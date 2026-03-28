import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { getGoldSpotPrice } from "@/lib/gold-spot-price"

/**
 * GET /api/gold-price
 *
 * Returns the current gold spot price in AUD per gram and per troy ounce.
 * Uses shared spot-price utility with 1-hour cache and 3-source fallback.
 * Adds 24h change calculation and freshness indicators.
 */

export const dynamic = "force-dynamic"

export async function GET() {
  const spot = await getGoldSpotPrice()
  const supabase = createServiceClient()

  // Calculate 24h change
  let change24h: number | null = null
  let changePercent24h: number | null = null

  if (supabase) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from("gold_prices")
      .select("price_per_gram")
      .eq("locale", "au")
      .lte("recorded_at", yesterday)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single()

    if (data && data.price_per_gram > 0) {
      change24h = Math.round((spot.pricePerGram - Number(data.price_per_gram)) * 100) / 100
      changePercent24h = Math.round(((spot.pricePerGram - Number(data.price_per_gram)) / Number(data.price_per_gram)) * 10000) / 100
    }
  }

  return NextResponse.json({
    pricePerGram: spot.pricePerGram,
    pricePerOunce: spot.pricePerOunce,
    currency: "AUD",
    source: spot.source,
    timestamp: spot.timestamp,
    isFresh: spot.isFresh,
    change24h,
    changePercent24h,
  })
}
