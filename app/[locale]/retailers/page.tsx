"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Loader2, MapPin, ExternalLink, Store, Globe } from "lucide-react"

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

interface DirectoryRetailer {
  name: string
  website_url: string | null
  city: string | null
  state: string | null
  has_physical_store: boolean
  has_online_store: boolean
  categories: string[]
}

export default function RetailersPage() {
  const [retailers, setRetailers] = useState<RetailerScore[]>([])
  const [directory, setDirectory] = useState<DirectoryRetailer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/retailers")
      .then(res => res.json())
      .then(data => {
        setRetailers(data.retailers || [])
        setDirectory(data.directory || [])
        setLoading(false)
      })
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

      {/* ═══ SECTION 1: Verified Retailers ═══ */}
      {!loading && retailers.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" style={{ color: "#10B981" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Verified Retailers</h2>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
              {retailers.length} retailers
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Retailers with product data tracked and analysed by Lustrumo.
          </p>

          <div className="mt-4 space-y-4">
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
                      <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</h3>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${r.tierColor}15`, color: r.tierColor }}>
                        {r.tier}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {r.totalProducts.toLocaleString()} products tracked
                      {r.totalGold > 0 && <> &middot; {r.totalGold.toLocaleString()} gold</>}
                      {r.totalDiamonds > 0 && <> &middot; {r.totalDiamonds.toLocaleString()} diamonds</>}
                      {r.avgMakingCharge !== null && <> &middot; Avg making charge: <span className="font-mono">{r.avgMakingCharge.toFixed(0)}%</span></>}
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
        </div>
      )}

      {/* ═══ SECTION 2: Directory ═══ */}
      {!loading && directory.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Directory</h2>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>
              {directory.length} retailers
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            Australian jewellery retailers listed for reference. Product data not yet tracked.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {directory.map(d => (
              <Card key={d.name}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.name}</h3>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium"
                      style={{ background: "var(--background-alt)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                      Profile Only
                    </span>
                  </div>

                  {d.city && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <MapPin className="h-3 w-3 shrink-0" />
                      {d.city}{d.state ? `, ${d.state}` : ""}
                    </p>
                  )}

                  <div className="mt-1.5 flex items-center gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {d.has_physical_store && (
                      <span className="flex items-center gap-0.5">
                        <Store className="h-3 w-3" /> Physical
                      </span>
                    )}
                    {d.has_online_store && (
                      <span className="flex items-center gap-0.5">
                        <Globe className="h-3 w-3" /> Online
                      </span>
                    )}
                  </div>

                  {d.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {d.categories.map(c => (
                        <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    {d.website_url && (
                      <a href={d.website_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline"
                        style={{ color: "var(--accent-primary)" }}>
                        Visit website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <a href="mailto:hello@lustrumo.com?subject=Claim%20Retailer%20Profile"
                      className="text-[10px] font-medium hover:underline"
                      style={{ color: "var(--text-muted)" }}>
                      Claim this profile
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-4 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>
            Are you a retailer? <a href="mailto:hello@lustrumo.com?subject=Claim%20Retailer%20Profile" className="font-medium hover:underline" style={{ color: "var(--accent-primary)" }}>Claim your profile</a> to get verified with full product data analysis and confidence scoring.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && retailers.length === 0 && directory.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <p style={{ color: "var(--text-secondary)" }}>
              No retailer data found. Retailer scores appear once product data is ingested via the scraper.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="mt-8 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Retailer scores are calculated from publicly available product data and do not reflect subjective quality assessments.
        Scores update daily as new data is ingested. Lustrumo does not endorse or recommend specific retailers.
        Directory listings are for reference only and do not imply a partnership.
      </p>
    </div>
  )
}
