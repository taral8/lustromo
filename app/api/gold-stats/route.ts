import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { getSpotPricePerGram } from "@/lib/gold-spot-price"

export const dynamic = "force-dynamic"

const KARAT_PURITY: Record<number, number> = {
  9: 0.375, 14: 0.5833, 18: 0.75, 22: 0.9167, 24: 0.9999,
}

/**
 * GET /api/gold-stats
 *
 * Returns aggregate making charge statistics from the gold_products table.
 * Making charges are recalculated dynamically using the live spot price,
 * not the stale values stored at scrape time.
 */
export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  // Fetch live spot price
  const spotPerGram = await getSpotPricePerGram()

  // Fetch all gold products with the fields needed for recalculation
  // Paginate past the 1,000 row Supabase default
  const allData: {
    product_type: string | null
    karat: number | null
    weight_grams: number | null
    price_local: number
    has_diamonds: boolean
    has_gemstones: boolean
  }[] = []

  let offset = 0
  while (true) {
    const { data } = await supabase
      .from("gold_products")
      .select("product_type, karat, weight_grams, price_local, has_diamonds, has_gemstones")
      .eq("locale", "au")
      .gt("price_local", 0)
      .not("karat", "is", null)
      .range(offset, offset + 999)

    if (!data || data.length === 0) break
    allData.push(...data)
    if (data.length < 1000) break
    offset += 1000
  }

  if (allData.length === 0) {
    return NextResponse.json({ total: 0, byType: [], byKarat: [], distribution: [], spotPricePerGram: spotPerGram })
  }

  // Recalculate making charges dynamically
  const recalculated: {
    product_type: string
    karat: number
    making_charge_pct: number
    has_diamonds: boolean
    has_gemstones: boolean
  }[] = []

  for (const d of allData) {
    if (!d.karat || !KARAT_PURITY[d.karat]) continue
    if (!d.weight_grams || d.weight_grams <= 0) continue

    const intrinsic = d.weight_grams * KARAT_PURITY[d.karat] * spotPerGram
    if (intrinsic <= 0) continue

    const makingChargePct = ((d.price_local / intrinsic) - 1) * 100

    recalculated.push({
      product_type: d.product_type || "unknown",
      karat: d.karat,
      making_charge_pct: makingChargePct,
      has_diamonds: d.has_diamonds,
      has_gemstones: d.has_gemstones,
    })
  }

  if (recalculated.length === 0) {
    return NextResponse.json({ total: 0, byType: [], byKarat: [], distribution: [], spotPricePerGram: spotPerGram })
  }

  // Overall stats
  const allCharges = recalculated.map(d => d.making_charge_pct)
  const overallAvg = allCharges.reduce((a, b) => a + b, 0) / allCharges.length

  // By product type
  const typeMap: Record<string, number[]> = {}
  for (const d of recalculated) {
    if (!typeMap[d.product_type]) typeMap[d.product_type] = []
    typeMap[d.product_type].push(d.making_charge_pct)
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
  for (const d of recalculated) {
    if (!karatMap[d.karat]) karatMap[d.karat] = []
    karatMap[d.karat].push(d.making_charge_pct)
  }

  const byKarat = Object.entries(karatMap)
    .map(([karat, charges]) => ({
      karat: parseInt(karat),
      avg: Math.round(charges.reduce((a, b) => a + b, 0) / charges.length * 10) / 10,
      count: charges.length,
    }))
    .sort((a, b) => a.karat - b.karat)

  // Distribution histogram
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
  const pureGoldCharges = recalculated
    .filter(d => !d.has_diamonds && !d.has_gemstones)
    .map(d => d.making_charge_pct)
  const pureGoldAvg = pureGoldCharges.length > 0
    ? pureGoldCharges.reduce((a, b) => a + b, 0) / pureGoldCharges.length
    : null

  return NextResponse.json({
    total: recalculated.length,
    overallAvg: Math.round(overallAvg * 10) / 10,
    pureGoldAvg: pureGoldAvg !== null ? Math.round(pureGoldAvg * 10) / 10 : null,
    pureGoldCount: pureGoldCharges.length,
    byType,
    byKarat,
    distribution: buckets,
    spotPricePerGram: spotPerGram,
  })
}
