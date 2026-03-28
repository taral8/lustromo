import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { scrapeGoldProducts } from "@/lib/scrapers/gold-scraper"
import { valuateGoldProduct } from "@/lib/valuation/gold-valuation"

export const dynamic = "force-dynamic"
export const maxDuration = 300

/**
 * POST /api/scrape/gold
 *
 * Scrapes a Shopify retailer for gold products, runs valuation,
 * and upserts into gold_products table.
 *
 * Body: { url: string, retailer_name: string }
 * Protected by CRON_SECRET or SCRAPE_WEBHOOK_KEY.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  const webhookKey = process.env.SCRAPE_WEBHOOK_KEY

  const authorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (webhookKey && authHeader === `Bearer ${webhookKey}`)

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const url = body.url || "https://rbdiamond.com.au"
  const retailerName = body.retailer_name || "RB Diamond"

  // Scrape
  const { total, goldCount, products } = await scrapeGoldProducts(url, retailerName)

  // Valuate and upsert
  let upserted = 0
  let errors = 0
  let totalMakingCharge = 0
  let valuatedCount = 0

  for (const p of products) {
    const valuation = valuateGoldProduct({
      price_aud: p.price_aud,
      karat: p.karat,
      weight_grams: p.weight_grams,
      product_type: p.product_type,
      product_title: p.product_title,
      has_diamonds: p.has_diamonds,
      has_gemstones: p.has_gemstones,
    })

    const row = {
      locale: "au",
      retailer_name: p.retailer_name,
      retailer_url: url,
      product_url: p.product_url,
      product_handle: p.shopify_handle,
      title: p.product_title,
      price_local: p.price_aud ?? 0,
      currency: "AUD",
      karat: p.karat,
      gold_color: p.gold_color,
      weight_grams: valuation?.estimated_weight_grams ?? p.weight_grams,
      weight_source: valuation?.weight_source ?? "estimated",
      product_type: p.product_type,
      has_diamonds: p.has_diamonds,
      has_gemstones: p.has_gemstones,
      image_url: p.image_url,
      tags: p.tags,
      intrinsic_value: valuation?.estimated_intrinsic_value ?? null,
      making_charge_pct: valuation?.making_charge_pct ?? null,
      making_charge_rating: valuation?.making_charge_rating ?? null,
      fair_price_low: valuation?.fair_price_range.low ?? null,
      fair_price_high: valuation?.fair_price_range.high ?? null,
      scraped_at: p.scraped_at,
    }

    const { error } = await supabase
      .from("gold_products")
      .upsert(row, { onConflict: "product_url" })

    if (error) {
      errors++
    } else {
      upserted++
      if (valuation && p.price_aud && !p.has_diamonds && !p.has_gemstones) {
        totalMakingCharge += valuation.making_charge_pct
        valuatedCount++
      }
    }
  }

  const avgMakingCharge = valuatedCount > 0
    ? Math.round(totalMakingCharge / valuatedCount * 10) / 10
    : null

  return NextResponse.json({
    retailer: retailerName,
    url,
    total_products: total,
    gold_identified: goldCount,
    upserted,
    errors,
    avg_making_charge_pure_gold: avgMakingCharge,
    timestamp: new Date().toISOString(),
  })
}
