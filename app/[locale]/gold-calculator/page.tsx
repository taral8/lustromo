"use client"

import { useState, useEffect } from "react"
import { Info, Loader2, Coins, ExternalLink, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * SKILL.md Section 5.2 — Gold Valuation Formula
 *
 * intrinsic_value = weight_grams × purity × spot_price_aud_per_gram
 * retail_value = intrinsic_value × making_charge_multiplier
 *
 * Section 2.6 — Gold Purity Reference
 */

const KARAT_OPTIONS = [
  { label: "9K", purity: 0.375 },
  { label: "14K", purity: 0.585 },
  { label: "18K", purity: 0.750 },
  { label: "22K", purity: 0.916 },
  { label: "24K", purity: 0.999 },
]

const GOLD_COLOURS = ["Yellow", "White", "Rose"]

// SKILL.md Section 5.2 — Making Charge Multipliers
const MAKING_CHARGE_TIERS = [
  { type: "Machine-made chain", multiplierLow: 1.15, multiplierHigh: 1.30 },
  { type: "Cast ring / bangle", multiplierLow: 1.25, multiplierHigh: 1.50 },
  { type: "Handmade / traditional", multiplierLow: 1.50, multiplierHigh: 2.50 },
]

interface GoldPrice {
  pricePerGram: number
  pricePerOunce: number
  currency: string
  source: string
  timestamp: string
}

// ─── Gold Intelligence Types ───

interface GoldProduct {
  id: string
  title: string
  product_url: string
  image_url: string | null
  price_local: number
  karat: number | null
  gold_color: string | null
  product_type: string | null
  weight_grams: number | null
  weight_source: string | null
  intrinsic_value: number | null
  making_charge_pct: number | null
  making_charge_rating: string | null
  fair_price_low: number | null
  fair_price_high: number | null
  has_diamonds: boolean
  has_gemstones: boolean
  retailer_name: string
}

const KARAT_FILTERS = ["All", "9", "14", "18", "22", "24"]
const TYPE_FILTERS = ["All", "ring", "chain", "bangle", "pendant", "earring", "necklace"]
const RATING_FILTERS = [
  { label: "All", value: "" },
  { label: "Low", value: "low" },
  { label: "Average", value: "average" },
  { label: "High", value: "high" },
]

const RATING_STYLES: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(16,185,129,0.1)", text: "var(--accent-success)" },
  average: { bg: "rgba(59,130,246,0.1)", text: "var(--accent-secondary)" },
  high: { bg: "rgba(245,158,11,0.1)", text: "var(--accent-warning)" },
  very_high: { bg: "rgba(239,68,68,0.1)", text: "var(--accent-danger)" },
}

const RATING_LABELS: Record<string, string> = {
  low: "Low",
  average: "Average",
  high: "High",
  very_high: "Very High",
}

type SortField = "price_local" | "making_charge_pct" | "karat"

