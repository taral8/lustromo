/**
 * Lustrumo — Gold Valuation Engine (Phase 2B)
 *
 * SKILL.md Section 5.2:
 *   intrinsic_value = weight_grams × purity × spot_price_aud_per_gram
 *   retail_value = intrinsic_value × making_charge_multiplier
 *
 * For products without listed weight, estimates from product type medians.
 */

import { type GoldProductType } from "../scrapers/gold-scraper"

// ─── Types ───

export type MakingChargeRating = "low" | "average" | "high" | "very_high"

export interface GoldValuationResult {
  estimated_intrinsic_value: number
  weight_source: "listed" | "estimated"
  estimated_weight_grams: number
  making_charge_pct: number
  making_charge_rating: MakingChargeRating
  fair_price_range: { low: number; high: number }
  is_fair: boolean
}

// ─── Constants ───

// Default 24K gold spot price AUD per gram (placeholder — replaced by live feed)
const DEFAULT_SPOT_PRICE_24K = 135.20

// Karat purity fractions (equivalent to karat/24)
const KARAT_PURITY: Record<number, number> = {
  9: 0.375,
  14: 0.5833,
  18: 0.75,
  22: 0.9167,
  24: 0.9999,
}

// Median weight estimates by product type (grams)
const WEIGHT_ESTIMATES: Record<GoldProductType, number> = {
  ring: 4,
  chain: 12,      // midpoint of light (8) and heavy (25) ≈ 12
  bangle: 15,
  pendant: 3,
  earring: 4,     // pair
  necklace: 20,
  bracelet: 8,
  mangalsutra: 12,
  nosering: 1,
  anklet: 8,
  coin: 5,        // default, overridden by title parse
  brooch: 5,
  unknown: 6,     // conservative median across all types
}

// Making charge rating thresholds (percentage above intrinsic)
// low: <15%, average: 15-30%, high: 30-50%, very_high: >50%

function rateMakingCharge(pct: number): MakingChargeRating {
  if (pct < 15) return "low"
  if (pct <= 30) return "average"
  if (pct <= 50) return "high"
  return "very_high"
}

// Fair making charge ranges by product type (% above intrinsic)
const FAIR_MAKING_CHARGE: Record<GoldProductType, { low: number; high: number }> = {
  ring: { low: 15, high: 40 },
  chain: { low: 10, high: 25 },
  bangle: { low: 15, high: 35 },
  pendant: { low: 15, high: 35 },
  earring: { low: 20, high: 45 },
  necklace: { low: 15, high: 40 },
  bracelet: { low: 15, high: 35 },
  mangalsutra: { low: 20, high: 50 },
  nosering: { low: 25, high: 60 },
  anklet: { low: 15, high: 35 },
  coin: { low: 3, high: 12 },
  brooch: { low: 25, high: 55 },
  unknown: { low: 15, high: 45 },
}

// ─── Coin weight parser ───

/**
 * Try to extract coin weight from product title.
 * Patterns: "1g gold coin", "10 gram coin", "5gm coin"
 */
function parseCoinWeight(title: string): number | null {
  const match = title.match(/(\d+\.?\d*)\s*(?:g(?:ram|ms?|m)?)\s*(?:gold\s*)?(?:coin|biscuit)/i)
    || title.match(/(?:coin|biscuit)\s*[\-–]\s*(\d+\.?\d*)\s*(?:g(?:ram|ms?|m)?)/i)
  if (match) {
    const val = parseFloat(match[1])
    if (val > 0 && val <= 100) return val
  }
  return null
}

// ─── Main Valuation ───

export interface GoldValuationInput {
  price_aud: number | null
  karat: number | null
  weight_grams: number | null
  product_type: GoldProductType
  product_title: string
  has_diamonds: boolean
  has_gemstones: boolean
  spot_price_24k?: number // optional override for live price
}

/**
 * Calculate the gold valuation for a product.
 *
 * Returns null if we can't compute a meaningful valuation
 * (e.g. no karat and no price).
 */
export function valuateGoldProduct(input: GoldValuationInput): GoldValuationResult | null {
  const spotPrice = input.spot_price_24k ?? DEFAULT_SPOT_PRICE_24K

  // Must have karat to compute intrinsic value
  const karat = input.karat
  if (!karat || !KARAT_PURITY[karat]) return null

  const purity = KARAT_PURITY[karat]

  // Determine weight: listed > coin parse > estimate
  let weightGrams: number
  let weightSource: "listed" | "estimated"

  if (input.weight_grams && input.weight_grams > 0) {
    weightGrams = input.weight_grams
    weightSource = "listed"
  } else {
    // Try coin weight from title
    if (input.product_type === "coin") {
      const coinWeight = parseCoinWeight(input.product_title)
      if (coinWeight) {
        weightGrams = coinWeight
        weightSource = "estimated" // still estimated since it's parsed, not listed structured data
      } else {
        weightGrams = WEIGHT_ESTIMATES.coin
        weightSource = "estimated"
      }
    } else {
      weightGrams = WEIGHT_ESTIMATES[input.product_type] ?? WEIGHT_ESTIMATES.unknown
      weightSource = "estimated"
    }
  }

  // Intrinsic value = weight × purity × spot price
  const intrinsicValue = weightGrams * purity * spotPrice

  // Making charge calculation
  let makingChargePct = 0
  if (input.price_aud && input.price_aud > 0 && intrinsicValue > 0) {
    makingChargePct = ((input.price_aud / intrinsicValue) - 1) * 100
  }

  // Clamp to reasonable range — negative means price is below melt (suspicious or sale)
  const makingChargeRating = rateMakingCharge(makingChargePct)

  // Fair price range: intrinsic × (1 + fair making charge range)
  // If product has diamonds/gemstones, expand the high end — stones add value beyond gold
  const fairRange = FAIR_MAKING_CHARGE[input.product_type] ?? FAIR_MAKING_CHARGE.unknown
  let fairHighMultiplier = fairRange.high / 100
  if (input.has_diamonds) fairHighMultiplier += 0.30 // diamonds can add significant value
  if (input.has_gemstones) fairHighMultiplier += 0.15

  const fairLow = Math.round(intrinsicValue * (1 + fairRange.low / 100))
  const fairHigh = Math.round(intrinsicValue * (1 + fairHighMultiplier))

  // Is the retail price within the fair range?
  const isFair = input.price_aud != null
    ? input.price_aud >= fairLow * 0.9 && input.price_aud <= fairHigh * 1.1 // 10% tolerance
    : false

  return {
    estimated_intrinsic_value: Math.round(intrinsicValue * 100) / 100,
    weight_source: weightSource,
    estimated_weight_grams: weightGrams,
    making_charge_pct: Math.round(makingChargePct * 10) / 10,
    making_charge_rating: makingChargeRating,
    fair_price_range: { low: fairLow, high: fairHigh },
    is_fair: isFair,
  }
}
