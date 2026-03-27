/**
 * Lustrumo — Gold Spot Price Refresh
 *
 * Fetches current gold spot price in AUD and stores it in the gold_prices table.
 * Designed to run on a cron schedule (every 1–4 hours during market hours).
 *
 * Usage:
 *   npx tsx scripts/refresh-gold-price.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const TROY_OUNCE_GRAMS = 31.1035

async function fetchGoldPrice(): Promise<{ perGram: number; perOunce: number; source: string } | null> {
  // goldapi.io
  const goldApiKey = process.env.GOLD_API_KEY
  if (goldApiKey) {
    try {
      const res = await fetch("https://www.goldapi.io/api/XAU/AUD", {
        headers: { "x-access-token": goldApiKey },
        signal: AbortSignal.timeout(10000),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.price_gram_24k > 0) {
          return {
            perGram: data.price_gram_24k,
            perOunce: data.price || data.price_gram_24k * TROY_OUNCE_GRAMS,
            source: "goldapi.io",
          }
        }
      }
    } catch (e) {
      console.log("  goldapi.io failed:", e instanceof Error ? e.message : e)
    }
  }

  // metals.dev
  try {
    const key = process.env.METALS_DEV_API_KEY || "demo"
    const res = await fetch(`https://api.metals.dev/v1/latest?api_key=${key}&currency=AUD&unit=gram`, {
      signal: AbortSignal.timeout(10000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.metals?.gold > 0) {
        return {
          perGram: data.metals.gold,
          perOunce: data.metals.gold * TROY_OUNCE_GRAMS,
          source: "metals.dev",
        }
      }
    }
  } catch (e) {
    console.log("  metals.dev failed:", e instanceof Error ? e.message : e)
  }

  // frankfurter + metals.dev USD fallback
  try {
    const fxRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=AUD", {
      signal: AbortSignal.timeout(10000),
    })
    if (fxRes.ok) {
      const fxData = await fxRes.json()
      const usdToAud = fxData?.rates?.AUD
      if (usdToAud > 0) {
        const metalRes = await fetch("https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=gram", {
          signal: AbortSignal.timeout(10000),
        })
        if (metalRes.ok) {
          const metalData = await metalRes.json()
          if (metalData?.metals?.gold > 0) {
            const perGram = metalData.metals.gold * usdToAud
            return {
              perGram,
              perOunce: perGram * TROY_OUNCE_GRAMS,
              source: "frankfurter+metals.dev",
            }
          }
        }
      }
    }
  } catch (e) {
    console.log("  frankfurter fallback failed:", e instanceof Error ? e.message : e)
  }

  return null
}

async function main() {
  console.log("Refreshing gold spot price...")

  const price = await fetchGoldPrice()

  if (!price) {
    console.error("All gold price APIs failed. No update stored.")
    process.exit(1)
  }

  console.log(`  Source: ${price.source}`)
  console.log(`  AUD per gram: $${price.perGram.toFixed(2)}`)
  console.log(`  AUD per troy oz: $${price.perOunce.toFixed(2)}`)

  // Check if we already have a recent price (within 30 min)
  const { data: recent } = await supabase
    .from("gold_prices")
    .select("recorded_at, price_per_gram")
    .eq("locale", "au")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .single()

  if (recent) {
    const age = Date.now() - new Date(recent.recorded_at).getTime()
    const ageMin = Math.round(age / 60000)
    const priceDiff = Math.abs(price.perGram - Number(recent.price_per_gram))

    if (age < 30 * 60 * 1000 && priceDiff < 0.50) {
      console.log(`  Skipped — last price is ${ageMin}min old and within $0.50. No update needed.`)
      return
    }

    const change = price.perGram - Number(recent.price_per_gram)
    console.log(`  Change since last: ${change >= 0 ? "+" : ""}$${change.toFixed(2)}/gram`)
  }

  const { error } = await supabase.from("gold_prices").insert({
    locale: "au",
    currency: "AUD",
    price_per_gram: Math.round(price.perGram * 100) / 100,
    price_per_ounce: Math.round(price.perOunce * 100) / 100,
    source: price.source,
  })

  if (error) {
    console.error("  Failed to store price:", error.message)
    process.exit(1)
  }

  console.log("  Stored successfully.")
}

main()
