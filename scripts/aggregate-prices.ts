/**
 * Price Aggregation Script
 *
 * Runs daily after scraping. Computes avg/min/max/count per shape+carat+origin
 * and inserts into diamond_price_history for charts.
 *
 * Usage: npx tsx scripts/aggregate-prices.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CARAT_BUCKETS = [0.5, 1.0, 1.5, 2.0, 3.0]
const SHAPES = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
const ORIGINS: ("natural" | "lab_grown")[] = ["natural", "lab_grown"]

function getBucket(carat: number): number | null {
  // Assign to nearest bucket (within 0.3 range)
  let closest: number | null = null
  let minDiff = Infinity
  for (const b of CARAT_BUCKETS) {
    const diff = Math.abs(carat - b)
    if (diff < minDiff && diff <= 0.3) {
      minDiff = diff
      closest = b
    }
  }
  return closest
}

async function aggregate() {
  console.log("Starting price aggregation...")

  for (const origin of ORIGINS) {
    for (const shape of SHAPES) {
      for (const bucket of CARAT_BUCKETS) {
        const caratMin = bucket - 0.3
        const caratMax = bucket + 0.3

        const { data, error } = await supabase
          .from("diamonds")
          .select("price")
          .eq("origin", origin)
          .eq("shape", shape)
          .eq("is_available", true)
          .eq("locale", "au")
          .gte("carat", caratMin)
          .lte("carat", caratMax)

        if (error || !data?.length) continue

        const prices = data.map(d => d.price).sort((a, b) => a - b)
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length
        const median = prices[Math.floor(prices.length / 2)]

        const { error: insertError } = await supabase
          .from("diamond_price_history")
          .upsert({
            shape,
            carat_bucket: bucket,
            origin,
            locale: "au",
            avg_price: Math.round(avg * 100) / 100,
            min_price: prices[0],
            max_price: prices[prices.length - 1],
            median_price: median,
            inventory_count: prices.length,
            recorded_date: new Date().toISOString().split("T")[0],
          }, {
            onConflict: "shape,carat_bucket,origin,locale,recorded_date",
          })

        if (insertError) {
          console.error(`Error: ${shape} ${bucket}ct ${origin}:`, insertError.message)
        } else {
          console.log(`  ${origin} ${shape} ${bucket}ct: $${Math.round(avg)} avg (${prices.length} stones)`)
        }
      }
    }
  }

  console.log("Aggregation complete.")
}

aggregate()
