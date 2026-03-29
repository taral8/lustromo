import { createServiceClient } from "@/lib/supabase"

export interface PlatformStats {
  diamondCount: number
  goldCount: number
  retailerCount: number
}

let cached: { stats: PlatformStats; ts: number } | null = null
const CACHE_MS = 60 * 60 * 1000 // 1 hour

export async function getPlatformStats(): Promise<PlatformStats> {
  if (cached && Date.now() - cached.ts < CACHE_MS) return cached.stats

  const sb = createServiceClient()
  if (!sb) return { diamondCount: 0, goldCount: 0, retailerCount: 0 }

  const [diamonds, gold, retailers] = await Promise.all([
    sb.from("products").select("*", { count: "exact", head: true }),
    sb.from("gold_products").select("*", { count: "exact", head: true }),
    sb.from("retailers").select("*", { count: "exact", head: true }),
  ])

  const stats: PlatformStats = {
    diamondCount: diamonds.count ?? 0,
    goldCount: gold.count ?? 0,
    retailerCount: retailers.count ?? 0,
  }

  cached = { stats, ts: Date.now() }
  return stats
}

/** Round a number for display: <100 exact, 100-999 nearest 10, 1k-9999 nearest 1k, 10k+ nearest 5k */
export function formatStatNumber(n: number): string {
  if (n < 100) return n.toLocaleString()
  if (n < 1000) return `${Math.floor(n / 10) * 10}+`
  if (n < 10000) return `${Math.floor(n / 1000).toLocaleString()},000+`
  return `${(Math.floor(n / 5000) * 5).toLocaleString()},000+`
}
