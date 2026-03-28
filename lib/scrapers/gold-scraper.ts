/**
 * Lustrumo — Gold Jewellery Scraper (Phase 2A)
 *
 * Scrapes Shopify stores for gold jewellery products, parses karat,
 * weight, colour, and product type from titles/descriptions/tags.
 *
 * Usage (standalone test):
 *   npx tsx lib/scrapers/gold-scraper.ts
 */

// ─── Types ───

export type GoldColor = "yellow" | "white" | "rose"

export type GoldProductType =
  | "ring"
  | "chain"
  | "bangle"
  | "pendant"
  | "earring"
  | "necklace"
  | "bracelet"
  | "mangalsutra"
  | "nosering"
  | "anklet"
  | "coin"
  | "brooch"
  | "unknown"

export interface ScrapedGoldProduct {
  retailer_name: string
  product_url: string
  product_title: string
  image_url: string | null
  price_aud: number | null
  price_raw: string
  karat: number | null
  gold_color: GoldColor
  weight_grams: number | null
  product_type: GoldProductType
  has_diamonds: boolean
  has_gemstones: boolean
  shopify_id: number
  shopify_handle: string
  shopify_product_type: string
  tags: string[]
  scraped_at: string
}

interface ShopifyProductRaw {
  id: number
  title: string
  handle: string
  body_html: string
  vendor: string
  product_type: string
  tags: string[]
  images: { src: string }[]
  variants: {
    id: number
    price: string
    compare_at_price: string | null
    sku: string | null
    available: boolean
  }[]
}

// ─── Shopify Fetch ───

export async function fetchAllShopifyProducts(baseUrl: string): Promise<ShopifyProductRaw[]> {
  const allProducts: ShopifyProductRaw[] = []
  let page = 1

  while (page <= 20) {
    const url = `${baseUrl}/products.json?limit=250&page=${page}`
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Lustrumo/1.0)" },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) break
      const data = await res.json()
      const products: ShopifyProductRaw[] = data.products || []
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

// ─── Gold Detection ───

// Karat patterns: "22K", "22kt", "22 karat", "22-karat", "22 Kt"
const KARAT_REGEX = /\b(9|14|18|22|24)\s*(?:k(?:t|arat)?)\b/i

// Gold colour from abbreviations or full words
const COLOR_PATTERNS: [RegExp, GoldColor][] = [
  [/\brose\s*gold\b|\bRG\b/i, "rose"],
  [/\bwhite\s*gold\b|\bWG\b/i, "white"],
  [/\byellow\s*gold\b|\bYG\b/i, "yellow"],
]

// Weight patterns: "5.2g", "weight: 5.2 grams", "5.2 gms", "wt 5.2g", "5.2 gm"
const WEIGHT_PATTERNS = [
  /(?:weight|wt|net\s*wt)[\s:]*(\d+\.?\d*)\s*(?:g(?:ram|ms?|m)?)\b/i,
  /(\d+\.?\d*)\s*(?:grams|gms)\b/i,
  /(\d+\.?\d*)\s*g\b(?!old|ia|em)/i, // "5.2g" but not "gold", "GIA", "gem"
]

// Product type classification from title/tags
const PRODUCT_TYPE_MAP: [RegExp, GoldProductType][] = [
  [/\bmangalsutra\b/i, "mangalsutra"],
  [/\bnose\s*(?:ring|pin|stud)\b/i, "nosering"],
  [/\banklet\b/i, "anklet"],
  [/\bbrooch\b/i, "brooch"],
  [/\bcoin\b|\bbiscuit\b/i, "coin"],
  [/\bbangle\b|\bkada\b/i, "bangle"],
  [/\bbracelet\b/i, "bracelet"],
  [/\bchain\b/i, "chain"],
  [/\bnecklace\b|\bhar\b|\bset\b.*\bnecklace\b/i, "necklace"],
  [/\bpendant\b|\blocket\b/i, "pendant"],
  [/\bearring\b|\bjhumka\b|\bstud\b|\btops\b|\bbali\b/i, "earring"],
  [/\bring\b/i, "ring"],
]

// Gemstone detection
const GEMSTONE_REGEX = /\b(?:ruby|rubies|sapphire|emerald|opal|topaz|amethyst|garnet|tanzanite|aquamarine|peridot|tourmaline|morganite|citrine|onyx|jade|pearl)\b/i

// Exclusion patterns — clearly not gold jewellery
const EXCLUDE_PATTERNS = [
  /\bsterling\s*silver\b.*(?:only|925)\b/i,
  /\bsilver\s*(?:ring|chain|pendant|earring|bracelet|necklace)\b(?!.*\bgold\b)/i,
  /\bstainless\s*steel\b/i,
  /\btitanium\b/i,
  /\bgift\s*card\b/i,
  /\bpolishing\s*cloth\b/i,
  /\bring\s*(?:sizer|box|holder)\b/i,
  /\bjewelr?y\s*(?:box|case|cleaner)\b/i,
]

/**
 * Determine if a Shopify product is a gold jewellery item.
 */
function isGoldProduct(product: ShopifyProductRaw): boolean {
  const text = [product.title, product.product_type, product.tags.join(" ")].join(" ")
  const lower = text.toLowerCase()

  // Check exclusions first
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(text)) return false
  }

  // Must have gold signal
  const hasKarat = KARAT_REGEX.test(text)
  const hasGoldWord = /\bgold\b/i.test(text)
  const hasGoldAbbrev = /\b[YWR]G\b/.test(text) // YG, WG, RG (case-sensitive)
  const hasGoldTag = product.tags.some(t => /gold|karat|22k|18k|14k|9k|24k/i.test(t))
  const hasGoldProductType = /gold/i.test(product.product_type)

  if (!hasKarat && !hasGoldWord && !hasGoldAbbrev && !hasGoldTag && !hasGoldProductType) {
    return false
  }

  // Exclude diamond-only products with no gold setting
  // (e.g. loose diamonds listed as "diamond" with no gold reference)
  if (/\bloose\s*diamond\b/i.test(lower) && !hasGoldWord && !hasKarat) {
    return false
  }

  return true
}

