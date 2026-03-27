import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

const TROY_OUNCE_GRAMS = 31.1035

/**
 * GET /api/cron/gold
 *
 * Vercel Cron Job — refreshes gold spot price and stores in gold_prices table.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  // Check if we already have a recent price (within 1 hour)
  const { data: recent } = await supabase
    .from("gold_prices")
    .select("recorded_at, price_per_gram")
    .eq("locale", "au")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single()

  if (recent) {
    const age = Date.now() - new Date(recent.recorded_at).getTime()
    if (age < 60 * 60 * 1000) {
      return NextResponse.json({
        skipped: true,
        message: `Last price is ${Math.round(age / 60000)}min old`,
        pricePerGram: Number(recent.price_per_gram),
      })
    }
  }

  // Try goldapi.io
  let result: { perGram: number; perOunce: number; source: string } | null = null

  const goldApiKey = process.env.GOLD_API_KEY
  if (goldApiKey) {
    try {
      const res = await fetch("https://www.goldapi.io/api/XAU/AUD", {
        headers: { "x-access-token": goldApiKey },
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.price_gram_24k > 0) {
          result = {
            perGram: data.price_gram_24k,
            perOunce: data.price || data.price_gram_24k * TROY_OUNCE_GRAMS,
            source: "goldapi.io",
          }
        }
      }
    } catch { /* fall through */ }
  }

  // Try metals.dev
  if (!result) {
    try {
      const key = process.env.METALS_DEV_API_KEY || "demo"
      const res = await fetch(`https://api.metals.dev/v1/latest?api_key=${key}&currency=AUD&unit=gram`, {
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.metals?.gold > 0) {
          result = {
            perGram: data.metals.gold,
            perOunce: data.metals.gold * TROY_OUNCE_GRAMS,
            source: "metals.dev",
          }
        }
      }
    } catch { /* fall through */ }
  }

  if (!result) {
    return NextResponse.json({ error: "All gold price APIs failed" }, { status: 502 })
  }

  // Store in gold_prices
  const { error } = await supabase.from("gold_prices").insert({
    locale: "au",
    currency: "AUD",
    price_per_gram: Math.round(result.perGram * 100) / 100,
    price_per_ounce: Math.round(result.perOunce * 100) / 100,
    source: result.source,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    stored: true,
    pricePerGram: Math.round(result.perGram * 100) / 100,
    pricePerOunce: Math.round(result.perOunce * 100) / 100,
    source: result.source,
    timestamp: new Date().toISOString(),
  })
}
