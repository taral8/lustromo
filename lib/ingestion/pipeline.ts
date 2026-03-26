import { type SupabaseClient } from "@supabase/supabase-js"
import { type ShopifyProduct, type NormalisedProduct, type DataQualityFlag, type FlagType, FLAG_SCORE_DEDUCTION } from "./types"
import { validatePrice } from "./price-validation"
import { classifyProduct } from "./classify"
import { parseShopifyProduct } from "./parse-shopify"

let idCounter = 0

function generateLustrumoId(): string {
  idCounter++
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 7)
  return `lus_${ts}${rand}${idCounter}`
}

function calculateDataQualityScore(flags: FlagType[]): number {
  let score = 100
  for (const flag of flags) {
    score -= FLAG_SCORE_DEDUCTION[flag] ?? 0
  }
  return Math.max(0, score)
}

/**
 * Normalise a single Shopify product into the SKILL.md schema.
 * Returns null if the product is not jewellery-relevant.
 */
export function normaliseShopifyProduct(
  product: ShopifyProduct,
  retailerId: string,
  baseUrl: string
): NormalisedProduct | null {
  // Parse specs from title + body + tags
  const specs = parseShopifyProduct(product, baseUrl)
  const allFlags: DataQualityFlag[] = [...specs.flags]

  // Classify product type
  const productType = classifyProduct({
    title: product.title,
    bodyHtml: product.body_html || "",
    tags: product.tags || [],
    shopifyProductType: product.product_type || "",
    hasCert: !!specs.certNumber,
    hasCarat: !!specs.carat,
    certBody: specs.certBody,
    diamondType: specs.diamondType,
    metalKarat: specs.metalKarat,
  })

  // Skip completely unclassifiable non-jewellery items
  if (productType === "unknown" && !specs.carat && !specs.certNumber && !specs.metalKarat) {
    return null
  }

  // Price validation (Section 9)
  const rawPrice = product.variants[0]?.price
  const priceResult = validatePrice(rawPrice, productType)
  allFlags.push(...priceResult.flags)

  // Compare-at price
  const compareRaw = product.variants[0]?.compare_at_price
  let compareAtPrice: number | null = null
  if (compareRaw) {
    const parsed = parseFloat(compareRaw.replace(/[^0-9.]/g, ""))
    if (!isNaN(parsed) && parsed > 0) compareAtPrice = parsed
  }

  // Diamond-specific flags
  const isDiamondType = productType.includes("diamond") || productType.includes("engagement")
  if (isDiamondType) {
    if (!specs.certNumber) {
      allFlags.push({ type: "missing_cert_number", severity: "MEDIUM", message: "Diamond product with no certificate number" })
    }
    if (!specs.carat) {
      allFlags.push({ type: "missing_carat", severity: "MEDIUM", message: "Diamond product with no carat weight" })
    }
    if (!specs.cut) {
      allFlags.push({ type: "missing_cut_grade", severity: "LOW", message: "Diamond with no cut grade specified" })
    }
  }

  // Gold-specific flags
  if (productType.startsWith("gold_") && !specs.goldWeightGrams) {
    allFlags.push({ type: "missing_metal_weight", severity: "LOW", message: "Gold product with no gram weight" })
  }

  // Product type flag
  if (productType === "unknown") {
    allFlags.push({ type: "product_type_unknown", severity: "MEDIUM", message: "Could not classify product type" })
  }

  // Deduplicate flags by type
  const uniqueFlags = allFlags.filter((f, i, arr) => arr.findIndex(a => a.type === f.type) === i)
  const flagTypes = uniqueFlags.map(f => f.type)
  const score = calculateDataQualityScore(flagTypes)

  // Setting tier estimation
  let settingTier: string | null = null
  if (specs.settingStyle) {
    if (/solitaire/i.test(specs.settingStyle)) settingTier = specs.metalKarat === "Plat" ? "premium" : "standard"
    else if (/halo|pavé|pave/i.test(specs.settingStyle)) settingTier = "premium"
    else if (/channel|bezel/i.test(specs.settingStyle)) settingTier = "standard"
    else settingTier = "standard"
  }

  return {
    lustrumo_id: generateLustrumoId(),
    retailer_id: retailerId,
    retailer_product_id: String(product.id),
    retailer_sku: product.variants[0]?.sku || null,
    product_url: `${baseUrl}/products/${product.handle}`,
    product_title: product.title,
    product_type: productType,
    platform: "shopify",
    image_url: product.images?.[0]?.src || null,
    is_available: product.variants?.some(v => v.available) ?? true,

    price_aud: priceResult.price_aud,
    price_aud_raw: rawPrice || null,
    compare_at_price_aud: compareAtPrice,
    is_gst_inclusive: true, // AU law requires GST-inclusive pricing for consumers
    price_status: priceResult.price_status,

    diamond_centre_carat: specs.carat,
    diamond_centre_shape: specs.shape,
    diamond_centre_color: specs.color,
    diamond_centre_clarity: specs.clarity,
    diamond_centre_cut: specs.cut,
    diamond_centre_type: specs.diamondType,
    diamond_centre_cert_number: specs.certNumber,
    diamond_centre_cert_body: specs.certBody,
    diamond_centre_fluorescence: specs.fluorescence,
    diamond_centre_polish: specs.polish,
    diamond_centre_symmetry: specs.symmetry,
    diamond_side_stone_type: specs.sideStoneType,
    diamond_side_stone_total_carat: specs.sideStoneCaratTotal,
    diamond_side_stone_count: specs.sideStoneCount,
    diamond_side_stone_quality: specs.sideStoneQuality,

    setting_style: specs.settingStyle,
    setting_tier: settingTier,
    setting_metal_type: specs.metalType,
    setting_metal_karat: specs.metalKarat,
    setting_metal_weight_grams: specs.metalWeightGrams,
    setting_ring_size_au: specs.ringSize,

    gold_karat: specs.goldKarat,
    gold_weight_grams: specs.goldWeightGrams,
    gold_purity: specs.goldPurity,

    data_quality_score: score,
    data_quality_flags: flagTypes,

    locale: "au",
    raw_body_html: (product.body_html || "").substring(0, 10000), // cap storage
  }
}

