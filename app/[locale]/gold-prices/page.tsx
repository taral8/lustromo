"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, Loader2, ExternalLink, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/charts/sparkline"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useLocale } from "@/lib/locale-context"

// ─── Types ───

interface GoldPrice {
  pricePerGram: number
  pricePerOunce: number
  currency: string
  source: string
  timestamp: string
  isFresh: boolean
  change24h: number | null
  changePercent24h: number | null
}

interface GoldStats {
  total: number
  overallAvg: number
  pureGoldAvg: number | null
  pureGoldCount: number
  byType: { type: string; avg: number; count: number; min: number; max: number }[]
  byKarat: { karat: number; avg: number; count: number }[]
  distribution: { label: string; count: number }[]
}

interface GoldProduct {
  id: string
  title: string
  product_url: string
  image_url: string | null
  price_local: number
  karat: number | null
  gold_color: string | null
  product_type: string | null
  intrinsic_value: number | null
  making_charge_pct: number | null
  making_charge_rating: string | null
  has_diamonds: boolean
  has_gemstones: boolean
  retailer_name: string
}

// ─── Constants ───

const KARAT_PURITY: Record<number, number> = { 9: 0.375, 14: 0.5833, 18: 0.75, 22: 0.9167, 24: 0.9999 }
const TOLA_GRAMS = 11.6638 // 1 tola

const RATING_STYLES: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(16,185,129,0.1)", text: "var(--accent-success)" },
  average: { bg: "rgba(59,130,246,0.1)", text: "var(--accent-secondary)" },
  high: { bg: "rgba(245,158,11,0.1)", text: "var(--accent-warning)" },
  very_high: { bg: "rgba(239,68,68,0.1)", text: "var(--accent-danger)" },
}
const RATING_LABELS: Record<string, string> = { low: "Low", average: "Average", high: "High", very_high: "Very High" }

