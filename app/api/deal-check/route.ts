import { NextRequest, NextResponse } from "next/server"

export interface ScrapedProduct {
  name: string | null
  price: number | null
  currency: string
  image: string | null
  retailer: string | null
  url: string
  productType: "diamond" | "gold" | "unknown"
  specs: {
    carat: string | null
    shape: string | null
    color: string | null
    clarity: string | null
    cut: string | null
    metal: string | null
    origin: "natural" | "lab_grown" | "unknown"
    certLab: string | null
    karatGold: string | null
    weightGrams: string | null
  }
}

function extractPrice(html: string): number | null {
  const patterns = [
    // JSON-LD product schema
    /"price"\s*:\s*"?([\d,]+\.?\d*)"?/,
    // Shopify variant price
    /"price":([\d]+),"compare/,
    /"price":([\d]+)/,
    // Common price display patterns
    /class="[^"]*price[^"]*"[^>]*>\s*\$?\s*([\d,]+\.?\d*)/i,
    /data-price="([\d.]+)"/,
    // AUD price patterns
    /\$\s?([\d,]+\.?\d{0,2})\s*(?:AUD|aud)?/,
    /(?:price|Price|PRICE)[^$\d]*\$\s*([\d,]+\.?\d{0,2})/,
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
  const jsonLdMatch = html.match(/"name"\s*:\s*"([^"]+)"/)
  if (jsonLdMatch?.[1] && jsonLdMatch[1].length < 200) return jsonLdMatch[1]

  const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)
  if (ogMatch?.[1]) return ogMatch[1]

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
    return hostname.split(".")[0].charAt(0).toUpperCase() + hostname.split(".")[0].slice(1)
  } catch {
    return "Unknown"
  }
}

