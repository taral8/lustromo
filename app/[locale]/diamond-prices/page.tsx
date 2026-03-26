"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkline } from "@/components/charts/sparkline"
import { type DiamondShape, type DiamondOrigin, shapeLabels, getDiamondPrices } from "@/lib/diamond-data"
import { formatPrice } from "@/lib/locale"
import { shapeIcons, type DiamondShapeName } from "@/components/tools/diamond-shapes"

const shapes: DiamondShape[] = ["round","cushion","oval","princess","emerald","pear","radiant","asscher","marquise","heart"]
const caratSummaries = [0.5, 1.0, 2.0, 3.0]

export default function DiamondPricesPage() {
  const [origin, setOrigin] = useState<DiamondOrigin>("lab_grown")
  const [shape, setShape] = useState<DiamondShape>("round")
  const [timeframe, setTimeframe] = useState("1M")

  const summaryData = getDiamondPrices(origin, shape)
  const allData = getDiamondPrices(origin)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>Diamond Prices</h1>
      <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
        Track lab-grown and natural diamond prices with daily updates from leading retailers.
      </p>

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

      {/* Price Summary Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {caratSummaries.map(carat => {
          const data = summaryData.find(d => d.carat === carat)
          if (!data) return (
            <Card key={carat} className="opacity-50">
              <CardContent className="p-4">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{carat}ct {shapeLabels[shape]}</p>
                <p className="mt-2 font-mono text-lg" style={{ color: "var(--text-muted)" }}>No data</p>
              </CardContent>
            </Card>
          )
          return (
            <Card key={carat}>
              <CardContent className="p-4">
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{carat} Carat Diamond Prices</p>
                <div className="mt-2 font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {formatPrice(data.avgPrice)}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Sparkline data={data.sparklineData} />
                  <span className="flex items-center gap-0.5 font-mono text-xs font-semibold"
                    style={{ color: data.change30d >= 0 ? "var(--accent-success)" : "var(--accent-danger)" }}>
                    {data.change30d >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(data.change30d)}%
                  </span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  {(data.inventoryCount / 1000).toFixed(0)}K stones
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Timeframe selector */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Price Index</h2>
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
      </div>

      {/* Price Table */}
      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Price Index</th>
                <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Chart</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Price (AUD)</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>% Change</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Range</th>
                <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Inventory</th>
              </tr>
            </thead>
            <tbody>
              {allData.map(row => (
                <tr key={`${row.shape}-${row.carat}`}
                  className="transition-colors hover:bg-[var(--background-alt)]"
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {row.carat}ct {shapeLabels[row.shape]}
                    </span>
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      {row.origin === "lab_grown" ? "Lab" : "Natural"}
                    </Badge>
                    <Badge variant="outline" className="ml-1 text-[10px]" style={{ color: "var(--accent-warning)", borderColor: "var(--accent-warning)" }}>
                      Sample Data
                    </Badge>
                  </td>
                  <td className="px-4 py-3"><Sparkline data={row.sparklineData} /></td>
                  <td className="px-4 py-3 text-right font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                    {formatPrice(row.avgPrice)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-0.5 font-mono font-semibold"
                      style={{ color: row.change30d >= 0 ? "var(--accent-success)" : "var(--accent-danger)" }}>
                      {row.change30d >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(row.change30d)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                    {formatPrice(row.minPrice)} – {formatPrice(row.maxPrice)}
                  </td>
                  <td className="px-4 py-3 text-right" style={{ color: "var(--text-secondary)" }}>
                    {(row.inventoryCount / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
        [Sample Data] Prices sourced from leading local and international retailers. Updated daily.
      </p>
    </div>
  )
}
