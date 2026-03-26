import { NextRequest, NextResponse } from "next/server"

interface ScrapedProduct {
  name: string | null
  price: number | null
  currency: string
  image: string | null
  retailer: string | null
  url: string
  specs: {
    carat: string | null
    shape: string | null
    color: string | null
    clarity: string | null
    metal: string | null
  }
}

function extractPrice(html: string): number | null {
  // Try multiple price patterns common on jewellery sites
  const patterns = [
    // JSON-LD product schema (most reliable)
    /"price"\s*:\s*"?([\d,]+\.?\d*)"?/,
    // Shopify-style price
    /"price"\s*:\s*([\d]+)/,
    // Common price display patterns
    /class="[^"]*price[^"]*"[^>]*>\s*\$?\s*([\d,]+\.?\d*)/i,
    /data-price="([\d.]+)"/,
    // AUD price patterns
    /\$\s?([\d,]+\.?\d{0,2})\s*(?:AUD|aud)?/,
    // Generic price
    /(?:price|Price|PRICE)[^$\d]*\$\s*([\d,]+\.?\d{0,2})/,
    // Shopify variant price (in cents)
    /"price":([\d]+),"compare/,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      let price = parseFloat(match[1].replace(/,/g, ""))
      // Shopify stores price in cents
      if (price > 100000 && html.includes("Shopify")) {
        price = price / 100
      }
      if (price > 0 && price < 1000000) {
        return price
      }
    }
  }
  return null
}

function extractProductName(html: string): string | null {
  // Try JSON-LD first
  const jsonLdMatch = html.match(/"name"\s*:\s*"([^"]+)"/)
  if (jsonLdMatch?.[1] && jsonLdMatch[1].length < 200) return jsonLdMatch[1]

  // Try og:title
  const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)
  if (ogMatch?.[1]) return ogMatch[1]

  // Try <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch?.[1]) return titleMatch[1].split("|")[0].split("–")[0].trim()

  return null
}

function extractImage(html: string): string | null {
  const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
  if (ogMatch?.[1]) return ogMatch[1]
  return null
}

function extractRetailer(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "")
    // Capitalise and clean up
    return hostname.split(".")[0].charAt(0).toUpperCase() + hostname.split(".")[0].slice(1)
  } catch {
    return "Unknown"
  }
}

function extractSpecs(html: string, name: string | null): ScrapedProduct["specs"] {
  const text = (name || "") + " " + html.substring(0, 20000)
  const lower = text.toLowerCase()

  // Carat
  let carat: string | null = null
  const caratMatch = text.match(/([\d.]+)\s*(?:ct|carat|car)/i)
  if (caratMatch) carat = caratMatch[1]

  // Shape
  let shape: string | null = null
  const shapeWords = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
  for (const s of shapeWords) {
    if (lower.includes(s)) { shape = s.charAt(0).toUpperCase() + s.slice(1); break }
  }

  // Color
  let color: string | null = null
  const colorMatch = text.match(/(?:color|colour)\s*:?\s*([D-K])\b/i)
  if (colorMatch) color = colorMatch[1].toUpperCase()

  // Clarity
  let clarity: string | null = null
  const clarityMatch = text.match(/(?:clarity)\s*:?\s*(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])/i)
  if (clarityMatch) clarity = clarityMatch[1].toUpperCase()

  // Metal
  let metal: string | null = null
  const metalPatterns = ["18k", "14k", "9k", "22k", "24k", "platinum", "rose gold", "white gold", "yellow gold"]
  for (const m of metalPatterns) {
    if (lower.includes(m)) { metal = m.toUpperCase(); break }
  }

  return { carat, shape, color, clarity, metal }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol")
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // Fetch the page
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-AU,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not fetch page (HTTP ${res.status})` },
        { status: 422 }
      )
    }

    const html = await res.text()

    const name = extractProductName(html)
    const price = extractPrice(html)
    const image = extractImage(html)
    const retailer = extractRetailer(url)
    const specs = extractSpecs(html, name)

    const product: ScrapedProduct = {
      name,
      price,
      currency: "AUD",
      image,
      retailer,
      url,
      specs,
    }

    return NextResponse.json(product)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { error: `Failed to check deal: ${message}` },
      { status: 500 }
    )
  }
}
