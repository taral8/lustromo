"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Check,
  Loader2,
  Diamond,
  ShieldCheck,
  BarChart3,
  FileText,
  Star,
  Lock,
  ArrowLeft,
  ChevronDown,
} from "lucide-react"

const features = [
  {
    icon: Diamond,
    title: "Top-5 Stone Recommendations",
    description:
      "Hand-picked stones that match your criteria — shape, carat, colour, clarity — ranked by overall value, not just price.",
  },
  {
    icon: BarChart3,
    title: "Fair Price Analysis",
    description:
      "Each recommended stone benchmarked against current market data so you can see exactly where it sits — overpriced, fair, or a genuine deal.",
  },
  {
    icon: ShieldCheck,
    title: "Certification Verification",
    description:
      "Every certificate cross-checked against the issuing lab. You'll know if the grading is reliable before you spend a cent.",
  },
  {
    icon: FileText,
    title: "Retailer Comparison",
    description:
      "Side-by-side pricing from multiple retailers for comparable stones. The markup differences will surprise you.",
  },
]

const faqs = [
  {
    q: "How is this different from browsing retailer websites myself?",
    a: "Retailers show you their inventory at their prices. We show you the same stones benchmarked against the broader market — with independent analysis of whether the price, certification, and retailer are worth your trust.",
  },
  {
    q: "What information do you need from me?",
    a: "Your preferred shape, carat range, and budget. If you have a specific stone or retailer in mind, include that too. The more detail you share, the more targeted the report.",
  },
  {
    q: "Is this financial or valuation advice?",
    a: "No. This is independent market research and price benchmarking. We always recommend having a stone independently appraised before any major purchase.",
  },
  {
    q: "How quickly will I receive the report?",
    a: "Within 24 hours of purchase. Most reports are delivered same-day. You'll receive a PDF to the email address you provide at checkout.",
  },
  {
    q: "$49 seems like a lot for a report.",
    a: "The average diamond engagement ring in Australia costs $5,000 to $15,000. A single percentage point of overpayment is $50 to $150. This report regularly identifies savings many times its cost.",
  },
]

export default function DiamondReportPage() {
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
        body: JSON.stringify({ productType: "diamond_report" }),
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
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(13,148,136,0.25)" }} />
          <div className="absolute -right-16 top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "rgba(59,130,246,0.15)" }} />
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
            You found the stone. But is the price right?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(241,245,249,0.75)" }}>
            Personalised diamond recommendations, independent price benchmarking, and certification verification — delivered to your inbox within 24 hours.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              onClick={handleCheckout}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get Your Report — $49"}
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
            You've spent hours scrolling through diamond listings. The specs look similar, but the prices are all over the place — $4,200 here, $6,800 there, for what looks like the same stone.
          </p>
          <p>
            One retailer says their stone is "excellent value." Another claims theirs is "investment grade." The certificates have different labs, different grading scales, and you're not sure which ones to trust.
          </p>
          <p>
            You don't need another sales pitch. You need someone with no stake in the sale to tell you what the data actually says.
          </p>
        </div>
      </section>

      {/* Stakes */}
      <section style={{ background: "var(--background-alt)" }}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
            The difference between a fair price and an inflated one is often thousands of dollars
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            A 1-carat round brilliant can vary by 30-40% across retailers for the same grade. On a $7,000 stone, that's $2,000 or more. A $49 report that shows you the real spread isn't an expense — it's the most obvious saving you'll make in this entire process.
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(13,148,136,0.1)" }}>
                  <f.icon className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
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
              { title: "Independent", desc: "We receive no commissions, referral fees, or incentives from any jeweller or retailer. Our only customer is you." },
              { title: "Data-Driven", desc: "Recommendations are built on live market data from thousands of listings — not opinion, not guesswork." },
              { title: "Australian-Focused", desc: "Pricing, retailers, and market benchmarks are specific to the Australian market. Not US data adapted for local use." },
            ].map((p) => (
              <div key={p.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(13,148,136,0.15)" }}>
                  <Star className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
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
            You're going to buy the diamond either way. <br className="hidden sm:block" />
            The only question is whether you overpay.
          </h2>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              onClick={handleCheckout}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get Your Report — $49"}
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
