"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    // Check if previously dismissed
    if (sessionStorage.getItem("lustrumo-install-dismissed")) {
      setDismissed(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (isStandalone || dismissed || !deferredPrompt) return null

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDeferredPrompt(null)
    }
  }

  function handleDismiss() {
    setDismissed(true)
    sessionStorage.setItem("lustrumo-install-dismissed", "1")
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="flex items-center gap-3 rounded-xl p-4 shadow-lg" style={{
        background: "var(--surface-dark)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--accent-primary)" }}>
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Install Lustrumo</p>
          <p className="text-xs" style={{ color: "var(--surface-dark-text)" }}>
            Add to home screen for instant access.
          </p>
        </div>
        <button onClick={handleInstall}
          className="shrink-0 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          style={{ background: "var(--accent-primary)" }}>
          Install
        </button>
        <button onClick={handleDismiss} className="shrink-0 p-1" style={{ color: "var(--surface-dark-text)" }}>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
