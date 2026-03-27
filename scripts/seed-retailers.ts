/**
 * Seed Australian Shopify-based lab-grown diamond retailers into the retailers table.
 *
 * Usage:
 *   npx tsx scripts/seed-retailers.ts
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

// Australian Shopify retailers known to sell lab-grown diamonds
const RETAILERS = [
  {
    name: "RB Diamond",
    slug: "rb-diamond",
    website_url: "https://rbdiamond.com.au",
    city: "Melbourne",
    state: "VIC",
    is_online: true,
    is_physical: true,
    specialities: ["lab_grown", "natural", "engagement"],
  },
  {
    name: "Novita Diamonds",
    slug: "novita-diamonds",
    website_url: "https://www.novitadiamonds.com.au",
    city: "Sydney",
    state: "NSW",
    is_online: true,
    is_physical: true,
    specialities: ["lab_grown", "engagement"],
  },
  {
    name: "Mdera",
    slug: "mdera",
    website_url: "https://mdera.com.au",
    city: "Sydney",
    state: "NSW",
    is_online: true,
    is_physical: false,
    specialities: ["lab_grown", "engagement"],
  },
  {
    name: "Lab Grown Diamonds Australia",
    slug: "lab-grown-diamonds-au",
    website_url: "https://www.labgrowndiamonds.com.au",
    city: "Melbourne",
    state: "VIC",
    is_online: true,
    is_physical: false,
    specialities: ["lab_grown", "engagement"],
  },
  {
    name: "Four Words",
    slug: "four-words",
    website_url: "https://fourwords.com.au",
    city: "Melbourne",
    state: "VIC",
    is_online: true,
    is_physical: true,
    specialities: ["lab_grown", "natural", "engagement"],
  },
  {
    name: "Lumdera",
    slug: "lumdera",
    website_url: "https://lumdera.com.au",
    city: "Melbourne",
    state: "VIC",
    is_online: true,
    is_physical: false,
    specialities: ["lab_grown", "engagement"],
  },
]

async function seed() {
  console.log(`Seeding ${RETAILERS.length} retailers...`)

  for (const retailer of RETAILERS) {
    const { error } = await supabase
      .from("retailers")
      .upsert({
        ...retailer,
        country: "AU",
        locale: "au",
        is_active: true,
      }, {
        onConflict: "slug",
      })

    if (error) {
      console.error(`  Error seeding ${retailer.name}:`, error.message)
    } else {
      console.log(`  ✓ ${retailer.name} (${retailer.website_url})`)
    }
  }

  console.log("Done.")
}

seed()
