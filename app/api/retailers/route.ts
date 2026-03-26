import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { scoreRetailer, type ProductForScoring } from "@/lib/valuation/retailer-scoring"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // cache for 1 hour

interface RetailerRow {
  id: string
  name: string
  slug: string
  website_url: string
  locale: string
  city: string | null
  state: string | null
  is_online: boolean
  is_physical: boolean
  specialities: string[] | null
}

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ retailers: [], source: "not_configured" })
  }

  // Get all active retailers
  const { data: retailers, error } = await supabase
    .from("retailers")
    .select("id, name, slug, website_url, locale, city, state, is_online, is_physical, specialities")
    .eq("is_active", true)
    .eq("locale", "au")

  if (error || !retailers?.length) {
    return NextResponse.json({ retailers: [], source: "empty" })
  }

  // For each retailer, fetch their products and compute score
  const scored = await Promise.all(
    retailers.map(async (retailer: RetailerRow) => {
      // Derive retailer_id the same way the scraper does
      const retailerId = `${retailer.slug.replace(/-/g, "")}_au`

      const { data: products } = await supabase
        .from("products")
        .select(`
          product_type, price_status, price_aud,
          diamond_centre_carat, diamond_centre_shape, diamond_centre_color,
          diamond_centre_clarity, diamond_centre_type, diamond_centre_cert_body,
          diamond_centre_cert_number, setting_metal_type,
          gold_karat, gold_weight_grams, gold_purity, date_updated
        `)
        .eq("retailer_id", retailerId)
        .eq("is_available", true)
        .limit(2000)

      const score = scoreRetailer((products as ProductForScoring[]) || [])

      return {
        ...retailer,
        retailer_id: retailerId,
        score,
      }
    })
  )

  // Sort by overall score descending
  scored.sort((a, b) => b.score.overall - a.score.overall)

  return NextResponse.json({ retailers: scored })
}
