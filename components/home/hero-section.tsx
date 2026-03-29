import Link from "next/link"
import { Button } from "@/components/ui/button"
import { type PlatformStats, formatStatNumber } from "@/lib/platform-stats"

interface HeroSectionProps {
  locale: string
  stats: PlatformStats
}

export function HeroSection({ locale, stats }: HeroSectionProps) {
  const prefix = `/${locale}`
  const totalProducts = stats.diamondCount + stats.goldCount

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--surface-dark)" }}>
      {/* Gradient mesh */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(13,148,136,0.25)" }} />
        <div className="absolute -right-16 top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "rgba(59,130,246,0.15)" }} />
        <div className="absolute bottom-0 left-1/3 h-40 w-80 rounded-full blur-3xl" style={{ background: "rgba(13,148,136,0.15)" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[600px] text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Independent Jewellery Intelligence
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-lg" style={{ color: "rgba(241,245,249,0.75)" }}>
            Diamond prices, gold valuations, retailer ratings, and certification
            verification — the data you need before you buy
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="px-6 py-3 font-semibold" asChild>
              <Link href={`${prefix}/diamond-prices`}>Check Diamond Prices</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-white/10 px-6 py-3 font-semibold text-white hover:border-white/60 hover:bg-white/20 hover:text-white"
              asChild
            >
              <Link href={`${prefix}/gold-prices`}>Check Gold Price</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: formatStatNumber(totalProducts), label: "Products Tracked" },
              { value: "Live", label: "Diamond Prices" },
              { value: "Live", label: "Gold Prices" },
              { value: formatStatNumber(stats.goldCount), label: "Gold Products Analysed" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
