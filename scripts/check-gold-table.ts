import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function check() {
  const { error } = await s.from("gold_products").select("id").limit(1)
  if (error) {
    console.log("gold_products table NOT found:", error.message)
    console.log("\nRun supabase/migration-gold-products.sql in Supabase SQL Editor.")
  } else {
    console.log("gold_products table exists!")
  }
}
check()
