"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useState } from "react"
import { useLocale } from "@/lib/locale-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

const navLinks = [
  { label: "Diamond Prices", href: "/diamond-prices" },
  { label: "Gold Calculator", href: "/gold-calculator" },
  { label: "Deal Checker", href: "/deal-check" },
]

const toolsLinks = [
  { label: "Diamond Price Calculator", href: "/diamond-calculator" },
  { label: "Certification Verifier", href: "/verify" },
  { label: "Retailer Scorecard", href: "/retailers" },
]


export function Navbar() {
  const locale = useLocale()
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const prefix = `/${locale}`

  function isActive(href: string) {
    return pathname === `${prefix}${href}`
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
      style={{ borderBottom: "1px solid var(--border)", height: 64 }}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={prefix} className="flex items-center text-xl font-bold">
          <span style={{ color: "var(--text-primary)" }}>Lustrum</span>
          <span style={{ color: "var(--accent-primary)" }}>o</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={`${prefix}${link.href}`}
              className="rounded-lg px-3 py-2 text-[15px] font-medium transition-colors"
              style={{
                color: isActive(link.href) ? "var(--accent-primary)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = "var(--text-primary)" }}
              onMouseLeave={(e) => { if (!isActive(link.href)) e.currentTarget.style.color = "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}>
                Tools
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mt-0.5">
                  <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {toolsLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={`${prefix}${link.href}`} className="cursor-pointer">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Learn link */}
          <Link
            href={`${prefix}/learn`}
            className="rounded-lg px-3 py-2 text-[15px] font-medium transition-colors"
            style={{ color: isActive("/learn") ? "var(--accent-primary)" : "var(--text-secondary)" }}
          >
            Learn
          </Link>
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={`${prefix}/sign-in`}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign In
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="rounded-lg p-2 md:hidden" style={{ color: "var(--text-secondary)" }}>
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="text-lg font-bold">
              <span style={{ color: "var(--text-primary)" }}>Lustrum</span>
              <span style={{ color: "var(--accent-primary)" }}>o</span>
            </SheetTitle>
            <div className="mt-6 flex flex-col gap-1">
              {[...navLinks, ...toolsLinks, { label: "Learning Centre", href: "/learn" }].map((link) => (
                <Link
                  key={link.href}
                  href={`${prefix}${link.href}`}
                  onClick={() => setSheetOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors"
                  style={{ color: isActive(link.href) ? "var(--accent-primary)" : "var(--text-secondary)" }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3" style={{ borderTop: "1px solid var(--border)" }} />
              <Link
                href={`${prefix}/sign-in`}
                onClick={() => setSheetOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Sign In
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
