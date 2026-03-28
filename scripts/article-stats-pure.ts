import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const { data: gold } = await s.from("gold_products")
    .select("product_type, making_charge_pct")
    .not("making_charge_pct", "is", null)
    .eq("locale", "au")
    .eq("has_diamonds", false)
    .eq("has_gemstones", false)

  console.log("Pure gold products (no diamonds/gemstones):", gold?.length)
  const types: Record<string, number[]> = {}
  for (const g of gold || []) {
    const t = g.product_type || "unknown"
    if (!types[t]) types[t] = []
    types[t].push(Number(g.making_charge_pct))
  }
  for (const [t, charges] of Object.entries(types).sort((a,b) => b[1].length - a[1].length)) {
    const avg = charges.reduce((a,b) => a+b, 0) / charges.length
    const sorted = [...charges].sort((a,b) => a-b)
    const median = sorted[Math.floor(sorted.length/2)]
    console.log(`  ${t}: avg=${avg.toFixed(0)}% median=${median.toFixed(0)}% min=${Math.min(...charges).toFixed(0)}% max=${Math.max(...charges).toFixed(0)}% n=${charges.length}`)
  }
}
main()
