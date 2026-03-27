import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

/**
 * GET /api/gold-price
 *
 * Returns the current gold spot price in AUD per gram and per troy ounce.
 * Fetches from external APIs, persists to gold_prices table, and falls
 * back to the most recent stored price if all APIs fail.
 */

export const dynamic = "force-dynamic"

interface GoldPriceResponse {
  pricePerGram: number
  pricePerOunce: number
  currency: string
  source: string
  timestamp: string
  change24h: number | null     // AUD per gram change vs 24h ago
  changePercent24h: number | null
}

const TROY_OUNCE_GRAMS = 31.1035

// ─── External API fetch chain ───

async function fetchFromGoldApi(): Promise<{ perGram: number; perOunce: number } | null> {
  const key = process.env.GOLD_API_KEY
  if (!key) return null
  try {
    const res = await fetch("https://www.goldapi.io/api/XAU/AUD", {
      headers: { "x-access-token": key },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data?.price_gram_24k && data.price_gram_24k > 0) {
      return { perGram: data.price_gram_24k, perOunce: data.price || data.price_gram_24k * TROY_OUNCE_GRAMS }
    }
  } catch { /* fall through */ }
  return null
}

async function fetchFromMetalsDev(): Promise<{ perGram: number; perOunce: number } | null> {
  try {
    const key = process.env.METALS_DEV_API_KEY || "demo"
    const res = await fetch(`https://api.metals.dev/v1/latest?api_key=${key}&currency=AUD&unit=gram`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data?.metals?.gold && data.metals.gold > 0) {
      return { perGram: data.metals.gold, perOunce: data.metals.gold * TROY_OUNCE_GRAMS }
    }
  } catch { /* fall through */ }
  return null
}

async function fetchFromFrankfurterFx(): Promise<{ perGram: number; perOunce: number } | null> {
  try {
    // Get live USD/AUD exchange rate
    const fxRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=AUD", {
      signal: AbortSignal.timeout(8000),
    })
    if (!fxRes.ok) return null
    const fxData = await fxRes.json()
    const usdToAud = fxData?.rates?.AUD
    if (!usdToAud || usdToAud <= 0) return null

    // Get gold price in USD from a free metals source
    const metalRes = await fetch("https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=gram", {
      signal: AbortSignal.timeout(8000),
    })
    if (metalRes.ok) {
      const metalData = await metalRes.json()
      if (metalData?.metals?.gold && metalData.metals.gold > 0) {
        const perGramAud = metalData.metals.gold * usdToAud
        return { perGram: perGramAud, perOunce: perGramAud * TROY_OUNCE_GRAMS }
      }
    }
  } catch { /* fall through */ }
  return null
}

async function fetchLiveGoldPrice(): Promise<{ perGram: number; perOunce: number; source: string } | null> {
  // Try goldapi.io first (most reliable for AUD)
  const goldApi = await fetchFromGoldApi()
  if (goldApi) return { ...goldApi, source: "goldapi.io" }

  // Try metals.dev
  const metalsDev = await fetchFromMetalsDev()
  if (metalsDev) return { ...metalsDev, source: "metals.dev" }

  // Try FX conversion approach
  const fx = await fetchFromFrankfurterFx()
  if (fx) return { ...fx, source: "frankfurter+metals.dev" }

  return null
}

// ─── Database helpers ───

async function getLatestStoredPrice(supabase: ReturnType<typeof createServiceClient>) {
  if (!supabase) return null
  const { data } = await supabase
    .from("gold_prices")
    .select("*")
    .eq("locale", "au")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single()
  return data
}

async function getPrice24hAgo(supabase: ReturnType<typeof createServiceClient>) {
  if (!supabase) return null
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from("gold_prices")
    .select("price_per_gram, recorded_at")
    .eq("locale", "au")
    .lte("recorded_at", yesterday)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single()
  return data
}

async function persistPrice(
  supabase: ReturnType<typeof createServiceClient>,
  perGram: number,
  perOunce: number,
  source: string
) {
  if (!supabase) return

  // Don't insert if we already have a price within the last 30 minutes
  const recent = await getLatestStoredPrice(supabase)
  if (recent) {
    const age = Date.now() - new Date(recent.recorded_at).getTime()
    if (age < 30 * 60 * 1000) return // skip if < 30min old
  }

  await supabase.from("gold_prices").insert({
    locale: "au",
    currency: "AUD",
    price_per_gram: perGram,
    price_per_ounce: perOunce,
    source,
  })
}

// ─── In-memory cache ───

let cachedResponse: GoldPriceResponse | null = null
let cacheTimestamp = 0
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

export async function GET() {
  const now = Date.now()

  // Serve from memory cache if fresh
  if (cachedResponse && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json(cachedResponse)
  }

  const supabase = createServiceClient()

  // Try live API
  const live = await fetchLiveGoldPrice()

  if (live) {
    // Persist to gold_prices table
    await persistPrice(supabase, live.perGram, live.perOunce, live.source)

    // Calculate 24h change
    const yesterday = await getPrice24hAgo(supabase)
    const change24h = yesterday ? Math.round((live.perGram - yesterday.price_per_gram) * 100) / 100 : null
    const changePercent24h = yesterday && yesterday.price_per_gram > 0
      ? Math.round(((live.perGram - yesterday.price_per_gram) / yesterday.price_per_gram) * 10000) / 100
      : null

    const response: GoldPriceResponse = {
      pricePerGram: Math.round(live.perGram * 100) / 100,
      pricePerOunce: Math.round(live.perOunce * 100) / 100,
      currency: "AUD",
      source: live.source,
      timestamp: new Date().toISOString(),
      change24h,
      changePercent24h,
    }

    cachedResponse = response
    cacheTimestamp = now
    return NextResponse.json(response)
  }

  // Fallback: serve from database
  const stored = await getLatestStoredPrice(supabase)
  if (stored) {
    const yesterday = await getPrice24hAgo(supabase)
    const change24h = yesterday ? Math.round((stored.price_per_gram - yesterday.price_per_gram) * 100) / 100 : null
    const changePercent24h = yesterday && yesterday.price_per_gram > 0
      ? Math.round(((stored.price_per_gram - yesterday.price_per_gram) / yesterday.price_per_gram) * 10000) / 100
      : null

    const response: GoldPriceResponse = {
      pricePerGram: Number(stored.price_per_gram),
      pricePerOunce: Number(stored.price_per_ounce),
      currency: "AUD",
      source: `${stored.source} (cached)`,
      timestamp: stored.recorded_at,
      change24h,
      changePercent24h,
    }

    cachedResponse = response
    cacheTimestamp = now
    return NextResponse.json(response)
  }

  // Final fallback: hardcoded
  const fallback: GoldPriceResponse = {
    pricePerGram: 148.50,
    pricePerOunce: 4618.50,
    currency: "AUD",
    source: "fallback",
    timestamp: new Date().toISOString(),
    change24h: null,
    changePercent24h: null,
  }

  return NextResponse.json(fallback)
}
