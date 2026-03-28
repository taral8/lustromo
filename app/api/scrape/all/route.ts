import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { getActiveRetailers, deriveRetailerId, type RetailerConfig } from "@/lib/scrapers/retailer-registry"
import { scrapeGoldProducts } from "@/lib/scrapers/gold-scraper"
import { valuateGoldProduct } from "@/lib/valuation/gold-valuation"
import { normaliseShopifyProduct, ingestProducts } from "@/lib/ingestion/pipeline"
import { type ShopifyProduct } from "@/lib/ingestion/types"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const USER_AGENT = "Lustrumo/1.0 (lustrumo.com; jewellery price intelligence)"
const RATE_LIMIT_MS = 2000
const FETCH_TIMEOUT_MS = 30000

interface RetailerResult {
  name: string
  url: string
  status: "success" | "blocked" | "error"
  gold: number
  diamonds: number
  totalProducts: number
  error?: string
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Test if a Shopify store's /products.json is accessible.
 */
async function testShopifyAccess(baseUrl: string): Promise<{ accessible: boolean; error?: string }> {
  try {
    const res = await fetch(`${baseUrl}/products.json?limit=1`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return { accessible: false, error: `HTTP ${res.status}` }
    const data = await res.json()
    if (!data.products) return { accessible: false, error: "Invalid JSON response" }
    return { accessible: true }
  } catch (err) {
    return { accessible: false, error: err instanceof Error ? err.message : "Unknown error" }
  }
}

/**
 * Fetch all Shopify products with pagination.
 */
async function fetchAllProducts(baseUrl: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = []
  let page = 1

  while (page <= 20) {
    try {
      const res = await fetch(`${baseUrl}/products.json?limit=250&page=${page}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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

/**
 * Scrape gold products for a retailer and upsert to gold_products.
 */
async function scrapeAndIngestGold(
  config: RetailerConfig,
  supabase: ReturnType<typeof createServiceClient>
): Promise<number> {
  if (!supabase || !config.categories.includes("gold")) return 0

  const { goldCount, products } = await scrapeGoldProducts(config.baseUrl, config.name)
  if (goldCount === 0) return 0

  let upserted = 0
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
      locale: config.locale,
      retailer_name: p.retailer_name,
      retailer_url: config.baseUrl,
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

    if (!error) upserted++
  }

  return upserted
}

/**
 * Scrape diamonds for a retailer and upsert to products table.
 */
async function scrapeAndIngestDiamonds(
  config: RetailerConfig,
  shopifyProducts: ShopifyProduct[],
  supabase: ReturnType<typeof createServiceClient>
): Promise<number> {
  if (!supabase) return 0
  if (!config.categories.includes("diamond") && !config.categories.includes("lab_grown")) return 0

  const retailerId = deriveRetailerId(config)
  const normalised = []

  for (const product of shopifyProducts) {
    try {
      const result = normaliseShopifyProduct(product, retailerId, config.baseUrl, config.name)
      if (!result) continue
      const isDiamondType = result.product_type.includes("diamond") || result.product_type.includes("engagement")
      if (!isDiamondType) continue
      normalised.push(result)
    } catch {
      // Skip products that fail to parse
    }
  }

  if (normalised.length === 0) return 0

  const { ingested } = await ingestProducts(supabase, normalised, retailerId)
  return ingested
}

/**
 * POST /api/scrape/all
 *
 * Master scraper — loops through all active retailers, scrapes gold + diamonds,
 * upserts to database, returns comprehensive summary.
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

  const activeRetailers = getActiveRetailers()
  const results: RetailerResult[] = []
  let totalGold = 0
  let totalDiamonds = 0
  let retailersAccessible = 0
  let retailersBlocked = 0

  for (let i = 0; i < activeRetailers.length; i++) {
    const config = activeRetailers[i]

    // Rate limiting between retailers
    if (i > 0) await sleep(RATE_LIMIT_MS)

    // Test access first
    const access = await testShopifyAccess(config.baseUrl)

    if (!access.accessible) {
      retailersBlocked++
      results.push({
        name: config.name,
        url: config.baseUrl,
        status: "blocked",
        gold: 0,
        diamonds: 0,
        totalProducts: 0,
        error: access.error,
      })
      continue
    }

    retailersAccessible++

    try {
      // Fetch all products once
      const shopifyProducts = await fetchAllProducts(config.baseUrl)

      // Scrape gold products (uses its own fetch internally for gold-specific parsing)
      const goldCount = await scrapeAndIngestGold(config, supabase)

      // Scrape diamonds from the already-fetched products
      const diamondCount = await scrapeAndIngestDiamonds(config, shopifyProducts, supabase)

      totalGold += goldCount
      totalDiamonds += diamondCount

      results.push({
        name: config.name,
        url: config.baseUrl,
        status: "success",
        gold: goldCount,
        diamonds: diamondCount,
        totalProducts: shopifyProducts.length,
      })
    } catch (err) {
      results.push({
        name: config.name,
        url: config.baseUrl,
        status: "error",
        gold: 0,
        diamonds: 0,
        totalProducts: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  return NextResponse.json({
    retailers_attempted: activeRetailers.length,
    retailers_accessible: retailersAccessible,
    retailers_blocked: retailersBlocked,
    total_gold_products: totalGold,
    total_diamond_products: totalDiamonds,
    by_retailer: results,
    timestamp: new Date().toISOString(),
  })
}
