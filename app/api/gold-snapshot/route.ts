import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

/**
 * GET /api/gold-snapshot
 *
 * Returns avg retail price per gram and avg making charge for 22K and 18K gold
 * from the gold_products table. Used by the homepage Price Snapshot.
 */
export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ karats: {} })
  }

  const result: Record<number, { avgPricePerGram: number; avgMakingCharge: number; count: number }> = {}

  for (const karat of [18, 22]) {
    const { data } = await supabase
      .from("gold_products")
      .select("price_local, weight_grams, making_charge_pct")
      .eq("locale", "au")
      .eq("karat", karat)
      .gt("price_local", 0)
      .not("weight_grams", "is", null)
      .not("making_charge_pct", "is", null)

    if (!data || data.length === 0) continue

    let totalPricePerGram = 0
    let totalMakingCharge = 0
    let validCount = 0

    for (const row of data) {
      const w = Number(row.weight_grams)
      if (w > 0) {
        totalPricePerGram += Number(row.price_local) / w
        totalMakingCharge += Number(row.making_charge_pct)
        validCount++
      }
    }

    if (validCount > 0) {
      result[karat] = {
        avgPricePerGram: Math.round(totalPricePerGram / validCount * 100) / 100,
        avgMakingCharge: Math.round(totalMakingCharge / validCount * 10) / 10,
        count: validCount,
      }
    }
  }

  return NextResponse.json({ karats: result })
}
