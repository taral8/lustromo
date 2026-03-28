import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

/**
 * GET /api/retailers
 *
 * Discovers retailers from actual product data (gold_products + products tables),
 * calculates confidence scores, and returns sorted by score descending.
 * Paginates all queries to handle >1,000 rows (Supabase default limit).
 */

interface RetailerScore {
  name: string
  totalProducts: number
  totalGold: number
  totalDiamonds: number
  avgMakingCharge: number | null
  categories: string[]
  score: number
  tier: string
  tierColor: string
}

function getTier(score: number): { tier: string; tierColor: string } {
  if (score >= 90) return { tier: "Lustrumo Verified", tierColor: "#10B981" }
  if (score >= 75) return { tier: "High Confidence", tierColor: "#10B981" }
  if (score >= 50) return { tier: "Moderate Confidence", tierColor: "#3B82F6" }
  if (score >= 25) return { tier: "Low Confidence", tierColor: "#F59E0B" }
  return { tier: "Insufficient Data", tierColor: "#94A3B8" }
}

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ retailers: [] })
  }

  // Paginated fetch — works past the 1,000 row Supabase default
  const sb = supabase

  async function fetchGoldPage(offset: number) {
    return sb.from("gold_products")
      .select("retailer_name, retailer_url, karat, weight_grams, making_charge_pct, has_diamonds, has_gemstones")
      .eq("locale", "au")
      .range(offset, offset + 999)
  }

  async function fetchDiamondPage(offset: number) {
    return sb.from("products")
      .select("retailer_id, retailer_name, diamond_centre_type, diamond_centre_carat, diamond_centre_color, diamond_centre_clarity, product_type")
      .eq("locale", "au")
      .eq("is_available", true)
      .range(offset, offset + 999)
  }

  // 1. Fetch ALL gold products
  const goldData: { retailer_name: string; retailer_url: string | null; karat: number | null; weight_grams: number | null; making_charge_pct: number | null; has_diamonds: boolean; has_gemstones: boolean }[] = []
  let goldOffset = 0
  while (true) {
    const { data } = await fetchGoldPage(goldOffset)
    if (!data || data.length === 0) break
    goldData.push(...data)
    if (data.length < 1000) break
    goldOffset += 1000
  }

  // 2. Fetch ALL diamond products
  const diamondData: { retailer_id: string; retailer_name: string | null; diamond_centre_type: string | null; diamond_centre_carat: number | null; diamond_centre_color: string | null; diamond_centre_clarity: string | null; product_type: string | null }[] = []
  let diamondOffset = 0
  while (true) {
    const { data } = await fetchDiamondPage(diamondOffset)
    if (!data || data.length === 0) break
    diamondData.push(...data)
    if (data.length < 1000) break
    diamondOffset += 1000
  }

  // Build retailer map
  const retailerMap: Record<string, {
    goldProducts: typeof goldData
    diamondProducts: typeof diamondData
    url: string | null
  }> = {}

  // Process gold products
  for (const g of goldData) {
    const name = g.retailer_name
    if (!retailerMap[name]) retailerMap[name] = { goldProducts: [], diamondProducts: [], url: g.retailer_url }
    retailerMap[name].goldProducts.push(g)
  }

  // Build retailer_id → name mapping from gold_products
  const idToName: Record<string, string> = {}
  for (const g of goldData) {
    if (g.retailer_url) {
      const id = g.retailer_url.replace(/^https?:\/\//, "").replace(/^www\./, "")
        .replace(/\.com\.au$|\.com$/, "").replace(/[^a-z0-9]/g, "") + "_au"
      idToName[id] = g.retailer_name
    }
  }

  // Process diamond products
  for (const d of diamondData) {
    const name = d.retailer_name || idToName[d.retailer_id] || d.retailer_id.replace(/_au$/, "").replace(/_/g, " ")
    if (!retailerMap[name]) retailerMap[name] = { goldProducts: [], diamondProducts: [], url: null }
    retailerMap[name].diamondProducts.push(d)
  }

  // Calculate scores
  const retailers: RetailerScore[] = []

  for (const [name, data] of Object.entries(retailerMap)) {
    const goldProds = data.goldProducts
    const diamondProds = data.diamondProducts
    const totalGold = goldProds.length
    const totalDiamonds = diamondProds.length
    const totalProducts = totalGold + totalDiamonds

    if (totalProducts === 0) continue

    // Categories
    const categories: string[] = []
    if (totalGold > 0) categories.push("Gold")
    if (diamondProds.some(d => d.diamond_centre_type === "natural")) categories.push("Natural")
    if (diamondProds.some(d => d.diamond_centre_type === "lab_grown")) categories.push("Lab Grown")
    if (diamondProds.some(d => d.product_type?.includes("engagement"))) categories.push("Engagement")

    // Avg making charge (pure gold only)
    const pureGoldCharges = goldProds
      .filter(g => !g.has_diamonds && !g.has_gemstones && g.making_charge_pct != null)
      .map(g => Number(g.making_charge_pct))
    const avgMakingCharge = pureGoldCharges.length > 0
      ? Math.round(pureGoldCharges.reduce((a, b) => a + b, 0) / pureGoldCharges.length * 10) / 10
      : null

    // Confidence score
    let score = 0

    // Data volume (0-60)
    if (totalProducts > 500) score += 60
    else if (totalProducts > 200) score += 50
    else if (totalProducts > 50) score += 35
    else score += 20

    // Data completeness (0-20)
    let complete = 0
    for (const d of diamondProds) {
      if (d.diamond_centre_carat && d.diamond_centre_color && d.diamond_centre_clarity) complete++
    }
    for (const g of goldProds) {
      if (g.karat && g.weight_grams) complete++
    }
    const total = diamondProds.length + goldProds.length
    score += total > 0 ? Math.round((complete / total) * 20) : 0

    // Category breadth (0-20)
    if (categories.length >= 3) score += 20
    else if (categories.length >= 2) score += 12
    else score += 5

    score = Math.min(100, score)
    const { tier, tierColor } = getTier(score)

    retailers.push({
      name, totalProducts, totalGold, totalDiamonds,
      avgMakingCharge, categories, score, tier, tierColor,
    })
  }

  retailers.sort((a, b) => b.score - a.score)

  return NextResponse.json({ retailers })
}