/**
 * Ingest a batch of normalised products into Supabase.
 * Writes products + flags to ingestion_logs.
 */
export async function ingestProducts(
  supabase: SupabaseClient,
  products: NormalisedProduct[],
  retailerId: string
): Promise<{ ingested: number; flagged: number; flagsSummary: Record<string, number> }> {
  let ingested = 0
  let flagged = 0
  const flagsSummary: Record<string, number> = {}

  for (const product of products) {
    // Upsert product
    const { error } = await supabase
      .from("products")
      .upsert({
        ...product,
        date_updated: new Date().toISOString(),
      }, {
        onConflict: "retailer_id,retailer_product_id",
      })

    if (error) {
      console.error(`  Error upserting ${product.product_url}:`, error.message)
      continue
    }
    ingested++

    // Write flags to ingestion_logs (Section 9 Rule 7: Log every flag)
    if (product.data_quality_flags.length > 0) {
      flagged++
      const logEntries = product.data_quality_flags.map(flagType => {
        flagsSummary[flagType] = (flagsSummary[flagType] || 0) + 1
        return {
          lustrumo_id: product.lustrumo_id,
          retailer_id: retailerId,
          retailer_product_id: product.retailer_product_id,
          product_url: product.product_url,
          flag_type: flagType,
          flag_severity: flagType.startsWith("price") ? "HIGH" : flagType.startsWith("missing") ? "MEDIUM" : "MEDIUM",
          flag_message: `Auto-flagged during ingestion`,
          raw_value: null,
        }
      })

      const { error: logError } = await supabase
        .from("ingestion_logs")
        .insert(logEntries)

      if (logError) {
        console.error(`  Error logging flags for ${product.lustrumo_id}:`, logError.message)
      }
    }
  }

  return { ingested, flagged, flagsSummary }
}
