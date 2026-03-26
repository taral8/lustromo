import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const expectedKey = process.env.SCRAPE_WEBHOOK_KEY

  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const action = body.action || "status"

  if (action === "status") {
    const { data: runs } = await supabase
      .from("scrape_runs")
      .select("retailer_name, status, items_found, items_new, started_at, completed_at")
      .order("started_at", { ascending: false })
      .limit(10)

    const { count: totalDiamonds } = await supabase
      .from("diamonds")
      .select("*", { count: "exact", head: true })
      .eq("is_available", true)

    return NextResponse.json({ total_diamonds: totalDiamonds, recent_runs: runs })
  }

  if (action === "aggregate") {
    const CARAT_BUCKETS = [0.5, 1.0, 1.5, 2.0, 3.0]
    const SHAPES = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
    const ORIGINS = ["natural", "lab_grown"]
    let count = 0

    for (const origin of ORIGINS) {
      for (const shape of SHAPES) {
        for (const bucket of CARAT_BUCKETS) {
          const { data } = await supabase
            .from("diamonds")
            .select("price")
            .eq("origin", origin)
            .eq("shape", shape)
            .eq("is_available", true)
            .eq("locale", "au")
            .gte("carat", bucket - 0.3)
            .lte("carat", bucket + 0.3)

          if (!data?.length) continue

          const prices = data.map((d: { price: number }) => d.price).sort((a: number, b: number) => a - b)
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
            recorded_date: new Date().toISOString().split("T")[0],
          }, { onConflict: "shape,carat_bucket,origin,locale,recorded_date" })

          count++
        }
      }
    }

    return NextResponse.json({ aggregated: count })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
