"use client"

import Link from "next/link"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/charts/sparkline"

interface PriceSnapshotProps {
  locale: string
}

const priceCards = [
  {
    label: "1ct Lab-Grown Round",
    price: "$1,420 AUD",
    change: -3.2,
    data: [1500, 1490, 1475, 1460, 1445, 1435, 1425, 1420, 1420],
  },
  {
    label: "1ct Natural Round",
    price: "$8,850 AUD",
    change: -1.8,
    data: [9010, 8990, 8960, 8940, 8910, 8880, 8860, 8850, 8850],
  },
  {
    label: "22K Gold per gram",
    price: "$98.40 AUD",
    change: 2.1,
    data: [96.10, 96.50, 96.80, 97.20, 97.50, 97.80, 98.00, 98.20, 98.40],
  },
  {
    label: "18K Gold per gram",
    price: "$72.30 AUD",
    change: 1.9,
    data: [70.80, 71.00, 71.20, 71.50, 71.70, 71.90, 72.00, 72.15, 72.30],
  },
]

export function PriceSnapshot({ locale }: PriceSnapshotProps) {
  const prefix = `/${locale}`

  return (
    <section className="py-16 sm:py-20" style={{ background: "var(--background-alt)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Live Price Snapshot
          </h2>
          <Link
            href={`${prefix}/diamond-prices`}
            className="hidden text-sm font-medium sm:inline-flex"
            style={{ color: "var(--accent-primary)" }}
          >
            View All Prices &rarr;
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {priceCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {card.label}
                </p>
                <div className="mt-2 font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {card.price}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Sparkline data={card.data} width={120} height={32} />
                  <span
                    className="flex items-center gap-1 font-mono text-sm font-semibold"
                    style={{ color: card.change >= 0 ? "var(--accent-success)" : "var(--accent-danger)" }}
                  >
                    {card.change >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {card.change >= 0 ? "+" : ""}{card.change}%
                    <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>(30d)</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Link
          href={`${prefix}/diamond-prices`}
          className="mt-6 flex items-center justify-center text-sm font-medium sm:hidden"
          style={{ color: "var(--accent-primary)" }}
        >
          View All Prices &rarr;
        </Link>
      </div>
    </section>
  )
}
