import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

const CARAT_BUCKETS = [0.5, 1.0, 1.5, 2.0, 3.0]
const SHAPES = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
const ORIGINS = ["natural", "lab_grown"]

/**
 * GET /api/cron/aggregate
 *
 * Vercel Cron Job — aggregates diamond prices into diamond_price_history
 * for chart rendering and trend tracking.
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

  const today = new Date().toISOString().split("T")[0]
  let aggregated = 0

  for (const origin of ORIGINS) {
    for (const shape of SHAPES) {
      for (const bucket of CARAT_BUCKETS) {
        // Query from products table (v2 schema)
        const { data } = await supabase
          .from("products")
          .select("price_aud")
          .eq("diamond_centre_type", origin)
          .eq("diamond_centre_shape", shape)
          .eq("is_available", true)
          .eq("locale", "au")
          .in("price_status", ["valid", "needs_review"])
          .gte("diamond_centre_carat", bucket - 0.3)
          .lte("diamond_centre_carat", bucket + 0.3)

        if (!data?.length) continue

        const prices = data.map((d: { price_aud: number }) => d.price_aud).sort((a: number, b: number) => a - b)
        const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length

        await supabase.from("diamond_price_history").upsert({
          shape,
          carat_bucket: bucket,
          origin,
          locale: "au",
          avg_price: Math.round(avg * 100) / 100,
          min_price: prices[0],
          max_price: prices[prices.length - 1],
          median_price: prices[Math.floor(prices.length / 2)],
          inventory_count: prices.length,
          recorded_date: today,
        }, { onConflict: "shape,carat_bucket,origin,locale,recorded_date" })

        aggregated++
      }
    }
  }

  return NextResponse.json({
    aggregated,
    date: today,
    timestamp: new Date().toISOString(),
  })
}
