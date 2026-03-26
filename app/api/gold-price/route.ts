import { NextResponse } from "next/server"

// Fetches live gold price from multiple free sources with fallback chain
// Primary: Frankfurt Exchange API (no key needed)
// Fallback: hardcoded recent price

interface GoldPriceResponse {
  pricePerGram: number
  pricePerOunce: number
  currency: string
  source: string
  timestamp: string
}

const TROY_OUNCE_GRAMS = 31.1035

async function fetchGoldPrice(): Promise<GoldPriceResponse> {
  // Try primary: metals.dev free API
  try {
    const res = await fetch("https://api.metals.dev/v1/latest?api_key=demo&currency=AUD&unit=gram", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.metals?.gold) {
        const pricePerGram = data.metals.gold
        return {
          pricePerGram,
          pricePerOunce: pricePerGram * TROY_OUNCE_GRAMS,
          currency: "AUD",
          source: "metals.dev",
          timestamp: new Date().toISOString(),
        }
      }
    }
  } catch {
    // fall through to next source
  }

  // Try secondary: Gold API (free tier, 6 requests/day)
  try {
    const res = await fetch("https://www.goldapi.io/api/XAU/AUD", {
      headers: { "x-access-token": process.env.GOLD_API_KEY || "" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.price_gram_24k) {
        return {
          pricePerGram: data.price_gram_24k,
          pricePerOunce: data.price,
          currency: "AUD",
          source: "goldapi.io",
          timestamp: new Date().toISOString(),
        }
      }
    }
  } catch {
    // fall through to next source
  }

  // Try tertiary: frankfurter.app (EUR-based, convert via XAU proxy)
  try {
    // Get USD/AUD rate
    const fxRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=AUD", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    })
    if (fxRes.ok) {
      const fxData = await fxRes.json()
      const usdToAud = fxData?.rates?.AUD || 1.55

      // Approximate gold price: use a known recent USD price as baseline
      // This is a fallback — not perfectly live but better than hardcoded
      const goldUsdPerOunce = 3020 // approximate current price, updated periodically
      const audPerOunce = goldUsdPerOunce * usdToAud
      const audPerGram = audPerOunce / TROY_OUNCE_GRAMS

      return {
        pricePerGram: Math.round(audPerGram * 100) / 100,
        pricePerOunce: Math.round(audPerOunce * 100) / 100,
        currency: "AUD",
        source: "frankfurter.app (estimated)",
        timestamp: new Date().toISOString(),
      }
    }
  } catch {
    // fall through to hardcoded
  }

  // Final fallback: hardcoded recent price
  return {
    pricePerGram: 148.50,
    pricePerOunce: 4618.50,
    currency: "AUD",
    source: "fallback",
    timestamp: new Date().toISOString(),
  }
}

// Cache the price in memory for 30 minutes
let cachedPrice: GoldPriceResponse | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export async function GET() {
  const now = Date.now()

  if (cachedPrice && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json(cachedPrice)
  }

  const price = await fetchGoldPrice()
  cachedPrice = price
  cacheTimestamp = now

  return NextResponse.json(price)
}
