import { type ShopifyProduct, type DataQualityFlag } from "./types"

/**
 * SKILL.md Section 9 Rule 2:
 * Parse diamond specs from HTML if structured fields are missing —
 * use regex on body_html for patterns like 1.00ct, VS1, GIA, #[0-9]{10}
 */

const SHAPES = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
const CLARITY_GRADES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"]
export interface ParsedSpecs {
  carat: number | null
  shape: string | null
  color: string | null
  clarity: string | null
  cut: string | null
  fluorescence: string | null
  polish: string | null
  symmetry: string | null
  certBody: "GIA" | "IGI" | "HRD" | "none" | null
  certNumber: string | null
  diamondType: "natural" | "lab_grown" | null
  sideStoneType: "natural" | "lab_grown" | "none" | null
  sideStoneCaratTotal: number | null
  sideStoneCount: number | null
  sideStoneQuality: string | null
  metalType: string | null
  metalKarat: string | null
  metalWeightGrams: number | null
  settingStyle: string | null
  ringSize: string | null
  goldKarat: string | null
  goldWeightGrams: number | null
  goldPurity: number | null
  specsFromDescription: boolean // true if specs came from HTML parsing, not structured data
  flags: DataQualityFlag[]
}

const KARAT_PURITY: Record<string, number> = {
  "9K": 0.375, "14K": 0.585, "18K": 0.750, "22K": 0.916, "24K": 0.999,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function parseShopifyProduct(product: ShopifyProduct, _baseUrl: string): ParsedSpecs {
  const text = [product.title, product.body_html, product.tags.join(" ")].join("\n")
  const lower = text.toLowerCase()
  const titleLower = product.title.toLowerCase()
  const urlSlug = product.handle.toLowerCase()
  const flags: DataQualityFlag[] = []
  let specsFromDescription = false

  // ─── CERT BODY ───
  let certBody: ParsedSpecs["certBody"] = null
  if (/\bGIA\b/.test(text)) certBody = "GIA"
  else if (/\bIGI\b/.test(text)) certBody = "IGI"
  else if (/\bHRD\b/.test(text)) certBody = "HRD"

  // ─── CERT NUMBER (Section 9 Rule 2) ───
  // Pattern: #[0-9]{6,} or "certificate: 1234567890" or GIA #1234567890
  let certNumber: string | null = null
  const certPatterns = [
    /#(\d{6,})/,
    /(?:certificate|cert|report)\s*[:#]?\s*(\d{6,})/i,
    /(?:GIA|IGI|HRD)\s*#?(\d{6,})/i,
  ]
  for (const p of certPatterns) {
    const m = text.match(p)
    if (m?.[1]) { certNumber = m[1]; break }
  }

  // ─── DIAMOND TYPE ───
  let diamondType: "natural" | "lab_grown" | null = null
  if (/\bnatural\b/i.test(product.title)) diamondType = "natural"
  if (/lab[\s-]?grown|lab[\s-]?created|cvd|hpht|laboratory/i.test(lower)) diamondType = "lab_grown"
  if (!diamondType && certBody === "GIA") diamondType = "natural"
  if (!diamondType && certBody === "IGI" && !/\bnatural\b/i.test(lower)) diamondType = "lab_grown"

  // ─── CARAT ───
  let carat: number | null = null
  const caratPatterns = [
    /(?:diamond|stone|centre|center)\s*[:\-]?\s*(\d+\.?\d*)\s*ct/i,
    /(\d+\.?\d*)ct\b/i,
    /(\d+\.?\d*)\s*carat/i,
  ]
  for (const p of caratPatterns) {
    const m = text.match(p)
    if (m?.[1]) {
      const val = parseFloat(m[1])
      if (val > 0 && val < 30) { carat = val; break }
    }
  }
  // Check if carat came from body_html only (not title)
  if (!carat) {
    specsFromDescription = true
  } else if (!/\d+\.?\d*ct/i.test(product.title) && !/\d+\.?\d*\s*carat/i.test(product.title)) {
    specsFromDescription = true
  }

  // ─── SHAPE ───
  let shape: string | null = null
  // Priority: URL slug → title → body
  for (const s of SHAPES) {
    if (urlSlug.includes(s)) { shape = s; break }
  }
  if (!shape) {
    for (const s of SHAPES) {
      if (titleLower.includes(s)) { shape = s; break }
    }
  }
  if (!shape) {
    for (const s of SHAPES) {
      if (lower.includes(s)) { shape = s; specsFromDescription = true; break }
    }
  }

  // ─── COLOR + CLARITY ───
  let color: string | null = null
  let clarity: string | null = null

  // Combined: "VS1 H" or "H VS1" or "Info: VS1 H"
  const combo1 = text.match(/\b(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\s+([D-K])\b/i)
  const combo2 = text.match(/\b([D-K])\s+(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\b/i)
  if (combo1) { clarity = combo1[1].toUpperCase(); color = combo1[2].toUpperCase() }
  else if (combo2) { color = combo2[1].toUpperCase(); clarity = combo2[2].toUpperCase() }

  // Labelled: "Color: H" "Clarity: VS1"
  if (!color) {
    const m = text.match(/(?:colo[u]?r)\s*[:\-]\s*([D-K])\b/i)
    if (m) color = m[1].toUpperCase()
  }
  if (!clarity) {
    const m = text.match(/(?:clarity)\s*[:\-]\s*(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\b/i)
    if (m) clarity = m[1].toUpperCase()
  }
  // Standalone clarity
  if (!clarity) {
    for (const g of CLARITY_GRADES) {
      if (new RegExp(`\\b${g}\\b`).test(text)) { clarity = g; break }
    }
  }

  // ─── CUT, POLISH, SYMMETRY ───
  let cut: string | null = null
  const cutMatch = text.match(/(?:cut)\s*[:\-]\s*(excellent|ideal|very\s*good|good|fair|poor)/i)
  if (cutMatch) cut = cutMatch[1].trim()

  let polish: string | null = null
  const polishMatch = text.match(/(?:polish)\s*[:\-]\s*(excellent|very\s*good|good|fair|poor)/i)
  if (polishMatch) polish = polishMatch[1].trim()

  let symmetry: string | null = null
  const symMatch = text.match(/(?:symmetry)\s*[:\-]\s*(excellent|very\s*good|good|fair|poor)/i)
  if (symMatch) symmetry = symMatch[1].trim()

  let fluorescence: string | null = null
  const fluMatch = text.match(/(?:fluorescence)\s*[:\-]\s*(none|faint|medium|strong|very\s*strong)/i)
  if (fluMatch) fluorescence = fluMatch[1].trim()

  // ─── SIDE STONES ───
  let sideStoneType: ParsedSpecs["sideStoneType"] = "none"
  let sideStoneCaratTotal: number | null = null
  let sideStoneCount: number | null = null
  let sideStoneQuality: string | null = null

  if (/side[\s_-]?stone/i.test(text) || /accent|shoulder|pav[eé]|halo/i.test(lower)) {
    const sideTypeMatch = text.match(/side[\s_-]?stone[\s_-]?type\s*[:\-]\s*(natural|lab[\s-]?grown|labgrown)/i)
    if (sideTypeMatch) {
      sideStoneType = /lab/i.test(sideTypeMatch[1]) ? "lab_grown" : "natural"
    } else {
      sideStoneType = diamondType || "natural"
    }
    const sideCarat = text.match(/side[\s_-]?stone.*?(\d+\.?\d*)\s*ct/i)
    if (sideCarat) sideStoneCaratTotal = parseFloat(sideCarat[1])
    const sideCount = text.match(/(\d+)\s*(?:side|accent)\s*(?:stone|diamond)/i)
    if (sideCount) sideStoneCount = parseInt(sideCount[1])
    const sideQual = text.match(/side.*?quality\s*[:\-]\s*([A-Z]+\/?[A-Z]*)/i)
    if (sideQual) sideStoneQuality = sideQual[1]
  }

  // ─── METAL / SETTING ───
  let metalType: string | null = null
  let metalKarat: string | null = null
  let metalWeightGrams: number | null = null
  let settingStyle: string | null = null
  let ringSize: string | null = null

  const metalPatterns: [RegExp, string, string][] = [
    [/18\s*[kK](?:t)?\s*(yellow|white|rose)?\s*gold/i, "18K", "18K Gold"],
    [/14\s*[kK](?:t)?\s*(yellow|white|rose)?\s*gold/i, "14K", "14K Gold"],
    [/9\s*[kK](?:t)?\s*(yellow|white|rose)?\s*gold/i, "9K", "9K Gold"],
    [/22\s*[kK](?:t)?\s*(yellow|white|rose)?\s*gold/i, "22K", "22K Gold"],
    [/\bplatinum\b/i, "Plat", "Platinum"],
  ]
  for (const [regex, karat, label] of metalPatterns) {
    const m = text.match(regex)
    if (m) {
      metalKarat = karat
      const colorWord = m[1]?.toLowerCase()
      metalType = colorWord
        ? `${karat} ${colorWord.charAt(0).toUpperCase() + colorWord.slice(1)} Gold`
        : label
      break
    }
  }

  // Setting style
  const settingPatterns = ["solitaire", "halo", "pavé", "pave", "channel", "bezel", "tension", "cathedral", "vintage", "trilogy", "cluster"]
  for (const s of settingPatterns) {
    if (lower.includes(s)) { settingStyle = s.charAt(0).toUpperCase() + s.slice(1); break }
  }

  // Ring size
  const sizeMatch = text.match(/(?:ring\s*)?size\s*[:\-]\s*([A-Z](?:\s*\d\/\d)?|\d+\.?\d*)/i)
  if (sizeMatch) ringSize = sizeMatch[1].trim()

  // Metal weight
  const metalWt = text.match(/(?:metal|gold|setting)\s*(?:weight)?\s*[:\-]\s*([\d.]+)\s*g/i)
  if (metalWt) metalWeightGrams = parseFloat(metalWt[1])

  // ─── GOLD-SPECIFIC ───
  let goldKarat: string | null = null
  let goldWeightGrams: number | null = null
  let goldPurity: number | null = null

  // For gold_* products, map from metal fields
  if (metalKarat && metalKarat !== "Plat") {
    goldKarat = metalKarat
    goldPurity = KARAT_PURITY[metalKarat] || null
  }
  const goldWt = text.match(/([\d.]+)\s*(?:grams?|gms?|g\b)/i)
  if (goldWt) goldWeightGrams = parseFloat(goldWt[1])

  // ─── GENERATE FLAGS ───
  if (specsFromDescription && carat) {
    flags.push({ type: "description_only_data", severity: "MEDIUM", message: "Diamond specs parsed from HTML body, not structured fields" })
  }
  if (!product.images?.length) {
    flags.push({ type: "image_missing", severity: "LOW", message: "No product image available" })
  }

  return {
    carat, shape, color, clarity, cut, fluorescence, polish, symmetry,
    certBody, certNumber, diamondType,
    sideStoneType, sideStoneCaratTotal, sideStoneCount, sideStoneQuality,
    metalType, metalKarat, metalWeightGrams, settingStyle, ringSize,
    goldKarat, goldWeightGrams, goldPurity,
    specsFromDescription, flags,
  }
}
