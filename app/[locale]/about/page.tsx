import Link from "next/link"
import { BarChart3, Shield, Eye, Gem } from "lucide-react"

export default function AboutPage({ params }: { params: { locale: string } }) {
  const prefix = `/${params.locale}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>
        About Lustrumo
      </h1>
      <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Lustrumo is an independent jewellery intelligence platform. We provide the data Australian
        consumers need to make informed purchasing decisions — diamond pricing, gold valuations,
        certification verification, and retailer ratings.
      </p>

      {/* Mission */}
      <div className="mt-12">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>What We Do</h2>
        <p className="mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          The jewellery industry relies on information asymmetry. Retailers benefit when consumers
          can&apos;t easily compare prices, verify certifications, or understand what drives value.
          Lustrumo structures the variables that retailers intentionally obscure — separating centre
          stone, setting, and side stone costs so you can see exactly what you&apos;re paying for.
        </p>
        <p className="mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          We are not a price comparison site. We are a value intelligence platform — a truth engine
          for jewellery purchases.
        </p>
      </div>

      {/* Principles */}
      <div className="mt-12">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Our Principles</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[
            {
              icon: BarChart3,
              title: "Data-First",
              body: "Every estimate, rating, and recommendation is backed by verifiable data. We show our confidence scores and never hide uncertainty.",
            },
            {
              icon: Shield,
              title: "Independent",
              body: "We do not accept payment from retailers for favourable ratings. Our revenue comes from consumer tools and future B2B intelligence products.",
            },
            {
              icon: Eye,
              title: "Transparent",
              body: "We unbundle every valuation — centre stone, setting, and side stones are assessed separately. No opaque single-number estimates.",
            },
            {
              icon: Gem,
              title: "Australian-Focused",
              body: "All prices in AUD including GST. All retailers are Australian-based or sell to Australian consumers. Market data reflects the local market.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-lg p-5" style={{ background: "var(--background-alt)" }}>
              <item.icon className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
              <h3 className="mt-3 font-semibold" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="mt-12">
        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Our Tools</h2>
        <div className="mt-4 space-y-3">
          {[
            { label: "Diamond Price Tracker", desc: "Real-time price comparison across Australian retailers.", href: "/diamond-prices" },
            { label: "Gold Price Calculator", desc: "Spot price-based gold valuation by karat and weight.", href: "/gold-calculator" },
            { label: "Deal Checker", desc: "Paste any product URL for an instant fair value verdict.", href: "/deal-check" },
            { label: "Certification Verifier", desc: "Verify GIA and IGI certificates against retailer listings.", href: "/verify" },
          ].map((tool) => (
            <Link key={tool.href} href={`${prefix}${tool.href}`}
              className="flex items-center justify-between rounded-lg p-4 transition-shadow hover:shadow-md"
              style={{ border: "1px solid var(--border)" }}>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{tool.label}</p>
                <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>{tool.desc}</p>
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--accent-primary)" }}>Explore &rarr;</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-12 rounded-lg p-6 text-center" style={{ background: "var(--background-alt)" }}>
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Questions or feedback?</p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          We&apos;d love to hear from you.
        </p>
        <Link href={`${prefix}/contact`}
          className="mt-3 inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white"
          style={{ background: "var(--accent-primary)" }}>
          Contact Us
        </Link>
      </div>
    </div>
  )
}
