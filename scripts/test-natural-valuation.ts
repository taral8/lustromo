/**
 * Test: Natural Diamond Valuation against scraped RB Diamond data.
 * Usage: npx tsx scripts/test-natural-valuation.ts
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import { valuateNaturalDiamond } from "../lib/valuation/natural-diamond-valuation"

dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log("\nNatural Diamond Valuation Test — RB Diamond")
  console.log("─".repeat(60))

  // Fetch all natural diamonds from DB
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("diamond_centre_type", "natural")
    .eq("locale", "au")

  if (error) {
    console.error("Error fetching products:", error.message)
    return
  }

  if (!products || products.length === 0) {
    console.log("No natural diamonds found in products table.")
    console.log("Run: npx tsx scripts/scrape-diamonds-all.ts rb-diamond")
    return
  }

  console.log(`Found ${products.length} natural diamonds in DB\n`)

  const results = []

  for (const p of products) {
    const val = valuateNaturalDiamond({
      carat: p.diamond_centre_carat,
      color: p.diamond_centre_color,
      clarity: p.diamond_centre_clarity,
      shape: p.diamond_centre_shape,
      retail_price: p.price_aud,
    })

    results.push({ product: p, valuation: val })
  }

  // Stats
  const verdicts: Record<string, number> = {}
  for (const r of results) {
    const v = r.valuation?.verdict || "null"
    verdicts[v] = (verdicts[v] || 0) + 1
  }

  console.log("Verdict distribution:", JSON.stringify(verdicts))

  // Sample 5
  console.log(`\n${"─".repeat(60)}`)
  console.log(`Sample Valuations:\n`)

  const samples = results.slice(0, 5)
  for (const { product: p, valuation: v } of samples) {
    console.log(`  ${p.product_title}`)
    console.log(`    Retail:   ${p.price_aud > 0 ? `$${Number(p.price_aud).toFixed(2)} AUD` : "$0 (contact for price)"}`)
    console.log(`    Specs:    ${p.diamond_centre_carat}ct ${p.diamond_centre_shape} ${p.diamond_centre_color} ${p.diamond_centre_clarity}`)
    console.log(`    Cert:     ${p.diamond_centre_cert_body} ${p.diamond_centre_cert_number || "—"}`)
    console.log(`    EVC:      ${p.evc || "—"}`)
    if (v) {
      console.log(`    Estimate: $${v.fair_estimate.toLocaleString()} (range: $${v.fair_range.low.toLocaleString()}–$${v.fair_range.high.toLocaleString()})`)
      console.log(`    Verdict:  ${v.verdict_label}${v.price_diff_pct !== null ? ` (${v.price_diff_pct >= 0 ? "+" : ""}${v.price_diff_pct}%)` : ""}`)
      console.log(`    Source:   ${v.base_price_source}`)
    } else {
      console.log(`    Verdict:  Could not valuate (missing carat)`)
    }
    console.log()
  }

  // Also test with a hypothetical priced natural diamond
  console.log("─".repeat(60))
  console.log("Hypothetical test: 1ct G VS1 Round @ $7,500 AUD\n")
  const hypo = valuateNaturalDiamond({
    carat: 1.0, color: "G", clarity: "VS1", shape: "round", retail_price: 7500,
  })
  if (hypo) {
    console.log(`  Estimate: $${hypo.fair_estimate.toLocaleString()} (range: $${hypo.fair_range.low.toLocaleString()}–$${hypo.fair_range.high.toLocaleString()})`)
    console.log(`  Verdict:  ${hypo.verdict_label} (${hypo.price_diff_pct! >= 0 ? "+" : ""}${hypo.price_diff_pct}%)`)
  }

  console.log("\nHypothetical test: 1.5ct D VVS2 Oval @ $25,000 AUD\n")
  const hypo2 = valuateNaturalDiamond({
    carat: 1.5, color: "D", clarity: "VVS2", shape: "oval", retail_price: 25000,
  })
  if (hypo2) {
    console.log(`  Estimate: $${hypo2.fair_estimate.toLocaleString()} (range: $${hypo2.fair_range.low.toLocaleString()}–$${hypo2.fair_range.high.toLocaleString()})`)
    console.log(`  Verdict:  ${hypo2.verdict_label} (${hypo2.price_diff_pct! >= 0 ? "+" : ""}${hypo2.price_diff_pct}%)`)
  }
}

main().catch(console.error)
