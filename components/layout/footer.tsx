import Link from "next/link"

interface FooterProps {
  locale: string
}

export function Footer({ locale }: FooterProps) {
  const prefix = `/${locale}`

  return (
    <footer style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
              Tools
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Diamond Prices", href: "/diamond-prices" },
                { label: "Gold Calculator", href: "/gold-calculator" },
                { label: "Diamond Calculator", href: "/diamond-calculator" },
                { label: "Deal Checker", href: "/deal-check" },
                { label: "Certification Verifier", href: "/verify" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={`${prefix}${link.href}`} className="text-sm transition-colors"
                    style={{ color: "var(--text-secondary)" }}
>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
              Learn
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Lab-Grown Diamonds Guide", href: "/learn/lab-grown-diamonds" },
                { label: "Gold Buying Guide", href: "/learn/gold-buying-guide" },
                { label: "4Cs Explained", href: "/learn/4cs-explained" },
                { label: "All Guides", href: "/learn" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={`${prefix}${link.href}`} className="text-sm transition-colors"
                    style={{ color: "var(--text-secondary)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={`${prefix}${link.href}`} className="text-sm transition-colors"
                    style={{ color: "var(--text-secondary)" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
              Stay Updated
            </h3>
            <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              Weekly price alerts and market insights.
            </p>
            <form className="mt-3 flex flex-col gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="h-10 rounded-lg px-3 text-sm"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="submit"
                className="h-10 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--accent-primary)" }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            &copy; 2026 Lustrumo. Independent jewellery intelligence.
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Lustrumo may earn a commission from retailer links. This never affects our ratings.
          </p>
        </div>
      </div>
    </footer>
  )
}
