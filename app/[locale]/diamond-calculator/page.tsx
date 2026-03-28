"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type DiamondShape, type DiamondOrigin, shapeLabels, estimateDiamondPrice } from "@/lib/diamond-data"
import { shapeIcons, type DiamondShapeName } from "@/components/tools/diamond-shapes"
import { valuateNaturalDiamond } from "@/lib/valuation/natural-diamond-valuation"

const shapes: DiamondShape[] = ["round","cushion","oval","princess","emerald","pear","radiant","asscher","marquise","heart"]
const colorGrades = ["D","E","F","G","H","I","J","K"]
const clarityGrades = ["FL","IF","VVS1","VVS2","VS1","VS2","SI1","SI2"]

export default function DiamondCalculatorPage() {
  const [origin, setOrigin] = useState<DiamondOrigin>("lab_grown")
  const [shape, setShape] = useState<DiamondShape>("round")
  const [carat, setCarat] = useState(1.0)
  const [color, setColor] = useState("G")
  const [clarity, setClarity] = useState("VS2")

  // Lab-grown estimate (existing model)
  const labResult = estimateDiamondPrice(carat, color, clarity, "lab_grown")

  // Natural estimate (new Phase 3B model)
  const natVal = valuateNaturalDiamond({ carat, color, clarity, shape, retail_price: null })
  const natResult = natVal && natVal.fair_estimate > 0
    ? { fairPrice: natVal.fair_estimate, low: natVal.fair_range.low, high: natVal.fair_range.high }
    : estimateDiamondPrice(carat, color, clarity, "natural") // fallback

  const result = origin === "lab_grown" ? labResult : natResult

  const savingsPct = origin === "lab_grown"
    ? Math.round((1 - labResult.fairPrice / natResult.fairPrice) * 100)
    : Math.round((1 - labResult.fairPrice / natResult.fairPrice) * 100)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>Diamond Price Calculator</h1>
      <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
        Get a fair price estimate for any diamond based on its specifications.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* INPUT */}
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Origin */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Diamond Origin</label>
              <div className="flex gap-2">
                {(["lab_grown","natural"] as DiamondOrigin[]).map(o => (
                  <button key={o} onClick={() => setOrigin(o)}
                    className="rounded-lg px-4 py-2 text-sm font-medium"
                    style={{
                      background: origin === o ? "var(--accent-primary)" : "var(--background-alt)",
                      color: origin === o ? "#fff" : "var(--text-secondary)",
                      border: origin === o ? "none" : "1px solid var(--border)",
                    }}>
                    {o === "lab_grown" ? "Lab Grown" : "Natural"}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Shape</label>
              <div className="grid grid-cols-5 gap-2">
                {shapes.map(s => {
                  const Icon = shapeIcons[s as DiamondShapeName]
                  return (
                    <button key={s} onClick={() => setShape(s)}
                      className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors"
                      style={{
                        border: shape === s ? "2px solid var(--accent-primary)" : "1px solid var(--border)",
                        color: shape === s ? "var(--accent-primary)" : "var(--text-secondary)",
                      }}>
                      <Icon className="h-6 w-6" />
                      {shapeLabels[s]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Carat */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Carat</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0.3} max={5} step={0.05} value={carat}
                  onChange={e => setCarat(parseFloat(e.target.value))}
                  className="flex-1" style={{ accentColor: "var(--accent-primary)" }} />
                <input type="number" value={carat} step={0.05} min={0.3} max={5}
                  onChange={e => setCarat(parseFloat(e.target.value) || 1)}
                  className="h-10 w-20 rounded-lg text-center font-mono"
                  style={{ border: "1px solid var(--border)" }} />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Color</label>
              <div className="flex flex-wrap gap-2">
                {colorGrades.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className="h-9 w-9 rounded-lg text-sm font-medium"
                    style={{
                      background: color === c ? "var(--accent-primary)" : "var(--background-alt)",
                      color: color === c ? "#fff" : "var(--text-secondary)",
                      border: color === c ? "none" : "1px solid var(--border)",
                    }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Clarity */}
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Clarity</label>
              <div className="flex flex-wrap gap-2">
                {clarityGrades.map(c => (
                  <button key={c} onClick={() => setClarity(c)}
                    className="rounded-lg px-3 py-2 text-sm font-medium"
                    style={{
                      background: clarity === c ? "var(--accent-primary)" : "var(--background-alt)",
                      color: clarity === c ? "#fff" : "var(--text-secondary)",
                      border: clarity === c ? "none" : "1px solid var(--border)",
                    }}>{c}</button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OUTPUT */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Fair Price Estimate</p>
              <p className="mt-1 font-mono text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                ${result.fairPrice.toLocaleString()} AUD
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">
                  {shapeLabels[shape]} {carat}ct {color} {clarity} — {origin === "lab_grown" ? "Lab Grown" : "Natural"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Estimate Range</span>
                <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                  ${result.low.toLocaleString()} – ${result.high.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Price Per Carat</span>
                <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                  ${Math.round(result.fairPrice / carat).toLocaleString()}/ct
                </span>
              </div>
              {origin === "natural" && natVal && (
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Shape Adjustment</span>
                  <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                    {natVal.shape_multiplier}× ({shapeLabels[shape]} vs Round)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comparison — lab vs natural */}
          <Card style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(240,253,250,0.3)" }}>
            <CardContent className="p-6">
              {origin === "lab_grown" ? (
                <p className="text-sm" style={{ color: "var(--accent-success)" }}>
                  This lab-grown diamond is <strong className="font-mono">{savingsPct}% cheaper</strong> than
                  a comparable natural diamond (est. <strong className="font-mono">${natResult.fairPrice.toLocaleString()}</strong>).
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Lab-grown alternative
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                    A comparable lab-grown diamond would cost approximately{" "}
                    <strong className="font-mono" style={{ color: "var(--accent-primary)" }}>
                      ${labResult.fairPrice.toLocaleString()}
                    </strong>{" "}
                    — <strong className="font-mono" style={{ color: "var(--accent-success)" }}>{savingsPct}% savings</strong>.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
