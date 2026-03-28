/**
 * Scrape RB Diamond for gold products, valuate, and upsert to gold_products.
 * Usage: npx tsx scripts/scrape-gold-rb.ts
 */
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import { scrapeGoldProducts } from "../lib/scrapers/gold-scraper"
import { valuateGoldProduct } from "../lib/valuation/gold-valuation"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const url = "https://rbdiamond.com.au"
  const retailerName = "RB Diamond"

  console.log(`Scraping gold products from ${url}...`)
  const { total, goldCount, products } = await scrapeGoldProducts(url, retailerName)
  console.log(`Fetched ${total} total, ${goldCount} gold products`)

  let upserted = 0
  let errors = 0

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

    const { error } = await supabase.from("gold_products").upsert({
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
    }, { onConflict: "product_url" })

    if (error) {
      errors++
      if (errors <= 3) console.log(`  Error: ${error.message}`)
    } else {
      upserted++
    }
  }

  console.log(`\nUpserted: ${upserted}`)
  console.log(`Errors: ${errors}`)
  console.log("Done.")
}

main().catch(console.error)
