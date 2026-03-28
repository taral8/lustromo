"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLocale } from "@/lib/locale-context"

export default function PremiumSuccessPage() {
  const locale = useLocale()
  const prefix = `/${locale}`
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(16,185,129,0.1)" }}>
            <CheckCircle className="h-8 w-8" style={{ color: "var(--accent-success)" }} />
          </div>

          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Thank you!
          </h1>
          <p className="mt-2 text-lg" style={{ color: "var(--text-secondary)" }}>
            Your purchase is confirmed.
          </p>

          <div className="mt-6 space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>For reports:</strong> Your report will be
              delivered to your email within 24 hours. Check your inbox (and spam folder).
            </p>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>For membership:</strong> Welcome to Lustrumo.
              Your annual membership is now active. You have unlimited deal checks and 50% off all premium reports.
            </p>
          </div>

          {sessionId && (
            <p className="mt-4 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
              Reference: {sessionId.slice(0, 20)}...
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <Link href={prefix}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ background: "var(--accent-primary)" }}>
              Back to Lustrumo
            </Link>
            <Link href={`${prefix}/deal-check`}
              className="rounded-lg px-5 py-2.5 text-sm font-medium"
              style={{ color: "var(--accent-primary)", border: "1px solid var(--border)" }}>
              Check a Deal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
