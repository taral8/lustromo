/**
 * Lustrumo — Natural Diamond Valuation Engine (Phase 3B)
 *
 * Fair price estimation from market data base tables.
 * Without Rapaport API access, uses approximate retail price tables
 * for round brilliant as baseline, with shape multipliers.
 *
 * SKILL.md Section 5.1: Always express fair value as a range.
 */

// ─── Types ───

export type NaturalDiamondVerdict =
  | "below_market"
  | "fair_price"
  | "above_market"
  | "significantly_above"
  | "insufficient_data"

export interface NaturalDiamondValuation {
  fair_estimate: number
  fair_range: { low: number; high: number }
  verdict: NaturalDiamondVerdict
  verdict_label: string
  price_diff_pct: number | null // % above/below estimate, null if no retail price
  shape_multiplier: number
  base_price_source: string // description of how base was derived
}

// ─── Base Price Table (AUD, Round Brilliant) ───

// Columns: D-F IF-VVS | D-F VS | D-F SI | G-I IF-VVS | G-I VS | G-I SI | J-K VS-SI
type ColorClarityBand = "DEF_IFVVS" | "DEF_VS" | "DEF_SI" | "GHI_IFVVS" | "GHI_VS" | "GHI_SI" | "JK_VSSI"

const BASE_PRICES: { carat: number; prices: Record<ColorClarityBand, number> }[] = [
  { carat: 0.3, prices: { DEF_IFVVS: 1200, DEF_VS: 900, DEF_SI: 650, GHI_IFVVS: 900, GHI_VS: 700, GHI_SI: 500, JK_VSSI: 400 } },
  { carat: 0.5, prices: { DEF_IFVVS: 3500, DEF_VS: 2400, DEF_SI: 1600, GHI_IFVVS: 2500, GHI_VS: 1800, GHI_SI: 1200, JK_VSSI: 800 } },
  { carat: 0.7, prices: { DEF_IFVVS: 5500, DEF_VS: 4000, DEF_SI: 2800, GHI_IFVVS: 4200, GHI_VS: 3000, GHI_SI: 2000, JK_VSSI: 1400 } },
  { carat: 1.0, prices: { DEF_IFVVS: 12000, DEF_VS: 8500, DEF_SI: 5500, GHI_IFVVS: 9000, GHI_VS: 6500, GHI_SI: 4200, JK_VSSI: 2800 } },
  { carat: 1.5, prices: { DEF_IFVVS: 22000, DEF_VS: 16000, DEF_SI: 10000, GHI_IFVVS: 17000, GHI_VS: 12000, GHI_SI: 7500, JK_VSSI: 5000 } },
  { carat: 2.0, prices: { DEF_IFVVS: 45000, DEF_VS: 32000, DEF_SI: 20000, GHI_IFVVS: 35000, GHI_VS: 24000, GHI_SI: 15000, JK_VSSI: 10000 } },
  { carat: 3.0, prices: { DEF_IFVVS: 95000, DEF_VS: 65000, DEF_SI: 40000, GHI_IFVVS: 70000, GHI_VS: 48000, GHI_SI: 30000, JK_VSSI: 20000 } },
]

// ─── Shape Multipliers ───

const SHAPE_MULTIPLIERS: Record<string, number> = {
  round: 1.00,
  oval: 0.85,
  cushion: 0.80,
  princess: 0.75,
  emerald: 0.78,
  pear: 0.82,
  radiant: 0.77,
  asscher: 0.78,
  marquise: 0.70,
  heart: 0.72,
}

// ─── Helpers ───

function getColorBand(color: string): "DEF" | "GHI" | "JK" | null {
  const c = color.toUpperCase()
  if ("DEF".includes(c) && c.length === 1) return "DEF"
  if ("GHI".includes(c) && c.length === 1) return "GHI"
  if ("JK".includes(c) && c.length === 1) return "JK"
  return null
}

function getClarityBand(clarity: string): "IFVVS" | "VS" | "SI" | null {
  const cl = clarity.toUpperCase()
  if (cl === "FL" || cl === "IF" || cl === "VVS1" || cl === "VVS2") return "IFVVS"
  if (cl === "VS1" || cl === "VS2") return "VS"
  if (cl === "SI1" || cl === "SI2") return "SI"
  return null // I1+ not in our table — insufficient for reliable valuation
}

function getColorClarityBand(color: string, clarity: string): ColorClarityBand | null {
  const cb = getColorBand(color)
  const clb = getClarityBand(clarity)
  if (!cb || !clb) return null

  if (cb === "JK") {
    // J-K only has VS-SI column
    if (clb === "IFVVS") return "GHI_IFVVS" // approximate upward
    return "JK_VSSI"
  }

  return `${cb}_${clb}` as ColorClarityBand
}

