import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
async function main() {
  const { count } = await s.from("gold_products").select("*", { count: "exact", head: true })
  console.log("Gold products in DB:", count)
  const { data } = await s.from("gold_products").select("karat, product_type, making_charge_rating").limit(5)
  if (data?.length) console.log("Sample:", JSON.stringify(data, null, 2))
}
main()