export default function GoldCalculatorPage() {
  const [karatIdx, setKaratIdx] = useState(3) // default 22K
  const [weight, setWeight] = useState(5)
  const [colour, setColour] = useState("Yellow")
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState(0) // default: machine-made chain

  // Gold Intelligence state
  const [products, setProducts] = useState<GoldProduct[]>([])
  const [productCount, setProductCount] = useState(0)
  const [productsLoading, setProductsLoading] = useState(true)
  const [filterKarat, setFilterKarat] = useState("All")
  const [filterType, setFilterType] = useState("All")
  const [filterRating, setFilterRating] = useState("")
  const [sortBy, setSortBy] = useState<SortField>("price_local")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    fetch("/api/gold-price")
      .then(res => res.json())
      .then(data => { setGoldPrice(data); setLoading(false) })
      .catch(() => {
        setGoldPrice({ pricePerGram: 148.50, pricePerOunce: 4618.50, currency: "AUD", source: "fallback", timestamp: new Date().toISOString() })
        setLoading(false)
      })
  }, [])

  // Fetch gold products
  useEffect(() => {
    setProductsLoading(true)
    const params = new URLSearchParams({ sort: sortBy, dir: sortDir, limit: "100" })
    if (filterKarat !== "All") params.set("karat", filterKarat)
    if (filterType !== "All") params.set("type", filterType)
    if (filterRating) params.set("rating", filterRating)

    fetch(`/api/gold-products?${params}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || [])
        setProductCount(data.count || 0)
        setProductsLoading(false)
      })
      .catch(() => {
        setProducts([])
        setProductCount(0)
        setProductsLoading(false)
      })
  }, [filterKarat, filterType, filterRating, sortBy, sortDir])

  const karat = KARAT_OPTIONS[karatIdx]
  const spotPrice = goldPrice?.pricePerGram ?? 148.50
  const isLive = goldPrice?.source !== "fallback"

  // Section 5.2: intrinsic_value = weight_grams × purity × spot_price_aud_per_gram
  const intrinsicValue = weight * karat.purity * spotPrice

  // Section 5.2: retail_value = intrinsic_value × making_charge_multiplier
  const tier = MAKING_CHARGE_TIERS[selectedTier]
  const retailLow = intrinsicValue * tier.multiplierLow
  const retailHigh = intrinsicValue * tier.multiplierHigh
  const retailMid = (retailLow + retailHigh) / 2

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDir("asc")
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
            Gold Price Calculator
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Calculate the intrinsic and estimated retail value of any gold piece.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* ─── INPUT PANEL ─── */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-6 p-6">
              {/* Karat */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Karat</label>
                <div className="flex flex-wrap gap-2">
                  {KARAT_OPTIONS.map((k, i) => (
                    <button key={k.label} onClick={() => setKaratIdx(i)}
                      className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      style={{
                        background: karatIdx === i ? "var(--accent-primary)" : "var(--background-alt)",
                        color: karatIdx === i ? "#fff" : "var(--text-secondary)",
                        border: karatIdx === i ? "none" : "1px solid var(--border)",
                      }}>
                      {k.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  Purity: {(karat.purity * 100).toFixed(1)}% fine gold
                </p>
              </div>

              {/* Weight */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Weight (grams)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWeight(Math.max(0.5, weight - 0.5))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-medium"
                    style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>−</button>
                  <input type="number" value={weight} step={0.5} min={0}
                    onChange={e => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="h-10 w-24 rounded-lg text-center font-mono text-lg"
                    style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  <button onClick={() => setWeight(weight + 0.5)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-medium"
                    style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>+</button>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>g</span>
                </div>
              </div>

              {/* Colour */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Gold Colour</label>
                <div className="flex gap-2">
                  {GOLD_COLOURS.map(c => (
                    <button key={c} onClick={() => setColour(c)}
                      className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      style={{
                        background: colour === c ? "var(--accent-primary)" : "var(--background-alt)",
                        color: colour === c ? "#fff" : "var(--text-secondary)",
                        border: colour === c ? "none" : "1px solid var(--border)",
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Jewellery Type (making charge tier) */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Jewellery Type</label>
                <div className="flex flex-col gap-2">
                  {MAKING_CHARGE_TIERS.map((t, i) => (
                    <button key={t.type} onClick={() => setSelectedTier(i)}
                      className="rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors"
                      style={{
                        background: selectedTier === i ? "var(--accent-primary)" : "var(--background-alt)",
                        color: selectedTier === i ? "#fff" : "var(--text-secondary)",
                        border: selectedTier === i ? "none" : "1px solid var(--border)",
                      }}>
                      <span className="block">{t.type}</span>
                      <span className="block text-xs opacity-75" style={{ color: selectedTier === i ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}>
                        Multiplier: {t.multiplierLow.toFixed(2)}× – {t.multiplierHigh.toFixed(2)}×
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── OUTPUT PANEL ─── */}
        <div className="space-y-6 lg:col-span-3">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-primary)" }} />
                <span className="ml-2 text-sm" style={{ color: "var(--text-secondary)" }}>Fetching live gold spot price...</span>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Intrinsic Value — the big number */}
              <Card style={{ borderColor: "rgba(13,148,136,0.2)", background: "rgba(240,253,250,0.3)" }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      Intrinsic Value (gold content)
                    </p>
                    {isLive && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: "var(--accent-success)" }}>LIVE</span>
                    )}
                  </div>
                  <p className="mt-2 font-mono text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                    ${intrinsicValue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="mt-3 font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>
                    {weight}g &times; {(karat.purity * 100).toFixed(1)}% ({karat.label}) &times; ${spotPrice.toFixed(2)}/g
                  </p>
                </CardContent>
              </Card>

              {/* Estimated Retail Value — range */}
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Estimated Retail Value
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    ${Math.round(retailLow).toLocaleString()} – ${Math.round(retailHigh).toLocaleString()} AUD
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Mid: ${Math.round(retailMid).toLocaleString()} &middot; Based on {tier.type.toLowerCase()} multiplier ({tier.multiplierLow}× – {tier.multiplierHigh}×)
                  </p>

                  {/* Visual: intrinsic vs retail bar */}
                  <div className="mt-5">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Intrinsic</p>
                        <div className="h-8 rounded" style={{ background: "var(--accent-primary)", width: "100%" }} />
                        <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                          ${Math.round(intrinsicValue).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Retail (low)</p>
                        <div className="h-8 rounded" style={{
                          background: "var(--accent-warning)",
                          width: `${Math.min(100, (retailLow / retailHigh) * 100)}%`,
                        }} />
                        <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                          ${Math.round(retailLow).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Retail (high)</p>
                        <div className="h-8 rounded" style={{ background: "var(--accent-danger)", width: "100%" }} />
                        <p className="mt-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                          ${Math.round(retailHigh).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      The difference between intrinsic and retail represents the making charge — the cost of
                      craftsmanship, labour, and retail margin.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Making Charge Reference — all tiers */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
                    Making Charge Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="pb-2 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Jewellery Type</th>
                        <th className="pb-2 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Multiplier</th>
                        <th className="pb-2 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Retail Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MAKING_CHARGE_TIERS.map(t => {
                        const lo = intrinsicValue * t.multiplierLow
                        const hi = intrinsicValue * t.multiplierHigh
                        const isActive = t.type === tier.type
                        return (
                          <tr key={t.type} style={{
                            borderBottom: "1px solid var(--border)",
                            background: isActive ? "rgba(13,148,136,0.04)" : "transparent",
                          }}>
                            <td className="py-2.5" style={{ color: "var(--text-primary)", fontWeight: isActive ? 600 : 400 }}>
                              {t.type}
                              {isActive && <span className="ml-2 text-[10px]" style={{ color: "var(--accent-primary)" }}>selected</span>}
                            </td>
                            <td className="py-2.5 text-right font-mono" style={{ color: "var(--text-secondary)" }}>
                              {t.multiplierLow.toFixed(2)}× – {t.multiplierHigh.toFixed(2)}×
                            </td>
                            <td className="py-2.5 text-right font-mono" style={{ color: "var(--text-primary)", fontWeight: isActive ? 600 : 400 }}>
                              ${Math.round(lo).toLocaleString()} – ${Math.round(hi).toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Live Spot Price */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        24K Gold Spot Price (AUD)
                      </p>
                      <div className="mt-1 flex items-baseline gap-4">
                        <span className="font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                          ${spotPrice.toFixed(2)}/g
                        </span>
                        <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                          ${goldPrice?.pricePerOunce.toFixed(2)}/oz
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    Source: {goldPrice?.source} &middot; Updated: {goldPrice?.timestamp ? new Date(goldPrice.timestamp).toLocaleString("en-AU") : "—"}
                  </p>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <p className="text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Intrinsic value reflects the gold content at current spot price. Retail estimates use indicative
                making charge multipliers from SKILL.md Section 5.2. Actual retail prices vary by jeweller,
                design complexity, and craftsmanship. Always request an itemised breakdown from your retailer.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          GOLD JEWELLERY PRICE INTELLIGENCE — Phase 2D
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Gold Jewellery Price Intelligence
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          Making charge analysis across Australian retailers. See how much you&apos;re paying above gold value.
        </p>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {/* Karat filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Karat:</span>
            <div className="flex gap-1">
              {KARAT_FILTERS.map(k => (
                <button key={k} onClick={() => setFilterKarat(k)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: filterKarat === k ? "var(--accent-primary)" : "var(--background-alt)",
                    color: filterKarat === k ? "#fff" : "var(--text-secondary)",
                  }}>
                  {k === "All" ? "All" : `${k}K`}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Type:</span>
            <div className="flex flex-wrap gap-1">
              {TYPE_FILTERS.map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                  style={{
                    background: filterType === t ? "var(--accent-primary)" : "var(--background-alt)",
                    color: filterType === t ? "#fff" : "var(--text-secondary)",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Charge:</span>
            <div className="flex gap-1">
              {RATING_FILTERS.map(r => (
                <button key={r.value} onClick={() => setFilterRating(r.value)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: filterRating === r.value ? "var(--accent-primary)" : "var(--background-alt)",
                    color: filterRating === r.value ? "#fff" : "var(--text-secondary)",
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product count */}
        {!productsLoading && products.length > 0 && (
          <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
            Showing {products.length} of {productCount} gold products
          </p>
        )}

        {/* Loading */}
        {productsLoading && (
          <Card className="mt-4">
            <CardContent className="flex items-center justify-center gap-3 p-8">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent-primary)" }} />
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading gold products...</span>
            </CardContent>
          </Card>
        )}

        {/* No data */}
        {!productsLoading && products.length === 0 && (
          <Card className="mt-4">
            <CardContent className="p-8 text-center">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {productCount === 0
                  ? "Run the scraper to populate gold product data."
                  : "No products match these filters. Try broadening your selection."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Products table */}
        {!productsLoading && products.length > 0 && (
          <Card className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Product</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Karat</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Type</th>
                    <th className="cursor-pointer px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}
                      onClick={() => toggleSort("price_local")}>
                      <span className="inline-flex items-center gap-1">
                        Retail Price {sortBy === "price_local" && <ArrowUpDown className="h-3 w-3" />}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Est. Gold Value</th>
                    <th className="cursor-pointer px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}
                      onClick={() => toggleSort("making_charge_pct")}>
                      <span className="inline-flex items-center gap-1">
                        Making Charge % {sortBy === "making_charge_pct" && <ArrowUpDown className="h-3 w-3" />}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center font-medium" style={{ color: "var(--text-secondary)" }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const ratingStyle = p.making_charge_rating ? RATING_STYLES[p.making_charge_rating] : null
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
                              <span className="line-clamp-1 max-w-[200px]">{p.title}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {p.karat ? (
                            <span className="rounded-md px-2 py-0.5 text-xs font-semibold" style={{ background: "var(--background-alt)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                              {p.karat}K
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs capitalize" style={{ color: "var(--text-secondary)" }}>
                          {p.product_type || "—"}
                        </td>
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
                          {p.making_charge_rating && ratingStyle ? (
                            <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                              style={{ background: ratingStyle.bg, color: ratingStyle.text }}>
                              {RATING_LABELS[p.making_charge_rating] || p.making_charge_rating}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Disclaimer */}
        {products.length > 0 && (
          <p className="mt-4 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Making charge estimates use weight estimates where retailer listings do not specify gram weight.
            Products with diamonds or gemstones will show higher making charges as the stone value is included in the retail price.
            All prices in AUD inc. GST.
          </p>
        )}
      </div>
    </div>
  )
}
