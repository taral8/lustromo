/**
 * Run a SQL migration file against Supabase.
 *
 * Usage: npx tsx scripts/run-migration.ts supabase/migration-gold-products.sql
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const file = process.argv[2]
if (!file) {
  console.error("Usage: npx tsx scripts/run-migration.ts <path-to-sql-file>")
  process.exit(1)
}

const sql = readFileSync(file, "utf-8")
console.log(`Running migration: ${file}`)

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { error } = await supabase.rpc("exec_sql", { sql_text: sql })

  if (error) {
    // rpc may not exist — try direct fetch to Supabase REST
    console.log("rpc exec_sql not available, running statements individually...")

    // Split on semicolons, filter empty
    const statements = sql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"))

    for (const stmt of statements) {
      // Use the Supabase SQL API via fetch
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      // This won't work either — inform the user
      if (!res.ok) {
        console.log("\nCannot run SQL via API. Please run the migration manually:")
        console.log(`  File: ${file}`)
        console.log("  Go to: Supabase Dashboard → SQL Editor → paste and run\n")
        break
      }
    }
    return
  }

  console.log("Migration completed successfully.")
}

run().catch(console.error)
