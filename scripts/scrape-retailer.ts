/**
 * Lustrumo — Shopify Retailer Scraper (SKILL.md compliant)
 *
 * Fetches products from Shopify /products.json, normalises to SKILL.md
 * Section 3 schema, validates prices per Section 9, writes data quality
 * flags to ingestion_logs per Section 4.
 *
 * Usage:
 *   npx tsx scripts/scrape-retailer.ts [retailer-slug]
 *   npx tsx scripts/scrape-retailer.ts --all
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import { type ShopifyProduct } from "../lib/ingestion/types"
import { normaliseShopifyProduct, ingestProducts } from "../lib/ingestion/pipeline"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchShopifyProducts(baseUrl: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = []
  let page = 1
  const maxPages = 20

  while (page <= maxPages) {
    const url = `${baseUrl}/products.json?limit=250&page=${page}`
    console.log(`  Fetching page ${page}...`)

    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Lustrumo/1.0)" },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        console.log(`  Page ${page} returned ${res.status}, stopping.`)
        break
      }
      const data = await res.json()
      const products: ShopifyProduct[] = data.products || []
      if (products.length === 0) break
      allProducts.push(...products)
      if (products.length < 250) break
      page++
    } catch (err) {
      console.error(`  Error fetching page ${page}:`, err instanceof Error ? err.message : err)
      break
    }
  }

  return allProducts
}

function deriveRetailerId(slug: string, locale: string): string {
  return `${slug.replace(/-/g, "")}_${locale}`
}

async function scrapeRetailer(slug: string) {
  const { data: retailer, error } = await supabase
    .from("retailers")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !retailer) {
    console.error(`Retailer "${slug}" not found in database.`)
    return
  }

  const retailerId = deriveRetailerId(slug, retailer.locale || "au")
  console.log(`\nScraping: ${retailer.name} (${retailer.website_url})`)
  console.log(`  Retailer ID: ${retailerId}`)

  // Log scrape run
  const { data: run } = await supabase
    .from("scrape_runs")
    .insert({ retailer_id: retailerId, retailer_name: retailer.name })
    .select()
    .single()

  const runId = run?.id

  try {
    const shopifyProducts = await fetchShopifyProducts(retailer.website_url)
    console.log(`  Fetched ${shopifyProducts.length} raw products from Shopify`)

    // Normalise all products through the pipeline
    const normalised = []
    let skipped = 0

    for (const product of shopifyProducts) {
      const result = normaliseShopifyProduct(product, retailerId, retailer.website_url)
      if (result) {
        normalised.push(result)
      } else {
        skipped++
      }
    }

    console.log(`  Normalised: ${normalised.length} products (${skipped} skipped — not jewellery)`)

    // Quality breakdown
    const byType: Record<string, number> = {}
    const byScore: { excellent: number; good: number; fair: number; poor: number } = { excellent: 0, good: 0, fair: 0, poor: 0 }
    for (const p of normalised) {
      byType[p.product_type] = (byType[p.product_type] || 0) + 1
      if (p.data_quality_score >= 90) byScore.excellent++
      else if (p.data_quality_score >= 70) byScore.good++
      else if (p.data_quality_score >= 50) byScore.fair++
      else byScore.poor++
    }

    console.log(`  Product types:`, JSON.stringify(byType))
    console.log(`  Data quality: ${byScore.excellent} excellent, ${byScore.good} good, ${byScore.fair} fair, ${byScore.poor} poor`)

    // Ingest into Supabase
    const { ingested, flagged, flagsSummary } = await ingestProducts(supabase, normalised, retailerId)

    console.log(`  Ingested: ${ingested} products, ${flagged} flagged`)
    if (Object.keys(flagsSummary).length > 0) {
      console.log(`  Flags:`, JSON.stringify(flagsSummary))
    }

    // Update scrape run
    if (runId) {
      await supabase.from("scrape_runs").update({
        status: "completed",
        products_found: shopifyProducts.length,
        products_ingested: ingested,
        products_skipped: skipped,
        products_flagged: flagged,
        flags_summary: flagsSummary,
        completed_at: new Date().toISOString(),
      }).eq("id", runId)
    }

    // Update retailer stats
    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("retailer_id", retailerId)
      .eq("is_available", true)

    await supabase.from("retailers").update({
      total_diamonds: count || 0,
    }).eq("id", retailer.id)

  } catch (err) {
    console.error(`  Scrape failed:`, err)
    if (runId) {
      await supabase.from("scrape_runs").update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown error",
        completed_at: new Date().toISOString(),
      }).eq("id", runId)
    }
  }
}

async function scrapeAll() {
  const { data: retailers } = await supabase
    .from("retailers")
    .select("slug")
    .eq("is_active", true)

  if (!retailers?.length) {
    console.log("No active retailers found.")
    return
  }

  console.log(`Found ${retailers.length} active retailers to scrape.`)

  for (const r of retailers) {
    await scrapeRetailer(r.slug)
  }

  console.log("\nAll retailers scraped.")
}

// --- CLI ---
const arg = process.argv[2]
if (arg === "--all") {
  scrapeAll()
} else if (arg) {
  scrapeRetailer(arg)
} else {
  console.log("Usage:")
  console.log("  npx tsx scripts/scrape-retailer.ts rb-diamond")
  console.log("  npx tsx scripts/scrape-retailer.ts --all")
}
