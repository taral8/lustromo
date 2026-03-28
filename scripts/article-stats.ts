import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const { count: goldTotal } = await s.from("gold_products").select("*", { count: "exact", head: true })
  const { count: diamondTotal } = await s.from("products").select("*", { count: "exact", head: true })
  console.log("Gold products:", goldTotal)
  console.log("Diamond products:", diamondTotal)

  // Gold by type
  const { data: gold } = await s.from("gold_products").select("product_type, making_charge_pct").not("making_charge_pct", "is", null).eq("locale", "au")
  const types: Record<string, number[]> = {}
  for (const g of gold || []) {
    const t = g.product_type || "unknown"
    if (!types[t]) types[t] = []
    types[t].push(Number(g.making_charge_pct))
  }
  console.log("\nGold making charges by type:")
  for (const [t, charges] of Object.entries(types).sort((a,b) => b[1].length - a[1].length)) {
    const avg = charges.reduce((a,b) => a+b, 0) / charges.length
    console.log(`  ${t}: avg=${avg.toFixed(0)}% min=${Math.min(...charges).toFixed(0)}% max=${Math.max(...charges).toFixed(0)}% n=${charges.length}`)
  }

  // Diamond avg prices by origin
  const { data: labDiamonds } = await s.from("products").select("price_aud, diamond_centre_carat").eq("diamond_centre_type", "lab_grown").gt("price_aud", 0)
  const { data: natDiamonds } = await s.from("products").select("price_aud, diamond_centre_carat").eq("diamond_centre_type", "natural").gt("price_aud", 0)

  if (labDiamonds?.length) {
    const prices1ct = labDiamonds.filter(d => d.diamond_centre_carat >= 0.8 && d.diamond_centre_carat <= 1.2).map(d => Number(d.price_aud))
    if (prices1ct.length) console.log(`\nLab-grown ~1ct avg: $${Math.round(prices1ct.reduce((a,b)=>a+b,0)/prices1ct.length)} (n=${prices1ct.length})`)
    console.log(`Lab-grown total with price: ${labDiamonds.length}`)
  }
  if (natDiamonds?.length) {
    console.log(`Natural total with price: ${natDiamonds.length}`)
  }
}
main()
