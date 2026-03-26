import Link from "next/link"
import { TrendingUp, Calculator, ShieldCheck, FileCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ToolsGridProps {
  locale: string
}

const tools = [
  {
    icon: TrendingUp,
    title: "Diamond Price Tracker",
    description: "Real-time price comparison across leading retailers. Lab-grown and natural diamonds.",
    href: "/diamond-prices",
  },
  {
    icon: Calculator,
    title: "Gold Price Calculator",
    description: "Spot price \u00d7 karat \u00d7 weight. See the real value of any gold piece instantly.",
    href: "/gold-calculator",
  },
  {
    icon: ShieldCheck,
    title: "Is This a Good Deal?",
    description: "Paste any jeweller's product URL. Get an instant fair price verdict.",
    href: "/deal-check",
  },
  {
    icon: FileCheck,
    title: "Certification Verifier",
    description: "Verify IGI and GIA certificates. Flag misrepresentation before you buy.",
    href: "/verify",
  },
]

export function ToolsGrid({ locale }: ToolsGridProps) {
  const prefix = `/${locale}`

  return (
    <section className="py-16 sm:py-20" style={{ background: "var(--background-alt)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Our Tools
        </h2>
        <p className="mt-3 text-center text-base" style={{ color: "var(--text-secondary)" }}>
          Everything you need to make a smarter jewellery purchase
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <Link key={tool.title} href={`${prefix}${tool.href}`}>
              <Card className="group h-full cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors group-hover:text-white"
                    style={{
                      background: "var(--background-alt)",
                      color: "var(--accent-primary)",
                    }}
                  >
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {tool.description}
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium" style={{ color: "var(--accent-primary)" }}>
                    Explore &rarr;
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