const BAR_COLORS = ["#10B981", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#EF4444", "#EF4444"]

// ─── Page ───

export default function GoldPricesPage() {
  const locale = useLocale()
  const prefix = `/${locale}`

  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [stats, setStats] = useState<GoldStats | null>(null)
  const [products, setProducts] = useState<GoldProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/gold-price").then(r => r.json()),
      fetch("/api/gold-stats").then(r => r.json()),
      fetch("/api/gold-products?sort=scraped_at&dir=desc&limit=20").then(r => r.json()),
    ]).then(([price, statsData, productsData]) => {
      setGoldPrice(price)
      setStats(statsData)
      setProducts(productsData.products || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const spot = goldPrice?.pricePerGram ?? 210.0
  const isFresh = goldPrice?.isFresh ?? false
  const isStale = goldPrice != null && !isFresh
  const change = goldPrice?.change24h ?? null
  const changePct = goldPrice?.changePercent24h ?? null

  // Calculate "X minutes ago" from timestamp
  const lastUpdatedText = goldPrice?.timestamp
    ? (() => {
        const diffMs = Date.now() - new Date(goldPrice.timestamp).getTime()
        const mins = Math.floor(diffMs / 60000)
        if (mins < 1) return "Just now"
        if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`
        const days = Math.floor(hrs / 24)
        return `${days} day${days > 1 ? "s" : ""} ago`
      })()
    : null

  // Sparkline placeholders (trending upward for gold)
  const karatCards = [9, 14, 18, 22, 24].map(k => {
    const purity = KARAT_PURITY[k]
    const pricePerGram = spot * purity
    const sparkData = Array.from({ length: 9 }, (_, i) =>
      Math.round(pricePerGram * (0.97 + i * 0.003) * 100) / 100
    )
    return { karat: k, purity, pricePerGram, sparkData }
  })

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" style={{ color: "var(--accent-primary)" }} />
        <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>Loading gold market data...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Gold Prices Australia
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Live gold spot prices, karat-by-karat pricing, and making charge analysis across Australian retailers.
        </p>
      </div>

      {/* ═══ SECTION 1: Live Gold Spot Price Banner ═══ */}
      <Card className="mt-8 overflow-hidden" style={{ background: "#0F172A", border: "none" }}>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(241,245,249,0.5)" }}>
                24K Gold Spot Price
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-mono text-3xl font-bold text-white sm:text-4xl">
                  ${spot.toFixed(2)}
                </span>
                <span className="font-mono text-lg" style={{ color: "rgba(241,245,249,0.7)" }}>
                  AUD/gram
                </span>
              </div>
              {change !== null && changePct !== null && (
                <div className="mt-2 flex items-center gap-1">
                  {change >= 0 ? <TrendingUp className="h-4 w-4" style={{ color: "#10B981" }} /> : <TrendingDown className="h-4 w-4" style={{ color: "#EF4444" }} />}
                  <span className="font-mono text-sm font-semibold" style={{ color: change >= 0 ? "#10B981" : "#EF4444" }}>
                    {change >= 0 ? "+" : ""}${change.toFixed(2)} ({changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%)
                  </span>
                  <span className="text-xs" style={{ color: "rgba(241,245,249,0.4)" }}>24h</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div>
                  <span className="text-xs" style={{ color: "rgba(241,245,249,0.4)" }}>Per troy ounce: </span>
                  <span className="font-mono text-sm font-semibold text-white">
                    ${(goldPrice?.pricePerOunce ?? spot * 31.1035).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-xs" style={{ color: "rgba(241,245,249,0.4)" }}>Per tola (11.66g): </span>
                  <span className="font-mono text-sm font-semibold text-white">
                    ${(spot * TOLA_GRAMS).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  {isFresh ? (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: "#10B981" }}>LIVE</span>
                  ) : (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: "#F59E0B" }}>CACHED</span>
                  )}
                  <span className="text-[10px]" style={{ color: "rgba(241,245,249,0.3)" }}>
                    {goldPrice?.source}
                  </span>
                </div>
                <span className="text-[10px]" style={{ color: isStale ? "#F59E0B" : "rgba(241,245,249,0.3)" }}>
                  {lastUpdatedText ? `Last updated: ${lastUpdatedText}` : "—"}
                  {isStale && " — live feed temporarily unavailable"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ SECTION 2: Karat Price Cards ═══ */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Price by Karat</h2>
        <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {karatCards.map(k => (
            <Card key={k.karat}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: "var(--background-alt)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                    {k.karat}K
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {(k.purity * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="mt-3 font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  ${k.pricePerGram.toFixed(2)}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>per gram</p>
                <div className="mt-2">
                  <Sparkline data={k.sparkData} width={100} height={24} />
                </div>
                <p className="mt-2 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {(k.purity * 100).toFixed(1)}% &times; ${spot.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ═══ SECTION 3: Making Charge Market Summary ═══ */}
      {stats && stats.total > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Making Charge Market Summary</h2>
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Aggregate making charge analysis across {stats.total.toLocaleString()} gold products from Australian retailers.
            {stats.pureGoldAvg !== null && (
              <> Pure gold average (no diamonds/gemstones): <strong className="font-mono">{stats.pureGoldAvg.toFixed(0)}%</strong> ({stats.pureGoldCount} products).</>
            )}
          </p>

          {/* By Product Type */}
          <Card className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Product Type</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Avg Making Charge</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Sample Size</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Range</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byType.map(row => (
                    <tr key={row.type} className="transition-colors hover:bg-[var(--background-alt)]" style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-4 py-2.5 font-medium capitalize" style={{ color: "var(--text-primary)" }}>{row.type}</td>
                      <td className="px-4 py-2.5 text-right font-mono" style={{
                        color: row.avg <= 30 ? "var(--accent-success)" : row.avg <= 50 ? "var(--accent-warning)" : "var(--accent-danger)"
                      }}>
                        {row.avg.toFixed(0)}%
                      </td>
                      <td className="px-4 py-2.5 text-right" style={{ color: "var(--text-secondary)" }}>
                        {row.count} products
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        {row.min.toFixed(0)}–{row.max.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* By Karat */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {stats.byKarat.map(row => (
              <div key={row.karat} className="rounded-lg p-4" style={{ background: "var(--background-alt)", border: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{row.karat}K Gold</p>
                <p className="mt-1 font-mono text-xl font-bold" style={{
                  color: row.avg <= 30 ? "var(--accent-success)" : row.avg <= 50 ? "var(--accent-warning)" : "var(--accent-danger)"
                }}>
                  {row.avg.toFixed(0)}%
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>avg charge &middot; {row.count} products</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SECTION 4: Price Distribution Chart ═══ */}
      {stats && stats.distribution.some(d => d.count > 0) && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Making Charge Distribution</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            How much are Australian retailers charging above gold value?
          </p>
          <Card className="mt-4">
            <CardContent className="p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.distribution} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0F172A",
                      border: "none",
                      borderRadius: 8,
                      color: "#F1F5F9",
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value} products`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.distribution.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i] || "#94A3B8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[10px]">
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: "#10B981" }} /> Low (&lt;20%)</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: "#3B82F6" }} /> Average (20–30%)</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: "#F59E0B" }} /> High (30–50%)</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded" style={{ background: "#EF4444" }} /> Very High (&gt;50%)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ SECTION 5: Latest Gold Products ═══ */}
      {products.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Latest Gold Products</h2>
            <Link href={`${prefix}/gold-calculator#intelligence`} className="text-sm font-medium" style={{ color: "var(--accent-primary)" }}>
              View all gold products &rarr;
            </Link>
          </div>
          <Card className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Product</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Karat</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Type</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Retail Price</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Est. Gold Value</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Making Charge</th>
                    <th className="px-4 py-3 text-center font-medium" style={{ color: "var(--text-secondary)" }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const rs = p.making_charge_rating ? RATING_STYLES[p.making_charge_rating] : null
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-[var(--background-alt)]" style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.image_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" style={{ border: "1px solid var(--border)" }} />
                            )}
                            <a href={p.product_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                              style={{ color: "var(--accent-primary)" }}>
                              <span className="line-clamp-1 max-w-[180px]">{p.title}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {p.karat ? (
                            <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ background: "var(--background-alt)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                              {p.karat}K
                            </span>
                          ) : <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs capitalize" style={{ color: "var(--text-secondary)" }}>{p.product_type || "—"}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                          ${p.price_local.toLocaleString("en-AU", { minimumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                          {p.intrinsic_value ? `$${Number(p.intrinsic_value).toLocaleString("en-AU", { minimumFractionDigits: 0 })}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs" style={{
                          color: p.making_charge_pct != null
                            ? Number(p.making_charge_pct) <= 30 ? "var(--accent-success)"
                            : Number(p.making_charge_pct) <= 50 ? "var(--accent-warning)"
                            : "var(--accent-danger)"
                            : "var(--text-muted)"
                        }}>
                          {p.making_charge_pct != null ? `${Number(p.making_charge_pct).toFixed(0)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.making_charge_rating && rs ? (
                            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: rs.bg, color: rs.text }}>
                              {RATING_LABELS[p.making_charge_rating] || p.making_charge_rating}
                            </span>
                          ) : <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-8 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Gold spot prices sourced from live market feeds. Making charge estimates use weight estimates where retailer
        listings do not specify gram weight. Products with diamonds or gemstones will show higher making charges as
        stone value is included in the retail price. All prices in AUD inc. GST.
      </p>
    </div>
  )
}
