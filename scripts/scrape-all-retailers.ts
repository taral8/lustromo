/**
 * Lustrumo — Master Scraper (All Retailers)
 *
 * Usage:
 *   npx tsx scripts/scrape-all-retailers.ts --retailer "bevilles.com.au"
 *   npx tsx scripts/scrape-all-retailers.ts --all
 *   npx tsx scripts/scrape-all-retailers.ts --all --force   (re-scrape already-scraped retailers)
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import { getActiveRetailers, deriveRetailerId, type RetailerConfig } from "../lib/scrapers/retailer-registry"
import { scrapeGoldProducts } from "../lib/scrapers/gold-scraper"
import { valuateGoldProduct } from "../lib/valuation/gold-valuation"
import { normaliseShopifyProduct, ingestProducts } from "../lib/ingestion/pipeline"
import { type ShopifyProduct } from "../lib/ingestion/types"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const USER_AGENT = "Lustrumo/1.0 (lustrumo.com; jewellery price intelligence)"
const RETAILER_TIMEOUT_MS = 30000

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

// ─── Fetch with progress logging ───

async function fetchShopifyProducts(baseUrl: string, retailerName: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = []
  let page = 1

  while (page <= 20) {
    try {
      const res = await fetch(`${baseUrl}/products.json?limit=250&page=${page}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(RETAILER_TIMEOUT_MS),
      })
      if (!res.ok) { console.log(`  [${retailerName}] Page ${page} returned HTTP ${res.status}, stopping.`); break }
      const data = await res.json()
      const products: ShopifyProduct[] = data.products || []
      if (products.length === 0) break
      allProducts.push(...products)
      console.log(`  [${retailerName}] Fetched page ${page}... ${allProducts.length} products so far`)
      if (products.length < 250) break
      page++
    } catch (err) {
      console.log(`  [${retailerName}] Page ${page} error: ${err instanceof Error ? err.message : "timeout"}`)
      break
    }
  }

  return allProducts
}

// ─── Gold ingestion with progress ───

async function scrapeGold(config: RetailerConfig): Promise<number> {
  if (!config.categories.includes("gold")) { console.log(`  [${config.name}] Skipping gold (not in categories)`); return 0 }

  console.log(`  [${config.name}] Running gold scraper...`)
  const { goldCount, products } = await scrapeGoldProducts(config.baseUrl, config.name)
  console.log(`  [${config.name}] Gold: ${goldCount} found`)

  if (goldCount === 0) return 0

  let upserted = 0
  let errors = 0
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const val = valuateGoldProduct({
      price_aud: p.price_aud, karat: p.karat, weight_grams: p.weight_grams,
      product_type: p.product_type, product_title: p.product_title,
      has_diamonds: p.has_diamonds, has_gemstones: p.has_gemstones,
    })

    const { error } = await supabase.from("gold_products").upsert({
      locale: config.locale, retailer_name: p.retailer_name, retailer_url: config.baseUrl,
      product_url: p.product_url, product_handle: p.shopify_handle, title: p.product_title,
      price_local: p.price_aud ?? 0, currency: "AUD", karat: p.karat, gold_color: p.gold_color,
      weight_grams: val?.estimated_weight_grams ?? p.weight_grams,
      weight_source: val?.weight_source ?? "estimated", product_type: p.product_type,
      has_diamonds: p.has_diamonds, has_gemstones: p.has_gemstones, image_url: p.image_url,
      tags: p.tags, intrinsic_value: val?.estimated_intrinsic_value ?? null,
      making_charge_pct: val?.making_charge_pct ?? null, making_charge_rating: val?.making_charge_rating ?? null,
      fair_price_low: val?.fair_price_range.low ?? null, fair_price_high: val?.fair_price_range.high ?? null,
      scraped_at: p.scraped_at,
    }, { onConflict: "product_url" })

    if (error) errors++
    else upserted++

    if ((i + 1) % 50 === 0) console.log(`  [${config.name}] Gold: ${upserted} upserted, ${errors} errors (${i + 1}/${products.length})`)
  }

  console.log(`  [${config.name}] Gold done: ${upserted} upserted, ${errors} errors`)
  return upserted
}

// ─── Diamond ingestion with progress ───

async function scrapeDiamonds(config: RetailerConfig, shopifyProducts: ShopifyProduct[]): Promise<number> {
  if (!config.categories.includes("diamond") && !config.categories.includes("lab_grown")) {
    console.log(`  [${config.name}] Skipping diamonds (not in categories)`)
    return 0
  }

  console.log(`  [${config.name}] Running diamond parser...`)
  const retailerId = deriveRetailerId(config)
  const normalised = []

  for (const product of shopifyProducts) {
    try {
      const result = normaliseShopifyProduct(product, retailerId, config.baseUrl)
      if (!result) continue
      const isDiamond = result.product_type.includes("diamond") || result.product_type.includes("engagement")
      if (!isDiamond) continue
      normalised.push(result)
    } catch { /* skip */ }
  }

  console.log(`  [${config.name}] Diamonds: ${normalised.length} found (${normalised.filter(d => d.diamond_centre_type === "natural").length} natural, ${normalised.filter(d => d.diamond_centre_type === "lab_grown").length} lab-grown)`)

  if (normalised.length === 0) return 0

  const { ingested } = await ingestProducts(supabase, normalised, retailerId)
  console.log(`  [${config.name}] Diamonds done: ${ingested} ingested`)
  return ingested
}

// ─── Check if retailer already has data ───

