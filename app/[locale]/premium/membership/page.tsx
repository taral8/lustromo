"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  Loader2,
  Infinity,
  Percent,
  Mail,
  Zap,
  Database,
  Star,
  Lock,
  ArrowLeft,
  ChevronDown,
} from "lucide-react"

const benefits = [
  {
    icon: Infinity,
    title: "Unlimited Deal Checks",
    description:
      "Run as many deal checks as you need — diamonds, gold, any piece, any retailer. No per-check fees, no limits, no hesitation.",
  },
  {
    icon: Percent,
    title: "50% Off All Premium Reports",
    description:
      "Diamond Intelligence Reports, Gold Valuations, Retailer Due Diligence — every premium report at half price for the life of your membership.",
  },
  {
    icon: Mail,
    title: "Monthly Market Intelligence",
    description:
      "A monthly email with price trends, market movements, and buying insights you won't find on retail websites. Written for buyers, not the trade.",
  },
  {
    icon: Zap,
    title: "Priority Access to New Tools",
    description:
      "Be the first to use new calculators, comparison tools, and data features as they launch — before they're available to the public.",
  },
  {
    icon: Database,
    title: "Member-Only Pricing Data",
    description:
      "Access deeper pricing datasets, historical trends, and retailer-level pricing data that isn't available on the free tools.",
  },
]

const valueBreakdown = [
  { item: "Unlimited deal checks (avg. 3/month × 12)", value: "Included" },
  { item: "50% off reports (avg. 2 reports/year)", value: "~$49 saved" },
  { item: "Monthly market intelligence (12 issues)", value: "Included" },
  { item: "Priority tool access", value: "Included" },
  { item: "Member-only pricing data", value: "Included" },
]

const faqs = [
  {
    q: "What happens when my membership renews?",
    a: "Your membership renews automatically after 12 months at the same $149/year rate. You can cancel anytime from your account — no lock-in, no cancellation fees.",
  },
  {
    q: "How does the 50% discount on reports work?",
    a: "When you order any premium report as a member, the discount is applied automatically at checkout. Diamond Intelligence Reports drop from $49 to $24.50, Gold Valuations and Retailer reports from $29 to $14.50.",
  },
  {
    q: "Can I share my membership with someone else?",
    a: "Memberships are individual. If you're buying jewellery together as a couple, one membership covers all the deal checks and reports you both need — there's no per-person limit on usage.",
  },
  {
    q: "What if I only need one report?",
    a: "If you're making a single purchase and don't expect to use the platform again, an individual report makes more sense. The membership pays for itself if you run more than a handful of deal checks or order two or more reports in a year.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account at any point. You'll keep access until the end of your billing period. No partial refunds, but no penalties either.",
  },
]

export default function MembershipPage() {
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
        body: JSON.stringify({ productType: "annual_membership" }),
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
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(13,148,136,0.3)" }} />
          <div className="absolute -right-16 top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "rgba(13,148,136,0.2)" }} />
          <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full blur-3xl" style={{ background: "rgba(59,130,246,0.12)" }} />
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
          <Badge className="mb-4" variant="default">Best Value</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Stop paying per question. Get the full picture, all year.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(241,245,249,0.75)" }}>
            Unlimited deal checks, half-price reports, monthly market intelligence, and priority access to every tool Lustrumo builds — for $149 a year.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              onClick={handleCheckout}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : "Join Lustrumo — $149/year"}
            </Button>
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              Cancel anytime · No lock-in · AUD
            </p>
          </div>
        </div>
      </section>

      {/* Pain / context */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="space-y-5 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <p>
            Buying jewellery isn't usually a one-time event. There's the engagement ring, then the wedding bands. An anniversary gift. Something for a milestone birthday. Gold for a family celebration.
          </p>
          <p>
            Each time, you're back to square one — checking prices, comparing retailers, wondering if you're getting a fair deal. Each time, you could pay for an individual report. Or you could just have the tools available whenever you need them.
          </p>
          <p>
            The membership exists for people who want to buy with confidence every time, not just once.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section style={{ background: "var(--background-alt)" }}>
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
            Everything included
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <Card key={b.title} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(13,148,136,0.1)" }}>
                    <b.icon className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    {b.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {b.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value comparison */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-center text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          The maths is simple
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          At $149 per year, the membership costs less than a single Diamond Intelligence Report and a single Gold Valuation combined — and gives you far more.
        </p>
        <div className="mt-10 overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)" }}>
          {valueBreakdown.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3.5 text-sm"
              style={{
                borderBottom: i < valueBreakdown.length - 1 ? "1px solid var(--border)" : undefined,
                color: "var(--text-secondary)",
              }}
            >
              <span>{row.item}</span>
              <span className="font-medium" style={{ color: "var(--accent-primary)" }}>{row.value}</span>
            </div>
          ))}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ background: "rgba(13,148,136,0.05)", borderTop: "1px solid var(--border)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Annual membership</span>
            <span className="font-mono text-lg font-bold" style={{ color: "var(--accent-primary)" }}>$149/year</span>
          </div>
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
              { title: "Independent", desc: "No retailer partnerships, no commissions, no sponsored content. Your membership funds the platform — that's the only revenue model." },
              { title: "Australian Market Data", desc: "Pricing, retailer coverage, and market intelligence focused on the Australian jewellery market. Not US data with a currency conversion." },
              { title: "Constantly Updated", desc: "New tools, expanded retailer coverage, and refreshed pricing data throughout the year. Your membership gets more valuable over time, not less." },
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
            One membership. Every purchase, informed.
          </h2>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              onClick={handleCheckout}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : "Join Lustrumo — $149/year"}
            </Button>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <Lock className="h-3 w-3" /> Secure payment via Stripe
              </span>
              <span>·</span>
              <span>Cancel anytime — no lock-in</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
