import type { Metadata } from "next"
import { HeroSection } from "@/components/home/hero-section"
import { ShapeSelector } from "@/components/home/shape-selector"
import { ToolsGrid } from "@/components/home/tools-grid"
import { HowItWorks } from "@/components/home/how-it-works"
import { PriceSnapshot } from "@/components/home/price-snapshot"
import { Testimonials } from "@/components/home/testimonials"
import { PricingSection } from "@/components/home/pricing-section"
import { getPlatformStats } from "@/lib/platform-stats"

export const metadata: Metadata = {
  title: "Lustrumo — Independent Diamond & Gold Price Intelligence",
  description:
    "Compare diamond prices, calculate gold values, verify certifications, and check retailer ratings. Independent jewellery intelligence for smarter buying decisions.",
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const stats = await getPlatformStats()

  return (
    <>
      <HeroSection locale={params.locale} stats={stats} />
      <ShapeSelector />
      <ToolsGrid locale={params.locale} />
      <HowItWorks />
      <PriceSnapshot locale={params.locale} />
      <PricingSection locale={params.locale} />
      <Testimonials />
    </>
  )
}
