"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Loader2,
  Building2,
  MessageSquare,
  BarChart3,
  RotateCcw,
  AlertTriangle,
  Star,
  Lock,
  ArrowLeft,
  ChevronDown,
} from "lucide-react"

const features = [
  {
    icon: Building2,
    title: "Business Registration Check",
    description:
      "We verify the retailer's ABN, business registration, and trading history. You'll know how long they've been operating and whether the business entity is legitimate.",
  },
  {
    icon: MessageSquare,
    title: "Review Sentiment Analysis",
    description:
      "Hundreds of online reviews distilled into a clear picture — what buyers consistently praise, what they consistently complain about, and how the retailer responds to problems.",
  },
  {
    icon: BarChart3,
    title: "Pricing Fairness Score",
    description:
      "Their listed prices benchmarked against the market. Are they competitive, mid-range, or premium? You'll see exactly where they sit relative to comparable retailers.",
  },
  {
    icon: RotateCcw,
    title: "Return Policy Assessment",
    description:
      "A plain-English breakdown of their return, refund, and exchange policies — including the conditions and timeframes that matter most if something goes wrong.",
  },
  {
    icon: AlertTriangle,
    title: "Complaint History Overview",
    description:
      "Publicly available complaints, disputes, and regulatory actions compiled in one place. Most buyers never check. You will.",
  },
]

const faqs = [
  {
    q: "Which retailers can you check?",
    a: "Any Australian jewellery retailer — online or brick-and-mortar. If they have a website and an ABN, we can research them. Provide the retailer name and website URL at checkout.",
  },
  {
    q: "Will the retailer know I've requested this?",
    a: "No. Everything in the report comes from publicly available information — business registries, online reviews, pricing data, and published policies. The retailer is never contacted.",
  },
  {
    q: "What if the retailer is new with limited reviews?",
    a: "We'll note the limited data and flag it as a consideration. A new retailer isn't necessarily a bad one — but it does mean there's less track record to assess. The report will include whatever is available.",
  },
  {
    q: "Can I use this to compare two retailers?",
    a: "Each report covers one retailer. If you're deciding between two, order a report for each. At $29 each, it's a small price for clarity on a purchase that's likely thousands of dollars.",
  },
  {
    q: "How quickly will I receive the report?",
    a: "Within 24 hours of purchase. Most reports are delivered same-day. You'll receive a PDF to the email address you provide at checkout.",
  },
]

export default function RetailerReportPage() {
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
        body: JSON.stringify({ productType: "retailer_report" }),
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
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(59,130,246,0.2)" }} />
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
            You've found the piece. But can you trust the seller?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(241,245,249,0.75)" }}>
            Business verification, review analysis, pricing fairness, and complaint history for any Australian jewellery retailer — before you hand over your money.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              onClick={handleCheckout}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check a Retailer — $29"}
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
            The website looks professional. The showroom is polished. The salesperson is friendly and knowledgeable. Everything feels right.
          </p>
          <p>
            But a beautiful shopfront tells you nothing about their pricing practices, their returns process when things go wrong, or the pattern of complaints that only shows up when you dig through consumer forums and regulatory filings.
          </p>
          <p>
            Most buyers don't do that research. They trust their gut, or they trust Google's star rating. Neither tells the full story.
          </p>
        </div>
      </section>

      {/* Stakes */}
      <section style={{ background: "var(--background-alt)" }}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
            A retailer problem after purchase is ten times harder to fix than before
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Difficult return policies, hidden restocking fees, and poor after-sales support don't show up in the sales pitch. They show up weeks later when you're trying to get a resize, a repair, or a refund. A $29 report gives you the picture before your money changes hands.
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "rgba(59,130,246,0.1)" }}>
                  <f.icon className="h-5 w-5" style={{ color: "var(--accent-secondary)" }} />
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
              { title: "No Retailer Affiliations", desc: "We don't partner with, endorse, or receive fees from any retailer. The assessment is based purely on publicly available data." },
              { title: "Comprehensive Sources", desc: "Business registries, review platforms, consumer forums, pricing data, and published policies — all cross-referenced into a single report." },
              { title: "Australian Retailers", desc: "This report is built for the Australian market — Australian business registrations, local consumer law, and local review platforms." },
            ].map((p) => (
              <div key={p.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(59,130,246,0.15)" }}>
                  <Star className="h-5 w-5" style={{ color: "var(--accent-secondary)" }} />
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
            You're about to trust this retailer with thousands of dollars. <br className="hidden sm:block" />
            Find out if they've earned it.
          </h2>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 py-3 text-base font-semibold"
              onClick={handleCheckout}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? <Loader2 className="h-5 w-5 animate-spin" /> : "Check a Retailer — $29"}
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