/**
 * Parse gold product details from a Shopify product.
 */
export function parseGoldProduct(product: ShopifyProductRaw, retailerName: string, baseUrl: string): ScrapedGoldProduct {
  const text = [product.title, product.body_html || "", product.tags.join(" ")].join("\n")
  const titleAndTags = [product.title, product.tags.join(" ")].join(" ")

  // ─── Karat ───
  let karat: number | null = null
  const karatMatch = titleAndTags.match(KARAT_REGEX) || text.match(KARAT_REGEX)
  if (karatMatch) {
    karat = parseInt(karatMatch[1], 10)
  }

  // ─── Gold Colour ───
  let goldColor: GoldColor = "yellow" // default
  for (const [pattern, color] of COLOR_PATTERNS) {
    if (pattern.test(titleAndTags)) {
      goldColor = color
      break
    }
  }

  // ─── Weight ───
  let weightGrams: number | null = null
  for (const pattern of WEIGHT_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const val = parseFloat(match[1])
      // Sanity: gold jewellery typically 0.5g–200g
      if (val > 0 && val <= 500) {
        weightGrams = val
        break
      }
    }
  }

  // ─── Product Type ───
  let productType: GoldProductType = "unknown"
  for (const [pattern, type] of PRODUCT_TYPE_MAP) {
    if (pattern.test(titleAndTags)) {
      productType = type
      break
    }
  }
  // Fallback: check body_html if title/tags didn't match
  if (productType === "unknown") {
    for (const [pattern, type] of PRODUCT_TYPE_MAP) {
      if (pattern.test(text)) {
        productType = type
        break
      }
    }
  }

  // ─── Diamonds & Gemstones ───
  const hasDiamonds = /\bdiamond\b/i.test(text)
  const hasGemstones = GEMSTONE_REGEX.test(text)

  // ─── Price ───
  const rawPrice = product.variants[0]?.price || "0"
  const priceAud = parseFloat(rawPrice)

  return {
    retailer_name: retailerName,
    product_url: `${baseUrl}/products/${product.handle}`,
    product_title: product.title,
    image_url: product.images?.[0]?.src || null,
    price_aud: isNaN(priceAud) || priceAud === 0 ? null : priceAud,
    price_raw: rawPrice,
    karat,
    gold_color: goldColor,
    weight_grams: weightGrams,
    product_type: productType,
    has_diamonds: hasDiamonds,
    has_gemstones: hasGemstones,
    shopify_id: product.id,
    shopify_handle: product.handle,
    shopify_product_type: product.product_type,
    tags: product.tags,
    scraped_at: new Date().toISOString(),
  }
}

