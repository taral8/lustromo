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
  const color = params.get("color")
  const clarity = params.get("clarity")
  const locale = params.get("locale") || "au"
  const limit = Math.min(parseInt(params.get("limit") || "50"), 200)
  const sortBy = params.get("sort") || "price"
  const sortDir = params.get("dir") === "desc" ? false : true

  let query = supabase
    .from("diamonds")
    .select("*")
    .eq("origin", origin)
    .eq("locale", locale)
    .eq("is_available", true)
    .gte("carat", caratMin)
    .lte("carat", caratMax)
    .order(sortBy, { ascending: sortDir })
    .limit(limit)

  if (shape) query = query.eq("shape", shape)
  if (color) query = query.eq("color", color)
  if (clarity) query = query.eq("clarity", clarity)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ diamonds: data || [], count: data?.length || 0 })
}
