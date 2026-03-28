import { type SupabaseClient } from "@supabase/supabase-js"
import { type ShopifyProduct, type NormalisedProduct, type DataQualityFlag, type FlagType, FLAG_SCORE_DEDUCTION, FLAG_SEVERITY } from "./types"
import { validatePrice } from "./price-validation"
import { classifyProduct } from "./classify"
import { parseShopifyProduct } from "./parse-shopify"
import { computeEVC } from "./evc"

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
  baseUrl: string,
  retailerName?: string
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

  // Section 4.4 — Compute Equivalent Value Class
  const evc = computeEVC({
    diamondType: specs.diamondType,
    carat: specs.carat,
    color: specs.color,
    clarity: specs.clarity,
    shape: specs.shape,
    certBody: specs.certBody,
  })

  return {
    lustrumo_id: generateLustrumoId(),
    retailer_id: retailerId,
    retailer_name: retailerName || null,
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

    evc,

    data_quality_score: score,
    data_quality_flags: flagTypes,

    locale: "au",
    raw_body_html: (product.body_html || "").substring(0, 10000), // cap storage
  }
}

/**
 * Section 9 Rule 5: Deduplicate by cert number.
 * If two products share the same GIA/IGI cert number, flag both as duplicate_product.
 */
function detectDuplicateCerts(products: NormalisedProduct[]): void {
  const certMap = new Map<string, NormalisedProduct[]>()

  for (const p of products) {
    const cert = p.diamond_centre_cert_number
    if (!cert) continue
    const existing = certMap.get(cert)
    if (existing) {
      existing.push(p)
    } else {
      certMap.set(cert, [p])
    }
  }

  for (const [cert, dupes] of Array.from(certMap.entries())) {
    if (dupes.length < 2) continue
    for (const p of dupes) {
      if (!p.data_quality_flags.includes("duplicate_product")) {
        p.data_quality_flags.push("duplicate_product")
        // Recalculate score with the new flag
        p.data_quality_score = Math.max(0, p.data_quality_score - FLAG_SCORE_DEDUCTION.duplicate_product)
      }
    }
    console.log(`  Duplicate cert ${cert} found on ${dupes.length} products`)
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
  // Section 9 Rule 5: detect duplicate certs within this batch
  detectDuplicateCerts(products)

  // Also check against existing products in the database
  const certsInBatch = products
    .map(p => p.diamond_centre_cert_number)
    .filter((c): c is string => !!c)

  if (certsInBatch.length > 0) {
    const { data: existing } = await supabase
      .from("products")
      .select("diamond_centre_cert_number, retailer_id")
      .in("diamond_centre_cert_number", certsInBatch)
      .neq("retailer_id", retailerId)

    if (existing?.length) {
      const existingCerts = new Set(existing.map(e => e.diamond_centre_cert_number))
      for (const p of products) {
        if (p.diamond_centre_cert_number && existingCerts.has(p.diamond_centre_cert_number)) {
          if (!p.data_quality_flags.includes("duplicate_product")) {
            p.data_quality_flags.push("duplicate_product")
            p.data_quality_score = Math.max(0, p.data_quality_score - FLAG_SCORE_DEDUCTION.duplicate_product)
          }
        }
      }
    }
  }

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
          flag_severity: FLAG_SEVERITY[flagType] || "MEDIUM",
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
