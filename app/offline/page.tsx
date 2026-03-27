"use client"

import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "var(--background-alt)" }}>
        <WifiOff className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
      </div>
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>You&apos;re Offline</h1>
      <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--text-secondary)" }}>
        Lustrumo needs an internet connection to fetch live diamond prices, gold rates, and retailer data.
        Check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-lg px-6 py-2.5 text-sm font-medium text-white"
        style={{ background: "var(--accent-primary)" }}
      >
        Try Again
      </button>
    </div>
  )
}
