"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Loader2, AlertCircle, ExternalLink, Diamond, Coins } from "lucide-react"
import { estimateTotalPrice, type DiamondOrigin } from "@/lib/diamond-data"

interface ScrapedProduct {
  name: string | null
  price: number | null
  currency: string
  image: string | null
  retailer: string | null
  url: string
  productType: "diamond" | "gold" | "unknown"
  specs: {
    carat: string | null
    shape: string | null
    color: string | null
    clarity: string | null
    cut: string | null
    metal: string | null
    origin: "natural" | "lab_grown" | "unknown"
    certLab: string | null
    certNumber: string | null
    karatGold: string | null
    weightGrams: string | null
    settingType: string | null
    sideStones: boolean
  }
}

function getVerdict(diffPercent: number): { label: string; color: string } {
  if (diffPercent <= -10) return { label: "Great Deal", color: "var(--accent-success)" }
  if (diffPercent <= 10) return { label: "Fair Price", color: "var(--accent-secondary)" }
  if (diffPercent <= 25) return { label: "Above Average", color: "var(--accent-warning)" }
  return { label: "Overpriced", color: "var(--accent-danger)" }
}

export default function DealCheckPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<ScrapedProduct | null>(null)

  async function handleCheck() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setProduct(null)

    try {
      const res = await fetch("/api/deal-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to fetch product")
      } else {
        setProduct(data)
      }
    } catch {
      setError("Network error — could not reach the server")
    } finally {
      setLoading(false)
    }
  }

  // Compute verdict
  let verdict = null
  if (product?.price && product.productType === "diamond") {
    const carat = parseFloat(product.specs.carat || "1")
    const color = product.specs.color || "G"
    const clarity = product.specs.clarity || "VS2"
    const origin: DiamondOrigin = product.specs.origin === "natural" ? "natural" : "lab_grown"
    const estimate = estimateTotalPrice(carat, color, clarity, origin, product.specs.metal, product.specs.sideStones)
    const diff = ((product.price - estimate.total) / estimate.total) * 100
    verdict = {
      asking: product.price,
      fair: estimate.total,
      fairLow: estimate.totalLow,
      fairHigh: estimate.totalHigh,
      diamondValue: estimate.diamondValue,
      settingValue: estimate.settingValue,
      sideStoneValue: estimate.sideStoneValue,
      diff,
      result: getVerdict(diff),
      origin: origin === "natural" ? "Natural" : "Lab-Grown",
      certLab: product.specs.certLab,
    }
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Is This a Good Deal?
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Paste any jeweller&apos;s product URL — we&apos;ll extract the details and give you a fair value verdict.
        </p>
      </div>

      {/* URL Input */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Product URL</label>
          <div className="flex gap-2">
            <Input
              placeholder="https://jeweller.com.au/product/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCheck()}
              className="text-base"
            />
            <Button onClick={handleCheck} disabled={loading || !url.trim()} className="shrink-0 px-6">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
            </Button>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Works with most Australian jewellery retailers — Shopify, WooCommerce, and custom stores.
          </p>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-danger)" }} />
          <p className="text-sm" style={{ color: "var(--accent-danger)" }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-center gap-3 p-8">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent-primary)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Fetching product details...</span>
          </CardContent>
        </Card>
      )}

      {/* Product Details */}
      {product && !loading && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Product Found</h3>
              {product.productType === "diamond" && (
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
                  <Diamond className="h-3 w-3" /> Diamond
                </span>
              )}
              {product.productType === "gold" && (
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#FFFBEB", color: "var(--accent-warning)" }}>
                  <Coins className="h-3 w-3" /> Gold
                </span>
              )}
              {product.specs.origin !== "unknown" && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{
                  background: product.specs.origin === "natural" ? "#EFF6FF" : "#F0FDFA",
                  color: product.specs.origin === "natural" ? "var(--accent-secondary)" : "var(--accent-primary)",
                }}>
                  {product.specs.origin === "natural" ? "Natural" : "Lab-Grown"}
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-4">
              {product.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image} alt="" className="h-20 w-20 rounded-lg object-cover" style={{ border: "1px solid var(--border)" }} />
              )}
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {product.name || "Unknown Product"}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {product.retailer} &middot;{" "}
                  <a href={product.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1" style={{ color: "var(--accent-primary)" }}>
                    View page <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                {product.price && (
                  <p className="mt-2 font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    ${product.price.toLocaleString()} {product.currency}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {product.specs.carat && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>{product.specs.carat}ct</span>}
                  {product.specs.shape && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>{product.specs.shape}</span>}
                  {product.specs.color && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>Color: {product.specs.color}</span>}
                  {product.specs.clarity && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>Clarity: {product.specs.clarity}</span>}
                  {product.specs.cut && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>Cut: {product.specs.cut}</span>}
                  {product.specs.metal && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>{product.specs.metal}</span>}
                  {product.specs.settingType && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>{product.specs.settingType}</span>}
                  {product.specs.sideStones && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>Side Stones</span>}
                  {product.specs.certLab && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#EFF6FF", color: "var(--accent-secondary)" }}>{product.specs.certLab} Certified</span>}
                </div>
              </div>
            </div>

            {/* Warnings for edge cases */}
            {!product.price && (
              <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="text-sm" style={{ color: "var(--accent-warning)" }}>
                  Could not extract price from this page. The retailer may use a non-standard format.
                </p>
              </div>
            )}
            {product.productType === "gold" && (
              <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="text-sm" style={{ color: "var(--accent-warning)" }}>
                  This appears to be a gold jewellery piece. Use our <a href="/au/gold-calculator" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>Gold Calculator</a> for a melt value and making charge analysis.
                </p>
              </div>
            )}
            {product.productType === "unknown" && product.price && (
              <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <p className="text-sm" style={{ color: "var(--accent-secondary)" }}>
                  We couldn&apos;t confidently identify the product type. The verdict below may not be accurate.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verdict */}
      {verdict && (
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 inline-block rounded-full px-6 py-2.5 text-lg font-bold text-white"
              style={{ background: verdict.result.color }}>
              {verdict.result.label}
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              This <strong style={{ color: "var(--text-primary)" }}>{verdict.origin} diamond</strong> is
              priced at <strong className="font-mono" style={{ color: "var(--text-primary)" }}>${verdict.asking.toLocaleString()}</strong>.
              Our fair price estimate is{" "}
              <strong className="font-mono" style={{ color: "var(--text-primary)" }}>${verdict.fair.toLocaleString()}</strong>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {" "}(${verdict.fairLow.toLocaleString()} – ${verdict.fairHigh.toLocaleString()})
              </span>.
              {" "}That&apos;s{" "}
              <span className="font-mono font-semibold" style={{ color: verdict.result.color }}>
                {Math.abs(verdict.diff).toFixed(0)}% {verdict.diff > 0 ? "above" : "below"} fair value
              </span>.
            </p>

            {/* Price breakdown */}
            <div className="mx-auto mt-5 max-w-xs text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Price Breakdown</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Diamond value ({verdict.origin.toLowerCase()})</span>
                  <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>${verdict.diamondValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Setting / metal</span>
                  <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>${verdict.settingValue.toLocaleString()}</span>
                </div>
                {verdict.sideStoneValue > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>Side stones</span>
                    <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>${verdict.sideStoneValue.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1.5" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>Estimated fair total</span>
                  <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>${verdict.fair.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {verdict.certLab && (
              <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
                Based on {verdict.certLab}-certified {verdict.origin.toLowerCase()} diamond pricing
              </p>
            )}

            <div className="mt-6" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                You have 2 free checks remaining this month
              </p>
              <div className="mt-3 rounded-lg p-3" style={{ background: "var(--background-alt)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Unlock unlimited checks — $149/year
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                  Plus 50% off all premium reports and monthly market intelligence.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
