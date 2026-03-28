"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"

const products = [
  {
    key: "diamond_report",
    title: "Diamond Intelligence Report",
    price: "$49",
    description: "Personalised top-5 stone recommendations, fair price analysis, and certification verification.",
    cta: "Get Your Report — $49",
    features: ["Top-5 stone recommendations", "Fair price analysis for each", "Certification verification", "Retailer comparison", "Delivered within 24 hours"],
    highlighted: false,
  },
  {
    key: "gold_report",
    title: "Gold Valuation Report",
    price: "$29",
    description: "Melt value analysis, making charge assessment, and comparable pricing for any gold piece.",
    cta: "Get Gold Valuation — $29",
    features: ["Melt value calculation", "Making charge fairness assessment", "Comparable market pricing", "Retailer price comparison", "PDF report delivered via email"],
    highlighted: false,
  },
  {
    key: "retailer_report",
    title: "Retailer Due Diligence Report",
    price: "$29",
    description: "Business verification, complaint history, pricing analysis, and review sentiment for any retailer.",
    cta: "Check a Retailer — $29",
    features: ["Business registration check", "Online review sentiment analysis", "Pricing fairness score", "Return policy assessment", "Complaint history overview"],
    highlighted: false,
  },
  {
    key: "annual_membership",
    title: "Annual Membership",
    price: "$149/year",
    description: "Unlimited deal checks, 50% off all reports, monthly market intelligence, priority access.",
    cta: "Join Lustrumo — $149/year",
    features: ["Unlimited deal checks", "50% off all premium reports", "Monthly market intelligence email", "Priority access to new tools", "Member-only pricing data"],
    highlighted: true,
  },
]

export default function PremiumPage() {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(productType: string) {
    setLoadingProduct(productType)
    setError(null)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Checkout failed")
        setLoadingProduct(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setError("No checkout URL returned")
        setLoadingProduct(null)
      }
    } catch {
      setError("Network error — please try again")
      setLoadingProduct(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Premium Intelligence Reports
        </h1>
        <p className="mt-2 text-base" style={{ color: "var(--text-secondary)" }}>
          Go deeper with personalised analysis.
        </p>
      </div>

      {error && (
        <div className="mx-auto mt-6 max-w-md rounded-lg p-3 text-center text-sm" style={{ background: "rgba(239,68,68,0.05)", color: "var(--accent-danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map(product => (
          <Card key={product.key}
            style={{
              borderColor: product.highlighted ? "var(--accent-primary)" : undefined,
              borderWidth: product.highlighted ? 2 : 1,
            }}>
            <CardHeader className="pb-2">
              {product.highlighted && (
                <Badge className="mb-2 w-fit">Best Value</Badge>
              )}
              <CardTitle className="text-lg">{product.title}</CardTitle>
              <p className="font-mono text-xl font-bold" style={{ color: "var(--accent-primary)" }}>
                {product.price}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{product.description}</p>
              <ul className="space-y-2">
                {product.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--accent-primary)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full font-semibold"
                variant={product.highlighted ? "default" : "outline"}
                onClick={() => handleCheckout(product.key)}
                disabled={loadingProduct === product.key}
              >
                {loadingProduct === product.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  product.cta
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        All prices in AUD. Reports are delivered as PDF to your email within 24 hours.
        Membership renews annually — cancel anytime. Payments processed securely by Stripe.
      </p>
    </div>
  )
}
