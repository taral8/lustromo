/**
 * Diamond Retailer Scraper
 *
 * Scrapes Shopify-based jewellery retailers for diamond product data.
 * Most AU diamond retailers use Shopify, which exposes a /products.json endpoint.
 *
 * Usage:
 *   npx tsx scripts/scrape-retailer.ts [retailer-slug]
 *   npx tsx scripts/scrape-retailer.ts novita-diamonds
 *   npx tsx scripts/scrape-retailer.ts --all
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ShopifyProduct {
  id: number
  title: string
  handle: string
  body_html: string
  vendor: string
  product_type: string
  tags: string[]
  images: { src: string }[]
  variants: {
    price: string
    compare_at_price: string | null
    available: boolean
  }[]
}

interface ParsedDiamond {
  product_name: string
  product_url: string
  image_url: string | null
  shape: string | null
  carat: number | null
  color: string | null
  clarity: string | null
  cut: string | null
  origin: "natural" | "lab_grown"
  cert_lab: string | null
  cert_number: string | null
  price: number
  metal: string | null
  setting_type: string | null
  has_side_stones: boolean
  is_available: boolean
}

const SHAPE_WORDS = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
const CLARITY_GRADES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"]

function parseProduct(product: ShopifyProduct, baseUrl: string): ParsedDiamond | null {
  const text = [product.title, product.body_html, product.tags.join(" ")].join(" ")
  const lower = text.toLowerCase()

  // Skip non-diamond products — check for diamond-related signals
  const diamondSignals = ["diamond", "carat", "ct ", "gia", "igi", "gcal", "solitaire", "engagement ring", "natural", "lab grown", "lab-grown"]
  const hasDiamondSignal = diamondSignals.some(s => lower.includes(s))
  // Also check if title has carat pattern like "1ct" or "0.5ct"
  const hasCarat = /\d+\.?\d*ct/i.test(product.title)
  if (!hasDiamondSignal && !hasCarat) {
    return null
  }

  const price = parseFloat(product.variants[0]?.price || "0")
  if (price <= 0) return null

  // Origin — default to natural, override if lab signals found
  let origin: "natural" | "lab_grown" = "natural"
  const labSignals = ["lab grown", "lab-grown", "lab created", "lab diamond", "cvd", "hpht", "laboratory"]
  for (const s of labSignals) {
    if (lower.includes(s)) { origin = "lab_grown"; break }
  }
  // "Natural" in title or body confirms natural
  if (/\bnatural\b/i.test(product.title)) origin = "natural"
  // IGI without "natural" usually means lab-grown in AU market
  if (/\bigi\b/i.test(text) && !/\bnatural\b/i.test(text)) origin = "lab_grown"

  // Carat
  let carat: number | null = null
  const caratMatch = text.match(/(\d+\.?\d*)\s*ct/i) || text.match(/(\d+\.?\d*)\s*carat/i)
  if (caratMatch) carat = parseFloat(caratMatch[1])

  // Shape
  let shape: string | null = null
  const titleLower = product.title.toLowerCase()
  for (const s of SHAPE_WORDS) {
    if (titleLower.includes(s)) { shape = s; break }
  }
  if (!shape) {
    for (const s of SHAPE_WORDS) {
      if (lower.includes(s)) { shape = s; break }
    }
  }

  // Color & Clarity from combined pattern "VS1 H" or "H VS1"
  let color: string | null = null
  let clarity: string | null = null

  const combo1 = text.match(/\b(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\s+([D-K])\b/i)
  const combo2 = text.match(/\b([D-K])\s+(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\b/i)
  if (combo1) { clarity = combo1[1].toUpperCase(); color = combo1[2].toUpperCase() }
  else if (combo2) { color = combo2[1].toUpperCase(); clarity = combo2[2].toUpperCase() }

  if (!color) {
    const cm = text.match(/(?:colo[u]?r)\s*[:\-]\s*([D-K])\b/i)
    if (cm) color = cm[1].toUpperCase()
  }
  if (!clarity) {
    const cm = text.match(/(?:clarity)\s*[:\-]\s*(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\b/i)
    if (cm) clarity = cm[1].toUpperCase()
  }
  if (!clarity) {
    for (const g of CLARITY_GRADES) {
      if (new RegExp(`\\b${g}\\b`, "i").test(text)) { clarity = g; break }
    }
  }

  // Cut
  let cut: string | null = null
  const cutMatch = text.match(/(?:cut)\s*[:\-]\s*(excellent|ideal|very good|good|fair)/i)
  if (cutMatch) cut = cutMatch[1]

  // Cert
  let cert_lab: string | null = null
  let cert_number: string | null = null
  if (/\bgia\b/i.test(text)) cert_lab = "GIA"
  else if (/\bigi\b/i.test(text)) cert_lab = "IGI"
  else if (/\bgcal\b/i.test(text)) cert_lab = "GCAL"
  const certMatch = text.match(/(?:certificate|cert)\s*[:#]?\s*(\d{6,})/i)
  if (certMatch) cert_number = certMatch[1]

  // Metal
  let metal: string | null = null
  if (/18k|18ct/i.test(text)) metal = "18K Gold"
  else if (/14k|14ct/i.test(text)) metal = "14K Gold"
  else if (/9k|9ct/i.test(text)) metal = "9K Gold"
  else if (/platinum/i.test(text)) metal = "Platinum"

  // Setting
  let setting_type: string | null = null
  const settings = ["solitaire", "halo", "pavé", "pave", "channel", "bezel", "cathedral", "vintage"]
  for (const s of settings) { if (lower.includes(s)) { setting_type = s; break } }

  const has_side_stones = /side\s*stone|accent|shoulder|pav[eé]/i.test(text)

  return {
    product_name: product.title,
    product_url: `${baseUrl}/products/${product.handle}`,
    image_url: product.images[0]?.src || null,
    shape,
    carat,
    color,
    clarity,
    cut,
    origin,
    cert_lab,
    cert_number,
    price,
    metal,
    setting_type,
    has_side_stones,
    is_available: product.variants.some(v => v.available),
  }
}

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
      console.error(`  Error fetching page ${page}:`, err)
      break
    }
  }

  return allProducts
}

async function scrapeRetailer(slug: string) {
  // Get retailer from DB
  const { data: retailer, error } = await supabase
    .from("retailers")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !retailer) {
    console.error(`Retailer "${slug}" not found in database.`)
    return
  }

  console.log(`\nScraping: ${retailer.name} (${retailer.website_url})`)

  // Log scrape run
  const { data: run } = await supabase
    .from("scrape_runs")
    .insert({ retailer_id: retailer.id, retailer_name: retailer.name })
    .select()
    .single()

  const runId = run?.id

  try {
    const products = await fetchShopifyProducts(retailer.website_url)
    console.log(`  Found ${products.length} total products`)

    let itemsNew = 0
    let itemsUpdated = 0
    let itemsSkipped = 0

    for (const product of products) {
      const parsed = parseProduct(product, retailer.website_url)
      if (!parsed || !parsed.carat) {
        itemsSkipped++
        continue
      }

      // Upsert into diamonds table
      const { error: upsertError } = await supabase
        .from("diamonds")
        .upsert({
          retailer_name: retailer.name,
          retailer_url: retailer.website_url,
          product_url: parsed.product_url,
          product_name: parsed.product_name,
          image_url: parsed.image_url,
          shape: parsed.shape || "unknown",
          carat: parsed.carat,
          color: parsed.color,
          clarity: parsed.clarity,
          cut: parsed.cut,
          origin: parsed.origin,
          cert_lab: parsed.cert_lab,
          cert_number: parsed.cert_number,
          price: parsed.price,
          currency: "AUD",
          price_per_carat: parsed.carat > 0 ? Math.round(parsed.price / parsed.carat) : null,
          metal: parsed.metal,
          setting_type: parsed.setting_type,
          has_side_stones: parsed.has_side_stones,
          is_available: parsed.is_available,
          locale: "au",
          last_seen_at: new Date().toISOString(),
        }, {
          onConflict: "product_url",
        })

      if (upsertError) {
        console.error(`  Error upserting ${parsed.product_url}:`, upsertError.message)
      } else {
        itemsNew++ // simplified — upsert handles both new and updated
      }
    }

    // Mark products not seen in this run as unavailable
    const { error: delistError } = await supabase
      .from("diamonds")
      .update({ is_available: false })
      .eq("retailer_name", retailer.name)
      .lt("last_seen_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

    const itemsDelisted = 0 // TODO: get count from response

    console.log(`  Results: ${itemsNew} upserted, ${itemsSkipped} skipped (no carat)`)

    // Update scrape run
    if (runId) {
      await supabase.from("scrape_runs").update({
        status: "completed",
        items_found: products.length,
        items_new: itemsNew,
        items_updated: itemsUpdated,
        items_delisted: itemsDelisted,
        completed_at: new Date().toISOString(),
      }).eq("id", runId)
    }

    // Update retailer stats
    const { count } = await supabase
      .from("diamonds")
      .select("*", { count: "exact", head: true })
      .eq("retailer_name", retailer.name)
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
  console.log("  npx tsx scripts/scrape-retailer.ts novita-diamonds")
  console.log("  npx tsx scripts/scrape-retailer.ts --all")
}