/**
 * Scrape a Shopify store for gold jewellery products.
 */
export async function scrapeGoldProducts(
  baseUrl: string,
  retailerName: string
): Promise<{ total: number; goldCount: number; products: ScrapedGoldProduct[] }> {
  const allProducts = await fetchAllShopifyProducts(baseUrl)
  const goldProducts: ScrapedGoldProduct[] = []

  for (const product of allProducts) {
    if (isGoldProduct(product)) {
      goldProducts.push(parseGoldProduct(product, retailerName, baseUrl))
    }
  }

  return {
    total: allProducts.length,
    goldCount: goldProducts.length,
    products: goldProducts,
  }
}

// ─── Standalone test runner ───

async function main() {
  const baseUrl = "https://rbdiamond.com.au"
  const retailerName = "RB Diamond"

  console.log(`\nScraping gold products from ${baseUrl}...`)
  console.log("─".repeat(60))

  const { total, goldCount, products } = await scrapeGoldProducts(baseUrl, retailerName)

  console.log(`\nTotal products fetched: ${total}`)
  console.log(`Gold products identified: ${goldCount}`)
  console.log(`Non-gold skipped: ${total - goldCount}`)

  // Stats breakdown
  const byType: Record<string, number> = {}
  const byKarat: Record<string, number> = {}
  let withWeight = 0
  let withDiamonds = 0
  let withGemstones = 0

  for (const p of products) {
    byType[p.product_type] = (byType[p.product_type] || 0) + 1
    byKarat[p.karat ? `${p.karat}K` : "unknown"] = (byKarat[p.karat ? `${p.karat}K` : "unknown"] || 0) + 1
    if (p.weight_grams) withWeight++
    if (p.has_diamonds) withDiamonds++
    if (p.has_gemstones) withGemstones++
  }

  console.log(`\nBy product type:`, JSON.stringify(byType))
  console.log(`By karat:`, JSON.stringify(byKarat))
  console.log(`With weight: ${withWeight}/${goldCount}`)
  console.log(`With diamonds: ${withDiamonds}/${goldCount}`)
  console.log(`With gemstones: ${withGemstones}/${goldCount}`)

  // Sample 5 products
  console.log(`\n${"─".repeat(60)}`)
  console.log(`Sample of ${Math.min(5, products.length)} parsed gold products:\n`)

  for (const p of products.slice(0, 5)) {
    console.log(`  Title: ${p.product_title}`)
    console.log(`  URL: ${p.product_url}`)
    console.log(`  Price: ${p.price_aud ? `$${p.price_aud.toFixed(2)} AUD` : "N/A"}`)
    console.log(`  Karat: ${p.karat ? `${p.karat}K` : "unknown"}`)
    console.log(`  Colour: ${p.gold_color}`)
    console.log(`  Weight: ${p.weight_grams ? `${p.weight_grams}g` : "not found"}`)
    console.log(`  Type: ${p.product_type}`)
    console.log(`  Diamonds: ${p.has_diamonds} | Gemstones: ${p.has_gemstones}`)
    console.log(`  Tags: [${p.tags.slice(0, 5).join(", ")}${p.tags.length > 5 ? "..." : ""}]`)
    console.log()
  }
}

// Run if executed directly
const isDirectRun = process.argv[1]?.includes("gold-scraper")
if (isDirectRun) {
  main().catch(console.error)
}
