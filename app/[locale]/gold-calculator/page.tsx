"use client"

import { useState, useEffect } from "react"
import { Info, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { karatPurity, makingCharges, calculateMeltValue } from "@/lib/gold"

const karats = ["9K", "14K", "18K", "22K", "24K"]
const goldColours = ["Yellow", "White", "Rose"]

interface GoldPrice {
  pricePerGram: number
  pricePerOunce: number
  currency: string
  source: string
  timestamp: string
}

export default function GoldCalculatorPage() {
  const [karat, setKarat] = useState("22K")
  const [weight, setWeight] = useState(5)
  const [colour, setColour] = useState("Yellow")
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/gold-price")
      .then(res => res.json())
      .then(data => { setGoldPrice(data); setLoading(false) })
      .catch(() => {
        setGoldPrice({ pricePerGram: 148.50, pricePerOunce: 4618.50, currency: "AUD", source: "fallback", timestamp: new Date().toISOString() })
        setLoading(false)
      })
  }, [])

  const spotPrice = goldPrice?.pricePerGram ?? 148.50
  const purity = karatPurity[karat] ?? 0.75
  const meltValue = calculateMeltValue(weight, karat, spotPrice)
  const retailMin = meltValue * 1.08
  const retailMax = meltValue * 1.25
  const isLive = goldPrice?.source !== "fallback"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
        Gold Price Calculator
      </h1>
      <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
        Calculate the real value of any gold piece instantly. See melt value, making charges, and fair price ranges.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* INPUT */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="space-y-6 p-6">
              {/* Karat */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Karat</label>
                <div className="flex flex-wrap gap-2">
                  {karats.map(k => (
                    <button key={k} onClick={() => setKarat(k)}
                      className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                      style={{
                        background: karat === k ? "var(--accent-primary)" : "var(--background-alt)",
                        color: karat === k ? "#fff" : "var(--text-secondary)",
                        border: karat === k ? "none" : "1px solid var(--border)",
                      }}>
                      {k}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  Purity: {(purity * 100).toFixed(1)}% pure gold
                </p>
              </div>

              {/* Weight */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Weight in grams</label>
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
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>grams</span>
                </div>
              </div>

              {/* Colour */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Gold Colour</label>
                <div className="flex gap-2">
                  {goldColours.map(c => (
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
            </CardContent>
          </Card>
        </div>

        {/* OUTPUT */}
        <div className="space-y-6 lg:col-span-3">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent-primary)" }} />
                <span className="ml-2 text-sm" style={{ color: "var(--text-secondary)" }}>Fetching live gold prices...</span>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Melt Value */}
              <Card style={{ borderColor: "rgba(13,148,136,0.2)", background: "rgba(240,253,250,0.3)" }}>
                <CardContent className="p-6">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Pure Gold Value</p>
                  <p className="mt-1 font-mono text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
                    ${meltValue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="mt-3 font-mono text-[13px]" style={{ color: "var(--text-muted)" }}>
                    {weight}g &times; {(purity * 100).toFixed(2)}% ({karat} purity) &times; ${spotPrice.toFixed(2)}/g = ${meltValue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              {/* Retail Range */}
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Estimated Retail Price</p>
                  <p className="mt-1 font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    ${Math.round(retailMin).toLocaleString()} – ${Math.round(retailMax).toLocaleString()} AUD
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Including typical making charges of 8–25%
                  </p>
                </CardContent>
              </Card>

              {/* Making Charge Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Info className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
                    Making Charge Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        <th className="pb-2 text-left font-medium" style={{ color: "var(--text-secondary)" }}>Type</th>
                        <th className="pb-2 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Making Charge</th>
                        <th className="pb-2 text-right font-medium" style={{ color: "var(--text-secondary)" }}>Est. Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {makingCharges.map(mc => {
                        const lo = meltValue * (1 + mc.range[0] / 100)
                        const hi = meltValue * (1 + mc.range[1] / 100)
                        return (
                          <tr key={mc.type} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td className="py-2.5" style={{ color: "var(--text-primary)" }}>{mc.type}</td>
                            <td className="py-2.5 text-right font-mono" style={{ color: "var(--text-secondary)" }}>{mc.range[0]}–{mc.range[1]}%</td>
                            <td className="py-2.5 text-right font-mono" style={{ color: "var(--text-primary)" }}>${Math.round(lo).toLocaleString()} – ${Math.round(hi).toLocaleString()}</td>
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>24K Gold Spot</p>
                        {isLive && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: "var(--accent-success)" }}>
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-baseline gap-4">
                        <span className="font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                          ${spotPrice.toFixed(2)} AUD/gram
                        </span>
                        <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
                          ${goldPrice?.pricePerOunce.toFixed(2)}/oz
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    Source: {goldPrice?.source} &middot; Last updated: {goldPrice?.timestamp ? new Date(goldPrice.timestamp).toLocaleString("en-AU") : "—"}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
