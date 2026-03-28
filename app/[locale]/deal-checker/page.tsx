"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Loader2, AlertCircle, ExternalLink, Diamond, Info, Coins } from "lucide-react"
import { calculateFairValue, comparePrice, type ComparisonResult, type ComparisonStatus } from "@/lib/valuation/engine"

interface NaturalDiamondDealResult {
  valuation: {
    fair_estimate: number
    fair_range: { low: number; high: number }
    verdict: string
    verdict_label: string
    price_diff_pct: number | null
    shape_multiplier: number
    base_price_source: string
  }
  labGrownAlternative: { fairPrice: number; savingsPct: number }
}

interface GoldDealResult {
  valuation: {
    estimated_intrinsic_value: number
    weight_source: "listed" | "estimated"
    estimated_weight_grams: number
    making_charge_pct: number
    making_charge_rating: "low" | "average" | "high" | "very_high"
    fair_price_range: { low: number; high: number }
    is_fair: boolean
  }
  productType: string
  marketAvg: { avgMakingCharge: number; count: number } | null
}

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

const STATUS_STYLES: Record<ComparisonStatus, { bg: string; text: string }> = {
  great_deal:        { bg: "#10B981", text: "#fff" },
  good_value:        { bg: "#0D9488", text: "#fff" },
  fair_price:        { bg: "#3B82F6", text: "#fff" },
  slightly_above:    { bg: "#F59E0B", text: "#fff" },
  overpriced:        { bg: "#EF4444", text: "#fff" },
  insufficient_data: { bg: "#94A3B8", text: "#fff" },
  needs_review:      { bg: "#94A3B8", text: "#fff" },
}

