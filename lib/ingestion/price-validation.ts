import { type PriceStatus, type DataQualityFlag, type ProductType } from "./types"

/**
 * SKILL.md Section 9 — Price Validation Rules
 * Always run on ingestion before storing any price field.
 */

interface PriceValidationResult {
  price_aud: number | null
  price_status: PriceStatus
  flags: DataQualityFlag[]
}

export function validatePrice(
  rawPrice: string | null | undefined,
  productType: ProductType
): PriceValidationResult {
  const flags: DataQualityFlag[] = []

  // Rule 5: If price cannot be parsed as a number → status = missing
  if (!rawPrice || rawPrice.trim() === "") {
    return { price_aud: null, price_status: "missing", flags: [] }
  }

  const cleaned = rawPrice.replace(/[^0-9.]/g, "")
  const parsed = parseFloat(cleaned)

  if (isNaN(parsed)) {
    return {
      price_aud: null,
      price_status: "missing",
      flags: [{
        type: "price_suspicious",
        severity: "HIGH",
        message: `Could not parse price from raw value`,
        rawValue: rawPrice,
      }],
    }
  }

  // Rule 1: If result is 0 → status = zero
  if (parsed === 0) {
    return {
      price_aud: 0,
      price_status: "zero",
      flags: [{
        type: "price_zero",
        severity: "HIGH",
        message: "Price is $0.00 — unpublished or placeholder",
        rawValue: rawPrice,
      }],
    }
  }

  let finalPrice = parsed

  // Rule 4: Detect decimal error — if price * 100 == parseInt(raw)
  // Shopify products.json returns price as string like "8614.00" (already in dollars)
  // But some sources may return cents. Check if dividing by 100 gives a plausible value.
  const rawAsInt = parseInt(cleaned, 10)
  if (Math.abs(finalPrice * 100 - rawAsInt) < 1 && finalPrice > 10000) {
    // Check if price/100 falls in plausible range for the product type
    const divided = finalPrice / 100
    const isDiamondType = productType.includes("diamond") || productType.includes("engagement")
    const isGoldType = productType.startsWith("gold_")

    if ((isDiamondType && divided >= 50 && divided <= 100000) ||
        (isGoldType && divided >= 20 && divided <= 50000)) {
      // This looks like a cents-to-dollars error
      flags.push({
        type: "price_decimal_error",
        severity: "HIGH",
        message: `Detected potential decimal error: raw=${rawPrice}, parsed=${finalPrice}, corrected=${divided}`,
        rawValue: rawPrice,
      })
      finalPrice = divided
    }
  }

  // Rule 2: If price > $500,000 AUD → status = suspicious
  if (finalPrice > 500000) {
    return {
      price_aud: finalPrice,
      price_status: "suspicious",
      flags: [{
        type: "price_suspicious",
        severity: "HIGH",
        message: `Price exceeds $500,000 AUD — likely decimal error`,
        rawValue: rawPrice,
      }],
    }
  }

  // Rule 3: If price < $50 AUD for a diamond product → status = suspicious
  const isDiamond = productType.includes("diamond") || productType.includes("engagement")
  if (isDiamond && finalPrice < 50) {
    return {
      price_aud: finalPrice,
      price_status: "suspicious",
      flags: [{
        type: "price_suspicious",
        severity: "HIGH",
        message: `Diamond product priced below $50 AUD — suspicious`,
        rawValue: rawPrice,
      }],
    }
  }

  return {
    price_aud: finalPrice,
    price_status: flags.length > 0 ? "needs_review" : "valid",
    flags,
  }
}