/**
 * Interpolate base price for a given carat weight.
 * Uses linear interpolation between the two nearest table entries.
 */
function interpolateBasePrice(carat: number, band: ColorClarityBand): number {
  // Below minimum
  if (carat <= BASE_PRICES[0].carat) {
    return BASE_PRICES[0].prices[band] * (carat / BASE_PRICES[0].carat)
  }

  // Above maximum
  const last = BASE_PRICES[BASE_PRICES.length - 1]
  if (carat >= last.carat) {
    return last.prices[band] * (carat / last.carat)
  }

  // Find surrounding entries
  for (let i = 0; i < BASE_PRICES.length - 1; i++) {
    const low = BASE_PRICES[i]
    const high = BASE_PRICES[i + 1]
    if (carat >= low.carat && carat <= high.carat) {
      const ratio = (carat - low.carat) / (high.carat - low.carat)
      return low.prices[band] + ratio * (high.prices[band] - low.prices[band])
    }
  }

  return BASE_PRICES[3].prices[band] // fallback to 1ct
}

// ─── Verdict labels ───

const VERDICT_LABELS: Record<NaturalDiamondVerdict, string> = {
  below_market: "Below Market",
  fair_price: "Fair Price",
  above_market: "Above Market",
  significantly_above: "Significantly Above Market",
  insufficient_data: "Insufficient Data",
}

// ─── Main Valuation ───

export interface NaturalDiamondInput {
  carat: number | null
  color: string | null
  clarity: string | null
  shape: string | null
  retail_price: number | null
}

/**
 * Estimate fair value for a natural diamond.
 * Returns null only if we truly can't compute anything (no carat at all).
 */
export function valuateNaturalDiamond(input: NaturalDiamondInput): NaturalDiamondValuation | null {
  const { carat, color, clarity, shape, retail_price } = input

  // Must have carat weight
  if (!carat || carat <= 0) return null

  // Must have color AND clarity for a meaningful estimate
  if (!color || !clarity) {
    return {
      fair_estimate: 0,
      fair_range: { low: 0, high: 0 },
      verdict: "insufficient_data",
      verdict_label: VERDICT_LABELS.insufficient_data,
      price_diff_pct: null,
      shape_multiplier: 1,
      base_price_source: "Missing color or clarity — cannot estimate",
    }
  }

  const band = getColorClarityBand(color, clarity)
  if (!band) {
    return {
      fair_estimate: 0,
      fair_range: { low: 0, high: 0 },
      verdict: "insufficient_data",
      verdict_label: VERDICT_LABELS.insufficient_data,
      price_diff_pct: null,
      shape_multiplier: 1,
      base_price_source: `Color ${color} / Clarity ${clarity} outside valuation range`,
    }
  }

  // Base price from table (round brilliant)
  const basePrice = interpolateBasePrice(carat, band)

  // Shape multiplier
  const shapeKey = (shape || "round").toLowerCase()
  const shapeMult = SHAPE_MULTIPLIERS[shapeKey] ?? 0.80

  // Fair estimate
  const fairEstimate = Math.round(basePrice * shapeMult)

  // ±20% range (natural diamonds have wider variance)
  const fairLow = Math.round(fairEstimate * 0.80)
  const fairHigh = Math.round(fairEstimate * 1.20)

  // Verdict
  let verdict: NaturalDiamondVerdict = "insufficient_data"
  let priceDiffPct: number | null = null

  if (retail_price && retail_price > 0) {
    priceDiffPct = Math.round(((retail_price / fairEstimate) - 1) * 1000) / 10

    if (retail_price < fairEstimate * 0.85) {
      verdict = "below_market"
    } else if (retail_price <= fairEstimate * 1.15) {
      verdict = "fair_price"
    } else if (retail_price <= fairEstimate * 1.40) {
      verdict = "above_market"
    } else {
      verdict = "significantly_above"
    }
  } else {
    // No retail price — we can still provide the estimate
    verdict = "insufficient_data"
  }

  const bandLabel = band.replace("_", " ").replace("DEF", "D-F").replace("GHI", "G-I").replace("JK", "J-K")
    .replace("IFVVS", "IF-VVS").replace("VSSI", "VS-SI")

  return {
    fair_estimate: fairEstimate,
    fair_range: { low: fairLow, high: fairHigh },
    verdict,
    verdict_label: VERDICT_LABELS[verdict],
    price_diff_pct: priceDiffPct,
    shape_multiplier: shapeMult,
    base_price_source: `${carat}ct ${bandLabel} ${shapeKey} (${shapeMult}× shape adj.)`,
  }
}
