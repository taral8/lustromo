/**
 * Lustrumo — Gold Spot Price Refresh
 *
 * Fetches current gold spot price in AUD and stores it in the gold_prices table.
 * Uses the same 3-source chain as the web app:
 *   1. gold-api.com (free, USD → AUD conversion)
 *   2. goldpricez.com API (free tier, AUD/gram direct)
 *   3. goldpricez.com HTML scrape (fallback)
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

// ─── Source 1: gold-api.com (free, returns USD → convert to AUD) ───

async function fetchFromGoldApiCom(): Promise<{ perGram: number; perOunce: number; source: string } | null> {
  try {
    console.log("  Trying gold-api.com...")
    const res = await fetch("https://api.gold-api.com/price/XAU", {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) { console.log(`  gold-api.com returned HTTP ${res.status}`); return null }
    const data = await res.json()
    const usdPerOunce = data?.price
    if (!usdPerOunce || usdPerOunce <= 0) { console.log("  gold-api.com: no price in response"); return null }

    // Get USD→AUD rate
    let usdToAud: number | null = null
    if (data?.exchangeRates?.AUD && data.exchangeRates.AUD > 0) {
      usdToAud = data.exchangeRates.AUD
    }
    if (!usdToAud) {
      const fxRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=AUD", {
        signal: AbortSignal.timeout(8000),
      })
      if (fxRes.ok) {
        const fxData = await fxRes.json()
        usdToAud = fxData?.rates?.AUD
      }
    }
    if (!usdToAud || usdToAud <= 0) { console.log("  gold-api.com: could not get USD→AUD rate"); return null }

    const audPerOunce = usdPerOunce * usdToAud
    const audPerGram = audPerOunce / TROY_OUNCE_GRAMS
    console.log(`  gold-api.com: $${usdPerOunce.toFixed(2)} USD/oz × ${usdToAud.toFixed(4)} = $${audPerGram.toFixed(2)} AUD/gram`)
    return { perGram: audPerGram, perOunce: audPerOunce, source: "gold-api.com" }
  } catch (e) {
    console.log("  gold-api.com failed:", e instanceof Error ? e.message : e)
  }
  return null
}

// ─── Source 2: goldpricez.com API (free tier, AUD/gram direct) ───

async function fetchFromGoldPricez(): Promise<{ perGram: number; perOunce: number; source: string } | null> {
  const key = process.env.GOLDPRICEZ_API_KEY
  if (!key) { console.log("  goldpricez.com: no GOLDPRICEZ_API_KEY set, skipping"); return null }
  try {
    console.log("  Trying goldpricez.com API...")
    const res = await fetch("https://goldpricez.com/api/rates/currency/aud/measure/gram", {
      headers: { "X-API-KEY": key },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) { console.log(`  goldpricez.com returned HTTP ${res.status}`); return null }
    const data = await res.json()
    const perGram = data?.price ?? data?.gold_price ?? data?.rates?.XAU
    if (perGram && perGram > 0) {
      console.log(`  goldpricez.com: $${perGram.toFixed(2)} AUD/gram`)
      return { perGram, perOunce: perGram * TROY_OUNCE_GRAMS, source: "goldpricez.com" }
    }
    console.log("  goldpricez.com: no price in response")
  } catch (e) {
    console.log("  goldpricez.com failed:", e instanceof Error ? e.message : e)
  }
  return null
}

// ─── Source 3: Scrape goldpricez.com HTML ───

async function scrapeGoldPricez(): Promise<{ perGram: number; perOunce: number; source: string } | null> {
  try {
    console.log("  Trying goldpricez.com scrape...")
    const res = await fetch("https://goldpricez.com/au/gram", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Lustrumo/1.0)", Accept: "text/html" },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) { console.log(`  goldpricez.com scrape returned HTTP ${res.status}`); return null }
    const html = await res.text()
    const patterns = [
      /(?:gold\s*(?:price|rate)?[^$]*?\$\s*)([\d,]+\.?\d*)/i,
      /data-price="([\d,]+\.?\d*)"/i,
      /AUD\s*([\d,]+\.?\d*)\s*(?:per\s*gram|\/g)/i,
      /24[kK][^$]*?\$\s*([\d,]+\.?\d*)/i,
      /<(?:b|strong|span)[^>]*>\s*\$?\s*([\d,]+\.\d{2})\s*<\//i,
    ]
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        const price = parseFloat(match[1].replace(/,/g, ""))
        if (price >= 50 && price <= 500) {
          console.log(`  goldpricez.com scrape: $${price.toFixed(2)} AUD/gram`)
          return { perGram: price, perOunce: price * TROY_OUNCE_GRAMS, source: "goldpricez.com (scraped)" }
        }
        if (price >= 2000 && price <= 15000) {
          const perGram = price / TROY_OUNCE_GRAMS
          console.log(`  goldpricez.com scrape: $${perGram.toFixed(2)} AUD/gram (from oz price)`)
          return { perGram, perOunce: price, source: "goldpricez.com (scraped)" }
        }
      }
    }
    console.log("  goldpricez.com scrape: could not parse price from HTML")
  } catch (e) {
    console.log("  goldpricez.com scrape failed:", e instanceof Error ? e.message : e)
  }
  return null
}

async function fetchGoldPrice(): Promise<{ perGram: number; perOunce: number; source: string } | null> {
  return await fetchFromGoldApiCom()
    ?? await fetchFromGoldPricez()
    ?? await scrapeGoldPricez()
}

async function main() {
  console.log("Refreshing gold spot price...")

  const price = await fetchGoldPrice()

  if (!price) {
    console.error("All gold price sources failed. No update stored.")
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
