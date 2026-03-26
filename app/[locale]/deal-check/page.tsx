"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck } from "lucide-react"

export default function DealCheckPage() {
  const [url, setUrl] = useState("")
  const [askingPrice, setAskingPrice] = useState("")
  const [showResult, setShowResult] = useState(false)

  const fairPrice = 1420
  const asking = parseFloat(askingPrice) || 1800
  const diff = ((asking - fairPrice) / fairPrice * 100)
  const verdict = diff <= -5 ? "Great Deal" : diff <= 5 ? "Fair Price" : diff <= 20 ? "Overpriced" : "Significantly Overpriced"
  const verdictColor = diff <= -5 ? "var(--accent-success)" : diff <= 5 ? "var(--accent-secondary)" : diff <= 20 ? "var(--accent-warning)" : "var(--accent-danger)"

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Is This a Good Deal?
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Paste any jeweller&apos;s product URL and get an instant fair price verdict.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Product URL</label>
            <Input
              placeholder="https://jeweller.com.au/product/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or enter details manually</span>
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Shape</label>
              <select className="h-10 w-full rounded-lg px-3 text-sm" style={{ border: "1px solid var(--border)" }}>
                <option>Round</option><option>Oval</option><option>Cushion</option><option>Princess</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Carat</label>
              <Input placeholder="1.00" type="number" step={0.01} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Color</label>
              <select className="h-10 w-full rounded-lg px-3 text-sm" style={{ border: "1px solid var(--border)" }}>
                {["D","E","F","G","H","I","J","K"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Clarity</label>
              <select className="h-10 w-full rounded-lg px-3 text-sm" style={{ border: "1px solid var(--border)" }}>
                {["FL","IF","VVS1","VVS2","VS1","VS2","SI1","SI2"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Asking Price (AUD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm" style={{ color: "var(--text-muted)" }}>$</span>
              <Input className="pl-7" placeholder="1,800" value={askingPrice} onChange={e => setAskingPrice(e.target.value)} />
            </div>
          </div>

          <Button className="w-full py-3 font-semibold" onClick={() => setShowResult(true)}>
            Check This Deal
          </Button>
        </CardContent>
      </Card>

      {showResult && (
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 inline-block rounded-full px-6 py-2 text-lg font-bold text-white"
              style={{ background: verdictColor }}>
              {verdict}
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              This stone is priced at <strong>${asking.toLocaleString()}</strong>. Our fair price estimate is{" "}
              <strong>${fairPrice.toLocaleString()}</strong>. That&apos;s{" "}
              <span style={{ color: verdictColor, fontWeight: 600 }}>
                {Math.abs(diff).toFixed(0)}% {diff > 0 ? "above" : "below"} fair value
              </span>.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                You have 2 free checks remaining this month
              </span>
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
