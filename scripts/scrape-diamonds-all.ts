/**
 * Lustrumo — Diamond Scraper (All Origins: Natural + Lab-Grown)
 *
 * Phase 3A: Expands diamond ingestion to include natural diamonds.
 * Uses the existing normalisation pipeline (parse-shopify, classify,
 * price-validation, EVC) — just removes the lab-grown-only filter.
 *
 * Usage:
 *   npx tsx scripts/scrape-diamonds-all.ts [retailer-slug]
 *   npx tsx scripts/scrape-diamonds-all.ts --all
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

  while (page <= 20) {
    const url = `${baseUrl}/products.json?limit=250&page=${page}`
    console.log(`  Fetching page ${page}...`)
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Lustrumo/1.0)" },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) { console.log(`  Page ${page} returned ${res.status}, stopping.`); break }
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
  console.log(`\nScraping ALL diamonds: ${retailer.name} (${retailer.website_url})`)
  console.log(`  Retailer ID: ${retailerId}`)

  const { data: run } = await supabase
    .from("scrape_runs")
    .insert({ retailer_id: retailerId, retailer_name: retailer.name })
    .select()
    .single()
  const runId = run?.id

  try {
    const shopifyProducts = await fetchShopifyProducts(retailer.website_url)
    console.log(`  Fetched ${shopifyProducts.length} raw products from Shopify`)

    const normalised = []
    let skippedNonJewellery = 0
    let skippedNonDiamond = 0
    let naturalCount = 0
    let labGrownCount = 0
    let unknownOriginCount = 0

    for (const product of shopifyProducts) {
      const result = normaliseShopifyProduct(product, retailerId, retailer.website_url)
      if (!result) { skippedNonJewellery++; continue }

      const isDiamondType = result.product_type.includes("diamond") || result.product_type.includes("engagement")
      if (!isDiamondType) { skippedNonDiamond++; continue }

      // Phase 3: Accept BOTH natural and lab-grown
      if (result.diamond_centre_type === "natural") naturalCount++
      else if (result.diamond_centre_type === "lab_grown") labGrownCount++
      else unknownOriginCount++

      normalised.push(result)
    }

    console.log(`\n  Diamond products: ${normalised.length}`)
    console.log(`    Natural:        ${naturalCount}`)
    console.log(`    Lab-Grown:      ${labGrownCount}`)
    console.log(`    Unknown origin: ${unknownOriginCount}`)
    console.log(`  Skipped: ${skippedNonJewellery} non-jewellery, ${skippedNonDiamond} non-diamond (gold/silver)`)

    // Quality breakdown
    const byType: Record<string, number> = {}
    const byScore = { excellent: 0, good: 0, fair: 0, poor: 0 }
    for (const p of normalised) {
      byType[p.product_type] = (byType[p.product_type] || 0) + 1
      if (p.data_quality_score >= 90) byScore.excellent++
      else if (p.data_quality_score >= 70) byScore.good++
      else if (p.data_quality_score >= 50) byScore.fair++
      else byScore.poor++
    }

    console.log(`  Product types:`, JSON.stringify(byType))
    console.log(`  Data quality: ${byScore.excellent} excellent, ${byScore.good} good, ${byScore.fair} fair, ${byScore.poor} poor`)

    // Sample 5 natural diamond products
    const naturalSamples = normalised.filter(p => p.diamond_centre_type === "natural").slice(0, 5)
    if (naturalSamples.length > 0) {
      console.log(`\n  ${"─".repeat(50)}`)
      console.log(`  Sample Natural Diamonds:\n`)
      for (const p of naturalSamples) {
        console.log(`    ${p.product_title}`)
        console.log(`      Price: $${p.price_aud?.toFixed(2) ?? "N/A"} AUD`)
        console.log(`      Carat: ${p.diamond_centre_carat ?? "?"} | Shape: ${p.diamond_centre_shape ?? "?"} | Color: ${p.diamond_centre_color ?? "?"} | Clarity: ${p.diamond_centre_clarity ?? "?"}`)
        console.log(`      Cut: ${p.diamond_centre_cut ?? "?"} | Cert: ${p.diamond_centre_cert_body ?? "none"} ${p.diamond_centre_cert_number ?? ""}`)
        console.log(`      Metal: ${p.setting_metal_type ?? "?"} | Setting: ${p.setting_style ?? "?"}`)
        console.log(`      EVC: ${p.evc ?? "—"} | Quality: ${p.data_quality_score}/100`)
        console.log()
      }
    }

    // Unknown origin samples
    const unknownSamples = normalised.filter(p => !p.diamond_centre_type).slice(0, 3)
    if (unknownSamples.length > 0) {
      console.log(`  Products with undetermined origin:`)
      for (const p of unknownSamples) {
        console.log(`    - ${p.product_title} (${p.diamond_centre_cert_body ?? "no cert"})`)
      }
      console.log()
    }

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
        products_skipped: skippedNonJewellery + skippedNonDiamond,
        products_flagged: flagged,
        flags_summary: { ...flagsSummary, natural: naturalCount, lab_grown: labGrownCount },
        completed_at: new Date().toISOString(),
      }).eq("id", runId)
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
  console.log("  npx tsx scripts/scrape-diamonds-all.ts rb-diamond")
  console.log("  npx tsx scripts/scrape-diamonds-all.ts --all")
}
