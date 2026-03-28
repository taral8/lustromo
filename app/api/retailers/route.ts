import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

export const dynamic = "force-dynamic"

/**
 * GET /api/retailers
 *
 * Discovers retailers from actual product data (gold_products + products tables),
 * calculates confidence scores, and returns sorted by score descending.
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

  // 1. Get unique retailers from gold_products
  const { data: goldData } = await supabase
    .from("gold_products")
    .select("retailer_name, retailer_url, karat, weight_grams, making_charge_pct, has_diamonds, has_gemstones")
    .eq("locale", "au")

  // 2. Get unique retailers from products (diamonds)
  const { data: diamondData } = await supabase
    .from("products")
    .select("retailer_id, diamond_centre_type, diamond_centre_carat, diamond_centre_color, diamond_centre_clarity, diamond_centre_cert_number, product_type")
    .eq("locale", "au")
    .eq("is_available", true)

  // Build retailer map
  const retailerMap: Record<string, {
    goldProducts: typeof goldData
    diamondProducts: typeof diamondData
    url: string | null
  }> = {}

  // Process gold products
  for (const g of goldData || []) {
    const name = g.retailer_name
    if (!retailerMap[name]) retailerMap[name] = { goldProducts: [], diamondProducts: [], url: g.retailer_url }
    retailerMap[name].goldProducts!.push(g)
  }

  // Process diamond products — retailer_id is like "rbdiamond_au", need to match to name
  // Build a retailer_id → name mapping from gold_products (which has both name and url)
  const idToName: Record<string, string> = {}
  for (const g of goldData || []) {
    if (g.retailer_url) {
      const id = g.retailer_url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\.com\.au$|\.com$/, "").replace(/[^a-z0-9]/g, "") + "_au"
      idToName[id] = g.retailer_name
    }
  }

  for (const d of diamondData || []) {
    const name = idToName[d.retailer_id] || d.retailer_id.replace(/_au$/, "").replace(/_/g, " ")
    if (!retailerMap[name]) retailerMap[name] = { goldProducts: [], diamondProducts: [], url: null }
    retailerMap[name].diamondProducts!.push(d)
  }

  // Calculate scores for each retailer
  const retailers: RetailerScore[] = []

  for (const [name, data] of Object.entries(retailerMap)) {
    const goldProds = data.goldProducts || []
    const diamondProds = data.diamondProducts || []
    const totalGold = goldProds.length
    const totalDiamonds = diamondProds.length
    const totalProducts = totalGold + totalDiamonds

    if (totalProducts === 0) continue

    // Categories
    const categories: string[] = []
    if (totalGold > 0) categories.push("Gold")
    const hasNatural = diamondProds.some(d => d.diamond_centre_type === "natural")
    const hasLabGrown = diamondProds.some(d => d.diamond_centre_type === "lab_grown")
    const hasEngagement = diamondProds.some(d => d.product_type?.includes("engagement"))
    if (hasNatural) categories.push("Natural")
    if (hasLabGrown) categories.push("Lab Grown")
    if (hasEngagement) categories.push("Engagement")

    // Average making charge (pure gold only)
    const pureGoldCharges = goldProds
      .filter(g => !g.has_diamonds && !g.has_gemstones && g.making_charge_pct != null)
      .map(g => Number(g.making_charge_pct))
    const avgMakingCharge = pureGoldCharges.length > 0
      ? Math.round(pureGoldCharges.reduce((a, b) => a + b, 0) / pureGoldCharges.length * 10) / 10
      : null

    // Confidence score
    let score = 0

    // Data volume (0-60 points)
    if (totalProducts > 500) score += 60
    else if (totalProducts > 200) score += 50
    else if (totalProducts > 50) score += 35
    else score += 20

    // Data completeness (0-20 points)
    let completeDiamonds = 0
    for (const d of diamondProds) {
      if (d.diamond_centre_carat && d.diamond_centre_color && d.diamond_centre_clarity) completeDiamonds++
    }
    let completeGold = 0
    for (const g of goldProds) {
      if (g.karat && g.weight_grams) completeGold++
    }
    const totalCheckable = diamondProds.length + goldProds.length
    const completeCount = completeDiamonds + completeGold
    const completenessPct = totalCheckable > 0 ? completeCount / totalCheckable : 0
    score += Math.round(completenessPct * 20)

    // Category breadth (0-20 points)
    const catCount = categories.length
    if (catCount >= 3) score += 20
    else if (catCount >= 2) score += 12
    else score += 5

    score = Math.min(100, score)

    const { tier, tierColor } = getTier(score)

    retailers.push({
      name,
      totalProducts,
      totalGold,
      totalDiamonds,
      avgMakingCharge,
      categories,
      score,
      tier,
      tierColor,
    })
  }

  // Sort by score descending
  retailers.sort((a, b) => b.score - a.score)

  return NextResponse.json({ retailers })
}
