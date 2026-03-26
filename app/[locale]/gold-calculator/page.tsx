"use client"

import { useState, useEffect } from "react"
import { Info, Loader2, Coins } from "lucide-react"
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

export default function GoldCalculatorPage() {
  const [karatIdx, setKaratIdx] = useState(3) // default 22K
  const [weight, setWeight] = useState(5)
  const [colour, setColour] = useState("Yellow")
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState(0) // default: machine-made chain

  useEffect(() => {
    fetch("/api/gold-price")
      .then(res => res.json())
      .then(data => { setGoldPrice(data); setLoading(false) })
      .catch(() => {
        setGoldPrice({ pricePerGram: 148.50, pricePerOunce: 4618.50, currency: "AUD", source: "fallback", timestamp: new Date().toISOString() })
        setLoading(false)
      })
  }, [])

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
    </div>
  )
}
