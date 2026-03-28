import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { normaliseShopifyProduct, ingestProducts } from "@/lib/ingestion/pipeline"
import { type ShopifyProduct } from "@/lib/ingestion/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300 // 5 minutes (Vercel Pro)

/**
 * GET /api/cron/scrape
 *
 * Vercel Cron Job — scrapes all active Shopify retailers for lab-grown diamonds.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  // Get all active retailers
  const { data: retailers } = await supabase
    .from("retailers")
    .select("id, slug, name, website_url, locale")
    .eq("is_active", true)

  if (!retailers?.length) {
    return NextResponse.json({ message: "No active retailers", scraped: 0 })
  }

  const results: { retailer: string; found: number; ingested: number; flagged: number; error?: string }[] = []

  for (const retailer of retailers) {
    const retailerId = `${retailer.slug.replace(/-/g, "")}_${retailer.locale || "au"}`

    // Log scrape run
    const { data: run } = await supabase
      .from("scrape_runs")
      .insert({ retailer_id: retailerId, retailer_name: retailer.name })
      .select()
      .single()

    try {
      // Fetch from Shopify /products.json
      const shopifyProducts = await fetchShopifyProducts(retailer.website_url)

      // Normalise and filter to lab-grown diamonds only
      const normalised = []
      let skipped = 0

      for (const product of shopifyProducts) {
        const result = normaliseShopifyProduct(product, retailerId, retailer.website_url, retailer.name)
        if (!result) { skipped++; continue }

        const isLabGrown = result.diamond_centre_type === "lab_grown"
        const isDiamondType = result.product_type.includes("diamond") || result.product_type.includes("engagement")
        if (isDiamondType && !isLabGrown) { continue }
        if (!isDiamondType) { skipped++; continue }

        normalised.push(result)
      }

      // Ingest into Supabase
      const { ingested, flagged, flagsSummary } = await ingestProducts(supabase, normalised, retailerId)

      results.push({ retailer: retailer.name, found: shopifyProducts.length, ingested, flagged })

      // Update scrape run
      if (run?.id) {
        await supabase.from("scrape_runs").update({
          status: "completed",
          products_found: shopifyProducts.length,
          products_ingested: ingested,
          products_skipped: skipped,
          products_flagged: flagged,
          flags_summary: flagsSummary,
          completed_at: new Date().toISOString(),
        }).eq("id", run.id)
      }

      // Update retailer product count
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("retailer_id", retailerId)
        .eq("is_available", true)

      await supabase.from("retailers").update({
        total_diamonds: count || 0,
      }).eq("id", retailer.id)

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error"
      results.push({ retailer: retailer.name, found: 0, ingested: 0, flagged: 0, error: errMsg })

      if (run?.id) {
        await supabase.from("scrape_runs").update({
          status: "failed",
          error_message: errMsg,
          completed_at: new Date().toISOString(),
        }).eq("id", run.id)
      }
    }
  }

  const totalIngested = results.reduce((s, r) => s + r.ingested, 0)
  const totalFlagged = results.reduce((s, r) => s + r.flagged, 0)

  return NextResponse.json({
    retailers: results.length,
    totalIngested,
    totalFlagged,
    results,
    timestamp: new Date().toISOString(),
  })
}

async function fetchShopifyProducts(baseUrl: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = []
  let page = 1

  while (page <= 20) {
    try {
      const res = await fetch(`${baseUrl}/products.json?limit=250&page=${page}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Lustrumo/1.0)" },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) break
      const data = await res.json()
      const products: ShopifyProduct[] = data.products || []
      if (products.length === 0) break
      allProducts.push(...products)
      if (products.length < 250) break
      page++
    } catch {
      break
    }
  }

  return allProducts
}
