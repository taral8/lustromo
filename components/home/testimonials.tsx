import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    quote: "Lustrumo's gold calculator saved me from overpaying for my wedding necklace. The making charge breakdown was eye-opening.",
    name: "Priya K.",
    context: "Melbourne, 22K Gold Necklace Buyer",
  },
  {
    quote: "I used the deal checker before purchasing my engagement ring. Turns out the retailer was 18% above fair value. Found a better deal the same day.",
    name: "James T.",
    context: "Sydney, Engagement Ring Buyer",
  },
  {
    quote: "As a first-time diamond buyer, the certification verifier gave me confidence that what I was buying was genuine and fairly priced.",
    name: "Sarah M.",
    context: "Brisbane, Lab-Grown Diamond Buyer",
  },
]

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Trusted by Buyers Across Australia
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-base italic leading-relaxed" style={{ color: "#334155" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
                  &mdash; {t.name}, {t.context}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
