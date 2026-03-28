/**
 * Lustrumo — Gold Spot Price Utility
 *
 * Shared module for fetching the current gold spot price in AUD/gram.
 * Used by gold-price API, gold-stats, gold-products, scrapers, and
 * the valuation engine.
 *
 * Priority chain (all free):
 *   1. gold-api.com  — free, no credit card (returns USD, convert via frankfurter)
 *   2. goldpricez.com API — free tier (returns AUD/gram directly)
 *   3. goldpricez.com HTML scrape — fallback if both APIs fail
 *   4. Supabase DB — last stored price
 *   5. Hardcoded emergency fallback
 */

import { createServiceClient } from "@/lib/supabase"

const TROY_OUNCE_GRAMS = 31.1035

// ─── In-memory cache ───

let cachedSpot: { perGram: number; perOunce: number; source: string; fetchedAt: number } | null = null
const MEMORY_CACHE_TTL = 60 * 60 * 1000 // 1 hour

export interface SpotPriceResult {
  pricePerGram: number
  pricePerOunce: number
  source: string
  timestamp: string
  isFresh: boolean // true if fetched live or cached < 1 hour
}

// ─── Source 1: gold-api.com (free, returns USD → convert to AUD) ───

async function fetchFromGoldApiCom(): Promise<{ perGram: number; perOunce: number } | null> {
  try {
    // Fetch gold price in USD
    const res = await fetch("https://api.gold-api.com/price/XAU", {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()

    // gold-api.com returns price per troy ounce in USD
    const usdPerOunce = data?.price
    if (!usdPerOunce || usdPerOunce <= 0) return null

    // Get USD→AUD exchange rate
    let usdToAud: number | null = null

    // Check if gold-api.com includes exchange rates
    if (data?.exchangeRates?.AUD && data.exchangeRates.AUD > 0) {
      usdToAud = data.exchangeRates.AUD
    }

    // Fall back to frankfurter for FX
    if (!usdToAud) {
      const fxRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=AUD", {
        signal: AbortSignal.timeout(8000),
      })
      if (fxRes.ok) {
        const fxData = await fxRes.json()
        usdToAud = fxData?.rates?.AUD
      }
    }

    if (!usdToAud || usdToAud <= 0) return null

    const audPerOunce = usdPerOunce * usdToAud
    const audPerGram = audPerOunce / TROY_OUNCE_GRAMS
    return { perGram: audPerGram, perOunce: audPerOunce }
  } catch { /* fall through */ }
  return null
}

// ─── Source 2: goldpricez.com API (free tier, returns AUD/gram directly) ───

async function fetchFromGoldPricez(): Promise<{ perGram: number; perOunce: number } | null> {
  const key = process.env.GOLDPRICEZ_API_KEY
  if (!key) return null
  try {
    const res = await fetch("https://goldpricez.com/api/rates/currency/aud/measure/gram", {
      headers: { "X-API-KEY": key },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const data = await res.json()

    // goldpricez.com returns AUD per gram directly
    const perGram = data?.price ?? data?.gold_price ?? data?.rates?.XAU
    if (perGram && perGram > 0) {
      return { perGram, perOunce: perGram * TROY_OUNCE_GRAMS }
    }
  } catch { /* fall through */ }
  return null
}

// ─── Source 3: Scrape goldpricez.com/au/gram HTML ───

async function scrapeGoldPricez(): Promise<{ perGram: number; perOunce: number } | null> {
  try {
    const res = await fetch("https://goldpricez.com/au/gram", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Lustrumo/1.0)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const html = await res.text()

    // Try common patterns for gold price on the page
    // Pattern: "$X,XXX.XX" or "X,XXX.XX AUD" near "gram" context
    const patterns = [
      // "1 Gram Gold = $X,XXX.XX AUD" or similar
      /(?:gold\s*(?:price|rate)?[^$]*?\$\s*)([\d,]+\.?\d*)/i,
      // data attribute or meta tag with price
      /data-price="([\d,]+\.?\d*)"/i,
      // "AUD X,XXX.XX per gram"
      /AUD\s*([\d,]+\.?\d*)\s*(?:per\s*gram|\/g)/i,
      // Generic price near "24k" and "gram"
      /24[kK][^$]*?\$\s*([\d,]+\.?\d*)/i,
      // Bold/span price pattern
      /<(?:b|strong|span)[^>]*>\s*\$?\s*([\d,]+\.\d{2})\s*<\//i,
    ]

    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        const price = parseFloat(match[1].replace(/,/g, ""))
        // Sanity check: gold per gram should be between $50 and $500 AUD
        if (price >= 50 && price <= 500) {
          return { perGram: price, perOunce: price * TROY_OUNCE_GRAMS }
        }
        // Could be price per ounce (between $2000 and $15000)
        if (price >= 2000 && price <= 15000) {
          const perGram = price / TROY_OUNCE_GRAMS
          return { perGram, perOunce: price }
        }
      }
    }
  } catch { /* fall through */ }
  return null
}

