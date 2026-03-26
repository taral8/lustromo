"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { estimateDiamondPrice, type DiamondOrigin } from "@/lib/diamond-data"

interface ScrapedProduct {
  name: string | null
  price: number | null
  currency: string
  image: string | null
  retailer: string | null
  url: string
  specs: {
    carat: string | null
    shape: string | null
    color: string | null
    clarity: string | null
    metal: string | null
  }
}

function getVerdict(diffPercent: number): { label: string; color: string } {
  if (diffPercent <= -5) return { label: "Great Deal", color: "var(--accent-success)" }
  if (diffPercent <= 5) return { label: "Fair Price", color: "var(--accent-secondary)" }
  if (diffPercent <= 20) return { label: "Overpriced", color: "var(--accent-warning)" }
  return { label: "Significantly Overpriced", color: "var(--accent-danger)" }
}

export default function DealCheckPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<ScrapedProduct | null>(null)

  // Manual entry fields
  const [manualShape, setManualShape] = useState("round")
  const [manualCarat, setManualCarat] = useState("")
  const [manualColor, setManualColor] = useState("G")
  const [manualClarity, setManualClarity] = useState("VS2")
  const [manualPrice, setManualPrice] = useState("")
  const [manualResult, setManualResult] = useState<{ asking: number; fair: number } | null>(null)

  async function handleUrlCheck() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setProduct(null)
    setManualResult(null)

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

  function handleManualCheck() {
    const asking = parseFloat(manualPrice)
    const carat = parseFloat(manualCarat) || 1
    if (!asking || asking <= 0) return
    const origin: DiamondOrigin = "lab_grown"
    const result = estimateDiamondPrice(carat, manualColor, manualClarity, origin)
    setManualResult({ asking, fair: result.fairPrice })
    setProduct(null)
  }

  // Calculate verdict for scraped product
  let scrapedVerdict = null
  if (product?.price && product.specs.carat) {
    const carat = parseFloat(product.specs.carat) || 1
    const color = product.specs.color || "G"
    const clarity = product.specs.clarity || "VS2"
    const estimate = estimateDiamondPrice(carat, color, clarity, "lab_grown")
    const diff = ((product.price - estimate.fairPrice) / estimate.fairPrice) * 100
    scrapedVerdict = { asking: product.price, fair: estimate.fairPrice, diff, verdict: getVerdict(diff) }
  }

  // Calculate verdict for manual entry
  let manualVerdict = null
  if (manualResult) {
    const diff = ((manualResult.asking - manualResult.fair) / manualResult.fair) * 100
    manualVerdict = { ...manualResult, diff, verdict: getVerdict(diff) }
  }

  const activeVerdict = scrapedVerdict || manualVerdict

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Is This a Good Deal?
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Paste any jeweller&apos;s product URL and we&apos;ll extract the price and give you a fair value verdict.
        </p>
      </div>

      {/* URL Input */}
      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Product URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://jeweller.com.au/product/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleUrlCheck()}
              />
              <Button onClick={handleUrlCheck} disabled={loading || !url.trim()} className="shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-danger)" }} />
              <p className="text-sm" style={{ color: "var(--accent-danger)" }}>{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or enter details manually</span>
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Shape</label>
              <select value={manualShape} onChange={e => setManualShape(e.target.value)}
                className="h-10 w-full rounded-lg px-3 text-sm" style={{ border: "1px solid var(--border)" }}>
                {["Round","Oval","Cushion","Princess","Emerald","Pear","Radiant","Asscher","Marquise","Heart"].map(s => (
                  <option key={s} value={s.toLowerCase()}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Carat</label>
              <Input placeholder="1.00" type="number" step={0.01} value={manualCarat} onChange={e => setManualCarat(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Color</label>
              <select value={manualColor} onChange={e => setManualColor(e.target.value)}
                className="h-10 w-full rounded-lg px-3 text-sm" style={{ border: "1px solid var(--border)" }}>
                {["D","E","F","G","H","I","J","K"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Clarity</label>
              <select value={manualClarity} onChange={e => setManualClarity(e.target.value)}
                className="h-10 w-full rounded-lg px-3 text-sm" style={{ border: "1px solid var(--border)" }}>
                {["FL","IF","VVS1","VVS2","VS1","VS2","SI1","SI2"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Asking Price (AUD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm" style={{ color: "var(--text-muted)" }}>$</span>
              <Input className="pl-7" placeholder="1,800" value={manualPrice} onChange={e => setManualPrice(e.target.value)} />
            </div>
          </div>

          <Button className="w-full py-3 font-semibold" onClick={handleManualCheck} disabled={!manualPrice}>
            Check This Deal
          </Button>
        </CardContent>
      </Card>

      {/* Scraped Product Details */}
      {product && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Product Found</h3>
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.specs.carat && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>{product.specs.carat}ct</span>}
                  {product.specs.shape && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>{product.specs.shape}</span>}
                  {product.specs.color && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>Color: {product.specs.color}</span>}
                  {product.specs.clarity && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>Clarity: {product.specs.clarity}</span>}
                  {product.specs.metal && <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "var(--background-alt)", color: "var(--text-secondary)" }}>{product.specs.metal}</span>}
                </div>
              </div>
            </div>
            {!product.price && (
              <div className="mt-4 rounded-lg p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="text-sm" style={{ color: "var(--accent-warning)" }}>
                  Could not extract price from this page. Try entering the details manually above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verdict */}
      {activeVerdict && (
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 inline-block rounded-full px-6 py-2.5 text-lg font-bold text-white"
              style={{ background: activeVerdict.verdict.color }}>
              {activeVerdict.verdict.label}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              This stone is priced at{" "}
              <strong className="font-mono" style={{ color: "var(--text-primary)" }}>${activeVerdict.asking.toLocaleString()}</strong>.
              Our fair price estimate is{" "}
              <strong className="font-mono" style={{ color: "var(--text-primary)" }}>${activeVerdict.fair.toLocaleString()}</strong>.
              That&apos;s{" "}
              <span className="font-mono font-semibold" style={{ color: activeVerdict.verdict.color }}>
                {Math.abs(activeVerdict.diff).toFixed(0)}% {activeVerdict.diff > 0 ? "above" : "below"} fair value
              </span>.
            </p>

            <div className="mt-6" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                You have 2 free checks remaining this month
              </p>
            </div>

            <div className="mt-4 rounded-lg p-4" style={{ background: "var(--background-alt)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Unlock unlimited checks — $149/year
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                Plus 50% off all premium reports and monthly market intelligence.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
