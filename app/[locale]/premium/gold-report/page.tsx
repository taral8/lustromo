"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Check,
  Loader2,
  Scale,
  TrendingUp,
  Store,
  FileText,
  Star,
  Lock,
  ArrowLeft,
  ChevronDown,
} from "lucide-react"

const features = [
  {
    icon: Scale,
    title: "Melt Value Calculation",
    description:
      "The actual gold content value of the piece, calculated from weight and purity against today's spot price. This is the floor — the absolute minimum the gold is worth.",
  },
  {
    icon: TrendingUp,
    title: "Making Charge Assessment",
    description:
      "How much of the sticker price is craftsmanship versus raw gold. Some retailers add 15%, others add 60%. You'll see exactly where this piece falls.",
  },
  {
    icon: Store,
    title: "Comparable Market Pricing",
    description:
      "The same weight and purity from other Australian retailers — so you can see whether the price you've been quoted is competitive or inflated.",
  },
  {
    icon: FileText,
    title: "Retailer Price Comparison",
    description:
      "A clear breakdown across multiple sellers. No need to visit five shops or open twenty browser tabs — we've already done the legwork.",
  },
]

const faqs = [
  {
    q: "What gold pieces can you value?",
    a: "Any gold jewellery — rings, chains, bangles, necklaces, earrings. 22K, 18K, 14K, or 9K. If you can tell us the karat, weight, and the price you've been quoted, we can assess it.",
  },
  {
    q: "How do you calculate the melt value?",
    a: "We use the live Australian gold spot price, multiply by the purity fraction (e.g. 22/24 for 22K), and multiply by the weight in grams. This gives the base metal value before any making charges.",
  },
  {
    q: "What's a fair making charge?",
    a: "It depends on complexity. A plain bangle might carry a 10-20% making charge. A detailed handcrafted necklace might justify 30-50%. Our report benchmarks the charge against comparable pieces so you can judge for yourself.",
  },
  {
    q: "Is this an official valuation or appraisal?",
    a: "No. This is independent market research and price benchmarking — not a certified appraisal. For insurance or resale purposes, we recommend a registered valuer.",
  },
  {
    q: "How quickly will I get the report?",
    a: "Within 24 hours of purchase. Most reports are delivered same-day. You'll receive a PDF to the email address you provide at checkout.",
  },
]

export default function GoldReportPage() {
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  async function handleCheckout() {
    setLoadingCheckout(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productType: "gold_report" }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Checkout failed")
        setLoadingCheckout(false)
        return
      }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError("No checkout URL returned")
        setLoadingCheckout(false)
      }
    } catch {
      setError("Network error — please try again")
      setLoadingCheckout(false)
    }
  }

  return (
    <div style={{ background: "var(--background)" }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--surface-dark)" }}>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(245,158,11,0.2)" }} />
          <div className="absolute -right-16 top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "rgba(13,148,136,0.15)" }} />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <Link
            href="/au/premium"
            className="mb-6 inline-flex items-center gap-1.5 text-sm transition-colors hover:text-white"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            All Reports
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            The sticker price tells you what the retailer wants. Not what the gold is worth.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(241,245,249,0.75)" }}>
            Melt value analysis, making charge breakdown, and comparable pricing from across the Australian market — for any gold piece you're considering.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              onClick={handleCheckout}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get Gold Valuation — $29"}
            </Button>
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              PDF report · Delivered within 24 hours · AUD
            </p>
          </div>
        </div>
      </section>

      {/* Pain / context */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="space-y-5 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <p>
            Gold jewellery pricing in Australia is opaque by design. The spot price is public, but the final price on the tag has been through several layers — making charges, retailer margins, brand premiums — and none of them are broken down for you.
          </p>
          <p>
            A 22K gold chain that weighs 20 grams might cost $2,400 at one shop and $3,800 at another. Both retailers will tell you their price is fair. Without knowing the melt value and the typical making charge for that type of piece, you have no way to judge.
          </p>
          <p>
            You shouldn't have to take the retailer's word for it.
          </p>
        </div>
      </section>

      {/* Stakes */}
      <section style={{ background: "var(--background-alt)" }}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
            Making charges can double the cost of the gold itself
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Some retailers add reasonable making charges. Others add margins that would make a luxury brand blush. On a $3,000 piece, the difference between a 15% and a 50% making charge is over $700. A $29 report shows you exactly where the piece you're looking at falls.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-center text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          What's in the report
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(245,158,11,0.1)" }}>
                  <f.icon className="h-5 w-5" style={{ color: "#D97706" }} />
                </div>
                <h3 className="mt-4 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {f.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Proof */}
      <section style={{ background: "var(--surface-dark)" }}>
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Why trust Lustrumo
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { title: "Independent", desc: "No commissions, no referral fees, no retailer partnerships. We have no reason to steer you toward — or away from — any seller." },
              { title: "Live Market Data", desc: "Gold spot prices and retailer listings are tracked in real time. Your report reflects today's market, not last month's." },
              { title: "Australian Market", desc: "Pricing data, retailer comparisons, and making charge benchmarks are specific to Australian jewellers. Not imported from overseas databases." },
            ].map((p) => (
              <div key={p.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(245,158,11,0.15)" }}>
                  <Star className="h-5 w-5" style={{ color: "#F59E0B" }} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(241,245,249,0.65)" }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-center text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Common questions
        </h2>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-slate-50"
                style={{ color: "var(--text-primary)" }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <ChevronDown
                  className={`ml-2 h-4 w-4 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  style={{ color: "var(--text-muted)" }}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--background-alt)" }}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          {error && (
            <div className="mx-auto mb-6 max-w-md rounded-lg p-3 text-center text-sm" style={{ background: "rgba(239,68,68,0.05)", color: "var(--accent-danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
            Know what the gold is worth before you pay what the retailer asks.
          </h2>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              onClick={handleCheckout}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get Gold Valuation — $29"}
            </Button>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Secure payment via Stripe
              </span>
              <span>·</span>
              <span>PDF delivered within 24 hours</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