function extractSpecs(html: string, name: string | null, url: string): ScrapedProduct["specs"] {
  // Combine name, URL, and first 30K of HTML for analysis
  const text = [name || "", url, html.substring(0, 30000)].join(" ")
  const lower = text.toLowerCase()

  // --- Diamond Origin Detection ---
  let origin: "natural" | "lab_grown" | "unknown" = "unknown"
  let certLab: string | null = null

  // Check for certification lab
  if (/\bgia\b/i.test(text)) { certLab = "GIA"; origin = "natural" } // GIA overwhelmingly certifies natural
  if (/\bigi\b/i.test(text)) { certLab = "IGI" } // IGI does both but skews lab-grown
  if (/\bgcal\b/i.test(text)) { certLab = "GCAL" }

  // Explicit lab-grown indicators (override cert-based guess)
  const labGrownSignals = ["lab grown", "lab-grown", "lab created", "lab-created", "cvd", "hpht", "laboratory grown", "lab diamond", "created diamond", "synthetic diamond"]
  for (const signal of labGrownSignals) {
    if (lower.includes(signal)) { origin = "lab_grown"; break }
  }

  // Explicit natural indicators
  const naturalSignals = ["natural diamond", "mined diamond", "earth-grown", "earth grown", "natural certified"]
  for (const signal of naturalSignals) {
    if (lower.includes(signal)) { origin = "natural"; break }
  }

  // If IGI and no explicit indicator, lean lab-grown (IGI is primary lab-grown certifier in AU market)
  if (certLab === "IGI" && origin === "unknown") origin = "lab_grown"
  // If GIA, lean natural unless overridden above
  if (certLab === "GIA" && origin === "unknown") origin = "natural"

  // --- Carat ---
  let carat: string | null = null
  const caratPatterns = [
    /(\d+\.?\d*)\s*(?:ct|carat|carats)\b/i,
    /(?:carat|ct)[:\s]+(\d+\.?\d*)/i,
  ]
  for (const p of caratPatterns) {
    const m = text.match(p)
    if (m?.[1] && parseFloat(m[1]) > 0 && parseFloat(m[1]) < 30) {
      carat = m[1]; break
    }
  }

  // --- Shape (search URL first as it's most reliable) ---
  let shape: string | null = null
  const shapeWords = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
  // Prioritise URL and product name over body HTML
  const priorityText = [url, name || ""].join(" ").toLowerCase()
  for (const s of shapeWords) {
    if (priorityText.includes(s)) { shape = s.charAt(0).toUpperCase() + s.slice(1); break }
  }
  // Fallback to HTML body
  if (!shape) {
    for (const s of shapeWords) {
      if (lower.includes(s)) { shape = s.charAt(0).toUpperCase() + s.slice(1); break }
    }
  }

  // --- Color ---
  let color: string | null = null
  const colorPatterns = [
    /(?:colo[u]?r)\s*[:\-]\s*([D-K])\b/i,
    /\b([D-K])\s+(?:colo[u]?r)/i,
    /(?:grade|quality)\s*[:\-]\s*[^,]*?([D-K])\b/i,
  ]
  for (const p of colorPatterns) {
    const m = text.match(p)
    if (m?.[1]) { color = m[1].toUpperCase(); break }
  }

  // --- Clarity ---
  let clarity: string | null = null
  const clarityPatterns = [
    /(?:clarity)\s*[:\-]\s*(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\b/i,
    /\b(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\s+(?:clarity)/i,
    /\b(VVS[12]|VS[12]|SI[12])\b/i, // standalone clarity grades
  ]
  for (const p of clarityPatterns) {
    const m = text.match(p)
    if (m?.[1]) { clarity = m[1].toUpperCase(); break }
  }

  // --- Cut ---
  let cut: string | null = null
  const cutMatch = text.match(/(?:cut)\s*[:\-]\s*(excellent|ideal|very good|good|fair|poor)/i)
  if (cutMatch) cut = cutMatch[1]

  // --- Metal ---
  let metal: string | null = null
  const metalPatterns = [
    { regex: /\b(18k|18ct|18\s*karat)\b/i, label: "18K" },
    { regex: /\b(14k|14ct|14\s*karat)\b/i, label: "14K" },
    { regex: /\b(9k|9ct|9\s*karat)\b/i, label: "9K" },
    { regex: /\b(22k|22ct|22\s*karat)\b/i, label: "22K" },
    { regex: /\b(24k|24ct|24\s*karat)\b/i, label: "24K" },
    { regex: /\bplatinum\b/i, label: "Platinum" },
    { regex: /\brose\s*gold\b/i, label: "Rose Gold" },
    { regex: /\bwhite\s*gold\b/i, label: "White Gold" },
    { regex: /\byellow\s*gold\b/i, label: "Yellow Gold" },
  ]
  for (const { regex, label } of metalPatterns) {
    if (regex.test(text)) { metal = label; break }
  }

  // --- Gold-specific: karat and weight ---
  let karatGold: string | null = null
  let weightGrams: string | null = null
  const goldKaratMatch = lower.match(/\b(9|14|18|22|24)\s*(?:k|kt|ct|karat|carat)\b/)
  if (goldKaratMatch) karatGold = goldKaratMatch[1] + "K"

  const weightMatch = text.match(/([\d.]+)\s*(?:grams?|gms?|g\b)/i)
  if (weightMatch) weightGrams = weightMatch[1]

  return { carat, shape, color, clarity, cut, metal, origin, certLab, karatGold, weightGrams }
}

function detectProductType(specs: ScrapedProduct["specs"], name: string | null, html: string): "diamond" | "gold" | "unknown" {
  const text = [name || "", html.substring(0, 15000)].join(" ").toLowerCase()

  // Strong diamond signals
  const diamondSignals = ["diamond", "carat", "ct ", "gia", "igi", "gcal", "brilliant", "solitaire", "lab grown", "lab-grown"]
  let diamondScore = 0
  for (const s of diamondSignals) {
    if (text.includes(s)) diamondScore++
  }
  if (specs.carat) diamondScore += 2
  if (specs.certLab) diamondScore += 3

  // Strong gold signals (without diamond)
  const goldOnlySignals = ["gold chain", "gold bangle", "gold bracelet", "gold necklace", "gold earring", "pure gold", "gold bar", "gold coin"]
  let goldScore = 0
  for (const s of goldOnlySignals) {
    if (text.includes(s)) goldScore += 2
  }
  if (specs.karatGold && !specs.carat) goldScore += 2
  if (specs.weightGrams) goldScore++

  if (diamondScore >= 2) return "diamond"
  if (goldScore >= 2) return "gold"
  if (text.includes("diamond")) return "diamond"
  if (text.includes("gold") && !text.includes("diamond")) return "gold"
  return "unknown"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol")
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-AU,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Could not fetch page (HTTP ${res.status})` }, { status: 422 })
    }

    const html = await res.text()
    const name = extractProductName(html)
    const price = extractPrice(html)
    const image = extractImage(html)
    const retailer = extractRetailer(url)
    const specs = extractSpecs(html, name, url)
    const productType = detectProductType(specs, name, html)

    const product: ScrapedProduct = { name, price, currency: "AUD", image, retailer, url, productType, specs }

    return NextResponse.json(product)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: `Failed to check deal: ${message}` }, { status: 500 })
  }
}