async function hasExistingData(config: RetailerConfig): Promise<boolean> {
  const { count: goldCount } = await supabase
    .from("gold_products")
    .select("*", { count: "exact", head: true })
    .eq("retailer_url", config.baseUrl)

  const retailerId = deriveRetailerId(config)
  const { count: diamondCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("retailer_id", retailerId)

  const total = (goldCount || 0) + (diamondCount || 0)
  if (total > 0) {
    console.log(`  [${config.name}] Already has ${goldCount || 0} gold + ${diamondCount || 0} diamond products in DB`)
    return true
  }
  return false
}

// ─── Scrape a single retailer ───

async function scrapeRetailer(config: RetailerConfig, force: boolean): Promise<{ gold: number; diamonds: number; status: string }> {
  console.log(`\n${"─".repeat(50)}`)
  console.log(`${config.name} (${config.baseUrl})`)
  console.log(`Categories: ${config.categories.join(", ")}`)

  // Skip if already scraped (unless --force)
  if (!force) {
    const exists = await hasExistingData(config)
    if (exists) {
      console.log(`  Skipping (already scraped). Use --force to re-scrape.`)
      return { gold: 0, diamonds: 0, status: "skipped" }
    }
  }

  // Test access
  console.log(`  Testing Shopify API access...`)
  try {
    const res = await fetch(`${config.baseUrl}/products.json?limit=1`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(RETAILER_TIMEOUT_MS),
    })
    if (!res.ok) {
      console.log(`  ✗ BLOCKED (HTTP ${res.status})`)
      return { gold: 0, diamonds: 0, status: "blocked" }
    }
    const data = await res.json()
    if (!data.products) {
      console.log(`  ✗ BLOCKED (invalid response)`)
      return { gold: 0, diamonds: 0, status: "blocked" }
    }
    console.log(`  ✓ Accessible`)
  } catch (err) {
    console.log(`  ✗ BLOCKED (${err instanceof Error ? err.message : "timeout"})`)
    return { gold: 0, diamonds: 0, status: "blocked" }
  }

  // Fetch all products
  const shopifyProducts = await fetchShopifyProducts(config.baseUrl, config.name)
  console.log(`  [${config.name}] Total products: ${shopifyProducts.length}`)

  // Scrape gold
  const goldCount = await scrapeGold(config)

  // Scrape diamonds
  const diamondCount = await scrapeDiamonds(config, shopifyProducts)

  console.log(`  [${config.name}] DONE — Gold: ${goldCount}, Diamonds: ${diamondCount}`)
  return { gold: goldCount, diamonds: diamondCount, status: "success" }
}

// ─── CLI ───

async function main() {
  const args = process.argv.slice(2)
  const retailerArg = args.find((_, i) => args[i - 1] === "--retailer")
  const runAll = args.includes("--all")
  const force = args.includes("--force")

  if (!retailerArg && !runAll) {
    console.log("Usage:")
    console.log('  npx tsx scripts/scrape-all-retailers.ts --retailer "bevilles.com.au"')
    console.log("  npx tsx scripts/scrape-all-retailers.ts --all")
    console.log("  npx tsx scripts/scrape-all-retailers.ts --all --force")
    process.exit(0)
  }

  const allRetailers = getActiveRetailers()

  if (retailerArg) {
    // Single retailer mode
    const config = allRetailers.find(r => r.baseUrl.includes(retailerArg))
    if (!config) {
      console.error(`Retailer matching "${retailerArg}" not found in registry.`)
      console.log("Available:", allRetailers.map(r => r.baseUrl).join(", "))
      process.exit(1)
    }
    await scrapeRetailer(config, force)
  } else {
    // All retailers mode
    console.log(`\nLustrumo Master Scraper — ${allRetailers.length} active retailers`)
    console.log("═".repeat(60))

    let totalGold = 0
    let totalDiamonds = 0
    const results: { name: string; gold: number; diamonds: number; status: string }[] = []

    for (let i = 0; i < allRetailers.length; i++) {
      if (i > 0) {
        console.log(`\n  [waiting 2s...]`)
        await sleep(2000)
      }

      console.log(`\n[${i + 1}/${allRetailers.length}]`)
      const result = await scrapeRetailer(allRetailers[i], force)
      totalGold += result.gold
      totalDiamonds += result.diamonds
      results.push({ name: allRetailers[i].name, ...result })
    }

    console.log(`\n${"═".repeat(60)}`)
    console.log(`SUMMARY`)
    console.log(`${"─".repeat(60)}`)
    for (const r of results) {
      const status = r.status === "success" ? "✓" : r.status === "skipped" ? "⊘" : "✗"
      console.log(`  ${status} ${r.name.padEnd(28)} Gold: ${String(r.gold).padStart(5)}  Diamonds: ${String(r.diamonds).padStart(5)}  [${r.status}]`)
    }
    console.log(`${"─".repeat(60)}`)
    console.log(`  Total gold:     ${totalGold}`)
    console.log(`  Total diamonds: ${totalDiamonds}`)
    console.log(`  Grand total:    ${totalGold + totalDiamonds}`)
  }

  // DB totals
  const { count: dbGold } = await supabase.from("gold_products").select("*", { count: "exact", head: true })
  const { count: dbDiamonds } = await supabase.from("products").select("*", { count: "exact", head: true })
  console.log(`\n  DB total gold_products: ${dbGold}`)
  console.log(`  DB total products:      ${dbDiamonds}`)
  console.log()
}

main().catch(console.error)
