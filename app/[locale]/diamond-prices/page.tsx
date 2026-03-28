"use client"

import { useState, useEffect, useMemo } from "react"
import { TrendingUp, TrendingDown, Loader2, Layers, List, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkline } from "@/components/charts/sparkline"
import { type DiamondShape, type DiamondOrigin, shapeLabels, getDiamondPrices } from "@/lib/diamond-data"
import { formatPrice } from "@/lib/locale"
import { shapeIcons, type DiamondShapeName } from "@/components/tools/diamond-shapes"

const shapes: DiamondShape[] = ["round","cushion","oval","princess","emerald","pear","radiant","asscher","marquise","heart"]
const caratSummaries = [0.5, 1.0, 2.0, 3.0]

// EVC band filters — Section 4.4
const COLOR_BANDS = [
  { label: "All Colours", value: "" },
  { label: "DEF", value: "DEF" },
  { label: "GH", value: "GH" },
  { label: "IJ", value: "IJ" },
  { label: "KL+", value: "KL+" },
]

const CLARITY_BANDS = [
  { label: "All Clarity", value: "" },
  { label: "FL-IF", value: "FL-IF" },
  { label: "VVS", value: "VVS" },
  { label: "VS", value: "VS" },
  { label: "SI1", value: "SI1" },
  { label: "SI2", value: "SI2" },
  { label: "I+", value: "I+" },
]

interface LiveDiamond {
  id: string
  lustrumo_id: string
  product_name: string
  product_url: string
  retailer_name: string
  shape: string
  carat: number
  color: string | null
  clarity: string | null
  cut: string | null
  origin: string
  cert_lab: string | null
  cert_number: string | null
  price: number
  metal: string | null
  metal_karat: string | null
  setting_style: string | null
  side_stones: string | null
  image_url: string | null
  evc: string | null
  data_quality_score: number
}

interface EVCGroup {
  count: number
  avgPrice: number
  minPrice: number
  maxPrice: number
}

interface PriceIndexEntry {
  origin: string
  caratBucket: string
  shape: string
  currentAvg: number
  currentMedian: number | null
  currentMin: number
  currentMax: number
  currentSampleSize: number
  change30d: number | null
  dataPoints: number
  sparkline: number[]
}

