/**
 * Create gold_products table via Supabase Management API.
 * Usage: npx tsx scripts/create-gold-table.ts
 */
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { readFileSync } from "fs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Extract project ref from URL: https://xxxx.supabase.co → xxxx
const projectRef = supabaseUrl.replace("https://", "").split(".")[0]

async function runSQL(sql: string) {
  // Use the Supabase SQL endpoint (available with service role key)
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
  })

  // The rpc approach won't work without a custom function.
  // Fall back to using the pg_net extension or direct approach.
  // Let's use a simpler method: create via individual table operations.
  return res
}

async function createTable() {
  console.log("Creating gold_products table...")
  console.log("Project ref:", projectRef)

  // We'll use the Supabase client to test insert — if the table doesn't exist,
  // we need the user to run the SQL manually.
  // BUT we can try the Supabase Management API if we have access.

  // Simplest approach: read the SQL and POST to the /pg endpoint
  const sql = readFileSync("supabase/migration-gold-products.sql", "utf-8")

  // Try the database query endpoint
  const res = await fetch(`${supabaseUrl}/pg/query`, {
    method: "POST",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  })

  if (res.ok) {
    console.log("Table created successfully!")
    return
  }

  // If that doesn't work, output instructions
  console.log("\nAutomatic creation not available on this Supabase plan.")
  console.log("Please run this SQL manually:\n")
  console.log("  1. Go to: https://supabase.com/dashboard/project/" + projectRef + "/sql/new")
  console.log("  2. Paste the contents of: supabase/migration-gold-products.sql")
  console.log("  3. Click 'Run'\n")
}

createTable()
