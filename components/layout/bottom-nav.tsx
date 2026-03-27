"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Diamond, Coins, ShieldCheck, FileCheck, BookOpen } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

const tabs = [
  { label: "Diamonds", href: "/diamond-prices", icon: Diamond },
  { label: "Gold", href: "/gold-calculator", icon: Coins },
  { label: "Deal Check", href: "/deal-check", icon: ShieldCheck },
  { label: "Verify", href: "/verify", icon: FileCheck },
  { label: "Learn", href: "/learn", icon: BookOpen },
]

export function BottomNav() {
  const locale = useLocale()
  const pathname = usePathname()
  const prefix = `/${locale}`

  function isActive(href: string) {
    return pathname === `${prefix}${href}` || pathname.startsWith(`${prefix}${href}/`)
  }

  return (
    <nav className="bottom-nav" style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid var(--border)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={`${prefix}${tab.href}`}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors"
              style={{ color: active ? "var(--accent-primary)" : "var(--text-muted)" }}
            >
              <tab.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
