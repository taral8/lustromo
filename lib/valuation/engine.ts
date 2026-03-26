/**
 * SKILL.md Section 5 — Valuation Logic
 *
 * Total Fair Value = Centre Stone Value + Setting Value + Side Stone Value
 * Always express as a range, not a single number.
 */

// ─── CENTRE STONE VALUE ───
// Base prices per carat (AUD) — sourced from market data
// Natural: approximate Rapaport-derived AU retail
// Lab-grown: approximate IDEX-derived AU retail

const NATURAL_BASE_PER_CARAT: Record<string, number> = {
  "0.3": 3200, "0.5": 4100, "0.7": 5500, "1.0": 6800,
  "1.5": 8500, "2.0": 12000, "3.0": 18000, "4.0": 28000, "5.0": 40000,
}

const LAB_GROWN_BASE_PER_CARAT: Record<string, number> = {
  "0.3": 500, "0.5": 650, "0.7": 800, "1.0": 1100,
  "1.5": 1400, "2.0": 1700, "3.0": 2200, "4.0": 3000, "5.0": 3800,
}

// Color adjustment: % change per grade step from G baseline
const COLOR_GRADES = ["D", "E", "F", "G", "H", "I", "J", "K"]
const COLOR_ADJUSTMENT_PCT = 0.06 // 6% per grade

// Clarity adjustment: % change per grade step from VS2 baseline
const CLARITY_GRADES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"]
const CLARITY_ADJUSTMENT_PCT = 0.04 // 4% per grade

// Cut premium for natural: +15-25% for Excellent (SKILL.md Section 4.1)
const CUT_MULTIPLIER: Record<string, number> = {
  excellent: 1.20,
  ideal: 1.20,
  "very good": 1.08,
  good: 1.00,
  fair: 0.90,
  poor: 0.80,
}

// Shape multipliers (rounds command a premium)
const SHAPE_MULTIPLIER: Record<string, number> = {
  round: 1.00,
  oval: 0.88,
  cushion: 0.85,
  princess: 0.82,
  emerald: 0.85,
  pear: 0.86,
  radiant: 0.84,
  asscher: 0.83,
  marquise: 0.82,
  heart: 0.80,
}

function interpolateBasePrice(carat: number, table: Record<string, number>): number {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b)

  if (carat <= keys[0]) return table[String(keys[0])] * (carat / keys[0])
  if (carat >= keys[keys.length - 1]) return table[String(keys[keys.length - 1])] * (carat / keys[keys.length - 1])

  for (let i = 0; i < keys.length - 1; i++) {
    if (carat >= keys[i] && carat <= keys[i + 1]) {
      const ratio = (carat - keys[i]) / (keys[i + 1] - keys[i])
      const low = table[String(keys[i])]
      const high = table[String(keys[i + 1])]
      return low + (high - low) * ratio
    }
  }
  return table["1.0"]
}

export function estimateCentreStoneValue(
  carat: number,
  color: string | null,
  clarity: string | null,
  cut: string | null,
  shape: string | null,
  type: "natural" | "lab_grown"
): { low: number; high: number; mid: number } {
  const table = type === "natural" ? NATURAL_BASE_PER_CARAT : LAB_GROWN_BASE_PER_CARAT
  let basePerCarat = interpolateBasePrice(carat, table)

  // Color adjustment from G baseline (index 3)
  const colorIdx = COLOR_GRADES.indexOf((color || "G").toUpperCase())
  const colorAdj = colorIdx >= 0 ? (3 - colorIdx) * COLOR_ADJUSTMENT_PCT : 0
  basePerCarat *= (1 + colorAdj)

  // Clarity adjustment from VS2 baseline (index 5)
  const clarityIdx = CLARITY_GRADES.indexOf((clarity || "VS2").toUpperCase())
  const clarityAdj = clarityIdx >= 0 ? (5 - clarityIdx) * CLARITY_ADJUSTMENT_PCT : 0
  basePerCarat *= (1 + clarityAdj)

  // Cut premium (natural only per SKILL.md)
  if (type === "natural" && cut) {
    const mult = CUT_MULTIPLIER[cut.toLowerCase()] ?? 1.0
    basePerCarat *= mult
  }

  // Shape multiplier
  if (shape) {
    const mult = SHAPE_MULTIPLIER[shape.toLowerCase()] ?? 0.90
    basePerCarat *= mult
  }

  const value = basePerCarat * carat
  return {
    low: Math.round(value * 0.85),
    high: Math.round(value * 1.15),
    mid: Math.round(value),
  }
}

// ─── SETTING VALUE (Section 4.1) ───

export const SETTING_VALUE_TIERS: Record<string, { low: number; high: number }> = {
  "basic_9k":     { low: 300, high: 600 },
  "basic_14k":    { low: 300, high: 600 },
  "standard_18k": { low: 500, high: 900 },
  "pave_18k":     { low: 800, high: 1500 },
  "halo_18k":     { low: 800, high: 1500 },
  "premium_18k":  { low: 1500, high: 3500 },
  "platinum":     { low: 2000, high: 5000 },
}

