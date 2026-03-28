/**
 * Test: Gold Scraper + Valuation Engine integration
 *
 * Scrapes RB Diamond, runs valuation on every gold product,
 * then logs 5 detailed samples and overall stats.
 *
 * Usage: npx tsx scripts/test-gold-valuation.ts
 */

import { scrapeGoldProducts } from "../lib/scrapers/gold-scraper"
import { valuateGoldProduct, type GoldValuationResult } from "../lib/valuation/gold-valuation"

async function main() {
  const baseUrl = "https://rbdiamond.com.au"
  const retailerName = "RB Diamond"

  console.log(`\nScraping & valuating gold products from ${baseUrl}...`)
  console.log("─".repeat(70))

  const { total, goldCount, products } = await scrapeGoldProducts(baseUrl, retailerName)
  console.log(`Fetched: ${total} total, ${goldCount} gold products\n`)

  // Run valuation on every product
  const valuations: { product: typeof products[0]; valuation: GoldValuationResult }[] = []
  let skippedNoKarat = 0
  let skippedNoPrice = 0

  for (const p of products) {
    if (!p.karat) { skippedNoKarat++; continue }
    if (!p.price_aud) { skippedNoPrice++; continue }

    const val = valuateGoldProduct({
      price_aud: p.price_aud,
      karat: p.karat,
      weight_grams: p.weight_grams,
      product_type: p.product_type,
      product_title: p.product_title,
      has_diamonds: p.has_diamonds,
      has_gemstones: p.has_gemstones,
    })

    if (val) {
      valuations.push({ product: p, valuation: val })
    }
  }

  console.log(`Valuated: ${valuations.length} products`)
  console.log(`Skipped: ${skippedNoKarat} (no karat), ${skippedNoPrice} (no price)`)

  // Stats
  const ratings = { low: 0, average: 0, high: 0, very_high: 0 }
  const fairCount = valuations.filter(v => v.valuation.is_fair).length
  let totalMakingCharge = 0

  for (const v of valuations) {
    ratings[v.valuation.making_charge_rating]++
    totalMakingCharge += v.valuation.making_charge_pct
  }

  const avgMakingCharge = valuations.length > 0 ? totalMakingCharge / valuations.length : 0

  console.log(`\nMaking charge distribution:`)
  console.log(`  Low (<15%):      ${ratings.low}`)
  console.log(`  Average (15-30%): ${ratings.average}`)
  console.log(`  High (30-50%):   ${ratings.high}`)
  console.log(`  Very High (>50%): ${ratings.very_high}`)
  console.log(`  Average making charge: ${avgMakingCharge.toFixed(1)}%`)
  console.log(`  Fair priced: ${fairCount}/${valuations.length} (${valuations.length > 0 ? Math.round(fairCount / valuations.length * 100) : 0}%)`)

  // Sample 5 products with diverse making charges
  const sorted = [...valuations].sort((a, b) => a.valuation.making_charge_pct - b.valuation.making_charge_pct)
  const samples = [
    sorted[0],                                          // lowest making charge
    sorted[Math.floor(sorted.length * 0.25)],           // 25th percentile
    sorted[Math.floor(sorted.length * 0.5)],            // median
    sorted[Math.floor(sorted.length * 0.75)],           // 75th percentile
    sorted[sorted.length - 1],                          // highest making charge
  ].filter(Boolean)

  console.log(`\n${"─".repeat(70)}`)
  console.log(`5 Sample Valuations (low → high making charge):\n`)

  for (const { product: p, valuation: v } of samples) {
    console.log(`  ${p.product_title}`)
    console.log(`    Retail price:     $${p.price_aud!.toFixed(2)} AUD`)
    console.log(`    Karat:            ${p.karat}K ${p.gold_color}`)
    console.log(`    Weight:           ${v.estimated_weight_grams}g (${v.weight_source})`)
    console.log(`    Intrinsic value:  $${v.estimated_intrinsic_value.toFixed(2)} AUD`)
    console.log(`    Making charge:    ${v.making_charge_pct.toFixed(1)}% (${v.making_charge_rating})`)
    console.log(`    Fair range:       $${v.fair_price_range.low} – $${v.fair_price_range.high}`)
    console.log(`    Fair?             ${v.is_fair ? "Yes" : "No"}`)
    if (p.has_diamonds) console.log(`    Note:             Has diamonds (fair range expanded)`)
    if (p.has_gemstones) console.log(`    Note:             Has gemstones (fair range expanded)`)
    console.log()
  }
}

main().catch(console.error)
