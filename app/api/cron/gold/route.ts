import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { getGoldSpotPrice } from "@/lib/gold-spot-price"

export const dynamic = "force-dynamic"

/**
 * GET /api/cron/gold
 *
 * Vercel Cron Job — refreshes gold spot price and stores in gold_prices table.
 * Uses the shared gold-spot-price utility (gold-api.com → goldpricez.com → scrape).
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

  // Fetch via shared utility (handles caching + persistence internally)
  const spot = await getGoldSpotPrice()

  if (spot.source === "fallback") {
    return NextResponse.json({ error: "All gold price APIs failed" }, { status: 502 })
  }

  return NextResponse.json({
    stored: true,
    pricePerGram: spot.pricePerGram,
    pricePerOunce: spot.pricePerOunce,
    source: spot.source,
    isFresh: spot.isFresh,
    timestamp: spot.timestamp,
  })
}
