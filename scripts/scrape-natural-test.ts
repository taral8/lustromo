/**
 * Test: Scrape RB Diamond, detect natural vs lab-grown, run valuation.
 *
 * Usage: npx tsx scripts/scrape-natural-test.ts
 */

import { type ShopifyProduct } from "../lib/ingestion/types"
import { normaliseShopifyProduct } from "../lib/ingestion/pipeline"
import { valuateNaturalDiamond } from "../lib/valuation/natural-diamond-valuation"

const USER_AGENT = "Lustrumo/1.0 (lustrumo.com; jewellery price intelligence)"

async function fetchAllProducts(baseUrl: string): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = []
  let page = 1
  while (page <= 20) {
    console.log(`  Fetching page ${page}...`)
    try {
      const res = await fetch(`${baseUrl}/products.json?limit=250&page=${page}`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) break
      const data = await res.json()
      const products: ShopifyProduct[] = data.products || []
      if (products.length === 0) break
      all.push(...products)
      if (products.length < 250) break
      page++
    } catch { break }
  }
  return all
}

async function main() {
  const baseUrl = "https://rbdiamond.com.au"
  console.log(`\nScraping RB Diamond for natural diamond detection test...`)

  const raw = await fetchAllProducts(baseUrl)
  console.log(`Fetched ${raw.length} total products\n`)

  // Normalise and filter to diamonds only
  interface DiamondResult {
    title: string
    origin: string | null
    type: string
    carat: number | null
    color: string | null
    clarity: string | null
    shape: string | null
    cert: string | null
    evc: string | null
    price: number | null
    valuation: ReturnType<typeof valuateNaturalDiamond>
  }

  const diamonds: DiamondResult[] = []

  for (const product of raw) {
    const result = normaliseShopifyProduct(product, "rbdiamond_au", baseUrl)
    if (!result) continue
    const isDiamond = result.product_type.includes("diamond") || result.product_type.includes("engagement")
    if (!isDiamond) continue

    // Run natural valuation on natural diamonds
    const val = result.diamond_centre_type === "natural"
      ? valuateNaturalDiamond({
          carat: result.diamond_centre_carat,
          color: result.diamond_centre_color,
          clarity: result.diamond_centre_clarity,
          shape: result.diamond_centre_shape,
          retail_price: result.price_aud,
        })
      : null

    diamonds.push({
      title: result.product_title,
      origin: result.diamond_centre_type,
      type: result.product_type,
      carat: result.diamond_centre_carat,
      color: result.diamond_centre_color,
      clarity: result.diamond_centre_clarity,
      shape: result.diamond_centre_shape,
      cert: result.diamond_centre_cert_body
        ? `${result.diamond_centre_cert_body} ${result.diamond_centre_cert_number || ""}`.trim()
        : null,
      evc: result.evc,
      price: result.price_aud,
      valuation: val,
    })
  }

  // Stats
  const natural = diamonds.filter(d => d.origin === "natural")
  const labGrown = diamonds.filter(d => d.origin === "lab_grown")
  const unknown = diamonds.filter(d => !d.origin)

  console.log(`Total diamonds found: ${diamonds.length}`)
  console.log(`  Natural:    ${natural.length}`)
  console.log(`  Lab-Grown:  ${labGrown.length}`)
  console.log(`  Unknown:    ${unknown.length}`)

  // Sample 5 natural diamonds with valuations
  const naturalWithVal = natural.filter(d => d.valuation)
  console.log(`\n${"─".repeat(60)}`)
  console.log(`Sample Natural Diamonds with Valuations (${Math.min(5, naturalWithVal.length)} of ${natural.length}):\n`)

  for (const d of naturalWithVal.slice(0, 5)) {
    const v = d.valuation!
    console.log(`  ${d.title}`)
    console.log(`    Specs:    ${d.carat}ct ${d.shape} ${d.color} ${d.clarity}`)
    console.log(`    Cert:     ${d.cert || "none"}`)
    console.log(`    EVC:      ${d.evc || "—"}`)
    console.log(`    Retail:   ${d.price && d.price > 0 ? `$${d.price.toFixed(2)} AUD` : "$0 (contact for price)"}`)
    console.log(`    Estimate: $${v.fair_estimate.toLocaleString()} (range: $${v.fair_range.low.toLocaleString()}–$${v.fair_range.high.toLocaleString()})`)
    console.log(`    Verdict:  ${v.verdict_label}${v.price_diff_pct !== null ? ` (${v.price_diff_pct >= 0 ? "+" : ""}${v.price_diff_pct}%)` : ""}`)
    console.log(`    Lab-grown alt: $${v.lab_grown_equivalent_price.toLocaleString()} (${v.savings_vs_lab_grown_pct}% savings)`)
    console.log()
  }

  // Sample 3 lab-grown for comparison
  console.log(`Sample Lab-Grown Diamonds (3 of ${labGrown.length}):\n`)
  for (const d of labGrown.slice(0, 3)) {
    console.log(`  [LAB] ${d.title}`)
    console.log(`    ${d.carat}ct ${d.shape} ${d.color || "?"} ${d.clarity || "?"} | ${d.cert || "no cert"} | EVC: ${d.evc || "—"}`)
    console.log()
  }

  // Unknown origin
  if (unknown.length > 0) {
    console.log(`Unknown origin (${unknown.length}):`)
    for (const d of unknown.slice(0, 3)) {
      console.log(`  [???] ${d.title}`)
    }
  }
}

main().catch(console.error)