// ─── Fetch chain ──��

async function fetchLive(): Promise<{ perGram: number; perOunce: number; source: string } | null> {
  // 1. gold-api.com (free)
  const goldApiCom = await fetchFromGoldApiCom()
  if (goldApiCom) return { ...goldApiCom, source: "gold-api.com" }

  // 2. goldpricez.com API
  const goldPricez = await fetchFromGoldPricez()
  if (goldPricez) return { ...goldPricez, source: "goldpricez.com" }

  // 3. goldpricez.com HTML scrape
  const scraped = await scrapeGoldPricez()
  if (scraped) return { ...scraped, source: "goldpricez.com (scraped)" }

  return null
}

// ─── Database fallback ───

async function getStoredPrice(): Promise<{ perGram: number; perOunce: number; source: string; recordedAt: string } | null> {
  const supabase = createServiceClient()
  if (!supabase) return null
  const { data } = await supabase
    .from("gold_prices")
    .select("price_per_gram, price_per_ounce, source, recorded_at")
    .eq("locale", "au")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single()
  if (!data) return null
  return {
    perGram: Number(data.price_per_gram),
    perOunce: Number(data.price_per_ounce),
    source: data.source,
    recordedAt: data.recorded_at,
  }
}

async function persistPrice(perGram: number, perOunce: number, source: string) {
  const supabase = createServiceClient()
  if (!supabase) return

  // Don't insert if we already have a price within the last 30 minutes
  const { data: recent } = await supabase
    .from("gold_prices")
    .select("recorded_at")
    .eq("locale", "au")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single()

  if (recent) {
    const age = Date.now() - new Date(recent.recorded_at).getTime()
    if (age < 30 * 60 * 1000) return
  }

  await supabase.from("gold_prices").insert({
    locale: "au",
    currency: "AUD",
    price_per_gram: perGram,
    price_per_ounce: perOunce,
    source,
  })
}

// ─── Public API ───

/**
 * Get the current gold spot price in AUD per gram.
 *
 * Priority: in-memory cache (1hr) → live API chain → Supabase DB fallback.
 * Returns isFresh=true when the price is < 1 hour old.
 */
export async function getGoldSpotPrice(): Promise<SpotPriceResult> {
  const now = Date.now()

  // 1. Serve from memory cache if < 1 hour old
  if (cachedSpot && (now - cachedSpot.fetchedAt) < MEMORY_CACHE_TTL) {
    return {
      pricePerGram: Math.round(cachedSpot.perGram * 100) / 100,
      pricePerOunce: Math.round(cachedSpot.perOunce * 100) / 100,
      source: cachedSpot.source,
      timestamp: new Date(cachedSpot.fetchedAt).toISOString(),
      isFresh: true,
    }
  }

  // 2. Try live API chain
  const live = await fetchLive()
  if (live) {
    cachedSpot = { perGram: live.perGram, perOunce: live.perOunce, source: live.source, fetchedAt: now }
    persistPrice(live.perGram, live.perOunce, live.source).catch(() => {})
    return {
      pricePerGram: Math.round(live.perGram * 100) / 100,
      pricePerOunce: Math.round(live.perOunce * 100) / 100,
      source: live.source,
      timestamp: new Date(now).toISOString(),
      isFresh: true,
    }
  }

  // 3. Fallback to Supabase
  const stored = await getStoredPrice()
  if (stored) {
    const age = now - new Date(stored.recordedAt).getTime()
    const isFresh = age < MEMORY_CACHE_TTL
    return {
      pricePerGram: stored.perGram,
      pricePerOunce: stored.perOunce,
      source: `${stored.source} (cached)`,
      timestamp: stored.recordedAt,
      isFresh,
    }
  }

  // 4. Hardcoded emergency fallback
  return {
    pricePerGram: 210.0,
    pricePerOunce: 210.0 * TROY_OUNCE_GRAMS,
    source: "fallback",
    timestamp: new Date(now).toISOString(),
    isFresh: false,
  }
}

/**
 * Quick helper: just the AUD/gram number for valuation calculations.
 */
export async function getSpotPricePerGram(): Promise<number> {
  const result = await getGoldSpotPrice()
  return result.pricePerGram
}
