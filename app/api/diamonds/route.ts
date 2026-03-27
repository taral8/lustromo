import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ diamonds: [], count: 0, source: "not_configured" })
  }

  const params = request.nextUrl.searchParams
  const origin = params.get("origin") || "lab_grown"
  const shape = params.get("shape")
  const caratMin = parseFloat(params.get("carat_min") || "0")
  const caratMax = parseFloat(params.get("carat_max") || "100")
  const color = params.get("color")        // single grade e.g. "G"
  const colorBand = params.get("color_band") // EVC band e.g. "GH"
  const clarity = params.get("clarity")     // single grade e.g. "VS1"
  const clarityBand = params.get("clarity_band") // EVC band e.g. "VS"
  const evc = params.get("evc")             // full EVC string filter
  const locale = params.get("locale") || "au"
  const limit = Math.min(parseInt(params.get("limit") || "50"), 200)
  const sortBy = params.get("sort") || "price_aud"
  const sortDir = params.get("dir") === "desc" ? false : true

  // Map origin to diamond_centre_type
  const diamondType = origin === "natural" ? "natural" : "lab_grown"

  let query = supabase
    .from("products")
    .select(`
      id, lustrumo_id, product_title, product_url, retailer_id, image_url,
      price_aud, price_status, is_available,
      diamond_centre_carat, diamond_centre_shape, diamond_centre_color,
      diamond_centre_clarity, diamond_centre_cut, diamond_centre_type,
      diamond_centre_cert_number, diamond_centre_cert_body,
      diamond_centre_fluorescence, diamond_centre_polish, diamond_centre_symmetry,
      diamond_side_stone_type, diamond_side_stone_total_carat,
      setting_style, setting_metal_type, setting_metal_karat,
      evc, data_quality_score, data_quality_flags,
      product_type
    `)
    .eq("diamond_centre_type", diamondType)
    .eq("locale", locale)
    .eq("is_available", true)
    .not("price_aud", "is", null)
    .in("price_status", ["valid", "needs_review"])
    .gte("diamond_centre_carat", caratMin)
    .lte("diamond_centre_carat", caratMax)
    .order(sortBy, { ascending: sortDir })
    .limit(limit)

  if (shape) query = query.eq("diamond_centre_shape", shape)
  if (color) query = query.eq("diamond_centre_color", color)
  if (clarity) query = query.eq("diamond_centre_clarity", clarity)
  if (evc) query = query.eq("evc", evc)

  // EVC band filters — expand band to individual grades
  if (colorBand) {
    const colorBands: Record<string, string[]> = {
      "DEF": ["D", "E", "F"],
      "GH": ["G", "H"],
      "IJ": ["I", "J"],
      "KL+": ["K", "L", "M", "N"],
    }
    const grades = colorBands[colorBand]
    if (grades) query = query.in("diamond_centre_color", grades)
  }

  if (clarityBand) {
    const clarityBands: Record<string, string[]> = {
      "FL-IF": ["FL", "IF"],
      "VVS": ["VVS1", "VVS2"],
      "VS": ["VS1", "VS2"],
      "SI1": ["SI1"],
      "SI2": ["SI2"],
      "I+": ["I1", "I2", "I3"],
    }
    const grades = clarityBands[clarityBand]
    if (grades) query = query.in("diamond_centre_clarity", grades)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map to a consistent response shape
  const diamonds = (data || []).map(p => ({
    id: p.id,
    lustrumo_id: p.lustrumo_id,
    product_name: p.product_title,
    product_url: p.product_url,
    retailer_name: p.retailer_id?.replace(/_/g, " ") || "Unknown",
    image_url: p.image_url,
    price: p.price_aud,
    price_status: p.price_status,
    shape: p.diamond_centre_shape,
    carat: p.diamond_centre_carat,
    color: p.diamond_centre_color,
    clarity: p.diamond_centre_clarity,
    cut: p.diamond_centre_cut,
    origin: p.diamond_centre_type,
    cert_lab: p.diamond_centre_cert_body,
    cert_number: p.diamond_centre_cert_number,
    fluorescence: p.diamond_centre_fluorescence,
    polish: p.diamond_centre_polish,
    symmetry: p.diamond_centre_symmetry,
    side_stones: p.diamond_side_stone_type,
    side_stone_carat: p.diamond_side_stone_total_carat,
    setting_style: p.setting_style,
    metal: p.setting_metal_type,
    metal_karat: p.setting_metal_karat,
    evc: p.evc,
    data_quality_score: p.data_quality_score,
    product_type: p.product_type,
  }))

  // Compute EVC summary stats (count + avg price per EVC)
  const evcGroups: Record<string, { count: number; avgPrice: number; minPrice: number; maxPrice: number }> = {}
  for (const d of diamonds) {
    if (!d.evc) continue
    const g = evcGroups[d.evc]
    if (g) {
      g.count++
      g.avgPrice += d.price
      g.minPrice = Math.min(g.minPrice, d.price)
      g.maxPrice = Math.max(g.maxPrice, d.price)
    } else {
      evcGroups[d.evc] = { count: 1, avgPrice: d.price, minPrice: d.price, maxPrice: d.price }
    }
  }
  for (const key of Object.keys(evcGroups)) {
    evcGroups[key].avgPrice = Math.round(evcGroups[key].avgPrice / evcGroups[key].count)
  }

  return NextResponse.json({
    diamonds,
    count: diamonds.length,
    evcGroups,
    source: "products",
  })
}
