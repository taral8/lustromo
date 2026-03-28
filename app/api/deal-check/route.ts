import { NextRequest, NextResponse } from "next/server"
import { valuateGoldProduct, type GoldValuationResult } from "@/lib/valuation/gold-valuation"
import { type GoldProductType } from "@/lib/scrapers/gold-scraper"
import { createServiceClient } from "@/lib/supabase"

export interface GoldDealResult {
  valuation: GoldValuationResult
  productType: GoldProductType
  marketAvg: { avgMakingCharge: number; count: number } | null
}

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
    certNumber: string | null
    karatGold: string | null
    weightGrams: string | null
    settingType: string | null
    sideStones: boolean
  }
}

function extractPrice(html: string): number | null {
  const patterns = [
    /"price"\s*:\s*"?([\d,]+\.?\d*)"?/,
    /"price":([\d]+),"compare/,
    /"price":([\d]+)/,
    /class="[^"]*price[^"]*"[^>]*>\s*\$?\s*([\d,]+\.?\d*)/i,
    /data-price="([\d.]+)"/,
    /\$\s?([\d,]+\.?\d{0,2})\s*(?:AUD|aud)?/,
    /(?:price|Price|PRICE)[^$\d]*\$\s*([\d,]+\.?\d{0,2})/,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      let price = parseFloat(match[1].replace(/,/g, ""))
      if (price > 100000 && html.includes("Shopify")) price = price / 100
      if (price > 0 && price < 1000000) return price
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
  const text = [name || "", url, html.substring(0, 50000)].join("\n")
  const lower = text.toLowerCase()

  // --- Origin ---
  let origin: "natural" | "lab_grown" | "unknown" = "unknown"
  let certLab: string | null = null
  let certNumber: string | null = null

  if (/\bgia\b/i.test(text)) { certLab = "GIA"; origin = "natural" }
  if (/\bigi\b/i.test(text)) { certLab = "IGI" }
  if (/\bgcal\b/i.test(text)) { certLab = "GCAL" }

  // Explicit origin signals
  const labSignals = ["lab grown", "lab-grown", "lab created", "lab-created", "cvd", "hpht", "laboratory grown"]
  for (const s of labSignals) { if (lower.includes(s)) { origin = "lab_grown"; break } }
  const natSignals = ["natural diamond", "mined diamond", "earth-grown", "stone type: natural", "natural certified"]
  for (const s of natSignals) { if (lower.includes(s)) { origin = "natural"; break } }

  if (certLab === "IGI" && origin === "unknown") origin = "lab_grown"
  if (certLab === "GIA" && origin === "unknown") origin = "natural"

  // Certificate number (long numeric string near "certificate")
  const certMatch = text.match(/(?:certificate|cert(?:ification)?)\s*[:#]?\s*(\d{6,})/i)
  if (certMatch) certNumber = certMatch[1]

  // --- Carat ---
  let carat: string | null = null
  // Pattern: "1.00ct" or "1.00 ct" or "1ct" or "Diamond : 1.00ct"
  const caratPatterns = [
    /(?:diamond|stone)\s*[:\-]?\s*(\d+\.?\d*)\s*ct/i,
    /(\d+\.?\d*)\s*ct\.?\s/i,
    /(\d+\.?\d*)\s*(?:carat|carats)\b/i,
    /(?:carat|ct)[:\s]+(\d+\.?\d*)/i,
  ]
  for (const p of caratPatterns) {
    const m = text.match(p)
    if (m?.[1] && parseFloat(m[1]) > 0 && parseFloat(m[1]) < 30) { carat = m[1]; break }
  }

  // --- Shape ---
  let shape: string | null = null
  const shapeWords = ["round", "oval", "cushion", "princess", "emerald", "pear", "radiant", "asscher", "marquise", "heart"]
  // Check URL first (most reliable signal — e.g. "celeste-1ct-oval-gia")
  const urlLower = url.toLowerCase()
  for (const s of shapeWords) {
    if (urlLower.includes(s)) { shape = s.charAt(0).toUpperCase() + s.slice(1); break }
  }
  // Then product name
  if (!shape && name) {
    const nameLower = name.toLowerCase()
    for (const s of shapeWords) {
      if (nameLower.includes(s)) { shape = s.charAt(0).toUpperCase() + s.slice(1); break }
    }
  }
  // Then body text — look near "diamond" keyword for more accurate match
  if (!shape) {
    const diamondContext = lower.match(/diamond[^.]{0,80}/g) || []
    const contextText = diamondContext.join(" ")
    for (const s of shapeWords) {
      if (contextText.includes(s)) { shape = s.charAt(0).toUpperCase() + s.slice(1); break }
    }
  }
  // Final fallback — anywhere in page
  if (!shape) {
    for (const s of shapeWords) {
      if (lower.includes(s)) { shape = s.charAt(0).toUpperCase() + s.slice(1); break }
    }
  }

  // --- Color & Clarity ---
  // These often appear together: "VS1 H" or "H VS1" or "Color: H, Clarity: VS1"
  let color: string | null = null
  let clarity: string | null = null

  const clarityGrades = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"]

  // Pattern 1: "Info: VS1 H" or "VS1 H" or "H VS1"
  const comboPattern1 = /\b(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\s+([D-K])\b/i
  const comboPattern2 = /\b([D-K])\s+(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\b/i
  const m1 = text.match(comboPattern1)
  const m2 = text.match(comboPattern2)
  if (m1) { clarity = m1[1].toUpperCase(); color = m1[2].toUpperCase() }
  else if (m2) { color = m2[1].toUpperCase(); clarity = m2[2].toUpperCase() }

  // Pattern 2: labeled "Color: H" and "Clarity: VS1"
  if (!color) {
    const colorMatch = text.match(/(?:colo[u]?r)\s*[:\-]\s*([D-K])\b/i)
    if (colorMatch) color = colorMatch[1].toUpperCase()
  }
  if (!clarity) {
    const clarityMatch = text.match(/(?:clarity)\s*[:\-]\s*(FL|IF|VVS[12]|VS[12]|SI[12]|I[123])\b/i)
    if (clarityMatch) clarity = clarityMatch[1].toUpperCase()
  }

  // Pattern 3: standalone clarity grade near "diamond" context
  if (!clarity) {
    for (const g of clarityGrades) {
      const regex = new RegExp(`\\b${g}\\b`, "i")
      if (regex.test(text)) { clarity = g; break }
    }
  }

  // --- Cut ---
  let cut: string | null = null
  const cutMatch = text.match(/(?:cut)\s*[:\-]\s*(excellent|ideal|very good|good|fair|poor)/i)
  if (cutMatch) cut = cutMatch[1].charAt(0).toUpperCase() + cutMatch[1].slice(1).toLowerCase()

  // --- Metal ---
  let metal: string | null = null
  const metalPatterns = [
    { regex: /\b18\s*k(?:t)?\s*(yellow|white|rose)?\s*gold\b/i, label: "18K Gold" },
    { regex: /\b14\s*k(?:t)?\s*(yellow|white|rose)?\s*gold\b/i, label: "14K Gold" },
    { regex: /\b9\s*k(?:t)?\s*(yellow|white|rose)?\s*gold\b/i, label: "9K Gold" },
    { regex: /\b(18k|18ct)\b/i, label: "18K Gold" },
    { regex: /\b(14k|14ct)\b/i, label: "14K Gold" },
    { regex: /\b(9k|9ct)\b/i, label: "9K Gold" },
    { regex: /\bplatinum\b/i, label: "Platinum" },
    { regex: /\brose\s*gold\b/i, label: "Rose Gold" },
    { regex: /\bwhite\s*gold\b/i, label: "White Gold" },
    { regex: /\byellow\s*gold\b/i, label: "Yellow Gold" },
  ]
  for (const { regex, label } of metalPatterns) {
    const match = text.match(regex)
    if (match) {
      // Add color detail if captured
      const colorWord = match[1]?.toLowerCase()
      if (colorWord && ["yellow", "white", "rose"].includes(colorWord)) {
        metal = label.replace("Gold", `${colorWord.charAt(0).toUpperCase() + colorWord.slice(1)} Gold`)
      } else {
        metal = label
      }
      break
    }
  }

  // --- Setting type ---
  let settingType: string | null = null
  const settingPatterns = ["solitaire", "halo", "pavé", "pave", "channel", "bezel", "prong", "tension", "cathedral", "vintage", "engagement ring", "wedding band", "eternity"]
  for (const s of settingPatterns) {
    if (lower.includes(s)) { settingType = s.charAt(0).toUpperCase() + s.slice(1); break }
  }

  // --- Side stones ---
  const sideStones = /side\s*stone|accent|shoulder|pav[eé]/i.test(text)

  // --- Gold-specific ---
  let karatGold: string | null = null
  let weightGrams: string | null = null
  const goldKaratMatch = lower.match(/\b(9|14|18|22|24)\s*(?:k|kt|ct|karat)\b/)
  if (goldKaratMatch) karatGold = goldKaratMatch[1] + "K"
  const weightMatch = text.match(/([\d.]+)\s*(?:grams?|gms?|g\b)/i)
  if (weightMatch) weightGrams = weightMatch[1]

  return { carat, shape, color, clarity, cut, metal, origin, certLab, certNumber, karatGold, weightGrams, settingType, sideStones }
}

function detectProductType(specs: ScrapedProduct["specs"], name: string | null, html: string): "diamond" | "gold" | "unknown" {
  const text = [name || "", html.substring(0, 15000)].join(" ").toLowerCase()
  const diamondSignals = ["diamond", "carat", "ct ", "gia", "igi", "gcal", "solitaire", "lab grown"]
  let diamondScore = 0
  for (const s of diamondSignals) { if (text.includes(s)) diamondScore++ }
  if (specs.carat) diamondScore += 2
  if (specs.certLab) diamondScore += 3

  const goldOnlySignals = ["gold chain", "gold bangle", "gold bracelet", "gold necklace", "gold earring", "pure gold", "gold bar"]
  let goldScore = 0
  for (const s of goldOnlySignals) { if (text.includes(s)) goldScore += 2 }
  if (specs.karatGold && !specs.carat) goldScore += 2

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

    try {
      const parsedUrl = new URL(url)
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("bad")
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

    // Gold valuation if gold product detected
    let goldDeal: GoldDealResult | null = null
    if (productType === "gold" && price) {
      const karatNum = specs.karatGold ? parseInt(specs.karatGold) : null
      const weightNum = specs.weightGrams ? parseFloat(specs.weightGrams) : null

      // Detect gold product type from title
      const titleLower = (name || "").toLowerCase()
      const goldTypeMap: [RegExp, GoldProductType][] = [
        [/\bmangalsutra\b/i, "mangalsutra"],
        [/\bnose\s*(?:ring|pin|stud)\b/i, "nosering"],
        [/\bbangle\b|\bkada\b/i, "bangle"],
        [/\bbracelet\b/i, "bracelet"],
        [/\bchain\b/i, "chain"],
        [/\bnecklace\b/i, "necklace"],
        [/\bpendant\b|\blocket\b/i, "pendant"],
        [/\bearring\b|\bjhumka\b|\bstud\b|\btops\b/i, "earring"],
        [/\bring\b/i, "ring"],
      ]
      let goldProdType: GoldProductType = "unknown"
      for (const [regex, type] of goldTypeMap) {
        if (regex.test(titleLower)) { goldProdType = type; break }
      }

      const hasDiamonds = /\bdiamond\b/i.test((name || "") + " " + html.substring(0, 10000))
      const hasGemstones = /\b(?:ruby|sapphire|emerald|opal|topaz|amethyst|garnet|pearl)\b/i.test((name || "") + " " + html.substring(0, 10000))

      const valuation = valuateGoldProduct({
        price_aud: price,
        karat: karatNum,
        weight_grams: weightNum,
        product_type: goldProdType,
        product_title: name || "",
        has_diamonds: hasDiamonds,
        has_gemstones: hasGemstones,
      })

      if (valuation) {
        // Fetch market avg for this product type from DB
        let marketAvg: { avgMakingCharge: number; count: number } | null = null
        const supabase = createServiceClient()
        if (supabase) {
          const { data: marketData } = await supabase
            .from("gold_products")
            .select("making_charge_pct")
            .eq("locale", "au")
            .eq("product_type", goldProdType)
            .not("making_charge_pct", "is", null)

          if (marketData && marketData.length > 0) {
            const charges = marketData.map(d => Number(d.making_charge_pct))
            marketAvg = {
              avgMakingCharge: Math.round(charges.reduce((a, b) => a + b, 0) / charges.length * 10) / 10,
              count: charges.length,
            }
          }
        }

        goldDeal = { valuation, productType: goldProdType, marketAvg }
      }
    }

    return NextResponse.json({
      name, price, currency: "AUD", image, retailer, url, productType, specs,
      ...(goldDeal ? { goldDeal } : {}),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: `Failed to check deal: ${message}` }, { status: 500 })
  }
}
