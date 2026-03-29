#!/usr/bin/env node
/**
 * Seed 30 new Australian jewellery retailers into retailers_directory
 *
 * Usage:
 *   node scripts/seed-30-retailers.mjs
 *
 * Or from Supabase SQL Editor: paste the contents of
 *   supabase/migration-seed-30-retailers.sql
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../.env.local") })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const newRetailers = [
  // ═══════════════════════════════════════════
  // CATEGORY 1: NATIONAL CHAINS (5)
  // ═══════════════════════════════════════════
  { name: "Bevilles Jewellers", website_url: "https://www.bevilles.com.au", locale: "au", city: "National", state: null, has_physical_store: true, has_online_store: true, categories: ["diamond", "gold", "silver", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Pandora Australia", website_url: "https://au.pandora.net", locale: "au", city: "National", state: null, has_physical_store: true, has_online_store: true, categories: ["silver", "gold", "lab_grown"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Swarovski Australia", website_url: "https://www.swarovski.com/en_GB-AU/", locale: "au", city: "National", state: null, has_physical_store: true, has_online_store: true, categories: ["silver", "diamond"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Tiffany & Co Australia", website_url: "https://www.tiffany.com.au", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "gold", "silver"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Zamels Jewellers", website_url: "https://www.zamels.com.au", locale: "au", city: "National", state: null, has_physical_store: true, has_online_store: true, categories: ["diamond", "gold", "silver", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },

  // ═══════════════════════════════════════════
  // CATEGORY 2: INDEPENDENT FINE JEWELLERS (10)
  // ═══════════════════════════════════════════
  { name: "Armans Fine Jewellery", website_url: "https://armansfinejewellery.com", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "lab_grown", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "GS Diamonds", website_url: "https://www.gsdiamonds.com.au", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "lab_grown", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Temple and Grace", website_url: "https://www.templeandgrace.com.au", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Affinity Diamonds", website_url: "https://affinitydiamonds.com.au", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "lab_grown", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Simon Curwood Jewellers", website_url: "https://www.simoncurwood.com.au", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "gold", "lab_grown"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Dracakis Jewellers", website_url: "https://dracakis.com.au", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Diamond Imports", website_url: "https://www.diamondimports.com.au", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Kush Diamonds", website_url: "https://www.kushdiamonds.com.au", locale: "au", city: "Melbourne", state: "VIC", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Torres Jewel Co", website_url: "https://www.torresjewelco.com.au", locale: "au", city: "Melbourne", state: "VIC", has_physical_store: true, has_online_store: true, categories: ["diamond", "engagement", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Cullen Jewellery", website_url: "https://cullenjewellery.com", locale: "au", city: "Melbourne", state: "VIC", has_physical_store: true, has_online_store: true, categories: ["lab_grown", "diamond", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },

  // ═══════════════════════════════════════════
  // CATEGORY 3: SOUTH ASIAN / DIASPORA GOLD (5)
  // ═══════════════════════════════════════════
  { name: "Akshara Jewellers", website_url: "https://aksharajewellers.com.au", locale: "au", city: "Harris Park", state: "NSW", has_physical_store: true, has_online_store: false, categories: ["gold", "diamond", "traditional"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "SG Jewels Australia", website_url: "https://sgjewel.com.au", locale: "au", city: "Dandenong", state: "VIC", has_physical_store: true, has_online_store: true, categories: ["gold", "traditional", "silver"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "OM Jewellers", website_url: "https://www.omjewellers.com.au", locale: "au", city: "Perth", state: "WA", has_physical_store: true, has_online_store: true, categories: ["gold", "diamond", "traditional"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Sardar Jewellers", website_url: "https://www.sardarjewellers.com.au", locale: "au", city: "Werribee", state: "VIC", has_physical_store: true, has_online_store: false, categories: ["gold", "diamond", "traditional"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "South East Fashions", website_url: "https://southeastfashions.com.au", locale: "au", city: "Dandenong", state: "VIC", has_physical_store: true, has_online_store: true, categories: ["gold", "traditional", "silver"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },

  // ═══════════════════════════════════════════
  // CATEGORY 4: LAB-GROWN DIAMOND SPECIALISTS (5)
  // ═══════════════════════════════════════════
  { name: "LINDELLI", website_url: "https://www.lindelli.com", locale: "au", city: "Sydney", state: "NSW", has_physical_store: true, has_online_store: true, categories: ["lab_grown", "diamond", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Diamond Lab", website_url: "https://shop.diamond-lab.com.au", locale: "au", city: "Perth", state: "WA", has_physical_store: false, has_online_store: true, categories: ["lab_grown", "diamond", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Luminesce Diamonds", website_url: "https://luminescediamonds.com.au", locale: "au", city: "National", state: null, has_physical_store: true, has_online_store: true, categories: ["lab_grown", "diamond", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Eco Lab Diamonds", website_url: "https://ecolabdiamonds.com.au", locale: "au", city: "Melbourne", state: "VIC", has_physical_store: false, has_online_store: true, categories: ["lab_grown", "diamond", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Leil Jewellery", website_url: "https://leil.com.au", locale: "au", city: "Sydney", state: "NSW", has_physical_store: false, has_online_store: true, categories: ["lab_grown", "diamond", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },

  // ═══════════════════════════════════════════
  // CATEGORY 5: ONLINE-ONLY RETAILERS (5)
  // ═══════════════════════════════════════════
  { name: "Indie and Harper", website_url: "https://www.indieandharper.com", locale: "au", city: "Melbourne", state: "VIC", has_physical_store: false, has_online_store: true, categories: ["silver", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Vinny and Charles", website_url: "https://vinnyandcharles.com", locale: "au", city: "Perth", state: "WA", has_physical_store: false, has_online_store: true, categories: ["engagement", "diamond", "gold"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Alana Maria Jewellery", website_url: "https://alanamariajewellery.com", locale: "au", city: "Sydney", state: "NSW", has_physical_store: false, has_online_store: true, categories: ["gold", "silver"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Francesca Jewellery", website_url: "https://www.francesca.com.au", locale: "au", city: "Hobart", state: "TAS", has_physical_store: false, has_online_store: true, categories: ["silver", "gold", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
  { name: "Sarah and Sebastian", website_url: "https://www.sarahandsebastian.com", locale: "au", city: "Sydney", state: "NSW", has_physical_store: false, has_online_store: true, categories: ["diamond", "gold", "engagement"], data_source: "manual", is_scraped: false, product_count: 0, diamond_count: 0, gold_count: 0, confidence_score: 0 },
]

async function main() {
  console.log("🔍 Checking existing retailers...")

  const { data: existing, error: fetchError } = await supabase
    .from("retailers_directory")
    .select("name")
    .eq("locale", "au")

  if (fetchError) {
    console.error("Error fetching existing retailers:", fetchError.message)
    process.exit(1)
  }

  console.log(`📊 Found ${existing.length} existing retailers`)

  const existingNames = new Set(existing.map(r => r.name.toLowerCase()))
  const toInsert = newRetailers.filter(r => !existingNames.has(r.name.toLowerCase()))

  if (toInsert.length === 0) {
    console.log("✅ All 30 retailers already exist. Nothing to insert.")
  } else {
    console.log(`📝 Inserting ${toInsert.length} new retailers...`)

    // Insert in batches of 10
    for (let i = 0; i < toInsert.length; i += 10) {
      const batch = toInsert.slice(i, i + 10)
      const { error } = await supabase
        .from("retailers_directory")
        .insert(batch)

      if (error) {
        console.error(`❌ Batch ${Math.floor(i / 10) + 1} failed:`, error.message)
      } else {
        console.log(`  ✅ Batch ${Math.floor(i / 10) + 1}: ${batch.length} retailers inserted`)
      }
    }
  }

  // Final count
  const { count } = await supabase
    .from("retailers_directory")
    .select("*", { count: "exact", head: true })
    .eq("locale", "au")

  console.log(`\n🏪 TOTAL directory retailers (AU): ${count}`)
  console.log("Done!")
}

main().catch(console.error)