export default function DealCheckerPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<ScrapedProduct | null>(null)
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [goldDeal, setGoldDeal] = useState<GoldDealResult | null>(null)
  const [naturalDeal, setNaturalDeal] = useState<NaturalDiamondDealResult | null>(null)

  async function handleCheck() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setProduct(null)
    setComparison(null)
    setGoldDeal(null)
    setNaturalDeal(null)

    try {
      const res = await fetch("/api/deal-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to fetch product")
        return
      }

      setProduct(data)

      // Gold deal result from API
      if (data.goldDeal) {
        setGoldDeal(data.goldDeal)
      }

      // Natural diamond deal result from API
      if (data.naturalDiamondDeal) {
        setNaturalDeal(data.naturalDiamondDeal)
      }

      // Run comparison if we have a diamond with a price
      if (data.productType === "diamond" && data.price) {
        const carat = parseFloat(data.specs.carat) || null
        const diamondType = data.specs.origin === "lab_grown" ? "lab_grown" as const : "natural" as const

        // Estimate data quality score based on available fields
        let dqScore = 100
        if (!data.specs.certLab) dqScore -= 15
        if (!carat) dqScore -= 10
        if (!data.specs.cut) dqScore -= 5

        const fairValue = calculateFairValue(
          carat,
          data.specs.color,
          data.specs.clarity,
          data.specs.cut,
          data.specs.shape?.toLowerCase() || null,
          diamondType,
          data.specs.settingType,
          data.specs.metal ? inferMetalKarat(data.specs.metal) : null,
          data.specs.sideStones ? 0.30 : null, // estimate if side stones detected
          data.specs.sideStones ? diamondType : "none",
          null,
          dqScore,
        )

        if (fairValue) {
          setComparison(comparePrice(data.price, fairValue))
        }
      }
    } catch {
      setError("Network error — could not reach the server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Is This a Good Deal?
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Paste any jeweller&apos;s product URL — we&apos;ll extract the details and give you a fair value estimate.
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

      {/* Product Card */}
      {product && !loading && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Product Found</h3>
              {product.productType === "diamond" && (
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
                  <Diamond className="h-3 w-3" /> Diamond
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
                    ${product.price.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {product.specs.carat && <Pill>{product.specs.carat}ct</Pill>}
                  {product.specs.shape && <Pill>{product.specs.shape}</Pill>}
                  {product.specs.color && <Pill>Colour: {product.specs.color}</Pill>}
                  {product.specs.clarity && <Pill>Clarity: {product.specs.clarity}</Pill>}
                  {product.specs.cut && <Pill>Cut: {product.specs.cut}</Pill>}
                  {product.specs.metal && <Pill>{product.specs.metal}</Pill>}
                  {product.specs.settingType && <Pill>{product.specs.settingType}</Pill>}
                  {product.specs.sideStones && <Pill>Side Stones</Pill>}
                  {product.specs.certLab && (
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#EFF6FF", color: "var(--accent-secondary)" }}>
                      {product.specs.certLab} {product.specs.certNumber ? `#${product.specs.certNumber}` : "Certified"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edge case warnings */}
            {!product.price && (
              <Warning>
                This product does not have a published price. Contact the retailer directly for pricing.
                Lustrumo cannot generate a comparison without a verified listed price.
              </Warning>
            )}
            {product.productType === "gold" && !goldDeal && (
              <Warning>
                This appears to be a gold jewellery piece. Use our <a href="/au/gold-calculator" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>Gold Calculator</a> for
                a melt value and making charge analysis.
              </Warning>
            )}
            {product.productType === "unknown" && product.price && (
              <Warning>
                We couldn&apos;t generate a reliable estimate for this product. Key data — such as
                diamond grade, metal weight, or certified stone details — was not available in the
                retailer&apos;s listing. Ask your retailer for a full specification sheet before comparing prices.
              </Warning>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Result */}
      {comparison && (
        <Card className="mt-6">
          <CardContent className="p-6">
            {/* Verdict badge */}
            <div className="text-center">
              <div
                className="mx-auto mb-1 inline-block rounded-full px-5 py-2 text-base font-bold"
                style={{
                  background: STATUS_STYLES[comparison.status].bg,
                  color: STATUS_STYLES[comparison.status].text,
                }}
              >
                {comparison.label}
              </div>
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                This product is priced at{" "}
                <strong className="font-mono" style={{ color: "var(--text-primary)" }}>
                  ${comparison.askingPrice.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </strong>.
                {comparison.priceDiffPercent !== 0 && (
                  <> That is{" "}
                    <span className="font-mono font-semibold" style={{ color: STATUS_STYLES[comparison.status].bg }}>
                      {Math.abs(comparison.priceDiffPercent).toFixed(0)}% {comparison.priceDiffPercent > 0 ? "above" : "below"}
                    </span>{" "}
                    our fair value estimate.
                  </>
                )}
              </p>
            </div>

            {/* Unbundled Breakdown — Section 5 */}
            <div className="mx-auto mt-6 max-w-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Fair Value Breakdown
              </p>
              <div className="space-y-2 text-sm">
                <Row
                  label="Centre stone"
                  low={comparison.fairValue.centre.low}
                  high={comparison.fairValue.centre.high}
                  mid={comparison.fairValue.centre.mid}
                />
                <Row
                  label="Setting / metal"
                  low={comparison.fairValue.setting.low}
                  high={comparison.fairValue.setting.high}
                  mid={comparison.fairValue.setting.mid}
                />
                {comparison.fairValue.sideStones.mid > 0 && (
                  <Row
                    label="Side stones"
                    low={comparison.fairValue.sideStones.low}
                    high={comparison.fairValue.sideStones.high}
                    mid={comparison.fairValue.sideStones.mid}
                  />
                )}
                <div className="flex justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Fair value range</span>
                  <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                    ${comparison.fairValue.total.low.toLocaleString()} – ${comparison.fairValue.total.high.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Mid estimate</span>
                  <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                    ${comparison.fairValue.total.mid.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Data confidence */}
            <div className="mx-auto mt-5 flex max-w-sm items-center justify-between rounded-lg p-3" style={{ background: "var(--background-alt)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Data confidence</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${comparison.fairValue.dataConfidence}%`,
                      background: comparison.fairValue.dataConfidence >= 70 ? "var(--accent-success)" :
                                  comparison.fairValue.dataConfidence >= 50 ? "var(--accent-warning)" : "var(--accent-danger)",
                    }}
                  />
                </div>
                <span className="font-mono text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {comparison.fairValue.dataConfidence}/100
                </span>
              </div>
            </div>

            {/* Low confidence warning — Section 7.4 */}
            {comparison.fairValue.dataConfidence < 60 && (
              <div className="mx-auto mt-4 max-w-sm rounded-lg p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="flex items-start gap-2 text-xs" style={{ color: "var(--accent-warning)" }}>
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This estimate is based on incomplete product data. Some fields were missing or could not be verified. Treat this result as indicative only.
                </p>
              </div>
            )}

            {/* Disclaimer — Section 7.2 */}
            <p className="mx-auto mt-5 max-w-sm text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Fair value estimate based on diamond grade, metal weight, and setting complexity.
              Individual retailer pricing may vary. Data confidence: {comparison.fairValue.dataConfidence}/100.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Needs review — no diamond data — Section 7.3 */}
      {product && product.productType === "diamond" && product.price && !comparison && !loading && (
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              We couldn&apos;t generate a reliable estimate for this product. Key data — such as diamond grade,
              metal weight, or certified stone details — was not available in the retailer&apos;s listing.
              Ask your retailer for a full specification sheet before comparing prices.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─── Natural Diamond Valuation Result ─── */}
      {naturalDeal && product && !loading && (
        <Card className="mt-6">
          <CardContent className="p-6">
            {/* Verdict badge */}
            <div className="text-center">
              <div className="mx-auto mb-1 inline-flex items-center gap-2 rounded-full px-5 py-2 text-base font-bold"
                style={{
                  background: naturalDeal.valuation.verdict === "below_market" ? "#10B981"
                    : naturalDeal.valuation.verdict === "fair_price" ? "#3B82F6"
                    : naturalDeal.valuation.verdict === "above_market" ? "#F59E0B"
                    : "#EF4444",
                  color: "#fff",
                }}>
                <Diamond className="h-4 w-4" />
                {naturalDeal.valuation.verdict_label}
              </div>
              {naturalDeal.valuation.price_diff_pct !== null && (
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  This diamond is priced{" "}
                  <strong className="font-mono" style={{
                    color: naturalDeal.valuation.price_diff_pct <= 0 ? "var(--accent-success)" : "var(--accent-danger)",
                  }}>
                    {Math.abs(naturalDeal.valuation.price_diff_pct).toFixed(1)}% {naturalDeal.valuation.price_diff_pct > 0 ? "above" : "below"}
                  </strong>{" "}
                  our fair value estimate.
                </p>
              )}
            </div>

            {/* Breakdown */}
            <div className="mx-auto mt-6 max-w-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Fair Value Breakdown
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Retail price</span>
                  <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                    ${product.price?.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Fair value estimate</span>
                  <span className="font-mono font-semibold" style={{ color: "var(--accent-primary)" }}>
                    ${naturalDeal.valuation.fair_estimate.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Fair range</span>
                  <span className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>
                    ${naturalDeal.valuation.fair_range.low.toLocaleString()} – ${naturalDeal.valuation.fair_range.high.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Lab-grown alternative */}
              <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(240,253,250,0.5)", border: "1px solid rgba(13,148,136,0.15)" }}>
                <p className="text-xs font-medium" style={{ color: "var(--accent-primary)" }}>
                  Lab-grown alternative
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  A comparable lab-grown diamond would cost approximately{" "}
                  <strong className="font-mono" style={{ color: "var(--accent-primary)" }}>
                    ${naturalDeal.labGrownAlternative.fairPrice.toLocaleString()}
                  </strong>{" "}
                  — <strong className="font-mono" style={{ color: "var(--accent-success)" }}>
                    {naturalDeal.labGrownAlternative.savingsPct}% savings
                  </strong>.
                </p>
              </div>

              <p className="mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                {naturalDeal.valuation.base_price_source}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Gold Valuation Result ─── */}
      {goldDeal && product && !loading && (
        <Card className="mt-6">
          <CardContent className="p-6">
            {/* Gold verdict badge */}
            <div className="text-center">
              <div className="mx-auto mb-1 inline-flex items-center gap-2 rounded-full px-5 py-2 text-base font-bold"
                style={{
                  background: goldDeal.valuation.making_charge_rating === "low" ? "#10B981"
                    : goldDeal.valuation.making_charge_rating === "average" ? "#3B82F6"
                    : goldDeal.valuation.making_charge_rating === "high" ? "#F59E0B"
                    : "#EF4444",
                  color: "#fff",
                }}>
                <Coins className="h-4 w-4" />
                {goldDeal.valuation.making_charge_rating === "low" ? "Great Value"
                  : goldDeal.valuation.making_charge_rating === "average" ? "Fair Price"
                  : goldDeal.valuation.making_charge_rating === "high" ? "Above Average Markup"
                  : "High Markup"}
              </div>
            </div>

            {/* Gold breakdown */}
            <div className="mx-auto mt-6 max-w-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Gold Value Breakdown
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Retail price</span>
                  <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                    ${product.price?.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Est. gold melt value
                    <span className="ml-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      ({goldDeal.valuation.estimated_weight_grams}g, {goldDeal.valuation.weight_source})
                    </span>
                  </span>
                  <span className="font-mono font-semibold" style={{ color: "var(--accent-primary)" }}>
                    ${goldDeal.valuation.estimated_intrinsic_value.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Making charge</span>
                  <span className="font-mono font-bold" style={{
                    color: goldDeal.valuation.making_charge_pct <= 30 ? "var(--accent-success)"
                      : goldDeal.valuation.making_charge_pct <= 50 ? "var(--accent-warning)"
                      : "var(--accent-danger)",
                  }}>
                    {goldDeal.valuation.making_charge_pct.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-muted)" }}>Fair price range</span>
                  <span className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>
                    ${goldDeal.valuation.fair_price_range.low.toLocaleString()} – ${goldDeal.valuation.fair_price_range.high.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Market context */}
              {goldDeal.marketAvg && (
                <div className="mt-4 rounded-lg p-3" style={{ background: "var(--background-alt)" }}>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    The average making charge for <strong className="capitalize">{goldDeal.productType}</strong> is{" "}
                    <strong className="font-mono">{goldDeal.marketAvg.avgMakingCharge.toFixed(0)}%</strong> across{" "}
                    <strong>{goldDeal.marketAvg.count}</strong> products in our database.
                  </p>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <p className="mx-auto mt-5 max-w-sm text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Gold valuation based on estimated weight and current spot price. Products with diamonds
              or gemstones will show higher making charges. Always request an itemised breakdown from
              your retailer.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Helper components ───

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>
      {children}
    </span>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
      <p className="text-sm" style={{ color: "var(--accent-warning)" }}>{children}</p>
    </div>
  )
}

function Row({ label, low, high, mid }: { label: string; low: number; high: number; mid: number }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>
        ${low.toLocaleString()} – ${high.toLocaleString()}
        <span style={{ color: "var(--text-muted)" }}> (mid: ${mid.toLocaleString()})</span>
      </span>
    </div>
  )
}

// ─── Utility ───

function inferMetalKarat(metal: string): string | null {
  if (/plat/i.test(metal)) return "Plat"
  if (/18/i.test(metal)) return "18K"
  if (/14/i.test(metal)) return "14K"
  if (/9/i.test(metal)) return "9K"
  if (/22/i.test(metal)) return "22K"
  return null
}
