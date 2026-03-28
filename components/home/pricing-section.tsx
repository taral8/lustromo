"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"

interface PricingSectionProps {
  locale: string
}

const products = [
  {
    key: "diamond_report",
    title: "Diamond Intelligence Report",
    price: "$49",
    description: "Personalised top-5 stone recommendations, fair price analysis, and certification verification.",
    cta: "Get Your Report",
    features: ["Top-5 stone recommendations", "Fair price analysis for each", "Certification verification", "Retailer comparison", "Delivered within 24 hours"],
    highlighted: false,
  },
  {
    key: "gold_report",
    title: "Gold Valuation Report",
    price: "$29",
    description: "Melt value analysis, making charge assessment, and comparable pricing for any gold piece.",
    cta: "Get Gold Valuation",
    features: ["Melt value calculation", "Making charge assessment", "Comparable market pricing", "Retailer price comparison", "PDF report via email"],
    highlighted: false,
  },
  {
    key: "retailer_report",
    title: "Retailer Due Diligence",
    price: "$29",
    description: "Business verification, complaint history, pricing analysis, and review sentiment for any retailer.",
    cta: "Check a Retailer",
    features: ["Business registration check", "Review sentiment analysis", "Pricing fairness score", "Return policy assessment", "Complaint history overview"],
    highlighted: false,
  },
  {
    key: "annual_membership",
    title: "Annual Membership",
    price: "$149",
    period: "/year",
    description: "Unlimited deal checks, 50% off all reports, monthly market intelligence, priority access.",
    cta: "Join Lustrumo",
    features: ["Unlimited deal checks", "50% off all premium reports", "Monthly market intelligence", "Priority access to new tools", "Member-only pricing data"],
    highlighted: true,
  },
]

export function PricingSection({ locale }: PricingSectionProps) {
  const prefix = `/${locale}`
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null)

  async function handleCheckout(productKey: string) {
    setLoadingProduct(productKey)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: productKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
    } catch { /* fall through */ }
    // Fallback: go to premium page
    window.location.href = `${prefix}/premium`
    setLoadingProduct(null)
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Premium Intelligence Reports
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
            Go deeper with personalised analysis before you buy.
          </p>
        </div>

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
                  {"period" in product && (
                    <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>{product.period}</span>
                  )}
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

        <p className="mt-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
          All prices in AUD. Reports delivered as PDF within 24 hours. Membership renews annually — cancel anytime.
        </p>
      </div>
    </section>
  )
}
