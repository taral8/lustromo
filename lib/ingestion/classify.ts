import { type ProductType } from "./types"

/**
 * SKILL.md Section 2.2 — Product Type Classification
 *
 * Rules:
 * - If product title or body contains "GIA" or "IGI" + diamond specs → engagement_ring_* or diamond_ring_*
 * - If side_stone_type = Labgrown or title contains "Labgrown" → suffix _labgrown
 * - If product_type field = "AUTO-GEN-DIA" (Shopify) → parse body HTML for diamond specs
 * - If no diamond specs found → classify as gold_* or silver_jewellery based on metal
 * - If classification cannot be determined → set unknown
 */

interface ClassificationInput {
  title: string
  bodyHtml: string
  tags: string[]
  shopifyProductType: string
  hasCert: boolean
  hasCarat: boolean
  certBody: string | null
  diamondType: "natural" | "lab_grown" | null
  metalKarat: string | null
}

const ENGAGEMENT_SIGNALS = [
  "engagement", "propose", "proposal", "solitaire", "halo",
  "bridal", "wedding ring", "diamond ring",
]

const GOLD_ITEM_MAP: Record<string, ProductType> = {
  ring: "gold_ring",
  bangle: "gold_bangle",
  chain: "gold_chain",
  necklace: "gold_necklace",
  earring: "gold_earring",
  bracelet: "gold_bracelet",
  pendant: "gold_pendant",
}

export function classifyProduct(input: ClassificationInput): ProductType {
  const combined = [input.title, input.bodyHtml, input.tags.join(" ")].join(" ")
  const lower = combined.toLowerCase()
  const titleLower = input.title.toLowerCase()

  // Rule: If Shopify product_type = "AUTO-GEN-DIA" → treat as diamond
  const hasDiamondSignal = input.shopifyProductType === "AUTO-GEN-DIA" ||
    input.hasCert ||
    input.hasCarat ||
    /\bdia(?:mond)?\b/i.test(combined) ||
    /\b(?:gia|igi|hrd)\b/i.test(combined) ||
    /\d+\.?\d*\s*ct/i.test(input.title)

  if (hasDiamondSignal && (input.hasCarat || input.hasCert)) {
    // Determine natural vs lab-grown
    const isLabGrown = input.diamondType === "lab_grown" ||
      /lab[\s-]?grown|lab[\s-]?created|cvd|hpht/i.test(combined)

    // Determine if engagement ring vs diamond ring
    const isEngagement = ENGAGEMENT_SIGNALS.some(s => lower.includes(s))

    if (isEngagement) {
      return isLabGrown ? "engagement_ring_labgrown" : "engagement_ring_natural"
    }
    return isLabGrown ? "diamond_ring_labgrown" : "diamond_ring_natural"
  }

  // Check for silver
  if (/\bsterling\s*silver\b|\b925\b/i.test(combined)) {
    return "silver_jewellery"
  }

  // Check for gold items
  if (input.metalKarat && /\b(?:9|14|18|22|24)\s*[kK]/i.test(combined)) {
    for (const [keyword, type] of Object.entries(GOLD_ITEM_MAP)) {
      if (titleLower.includes(keyword)) return type
    }
    // Gold product but can't determine specific type
    if (lower.includes("ring")) return "gold_ring"
    if (lower.includes("chain") || lower.includes("necklace")) return "gold_necklace"
    if (lower.includes("bangle")) return "gold_bangle"
    if (lower.includes("earring") || lower.includes("stud")) return "gold_earring"
    if (lower.includes("bracelet")) return "gold_bracelet"
    if (lower.includes("pendant")) return "gold_pendant"
  }

  // Traditional jewellery signals
  if (/\btemple\b|\btraditional\b|\bmangalsutra\b|\bjhumka\b/i.test(combined)) {
    return "traditional_jewellery"
  }

  // If it has gold or diamond in it but we couldn't classify precisely
  if (/\bgold\b/i.test(titleLower) && input.metalKarat) return "gold_ring"
  if (/\bdia(?:mond)?\b/i.test(titleLower)) return "unknown" // diamond but not enough specs

  return "unknown"
}
