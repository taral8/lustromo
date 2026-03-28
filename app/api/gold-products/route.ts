import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { getSpotPricePerGram } from "@/lib/gold-spot-price"

export const dynamic = "force-dynamic"

const KARAT_PURITY: Record<number, number> = {
  9: 0.375, 14: 0.5833, 18: 0.75, 22: 0.9167, 24: 0.9999,
}

function rateMakingCharge(pct: number): string {
  if (pct < 15) return "low"
  if (pct <= 30) return "average"
  if (pct <= 50) return "high"
  return "very_high"
}

/**
 * GET /api/gold-products
 *
 * Returns gold products with making charges recalculated dynamically
 * using the live spot price (not the stale values from scrape time).
 */
export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ products: [], count: 0 })
  }

  const params = request.nextUrl.searchParams
  const karat = params.get("karat")
  const productType = params.get("type")
  const makingChargeRating = params.get("rating")
  const sortBy = params.get("sort") || "price_local"
  const sortDir = params.get("dir") === "desc" ? false : true
  const limit = Math.min(parseInt(params.get("limit") || "100"), 500)
  const offset = parseInt(params.get("offset") || "0")

  // Fetch live spot price
  const spotPerGram = await getSpotPricePerGram()

  // Build query — fetch without rating filter (we recalculate ratings dynamically)
  let query = supabase
    .from("gold_products")
    .select("*", { count: "exact" })
    .eq("locale", "au")
    .gt("price_local", 0)

  if (karat) query = query.eq("karat", parseInt(karat))
  if (productType) query = query.eq("product_type", productType)

  // If filtering by rating, we can't do it in the DB query since we recalculate.
  // Fetch more rows and filter in memory when rating filter is active.
  if (makingChargeRating) {
    // Fetch all matching rows (up to a reasonable cap) and filter in memory
    query = query.order(sortBy, { ascending: sortDir }).range(0, 4999)
  } else {
    query = query.order(sortBy, { ascending: sortDir }).range(offset, offset + limit - 1)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Recalculate making charges with live spot price
  const products = (data || []).map(p => {
    let intrinsicValue = p.intrinsic_value ? Number(p.intrinsic_value) : null
    let makingChargePct = p.making_charge_pct ? Number(p.making_charge_pct) : null
    let makingChargeRatingVal = p.making_charge_rating

    if (p.karat && KARAT_PURITY[p.karat] && p.weight_grams && p.weight_grams > 0) {
      intrinsicValue = p.weight_grams * KARAT_PURITY[p.karat] * spotPerGram
      intrinsicValue = Math.round(intrinsicValue * 100) / 100

      if (p.price_local > 0 && intrinsicValue > 0) {
        makingChargePct = Math.round(((p.price_local / intrinsicValue) - 1) * 1000) / 10
        makingChargeRatingVal = rateMakingCharge(makingChargePct)
      }
    }

    return {
      ...p,
      intrinsic_value: intrinsicValue,
      making_charge_pct: makingChargePct,
      making_charge_rating: makingChargeRatingVal,
    }
  })

  // Apply rating filter in memory if requested
  if (makingChargeRating) {
    const filtered = products.filter(p => p.making_charge_rating === makingChargeRating)
    const paginated = filtered.slice(offset, offset + limit)
    return NextResponse.json({
      products: paginated,
      count: filtered.length,
      spotPricePerGram: spotPerGram,
    })
  }

  return NextResponse.json({
    products,
    count: count || 0,
    spotPricePerGram: spotPerGram,
  })
}
