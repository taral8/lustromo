import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Store, Star } from "lucide-react"

const placeholderRetailers = [
  { name: "Novita Diamonds", score: 87, location: "Melbourne, VIC", type: "Online + Physical", speciality: "Lab-Grown" },
  { name: "Michael Hill", score: 72, location: "National", type: "Physical", speciality: "Traditional" },
  { name: "Diamonds Direct", score: 81, location: "Sydney, NSW", type: "Online", speciality: "Engagement" },
]

export default function RetailersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <Store className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>Retailer Scorecard</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Independent ratings for jewellery retailers.</p>
        </div>
      </div>

      <Card className="mt-8">
        <CardContent className="p-6 text-center">
          <Badge style={{ background: "var(--accent-warning)", color: "#fff" }}>Coming Soon</Badge>
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
            We&apos;re building independent ratings for jewellery retailers across Australia — covering pricing fairness,
            certification practices, service quality, and returns policies.
          </p>
          <form className="mx-auto mt-6 flex max-w-sm gap-2">
            <Input placeholder="your@email.com" type="email" />
            <Button>Notify Me</Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview cards */}
      <h2 className="mt-12 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Preview: Rating Format</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {placeholderRetailers.map(r => (
          <Card key={r.name}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</h3>
                <span className="flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-bold text-white"
                  style={{ background: r.score >= 80 ? "var(--accent-success)" : r.score >= 60 ? "var(--accent-warning)" : "var(--accent-danger)" }}>
                  {r.score}
                </span>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{r.location}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary" className="text-[10px]">{r.type}</Badge>
                <Badge variant="secondary" className="text-[10px]">{r.speciality}</Badge>
              </div>
              <div className="mt-3 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5" style={{ color: i < Math.round(r.score / 20) ? "#F59E0B" : "var(--border)", fill: i < Math.round(r.score / 20) ? "#F59E0B" : "none" }} />
                ))}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>[Sample Data]</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
