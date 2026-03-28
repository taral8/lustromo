/**
 * Test: Natural vs Lab-Grown Diamond Detection
 *
 * Fetches diamond products from rbdiamond.com.au and runs the
 * origin detection logic on each, logging the classification.
 *
 * Usage: npx tsx scripts/test-natural-detection.ts
 */

import { type ShopifyProduct } from "../lib/ingestion/types"
import { normaliseShopifyProduct } from "../lib/ingestion/pipeline"

const USER_AGENT = "Lustrumo/1.0 (lustrumo.com; jewellery price intelligence)"

async function main() {
  const baseUrl = "https://rbdiamond.com.au"
  console.log(`\nFetching diamond products from ${baseUrl}...`)

  const res = await fetch(`${baseUrl}/products.json?limit=250&page=1`, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json()
  const raw: ShopifyProduct[] = data.products || []
  console.log(`Fetched ${raw.length} products from page 1\n`)

  // Normalise and filter to diamond products only
  const diamonds: { title: string; origin: string | null; type: string; carat: number | null; color: string | null; clarity: string | null; cert: string | null; evc: string | null }[] = []
  let skipped = 0

  for (const product of raw) {
    const result = normaliseShopifyProduct(product, "rbdiamond_au", baseUrl)
    if (!result) { skipped++; continue }

    const isDiamond = result.product_type.includes("diamond") || result.product_type.includes("engagement")
    if (!isDiamond) continue

    diamonds.push({
      title: result.product_title,
      origin: result.diamond_centre_type,
      type: result.product_type,
      carat: result.diamond_centre_carat,
      color: result.diamond_centre_color,
      clarity: result.diamond_centre_clarity,
      cert: result.diamond_centre_cert_body ? `${result.diamond_centre_cert_body} ${result.diamond_centre_cert_number || ""}`.trim() : null,
      evc: result.evc,
    })
  }

  console.log(`Diamond products found: ${diamonds.length} (${skipped} non-jewellery skipped)`)

  // Group by origin
  const natural = diamonds.filter(d => d.origin === "natural")
  const labGrown = diamonds.filter(d => d.origin === "lab_grown")
  const unknown = diamonds.filter(d => !d.origin)

  console.log(`  Natural:    ${natural.length}`)
  console.log(`  Lab-Grown:  ${labGrown.length}`)
  console.log(`  Unknown:    ${unknown.length}`)

  // Log all diamond products with classification
  console.log(`\n${"─".repeat(70)}`)
  console.log(`All ${diamonds.length} diamond products:\n`)

  for (const d of diamonds) {
    const originTag = d.origin === "natural" ? "NAT" : d.origin === "lab_grown" ? "LAB" : "???"
    const specs = [
      d.carat ? `${d.carat}ct` : null,
      d.color,
      d.clarity,
      d.cert,
    ].filter(Boolean).join(" ")

    console.log(`  [${originTag}] ${d.title}`)
    console.log(`        Specs: ${specs || "none parsed"} | EVC: ${d.evc || "—"} | Type: ${d.type}`)
  }

  // Unknown origin details
  if (unknown.length > 0) {
    console.log(`\n${"─".repeat(70)}`)
    console.log(`⚠ Products with undetermined origin:`)
    for (const d of unknown) {
      console.log(`  - ${d.title}`)
    }
  }
}

main().catch(console.error)
