import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

/**
 * GET /api/gold-stats
 *
 * Returns aggregate making charge statistics from the gold_products table:
 * - Overall average making charge
 * - Breakdown by product type (avg, count, min, max)
 * - Breakdown by karat
 * - Distribution histogram (buckets of 10%)
 */
export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  // Fetch all gold products with valid making charge data
  const { data, error } = await supabase
    .from("gold_products")
    .select("product_type, karat, making_charge_pct, making_charge_rating, has_diamonds, has_gemstones")
    .eq("locale", "au")
    .gt("price_local", 0)
    .not("making_charge_pct", "is", null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ total: 0, byType: [], byKarat: [], distribution: [] })
  }

  // Overall stats
  const allCharges = data.map(d => Number(d.making_charge_pct))
  const overallAvg = allCharges.reduce((a, b) => a + b, 0) / allCharges.length

  // By product type
  const typeMap: Record<string, number[]> = {}
  for (const d of data) {
    const t = d.product_type || "unknown"
    if (!typeMap[t]) typeMap[t] = []
    typeMap[t].push(Number(d.making_charge_pct))
  }

  const byType = Object.entries(typeMap)
    .map(([type, charges]) => ({
      type,
      avg: Math.round(charges.reduce((a, b) => a + b, 0) / charges.length * 10) / 10,
      count: charges.length,
      min: Math.round(Math.min(...charges) * 10) / 10,
      max: Math.round(Math.max(...charges) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count)

  // By karat
  const karatMap: Record<number, number[]> = {}
  for (const d of data) {
    if (!d.karat) continue
    if (!karatMap[d.karat]) karatMap[d.karat] = []
    karatMap[d.karat].push(Number(d.making_charge_pct))
  }

  const byKarat = Object.entries(karatMap)
    .map(([karat, charges]) => ({
      karat: parseInt(karat),
      avg: Math.round(charges.reduce((a, b) => a + b, 0) / charges.length * 10) / 10,
      count: charges.length,
    }))
    .sort((a, b) => a.karat - b.karat)

  // Distribution histogram (buckets of 10%)
  // Cap at 200% for display purposes
  const buckets = [
    { label: "0–10%", min: -Infinity, max: 10, count: 0 },
    { label: "10–20%", min: 10, max: 20, count: 0 },
    { label: "20–30%", min: 20, max: 30, count: 0 },
    { label: "30–50%", min: 30, max: 50, count: 0 },
    { label: "50–100%", min: 50, max: 100, count: 0 },
    { label: "100–200%", min: 100, max: 200, count: 0 },
    { label: "200%+", min: 200, max: Infinity, count: 0 },
  ]

  for (const charge of allCharges) {
    for (const bucket of buckets) {
      if (charge >= bucket.min && charge < bucket.max) {
        bucket.count++
        break
      }
    }
  }

  // Pure gold only stats (no diamonds/gemstones)
  const pureGold = data.filter(d => !d.has_diamonds && !d.has_gemstones)
  const pureGoldCharges = pureGold.map(d => Number(d.making_charge_pct))
  const pureGoldAvg = pureGoldCharges.length > 0
    ? pureGoldCharges.reduce((a, b) => a + b, 0) / pureGoldCharges.length
    : null

  return NextResponse.json({
    total: data.length,
    overallAvg: Math.round(overallAvg * 10) / 10,
    pureGoldAvg: pureGoldAvg !== null ? Math.round(pureGoldAvg * 10) / 10 : null,
    pureGoldCount: pureGold.length,
    byType,
    byKarat,
    distribution: buckets,
  })
}
