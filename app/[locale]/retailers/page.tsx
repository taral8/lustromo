"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, Loader2, ExternalLink, BarChart3, ShieldCheck, FileCheck, Clock } from "lucide-react"
import { type RetailerTier, getTierColor } from "@/lib/valuation/retailer-scoring"

interface RetailerWithScore {
  name: string
  slug: string
  website_url: string
  city: string | null
  state: string | null
  is_online: boolean
  is_physical: boolean
  specialities: string[] | null
  score: {
    overall: number
    tier: RetailerTier
    dimensions: {
      dataCompleteness: number
      pricingAccuracy: number
      certificationCompliance: number
      responseRecency: number
    }
    productCount: number
    diamondCount: number
  }
}

const DIMENSION_META = [
  { key: "dataCompleteness" as const, label: "Data Completeness", weight: "30%", icon: BarChart3, description: "Required fields populated across all products" },
  { key: "pricingAccuracy" as const, label: "Pricing Accuracy", weight: "30%", icon: Store, description: "Products with valid, non-zero prices" },
  { key: "certificationCompliance" as const, label: "Certification Compliance", weight: "25%", icon: FileCheck, description: "Diamond products with verifiable cert numbers" },
  { key: "responseRecency" as const, label: "Response / Recency", weight: "15%", icon: Clock, description: "How frequently product data is updated" },
]

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<RetailerWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

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
            Independent ratings for Australian jewellery retailers based on data quality, pricing accuracy, and certification compliance.
          </p>
        </div>
      </div>

      {/* Methodology */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Scoring Methodology</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIMENSION_META.map(d => (
              <div key={d.key} className="rounded-lg p-3" style={{ background: "var(--background-alt)" }}>
                <div className="flex items-center gap-2">
                  <d.icon className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.label}</span>
                </div>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{d.description}</p>
                <p className="mt-1 font-mono text-xs font-semibold" style={{ color: "var(--accent-primary)" }}>Weight: {d.weight}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { tier: "Lustrumo Verified ✦", range: "90–100" },
              { tier: "High Confidence", range: "75–89" },
              { tier: "Moderate Confidence", range: "50–74" },
              { tier: "Low Confidence", range: "25–49" },
              { tier: "Insufficient Data", range: "0–24" },
            ].map(t => (
              <span key={t.tier} className="flex items-center gap-1.5 text-xs">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: getTierColor(t.tier as RetailerTier) }} />
                <span style={{ color: "var(--text-secondary)" }}>{t.tier}</span>
                <span className="font-mono" style={{ color: "var(--text-muted)" }}>({t.range})</span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-center gap-3 p-8">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent-primary)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Computing retailer scores...</span>
          </CardContent>
        </Card>
      )}

      {/* Retailer Cards */}
      {!loading && retailers.length > 0 && (
        <div className="mt-6 space-y-4">
          {retailers.map(r => {
            const isExpanded = expanded === r.slug
            const tierColor = getTierColor(r.score.tier)

            return (
              <Card key={r.slug}>
                <CardContent className="p-0">
                  {/* Main row */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : r.slug)}
                    className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-[var(--background-alt)]"
                  >
                    {/* Score circle */}
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-white"
                      style={{ background: tierColor }}>
                      <span className="font-mono text-lg font-bold leading-none">{r.score.overall}</span>
                      <span className="text-[9px] leading-none opacity-80">/100</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</h2>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${tierColor}15`, color: tierColor }}>
                          {r.score.tier}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {r.city && r.state ? `${r.city}, ${r.state}` : ""}{r.is_online && r.is_physical ? " · Online + Physical" : r.is_online ? " · Online" : " · Physical"}
                        {" · "}{r.score.productCount} products tracked ({r.score.diamondCount} diamonds)
                      </p>
                      {r.specialities && r.specialities.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {r.specialities.map(s => (
                            <Badge key={s} variant="secondary" className="text-[10px] capitalize">{s.replace(/_/g, " ")}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Link */}
                    <a
                      href={r.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden shrink-0 items-center gap-1 text-xs font-medium sm:flex"
                      style={{ color: "var(--accent-primary)" }}
                      onClick={e => e.stopPropagation()}
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>

                    {/* Chevron */}
                    <svg
                      className="h-4 w-4 shrink-0 transition-transform"
                      style={{ color: "var(--text-muted)", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded: dimension breakdown */}
                  {isExpanded && (
                    <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "var(--border)" }}>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                        Score Breakdown
                      </p>
                      <div className="space-y-3">
                        {DIMENSION_META.map(d => {
                          const value = r.score.dimensions[d.key]
                          const pct = Math.round(value * 100)
                          return (
                            <div key={d.key}>
                              <div className="flex items-center justify-between text-sm">
                                <span style={{ color: "var(--text-secondary)" }}>{d.label} <span className="text-xs" style={{ color: "var(--text-muted)" }}>({d.weight})</span></span>
                                <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{pct}%</span>
                              </div>
                              <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    background: pct >= 80 ? "var(--accent-success)" : pct >= 50 ? "var(--accent-primary)" : pct >= 25 ? "var(--accent-warning)" : "var(--accent-danger)",
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Summary stats */}
                      <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg p-3" style={{ background: "var(--background-alt)" }}>
                        <div className="text-center">
                          <p className="font-mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>{r.score.productCount}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Total Products</p>
                        </div>
                        <div className="text-center">
                          <p className="font-mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>{r.score.diamondCount}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Diamond Products</p>
                        </div>
                        <div className="text-center">
                          <p className="font-mono text-lg font-bold" style={{ color: tierColor }}>{r.score.overall}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Overall Score</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && retailers.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <p style={{ color: "var(--text-secondary)" }}>
              Retailer scores are computed from our product database. Scores will appear once retailer data is ingested.
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
