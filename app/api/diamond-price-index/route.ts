import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

/**
 * GET /api/diamond-price-index
 *
 * Returns diamond price index data for sparklines and trend cards.
 *
 * Query params:
 *   origin: "lab_grown" | "natural"
 *   shape: "round" | "oval" | etc. (optional — returns all shapes if omitted)
 *   carat_bucket: "0.50" | "1.00" | etc. (optional)
 *   days: number of days of history (default 30, max 90)
 */
export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ index: [], dataPoints: 0 })
  }

  const params = request.nextUrl.searchParams
  const origin = params.get("origin") || "lab_grown"
  const shape = params.get("shape")
  const caratBucket = params.get("carat_bucket")
  const days = Math.min(parseInt(params.get("days") || "30"), 90)

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from("diamond_price_index")
    .select("*")
    .eq("origin", origin)
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true })

  if (shape) query = query.eq("shape", shape)
  if (caratBucket) query = query.eq("carat_bucket", caratBucket)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by carat_bucket + shape for easy frontend consumption
  const groups: Record<string, {
    origin: string
    caratBucket: string
    shape: string
    currentAvg: number
    currentMedian: number | null
    currentMin: number
    currentMax: number
    currentSampleSize: number
    change30d: number | null
    dataPoints: number
    sparkline: number[]
    dates: string[]
  }> = {}

  for (const row of data || []) {
    const key = `${row.carat_bucket}-${row.shape}`
    if (!groups[key]) {
      groups[key] = {
        origin: row.origin,
        caratBucket: row.carat_bucket,
        shape: row.shape,
        currentAvg: 0,
        currentMedian: null,
        currentMin: 0,
        currentMax: 0,
        currentSampleSize: 0,
        change30d: null,
        dataPoints: 0,
        sparkline: [],
        dates: [],
      }
    }
    const g = groups[key]
    g.sparkline.push(Math.round(Number(row.avg_price)))
    g.dates.push(row.recorded_at)
    g.dataPoints++

    // Last entry = current
    g.currentAvg = Math.round(Number(row.avg_price))
    g.currentMedian = row.median_price ? Math.round(Number(row.median_price)) : null
    g.currentMin = Math.round(Number(row.min_price))
    g.currentMax = Math.round(Number(row.max_price))
    g.currentSampleSize = row.sample_size
  }

  // Calculate 30-day change for each group
  for (const g of Object.values(groups)) {
    if (g.sparkline.length >= 2) {
      const oldest = g.sparkline[0]
      const newest = g.sparkline[g.sparkline.length - 1]
      if (oldest > 0) {
        g.change30d = Math.round(((newest - oldest) / oldest) * 10000) / 100
      }
    }
  }

  return NextResponse.json({
    index: Object.values(groups),
    dataPoints: (data || []).length,
    days,
    origin,
  })
}
