import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

/**
 * GET /api/gold-products
 *
 * Returns gold products from the gold_products table with filtering and sorting.
 */
export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ products: [], count: 0 })
  }

  const params = request.nextUrl.searchParams
  const karat = params.get("karat")                     // "9" | "14" | "18" | "22" | "24"
  const productType = params.get("type")                // "ring" | "chain" | etc.
  const makingChargeRating = params.get("rating")       // "low" | "average" | "high" | "very_high"
  const sortBy = params.get("sort") || "price_local"    // "price_local" | "making_charge_pct" | "karat"
  const sortDir = params.get("dir") === "desc" ? false : true
  const limit = Math.min(parseInt(params.get("limit") || "100"), 500)
  const offset = parseInt(params.get("offset") || "0")

  let query = supabase
    .from("gold_products")
    .select("*", { count: "exact" })
    .eq("locale", "au")
    .gt("price_local", 0)
    .order(sortBy, { ascending: sortDir })
    .range(offset, offset + limit - 1)

  if (karat) query = query.eq("karat", parseInt(karat))
  if (productType) query = query.eq("product_type", productType)
  if (makingChargeRating) query = query.eq("making_charge_rating", makingChargeRating)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ products: data || [], count: count || 0 })
}
