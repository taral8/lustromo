"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/charts/sparkline"

interface PriceSnapshotProps {
  locale: string
}

interface GoldPrice {
  pricePerGram: number
  source: string
  changePercent24h: number | null
}

// Diamond cards use placeholder data (will be live once price history builds)
const diamondCards = [
  {
    label: "1ct Lab-Grown Round",
    price: 1420,
    change: -3.2,
    data: [1500, 1490, 1475, 1460, 1445, 1435, 1425, 1420, 1420],
    href: "/diamond-prices",
  },
  {
    label: "1ct Natural Round",
    price: 8850,
    change: -1.8,
    data: [9010, 8990, 8960, 8940, 8910, 8880, 8860, 8850, 8850],
    href: "/diamond-prices",
  },
]

const KARAT_22_PURITY = 0.916
const KARAT_18_PURITY = 0.750

export function PriceSnapshot({ locale }: PriceSnapshotProps) {
  const prefix = `/${locale}`
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null)

  useEffect(() => {
    fetch("/api/gold-price")
      .then(res => res.json())
      .then(data => {
        if (data?.pricePerGram) setGoldPrice(data)
      })
      .catch(() => { /* use fallback */ })
  }, [])

  // Compute gold per gram by karat from 24K spot
  const spot24k = goldPrice?.pricePerGram ?? 148.50
  const gold22k = Math.round(spot24k * KARAT_22_PURITY * 100) / 100
  const gold18k = Math.round(spot24k * KARAT_18_PURITY * 100) / 100
  const goldChange = goldPrice?.changePercent24h ?? null
  const isLive = goldPrice !== null && goldPrice.source !== "fallback"

  // Build sparkline placeholders based on current price (trending upward)
  const spark22k = Array.from({ length: 9 }, (_, i) => Math.round((gold22k * (0.97 + i * 0.003 + Math.random() * 0.002)) * 100) / 100)
  const spark18k = Array.from({ length: 9 }, (_, i) => Math.round((gold18k * (0.97 + i * 0.003 + Math.random() * 0.002)) * 100) / 100)

  const allCards = [
    ...diamondCards.map(c => ({
      label: c.label,
      price: `$${c.price.toLocaleString("en-AU")} AUD`,
      change: c.change,
      data: c.data,
      href: c.href,
      isLive: false,
    })),
    {
      label: "22K Gold per gram",
      price: `$${gold22k.toFixed(2)} AUD`,
      change: goldChange,
      data: spark22k,
      href: "/gold-calculator",
      isLive,
    },
    {
      label: "18K Gold per gram",
      price: `$${gold18k.toFixed(2)} AUD`,
      change: goldChange,
      data: spark18k,
      href: "/gold-calculator",
      isLive,
    },
  ]

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
          {allCards.map((card) => (
            <Link key={card.label} href={`${prefix}${card.href}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {card.label}
                    </p>
                    {card.isLive && (
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white" style={{ background: "var(--accent-success)" }}>
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="mt-2 font-mono text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {card.price}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Sparkline data={card.data} width={120} height={32} />
                    {card.change !== null ? (
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
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
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
