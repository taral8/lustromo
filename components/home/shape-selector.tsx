"use client"

import Link from "next/link"
import { useLocale } from "@/lib/locale-context"
import {
  RoundSVG, CushionSVG, OvalSVG, PrincessSVG, EmeraldSVG,
  PearSVG, RadiantSVG, AsscherSVG, MarquiseSVG, HeartSVG,
} from "@/components/tools/diamond-shapes"

const shapes = [
  { name: "Round", Icon: RoundSVG },
  { name: "Cushion", Icon: CushionSVG },
  { name: "Oval", Icon: OvalSVG },
  { name: "Princess", Icon: PrincessSVG },
  { name: "Emerald", Icon: EmeraldSVG },
  { name: "Pear", Icon: PearSVG },
  { name: "Radiant", Icon: RadiantSVG },
  { name: "Asscher", Icon: AsscherSVG },
  { name: "Marquise", Icon: MarquiseSVG },
  { name: "Heart", Icon: HeartSVG },
]

export function ShapeSelector() {
  const locale = useLocale()
  const prefix = `/${locale}`

  return (
    <section className="py-16 sm:py-20" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="mx-auto max-w-[900px] rounded-2xl px-6 py-10 sm:px-10 sm:py-12"
          style={{
            background: "linear-gradient(135deg, #0F172A 0%, #134E4A 50%, #0D9488 100%)",
          }}
        >
          <h2 className="mb-8 text-center text-xl font-semibold text-white">
            Search diamonds by shape
          </h2>

          {/* Row 1 */}
          <div className="grid grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-8">
            {shapes.slice(0, 5).map(({ name, Icon }) => (
              <Link
                key={name}
                href={`${prefix}/diamond-prices?shape=${name.toLowerCase()}`}
                className="group flex flex-col items-center gap-2 transition-transform duration-150 hover:scale-105"
              >
                <div className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                  <Icon className="h-full w-full" />
                </div>
                <span className="text-xs font-medium sm:text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {name}
                </span>
              </Link>
            ))}
          </div>

          {/* Row 2 */}
          <div className="mt-6 grid grid-cols-5 gap-x-4 gap-y-6 sm:gap-x-8">
            {shapes.slice(5).map(({ name, Icon }) => (
              <Link
                key={name}
                href={`${prefix}/diamond-prices?shape=${name.toLowerCase()}`}
                className="group flex flex-col items-center gap-2 transition-transform duration-150 hover:scale-105"
              >
                <div className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                  <Icon className="h-full w-full" />
                </div>
                <span className="text-xs font-medium sm:text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
