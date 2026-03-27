/**
 * SKILL.md Section 4.4 — Equivalent Value Class (EVC)
 *
 * EVC is defined by: diamond_type + carat_band + color_band + clarity_band + shape + cert_body
 *
 * Example EVCs:
 *   LAB-1.00-FG-VS-OVAL-IGI
 *   NAT-1.00-GH-VS1-ROUND-GIA
 *
 * Products in the same EVC are directly comparable.
 * Products in different EVCs are NOT directly comparable.
 */

type DiamondType = "natural" | "lab_grown"
type CertBody = "GIA" | "IGI" | "HRD" | "none"

// Section 4.4: Carat bands
function getCaratBand(carat: number): string {
  if (carat < 0.50) return "0.30" // sub-half carat
  if (carat < 0.70) return "0.50"
  if (carat < 0.90) return "0.70"
  if (carat < 1.10) return "1.00"
  if (carat < 1.50) return "1.10"
  if (carat < 2.00) return "1.50"
  return "2.00"
}

// Section 4.4: Color bands — DEF / GH / IJ / KL+
function getColorBand(color: string): string {
  const c = color.toUpperCase()
  if ("DEF".includes(c) && c.length === 1) return "DEF"
  if ("GH".includes(c) && c.length === 1) return "GH"
  if ("IJ".includes(c) && c.length === 1) return "IJ"
  return "KL+"
}

// Section 4.4: Clarity bands — FL-IF / VVS / VS / SI1 / SI2 / I+
function getClarityBand(clarity: string): string {
  const cl = clarity.toUpperCase()
  if (cl === "FL" || cl === "IF") return "FL-IF"
  if (cl === "VVS1" || cl === "VVS2") return "VVS"
  if (cl === "VS1" || cl === "VS2") return "VS"
  if (cl === "SI1") return "SI1"
  if (cl === "SI2") return "SI2"
  return "I+"
}

export interface EVCInput {
  diamondType: DiamondType | null
  carat: number | null
  color: string | null
  clarity: string | null
  shape: string | null
  certBody: CertBody | null
}

/**
 * Compute the EVC string for a diamond product.
 * Returns null if insufficient data to compute EVC.
 */
export function computeEVC(input: EVCInput): string | null {
  const { diamondType, carat, color, clarity, shape, certBody } = input

  // All six components are needed for a valid EVC
  if (!diamondType || !carat || !color || !clarity || !shape || !certBody || certBody === "none") {
    return null
  }

  const typePrefix = diamondType === "lab_grown" ? "LAB" : "NAT"
  const caratBand = getCaratBand(carat)
  const colorBand = getColorBand(color)
  const clarityBand = getClarityBand(clarity)
  const shapeNorm = shape.toUpperCase()
  const cert = certBody.toUpperCase()

  return `${typePrefix}-${caratBand}-${colorBand}-${clarityBand}-${shapeNorm}-${cert}`
}