export function estimateSettingValue(
  style: string | null,
  metalKarat: string | null,
): { low: number; high: number; mid: number } {
  const isPlat = metalKarat === "Plat" || metalKarat?.toLowerCase() === "platinum"
  if (isPlat) {
    const t = SETTING_VALUE_TIERS["platinum"]
    return { low: t.low, high: t.high, mid: Math.round((t.low + t.high) / 2) }
  }

  const isPave = style && /pav[eé]|halo|channel/i.test(style)
  const is18k = metalKarat === "18K"
  const is14kOr9k = metalKarat === "14K" || metalKarat === "9K"

  let key = "standard_18k"
  if (isPave && is18k) key = "pave_18k"
  else if (is18k) key = "standard_18k"
  else if (is14kOr9k) key = "basic_14k"

  const t = SETTING_VALUE_TIERS[key] ?? SETTING_VALUE_TIERS["standard_18k"]
  return { low: t.low, high: t.high, mid: Math.round((t.low + t.high) / 2) }
}

// ─── SIDE STONE VALUE (Section 4.1) ───

const SIDE_STONE_PER_CARAT_NATURAL = 1200
const SIDE_STONE_PER_CARAT_LAB = 240  // 80% discount

const QUALITY_MULTIPLIER: Record<string, number> = {
  "F/VS": 1.0,
  "G/SI": 0.7,
  "H/SI2": 0.5,
}

export function estimateSideStoneValue(
  totalCarat: number | null,
  type: "natural" | "lab_grown" | "none" | null,
  quality: string | null,
): { low: number; high: number; mid: number } {
  if (!totalCarat || totalCarat <= 0 || type === "none" || !type) {
    return { low: 0, high: 0, mid: 0 }
  }

  const perCarat = type === "lab_grown" ? SIDE_STONE_PER_CARAT_LAB : SIDE_STONE_PER_CARAT_NATURAL
  const qualMult = (quality && QUALITY_MULTIPLIER[quality]) ? QUALITY_MULTIPLIER[quality] : 0.8
  const value = totalCarat * perCarat * qualMult

  return {
    low: Math.round(value * 0.7),
    high: Math.round(value * 1.3),
    mid: Math.round(value),
  }
}

// ─── TOTAL FAIR VALUE (Section 4.3) ───

export interface FairValueResult {
  centre: { low: number; high: number; mid: number }
  setting: { low: number; high: number; mid: number }
  sideStones: { low: number; high: number; mid: number }
  total: { low: number; high: number; mid: number }
  dataConfidence: number
}

export function calculateFairValue(
  carat: number | null,
  color: string | null,
  clarity: string | null,
  cut: string | null,
  shape: string | null,
  diamondType: "natural" | "lab_grown" | null,
  settingStyle: string | null,
  metalKarat: string | null,
  sideStoneCarat: number | null,
  sideStoneType: "natural" | "lab_grown" | "none" | null,
  sideStoneQuality: string | null,
  dataQualityScore: number,
): FairValueResult | null {
  if (!carat || carat <= 0 || !diamondType) return null

  const centre = estimateCentreStoneValue(carat, color, clarity, cut, shape, diamondType)
  const setting = estimateSettingValue(settingStyle, metalKarat)
  const sideStones = estimateSideStoneValue(sideStoneCarat, sideStoneType, sideStoneQuality)

  const total = {
    low: centre.low + setting.low + sideStones.low,
    high: centre.high + setting.high + sideStones.high,
    mid: centre.mid + setting.mid + sideStones.mid,
  }

  // Data confidence (0-100): based on how many fields are populated
  let confidence = 40 // base: we have carat + type
  if (color) confidence += 10
  if (clarity) confidence += 10
  if (cut) confidence += 8
  if (shape) confidence += 7
  if (metalKarat) confidence += 8
  if (settingStyle) confidence += 7
  if (sideStoneCarat) confidence += 5
  if (sideStoneQuality) confidence += 5
  confidence = Math.min(100, confidence)

  // Penalise if data quality score is low
  if (dataQualityScore < 50) confidence = Math.round(confidence * 0.7)
  else if (dataQualityScore < 70) confidence = Math.round(confidence * 0.85)

  return { centre, setting, sideStones, total, dataConfidence: confidence }
}

// ─── COMPARISON RESULT (Section 6) ───

export type ComparisonStatus =
  | "great_deal"
  | "good_value"
  | "fair_price"
  | "slightly_above"
  | "overpriced"
  | "insufficient_data"
  | "needs_review"

export interface ComparisonResult {
  status: ComparisonStatus
  label: string
  priceDiffPercent: number
  fairValue: FairValueResult
  askingPrice: number
}

export function comparePrice(
  askingPrice: number,
  fairValue: FairValueResult,
): ComparisonResult {
  const { total, dataConfidence } = fairValue

  // Section 6 Rule 6: Never display verdict without confidence ≥ 60
  if (dataConfidence < 60) {
    return {
      status: "needs_review",
      label: "Insufficient confidence for comparison",
      priceDiffPercent: 0,
      fairValue,
      askingPrice,
    }
  }

  // Section 6 comparison statuses
  const pctOfLow = askingPrice / total.low
  const pctOfHigh = askingPrice / total.high

  let status: ComparisonStatus
  let label: string

  if (pctOfLow < 0.85) {
    status = "great_deal"
    label = "Great Deal"
  } else if (pctOfLow >= 0.85 && pctOfLow <= 1.0) {
    status = "good_value"
    label = "Good Value"
  } else if (askingPrice >= total.low && askingPrice <= total.high) {
    status = "fair_price"
    label = "Fair Price"
  } else if (pctOfHigh > 1.0 && pctOfHigh <= 1.15) {
    status = "slightly_above"
    label = "Slightly Above Fair Value"
  } else {
    status = "overpriced"
    label = "Above Fair Value"
  }

  const priceDiffPercent = ((askingPrice - total.mid) / total.mid) * 100

  return { status, label, priceDiffPercent, fairValue, askingPrice }
}
