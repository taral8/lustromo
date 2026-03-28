/**
 * Debug: Show product counts per retailer (with pagination past 1,000 row limit).
 * Usage: npx tsx scripts/debug-retailers.ts
 */
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAll(table: string, select: string): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: any[] = []
  let offset = 0
  while (true) {
    const { data } = await supabase.from(table).select(select).range(offset, offset + 999)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < 1000) break
    offset += 1000
  }
  return all
}

async function main() {
  // 1. Gold products
  const gold = await fetchAll("gold_products", "retailer_name")
  const goldCounts: Record<string, number> = {}
  for (const g of gold) goldCounts[g.retailer_name as string] = (goldCounts[g.retailer_name as string] || 0) + 1

  console.log("\n=== gold_products by retailer_name ===")
  for (const [name, count] of Object.entries(goldCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name}: ${count}`)
  }
  console.log(`  TOTAL: ${Object.values(goldCounts).reduce((a, b) => a + b, 0)}`)

  // 2. Diamond products
  const diamonds = await fetchAll("products", "retailer_id")
  const diamondCounts: Record<string, number> = {}
  for (const d of diamonds) diamondCounts[d.retailer_id as string] = (diamondCounts[d.retailer_id as string] || 0) + 1

  console.log("\n=== products (diamonds) by retailer_id ===")
  for (const [id, count] of Object.entries(diamondCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${id}: ${count}`)
  }
  console.log(`  TOTAL: ${Object.values(diamondCounts).reduce((a, b) => a + b, 0)}`)

  console.log(`\n=== Grand total: ${Object.values(goldCounts).reduce((a, b) => a + b, 0) + Object.values(diamondCounts).reduce((a, b) => a + b, 0)} ===`)
}

main().catch(console.error)
