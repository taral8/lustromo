/**
 * SKILL.md Section 8 — Retailer Rating System
 *
 * Four dimensions, weighted:
 *   Data Completeness    30%  — % of required fields populated
 *   Pricing Accuracy     30%  — % of products with valid, non-zero, non-suspicious prices
 *   Certification Compliance 25% — % of diamond products with verifiable cert numbers
 *   Response/Recency     15%  — how frequently product data is updated
 *
 * Overall score = weighted average × 100
 *
 * Rating tiers:
 *   90–100  Lustrumo Verified ✦
 *   75–89   High Confidence
 *   50–74   Moderate Confidence
 *   25–49   Low Confidence
 *   0–24    Insufficient Data
 */

export interface RetailerDimensionScores {
  dataCompleteness: number    // 0–1
  pricingAccuracy: number     // 0–1
  certificationCompliance: number // 0–1
  responseRecency: number     // 0–1
}

export interface RetailerScore {
  overall: number             // 0–100
  tier: RetailerTier
  dimensions: RetailerDimensionScores
  productCount: number
  diamondCount: number
}

export type RetailerTier =
  | "Lustrumo Verified ✦"
  | "High Confidence"
  | "Moderate Confidence"
  | "Low Confidence"
  | "Insufficient Data"

const WEIGHTS = {
  dataCompleteness: 0.30,
  pricingAccuracy: 0.30,
  certificationCompliance: 0.25,
  responseRecency: 0.15,
}

export function getTier(score: number): RetailerTier {
  if (score >= 90) return "Lustrumo Verified ✦"
  if (score >= 75) return "High Confidence"
  if (score >= 50) return "Moderate Confidence"
  if (score >= 25) return "Low Confidence"
  return "Insufficient Data"
}

export function getTierColor(tier: RetailerTier): string {
  switch (tier) {
    case "Lustrumo Verified ✦": return "#0D9488"
    case "High Confidence": return "#10B981"
    case "Moderate Confidence": return "#3B82F6"
    case "Low Confidence": return "#F59E0B"
    case "Insufficient Data": return "#94A3B8"
  }
}

// Required fields for data completeness scoring
// Diamond products: carat, shape, color, clarity, type, cert_body, metal_type
// Gold products: karat, weight, purity, metal_type
const DIAMOND_REQUIRED_FIELDS = [
  "diamond_centre_carat",
  "diamond_centre_shape",
  "diamond_centre_color",
  "diamond_centre_clarity",
  "diamond_centre_type",
  "diamond_centre_cert_body",
  "setting_metal_type",
] as const

const GOLD_REQUIRED_FIELDS = [
  "gold_karat",
  "gold_weight_grams",
  "gold_purity",
  "setting_metal_type",
] as const

export interface ProductForScoring {
  product_type: string
  price_status: string
  price_aud: number | null
  diamond_centre_carat: number | null
  diamond_centre_shape: string | null
  diamond_centre_color: string | null
  diamond_centre_clarity: string | null
  diamond_centre_type: string | null
  diamond_centre_cert_body: string | null
  diamond_centre_cert_number: string | null
  setting_metal_type: string | null
  gold_karat: string | null
  gold_weight_grams: number | null
  gold_purity: number | null
  date_updated: string
}

export function scoreRetailer(products: ProductForScoring[]): RetailerScore {
  if (products.length === 0) {
    return {
      overall: 0,
      tier: "Insufficient Data",
      dimensions: { dataCompleteness: 0, pricingAccuracy: 0, certificationCompliance: 0, responseRecency: 0 },
      productCount: 0,
      diamondCount: 0,
    }
  }

  const diamondProducts = products.filter(p =>
    p.product_type.includes("diamond") || p.product_type.includes("engagement")
  )
  const goldProducts = products.filter(p => p.product_type.startsWith("gold_"))

  // ─── 1. Data Completeness (30%) ───
  let totalFields = 0
  let populatedFields = 0

  for (const p of diamondProducts) {
    for (const field of DIAMOND_REQUIRED_FIELDS) {
      totalFields++
      if (p[field] !== null && p[field] !== undefined && p[field] !== "") populatedFields++
    }
  }
  for (const p of goldProducts) {
    for (const field of GOLD_REQUIRED_FIELDS) {
      totalFields++
      if (p[field] !== null && p[field] !== undefined && p[field] !== "") populatedFields++
    }
  }

  const dataCompleteness = totalFields > 0 ? populatedFields / totalFields : 0

  // ─── 2. Pricing Accuracy (30%) ───
  const validPriceCount = products.filter(p => p.price_status === "valid" && p.price_aud && p.price_aud > 0).length
  const pricingAccuracy = products.length > 0 ? validPriceCount / products.length : 0

  // ─── 3. Certification Compliance (25%) ───
  const certifiedCount = diamondProducts.filter(p =>
    p.diamond_centre_cert_number && p.diamond_centre_cert_number.length >= 6
  ).length
  const certificationCompliance = diamondProducts.length > 0 ? certifiedCount / diamondProducts.length : 0

  // ─── 4. Response/Recency (15%) ───
  // Score based on how recently products were updated
  // Within 24h = 1.0, within 7d = 0.8, within 30d = 0.5, older = 0.2
  const now = Date.now()
  let recencyTotal = 0
  for (const p of products) {
    const updated = new Date(p.date_updated).getTime()
    const ageMs = now - updated
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    if (ageDays <= 1) recencyTotal += 1.0
    else if (ageDays <= 7) recencyTotal += 0.8
    else if (ageDays <= 30) recencyTotal += 0.5
    else recencyTotal += 0.2
  }
  const responseRecency = products.length > 0 ? recencyTotal / products.length : 0

  // ─── Overall Score ───
  const dimensions: RetailerDimensionScores = {
    dataCompleteness,
    pricingAccuracy,
    certificationCompliance,
    responseRecency,
  }

  const overall = Math.round(
    (dimensions.dataCompleteness * WEIGHTS.dataCompleteness +
     dimensions.pricingAccuracy * WEIGHTS.pricingAccuracy +
     dimensions.certificationCompliance * WEIGHTS.certificationCompliance +
     dimensions.responseRecency * WEIGHTS.responseRecency) * 100
  )

  return {
    overall,
    tier: getTier(overall),
    dimensions,
    productCount: products.length,
    diamondCount: diamondProducts.length,
  }
}
