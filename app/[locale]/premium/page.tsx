import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const products = [
  {
    title: "Diamond Intelligence Report",
    price: "$49–$97",
    description: "Personalised top-5 stone recommendations, fair price analysis, and certification verification.",
    cta: "Get Your Report — from $49",
    features: ["Top-5 stone recommendations", "Fair price analysis for each", "Certification verification", "Retailer comparison", "Delivered within 24 hours"],
    highlighted: false,
  },
  {
    title: "Gold Valuation Report",
    price: "$29–$49",
    description: "Melt value analysis, making charge assessment, and comparable pricing for any gold piece.",
    cta: "Get Gold Valuation — from $29",
    features: ["Melt value calculation", "Making charge fairness assessment", "Comparable market pricing", "Retailer price comparison", "PDF report delivered via email"],
    highlighted: false,
  },
  {
    title: "Retailer Due Diligence Report",
    price: "$29–$49",
    description: "Business verification, complaint history, pricing analysis, and review sentiment for any retailer.",
    cta: "Check a Retailer — from $29",
    features: ["Business registration check", "Online review sentiment analysis", "Pricing fairness score", "Return policy assessment", "Complaint history overview"],
    highlighted: false,
  },
  {
    title: "Annual Membership",
    price: "$149/year",
    description: "Unlimited deal checks, 50% off all reports, monthly market intelligence, priority access.",
    cta: "Join Lustrumo — $149/year",
    features: ["Unlimited deal checks", "50% off all premium reports", "Monthly market intelligence email", "Priority access to new tools", "Member-only pricing data"],
    highlighted: true,
  },
]

export default function PremiumPage() {
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

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map(product => (
          <Card key={product.title}
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
              <Button className="w-full font-semibold" variant={product.highlighted ? "default" : "outline"}>
                {product.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
