"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Loader2 } from "lucide-react"

interface RetailerScore {
  name: string
  totalProducts: number
  totalGold: number
  totalDiamonds: number
  avgMakingCharge: number | null
  categories: string[]
  score: number
  tier: string
  tierColor: string
}

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<RetailerScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/retailers")
      .then(res => res.json())
      .then(data => { setRetailers(data.retailers || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>Retailer Scorecard</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Independent confidence ratings for Australian jewellery retailers based on data volume, completeness, and category breadth.
          </p>
        </div>
      </div>

      {/* Scoring legend */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Confidence Levels</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {[
              { tier: "Lustrumo Verified", range: "90–100", color: "#10B981" },
              { tier: "High Confidence", range: "75–89", color: "#10B981" },
              { tier: "Moderate Confidence", range: "50–74", color: "#3B82F6" },
              { tier: "Low Confidence", range: "25–49", color: "#F59E0B" },
              { tier: "Insufficient Data", range: "0–24", color: "#94A3B8" },
            ].map(t => (
              <span key={t.tier} className="flex items-center gap-1.5 text-xs">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                <span style={{ color: "var(--text-secondary)" }}>{t.tier}</span>
                <span className="font-mono" style={{ color: "var(--text-muted)" }}>({t.range})</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Scores are based on: data volume (how many products we track), data completeness (percentage with full specs parsed),
            and category breadth (gold, diamonds, lab-grown coverage).
          </p>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-center gap-3 p-8">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent-primary)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Loading retailer data...</span>
          </CardContent>
        </Card>
      )}

      {/* Retailer Cards */}
      {!loading && retailers.length > 0 && (
        <div className="mt-6 space-y-4">
          {retailers.map(r => (
            <Card key={r.name}>
              <CardContent className="flex items-center gap-4 p-5">
                {/* Score circle */}
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-white"
                  style={{ background: r.tierColor }}>
                  <span className="font-mono text-lg font-bold leading-none">{r.score}</span>
                  <span className="text-[9px] leading-none opacity-80">/100</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</h2>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: `${r.tierColor}15`, color: r.tierColor }}>
                      {r.tier}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    Online &middot; {r.totalProducts.toLocaleString()} products tracked
                    {r.totalDiamonds > 0 && <> ({r.totalDiamonds.toLocaleString()} diamonds)</>}
                    {r.avgMakingCharge !== null && <> &middot; Avg gold making charge: <span className="font-mono">{r.avgMakingCharge.toFixed(0)}%</span></>}
                  </p>
                  {r.categories.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {r.categories.map(c => (
                        <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && retailers.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <p style={{ color: "var(--text-secondary)" }}>
              No retailer data found. Retailer scores appear once product data is ingested via the scraper.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="mt-6 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Retailer scores are calculated from publicly available product data and do not reflect subjective quality assessments.
        Scores update daily as new data is ingested. Lustrumo does not endorse or recommend specific retailers.
      </p>
    </div>
  )
}
