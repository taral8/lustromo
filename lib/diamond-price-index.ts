/**
 * Lustrumo — Diamond Price Index Computation
 *
 * After each daily scrape, calculates aggregate price stats by
 * origin × carat bucket × shape and stores to diamond_price_index.
 * Over 30+ days this builds real trend data for sparklines.
 */

import { type SupabaseClient } from "@supabase/supabase-js"

const CARAT_BUCKETS = [
  { label: "0.50", min: 0.3, max: 0.7 },
  { label: "1.00", min: 0.7, max: 1.3 },
  { label: "1.50", min: 1.3, max: 1.7 },
  { label: "2.00", min: 1.7, max: 2.5 },
  { label: "3.00", min: 2.5, max: 10.0 },
]

const SHAPES = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
const ORIGINS = ["lab_grown", "natural"]

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Compute and store the daily diamond price index.
 * Should be called once after the daily scrape completes.
 *
 * Skips if an index was already recorded in the last 12 hours
 * (prevents duplicate entries from multiple scrape triggers).
 */
export async function computeDiamondPriceIndex(supabase: SupabaseClient): Promise<{
  recorded: number
  skipped: boolean
}> {
  // Check if we already have an index entry in the last 12 hours
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  const { data: recent } = await supabase
    .from("diamond_price_index")
    .select("id")
    .gte("recorded_at", cutoff)
    .limit(1)

  if (recent && recent.length > 0) {
    return { recorded: 0, skipped: true }
  }

  // Fetch all available diamond products with prices — paginate past 1000 row limit
  const allProducts: {
    diamond_centre_type: string
    diamond_centre_carat: number
    diamond_centre_shape: string
    price_aud: number
  }[] = []

  let offset = 0
  while (true) {
    const { data } = await supabase
      .from("products")
      .select("diamond_centre_type, diamond_centre_carat, diamond_centre_shape, price_aud")
      .eq("locale", "au")
      .eq("is_available", true)
      .not("price_aud", "is", null)
      .gt("price_aud", 0)
      .not("diamond_centre_type", "is", null)
      .not("diamond_centre_carat", "is", null)
      .not("diamond_centre_shape", "is", null)
      .in("price_status", ["valid", "needs_review"])
      .range(offset, offset + 999)

    if (!data || data.length === 0) break
    allProducts.push(...data)
    if (data.length < 1000) break
    offset += 1000
  }

  if (allProducts.length === 0) {
    return { recorded: 0, skipped: false }
  }

  // Group by origin × carat bucket × shape
  const rows: {
    origin: string
    carat_bucket: string
    shape: string
    avg_price: number
    median_price: number
    min_price: number
    max_price: number
    sample_size: number
  }[] = []

  for (const origin of ORIGINS) {
    for (const bucket of CARAT_BUCKETS) {
      for (const shape of SHAPES) {
        const matching = allProducts.filter(p =>
          p.diamond_centre_type === origin &&
          p.diamond_centre_shape === shape &&
          p.diamond_centre_carat >= bucket.min &&
          p.diamond_centre_carat < bucket.max
        )

        if (matching.length < 2) continue // need at least 2 data points

        const prices = matching.map(p => Number(p.price_aud)).sort((a, b) => a - b)
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length

        rows.push({
          origin,
          carat_bucket: bucket.label,
          shape,
          avg_price: Math.round(avg * 100) / 100,
          median_price: Math.round(median(prices) * 100) / 100,
          min_price: prices[0],
          max_price: prices[prices.length - 1],
          sample_size: prices.length,
        })
      }
    }
  }

  if (rows.length === 0) {
    return { recorded: 0, skipped: false }
  }

  // Insert all index rows with the same timestamp
  const now = new Date().toISOString()
  const withTimestamp = rows.map(r => ({ ...r, recorded_at: now }))

  // Batch insert (Supabase handles up to ~1000 rows per insert)
  const { error } = await supabase.from("diamond_price_index").insert(withTimestamp)

  if (error) {
    console.error("Failed to insert diamond price index:", error.message)
    return { recorded: 0, skipped: false }
  }

  return { recorded: rows.length, skipped: false }
}
