import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ similar: [] })
  }

  const params = request.nextUrl.searchParams
  const shape = params.get("shape")
  const carat = parseFloat(params.get("carat") || "1")
  const origin = params.get("origin") || "natural"
  const color = params.get("color")
  const clarity = params.get("clarity")
  const excludeUrl = params.get("exclude_url")
  const locale = params.get("locale") || "au"

  const caratRange = 0.15
  const colorGrades = ["D", "E", "F", "G", "H", "I", "J", "K"]
  const clarityGrades = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"]

  let colorRange: string[] = []
  if (color) {
    const idx = colorGrades.indexOf(color)
    if (idx >= 0) colorRange = colorGrades.slice(Math.max(0, idx - 1), idx + 2)
  }

  let clarityRange: string[] = []
  if (clarity) {
    const idx = clarityGrades.indexOf(clarity)
    if (idx >= 0) clarityRange = clarityGrades.slice(Math.max(0, idx - 1), idx + 2)
  }

  let query = supabase
    .from("diamonds")
    .select("product_name, product_url, image_url, retailer_name, shape, carat, color, clarity, origin, cert_lab, price, metal, setting_type")
    .eq("origin", origin)
    .eq("locale", locale)
    .eq("is_available", true)
    .gte("carat", carat - caratRange)
    .lte("carat", carat + caratRange)
    .order("price", { ascending: true })
    .limit(6)

  if (shape) query = query.eq("shape", shape)
  if (colorRange.length > 0) query = query.in("color", colorRange)
  if (clarityRange.length > 0) query = query.in("clarity", clarityRange)
  if (excludeUrl) query = query.neq("product_url", excludeUrl)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ similar: [] })
  }

  return NextResponse.json({ similar: data || [] })
}