export default function DiamondPricesPage() {
  const [origin, setOrigin] = useState<DiamondOrigin>("lab_grown")
  const [shape, setShape] = useState<DiamondShape>("round")
  const [colorBand, setColorBand] = useState("")
  const [clarityBand, setClarityBand] = useState("")
  const [timeframe, setTimeframe] = useState("1M")
  const [viewMode, setViewMode] = useState<"grouped" | "list">("grouped")
  const [liveDiamonds, setLiveDiamonds] = useState<LiveDiamond[]>([])
  const [evcGroups, setEvcGroups] = useState<Record<string, EVCGroup>>({})
  const [priceIndex, setPriceIndex] = useState<PriceIndexEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiveData, setIsLiveData] = useState(false)

  // Fetch live data from products table via API
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      origin, shape, locale: "au", limit: "200", sort: "price_aud",
    })
    if (colorBand) params.set("color_band", colorBand)
    if (clarityBand) params.set("clarity_band", clarityBand)

    Promise.all([
      fetch(`/api/diamonds?${params}`).then(r => r.json()),
      fetch(`/api/diamond-price-index?origin=${origin}&shape=${shape}&days=30`).then(r => r.json()),
    ])
      .then(([data, indexData]) => {
        if (data.diamonds?.length > 0) {
          setLiveDiamonds(data.diamonds)
          setEvcGroups(data.evcGroups || {})
          setIsLiveData(true)
        } else {
          setLiveDiamonds([])
          setEvcGroups({})
          setIsLiveData(false)
        }
        setPriceIndex(indexData.index || [])
        setLoading(false)
      })
      .catch(() => {
        setLiveDiamonds([])
        setEvcGroups({})
        setPriceIndex([])
        setIsLiveData(false)
        setLoading(false)
      })
  }, [origin, shape, colorBand, clarityBand])

  // Group diamonds by EVC for the grouped view
  const groupedByEVC = useMemo(() => {
    const groups: Record<string, LiveDiamond[]> = {}
    const noEvc: LiveDiamond[] = []
    for (const d of liveDiamonds) {
      if (d.evc) {
        if (!groups[d.evc]) groups[d.evc] = []
        groups[d.evc].push(d)
      } else {
        noEvc.push(d)
      }
    }
    // Sort EVC groups by count descending
    const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
    if (noEvc.length > 0) sorted.push(["Unclassified", noEvc])
    return sorted
  }, [liveDiamonds])

  // Map carat values to bucket labels for index lookup
  const caratToBucket: Record<number, string> = { 0.5: "0.50", 1.0: "1.00", 1.5: "1.50", 2.0: "2.00", 3.0: "3.00" }

  // Look up price index trend for a carat/shape combo
  function getIndexEntry(carat: number): PriceIndexEntry | null {
    const bucket = caratToBucket[carat]
    if (!bucket) return null
    return priceIndex.find(e => e.caratBucket === bucket && e.shape === shape) || null
  }

  // Compute summary stats from live data
  const liveSummary = caratSummaries.map(carat => {
    const nearby = liveDiamonds.filter(d => Math.abs(d.carat - carat) <= 0.3)
    if (nearby.length === 0) return null
    const prices = nearby.map(d => d.price).sort((a, b) => a - b)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    return { carat, avgPrice: Math.round(avg), minPrice: prices[0], maxPrice: prices[prices.length - 1], count: nearby.length }
  })

  // Fallback to placeholder data
  const placeholderData = getDiamondPrices(origin, shape)
  const allPlaceholder = getDiamondPrices(origin)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>Diamond Prices</h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Track lab-grown and natural diamond prices with daily updates from leading retailers.
          </p>
        </div>
        {isLiveData && (
          <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white" style={{ background: "var(--accent-success)" }}>
            LIVE DATA
          </span>
        )}
      </div>

      {/* Origin toggle */}
      <div className="mt-6 flex gap-1 rounded-lg p-1" style={{ background: "var(--background-alt)", width: "fit-content" }}>
        {(["lab_grown", "natural"] as DiamondOrigin[]).map(o => (
          <button key={o} onClick={() => setOrigin(o)}
            className="rounded-md px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: origin === o ? "#fff" : "transparent",
              color: origin === o ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: origin === o ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
            }}>
            {o === "lab_grown" ? "Lab Grown" : "Natural"}
          </button>
        ))}
      </div>

      {/* Shape selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        {shapes.map(s => {
          const Icon = shapeIcons[s as DiamondShapeName]
          return (
            <button key={s} onClick={() => setShape(s)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: shape === s ? "var(--accent-primary)" : "#fff",
                color: shape === s ? "#fff" : "var(--text-secondary)",
                border: shape === s ? "none" : "1px solid var(--border)",
              }}>
              <Icon className="h-5 w-5" />
              {shapeLabels[s]}
            </button>
          )
        })}
      </div>

      {/* EVC Band Filters — Section 4.4 */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Filter by value class:</span>
        <div className="flex gap-1">
          {COLOR_BANDS.map(b => (
            <button key={b.value} onClick={() => setColorBand(b.value)}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: colorBand === b.value ? "var(--accent-primary)" : "var(--background-alt)",
                color: colorBand === b.value ? "#fff" : "var(--text-secondary)",
              }}>
              {b.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {CLARITY_BANDS.map(b => (
            <button key={b.value} onClick={() => setClarityBand(b.value)}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: clarityBand === b.value ? "var(--accent-primary)" : "var(--background-alt)",
                color: clarityBand === b.value ? "#fff" : "var(--text-secondary)",
              }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Summary Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {caratSummaries.map((carat, i) => {
          const live = liveSummary[i]
          const idx = getIndexEntry(carat)
          const fallback = placeholderData.find(d => d.carat === carat)
          const data = live || fallback

          if (!data) return (
            <Card key={carat} className="opacity-50">
              <CardContent className="p-4">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{carat}ct {shapeLabels[shape]}</p>
                <p className="mt-2 font-mono text-lg" style={{ color: "var(--text-muted)" }}>No data</p>
              </CardContent>
            </Card>
          )

          const avgPrice = live ? live.avgPrice : (idx ? idx.currentAvg : (fallback?.avgPrice ?? 0))
          const count = live ? live.count : (idx ? idx.currentSampleSize : (fallback?.inventoryCount ?? 0))
          // Use real 30d change from index if available, else fallback placeholder
          const change = idx?.change30d ?? fallback?.change30d ?? 0
          // Use real sparkline from index if enough data points, else fallback
          const hasRealSparkline = idx && idx.dataPoints >= 7
          const sparklineData = hasRealSparkline ? idx.sparkline : fallback?.sparklineData

          return (
            <Card key={carat}>
              <CardContent className="p-4">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{carat} Carat {shapeLabels[shape]}</p>
                <div className="mt-2 font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatPrice(avgPrice)}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {sparklineData ? (
                    <Sparkline data={sparklineData} />
                  ) : idx && idx.dataPoints > 0 ? (
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      Building trend data... ({idx.dataPoints}/7 days)
                    </span>
                  ) : null}
                  {change !== 0 && (
                    <span className="flex items-center gap-0.5 font-mono text-xs font-semibold"
                      style={{ color: change >= 0 ? "var(--accent-success)" : "var(--accent-danger)" }}>
                      {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(change)}%
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  {count.toLocaleString()} stones
                  {idx && !hasRealSparkline && idx.dataPoints > 0 && " \u00b7 trend building"}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* View mode toggle + heading */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {isLiveData ? "Live Inventory" : "Price Index"}
        </h2>
        <div className="flex items-center gap-3">
          {isLiveData && (
            <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--background-alt)" }}>
              <button onClick={() => setViewMode("grouped")}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: viewMode === "grouped" ? "#fff" : "transparent",
                  color: viewMode === "grouped" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: viewMode === "grouped" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                }}>
                <Layers className="h-3 w-3" /> By Value Class
              </button>
              <button onClick={() => setViewMode("list")}
                className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: viewMode === "list" ? "#fff" : "transparent",
                  color: viewMode === "list" ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                }}>
                <List className="h-3 w-3" /> All
              </button>
            </div>
          )}
          {!isLiveData && (
            <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--background-alt)" }}>
              {["1M","3M","6M","1Y"].map(tf => (
                <button key={tf} onClick={() => setTimeframe(tf)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: timeframe === tf ? "#fff" : "transparent",
                    color: timeframe === tf ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: timeframe === tf ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}>
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <Card className="mt-4">
          <CardContent className="flex items-center justify-center gap-3 p-8">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent-primary)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading diamond prices...</span>
          </CardContent>
        </Card>
      )}

      {/* LIVE: Grouped by EVC */}
      {!loading && isLiveData && viewMode === "grouped" && groupedByEVC.length > 0 && (
        <div className="mt-4 space-y-6">
          {groupedByEVC.map(([evc, diamonds]) => {
            const stats = evc !== "Unclassified" ? evcGroups[evc] : null
            return (
              <div key={evc}>
                {/* EVC Group Header — Section 4.4: "Comparing within value class" */}
                <div className="flex flex-wrap items-center gap-3 rounded-lg px-4 py-3" style={{ background: "var(--background-alt)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {evc === "Unclassified" ? "Insufficient data for value class" : "Comparing within value class"}
                    </span>
                  </div>
                  {evc !== "Unclassified" && (
                    <span className="rounded-md px-2 py-1 font-mono text-xs font-semibold" style={{ background: "#fff", color: "var(--accent-primary)", border: "1px solid var(--border)" }}>
                      {evc}
                    </span>
                  )}
                  {stats && (
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {stats.count} {stats.count === 1 ? "stone" : "stones"} &middot; avg {formatPrice(stats.avgPrice)} &middot; range {formatPrice(stats.minPrice)}–{formatPrice(stats.maxPrice)}
                    </span>
                  )}
                </div>

                {/* Diamonds in this EVC */}
                <Card className="mt-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Diamond</th>
                          <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Specs</th>
                          <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Price (AUD)</th>
                          <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>$/ct</th>
                          <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Retailer</th>
                          <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Quality</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diamonds.map(d => (
                          <DiamondRow key={d.id} d={d} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* LIVE: Flat list view */}
      {!loading && isLiveData && viewMode === "list" && liveDiamonds.length > 0 && (
        <Card className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Diamond</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Specs</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>EVC</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Price (AUD)</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>$/ct</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Retailer</th>
                  <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Quality</th>
                </tr>
              </thead>
              <tbody>
                {liveDiamonds.map(d => (
                  <DiamondRow key={d.id} d={d} showEvc />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* LIVE: No results */}
      {!loading && isLiveData && liveDiamonds.length === 0 && (
        <Card className="mt-4">
          <CardContent className="p-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No diamonds match these filters. Try broadening the colour or clarity range.
            </p>
          </CardContent>
        </Card>
      )}

      {/* FALLBACK: Price index table (real data from index or placeholder) */}
      {!loading && !isLiveData && (
        <>
          <Card className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Price Index</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Chart</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Price (AUD)</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>30d Change</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Range</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {allPlaceholder.map(row => {
                    // Look up real index data for this shape/carat
                    const bucket = caratToBucket[row.carat]
                    const idx = bucket ? priceIndex.find(e => e.caratBucket === bucket && e.shape === row.shape) : null
                    const hasReal = idx && idx.dataPoints >= 2
                    const hasRealSparkline = idx && idx.dataPoints >= 7
                    const avgPrice = hasReal ? idx.currentAvg : row.avgPrice
                    const minPrice = hasReal ? idx.currentMin : row.minPrice
                    const maxPrice = hasReal ? idx.currentMax : row.maxPrice
                    const change = hasReal && idx.change30d != null ? idx.change30d : row.change30d
                    const sampleSize = hasReal ? idx.currentSampleSize : row.inventoryCount
                    const sparkData = hasRealSparkline ? idx.sparkline : row.sparklineData

                    return (
                      <tr key={`${row.shape}-${row.carat}`}
                        className="transition-colors hover:bg-[var(--background-alt)]"
                        style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-4 py-3">
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                            {row.carat}ct {shapeLabels[row.shape]}
                          </span>
                          {!hasReal && (
                            <Badge variant="outline" className="ml-2 text-[10px]" style={{ color: "var(--accent-warning)", borderColor: "var(--accent-warning)" }}>
                              Sample
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {hasRealSparkline ? (
                            <Sparkline data={sparkData} />
                          ) : idx && idx.dataPoints > 0 ? (
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                              {idx.dataPoints}/7 days
                            </span>
                          ) : (
                            <Sparkline data={sparkData} />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                          {formatPrice(avgPrice)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {change !== 0 ? (
                            <span className="inline-flex items-center gap-0.5 font-mono font-semibold"
                              style={{ color: change >= 0 ? "var(--accent-success)" : "var(--accent-danger)" }}>
                              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {Math.abs(change)}%
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                          {formatPrice(minPrice)} – {formatPrice(maxPrice)}
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: "var(--text-secondary)" }}>
                          {sampleSize >= 1000 ? `${(sampleSize / 1000).toFixed(0)}K` : sampleSize}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          {priceIndex.length === 0 && (
            <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
              [Sample Data] Real trend data will build automatically from daily scrapes.
            </p>
          )}
        </>
      )}

      {/* Disclaimer */}
      {isLiveData && (
        <p className="mt-6 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Prices sourced from publicly listed Australian retailer data. Diamonds are grouped by Equivalent Value Class (EVC) for
          like-for-like comparison. Individual retailer pricing may vary. All prices in AUD inc. GST.
        </p>
      )}
    </div>
  )
}

// ─── Diamond Table Row ───

function DiamondRow({ d, showEvc }: { d: LiveDiamond; showEvc?: boolean }) {
  return (
    <tr className="transition-colors hover:bg-[var(--background-alt)]" style={{ borderBottom: "1px solid var(--border)" }}>
      <td className="px-4 py-3">
        <a href={d.product_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium hover:underline" style={{ color: "var(--accent-primary)" }}>
          {d.carat}ct {d.shape ? d.shape.charAt(0).toUpperCase() + d.shape.slice(1) : ""} {d.color || ""} {d.clarity || ""}
          <ExternalLink className="h-3 w-3" />
        </a>
        {d.cert_lab && (
          <span className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ background: "#EFF6FF", color: "var(--accent-secondary)" }}>
            {d.cert_lab}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
        {d.cut && <span>{d.cut} cut &middot; </span>}
        {d.metal && <span>{d.metal} &middot; </span>}
        {d.setting_style && <span>{d.setting_style} &middot; </span>}
        {d.origin === "lab_grown" ? "Lab" : "Natural"}
      </td>
      {showEvc && (
        <td className="px-4 py-3">
          {d.evc ? (
            <span className="rounded-md px-1.5 py-0.5 font-mono text-[10px]" style={{ background: "var(--background-alt)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              {d.evc}
            </span>
          ) : (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>—</span>
          )}
        </td>
      )}
      <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
        {formatPrice(d.price)}
      </td>
      <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
        {formatPrice(Math.round(d.price / d.carat))}
      </td>
      <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
        {d.retailer_name}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <div className="h-1.5 w-10 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
            <div className="h-full rounded-full" style={{
              width: `${d.data_quality_score}%`,
              background: d.data_quality_score >= 70 ? "var(--accent-success)" :
                          d.data_quality_score >= 50 ? "var(--accent-warning)" : "var(--accent-danger)",
            }} />
          </div>
          <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{d.data_quality_score}</span>
        </div>
      </td>
    </tr>
  )
}
