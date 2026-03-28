"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale-context"

interface ArticleLayoutProps {
  title: string
  category: string
  readTime: string
  publishedDate: string
  children: React.ReactNode
  jsonLd: object
}

export function ArticleLayout({ title, category, readTime, publishedDate, children, jsonLd }: ArticleLayoutProps) {
  const locale = useLocale()
  const prefix = `/${locale}`
  const [tocItems, setTocItems] = useState<{ id: string; text: string }[]>([])

  useEffect(() => {
    const headings = document.querySelectorAll("article h2")
    const items: { id: string; text: string }[] = []
    headings.forEach((h, i) => {
      const id = h.id || `section-${i}`
      if (!h.id) h.id = id
      items.push({ id, text: h.textContent || "" })
    })
    setTocItems(items)
  }, [])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link href={`${prefix}/learn`} className="mb-6 inline-flex items-center gap-1 text-sm" style={{ color: "var(--accent-primary)" }}>
          <ArrowLeft className="h-4 w-4" /> All guides
        </Link>

        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-12">
          {/* Main content */}
          <div>
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge>{category}</Badge>
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <Clock className="h-3 w-3" /> {readTime} read
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <User className="h-3 w-3" /> Lustrumo Research Team
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{publishedDate}</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
                {title}
              </h1>
            </div>

            <article className="article-content">
              {children}
            </article>
          </div>

          {/* Table of contents sidebar (desktop) */}
          {tocItems.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  On this page
                </p>
                <nav className="space-y-1.5">
                  {tocItems.map(item => (
                    <a key={item.id} href={`#${item.id}`}
                      className="block text-sm leading-snug transition-colors hover:text-[var(--accent-primary)]"
                      style={{ color: "var(--text-secondary)" }}>
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Reusable article sub-components ───

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0" id={id}>
      <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-[1.7]" style={{ color: "var(--text-secondary)", fontSize: "18px" }}>{children}</p>
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-lg p-5" style={{ background: "rgba(240,253,250,0.5)", borderLeft: "4px solid var(--accent-primary)" }}>
      <div className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-primary)" }}>{children}</div>
    </div>
  )
}

export function ToolCTA({ title, description, href, cta }: { title: string; description: string; href: string; cta: string }) {
  return (
    <Link href={href} className="my-6 block rounded-lg p-5 transition-shadow hover:shadow-md" style={{ border: "1px solid var(--border)", background: "var(--background-alt)" }}>
      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{description}</p>
      <p className="mt-2 text-sm font-medium" style={{ color: "var(--accent-primary)" }}>{cta} &rarr;</p>
    </Link>
  )
}

export function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--background-alt)" }}>
            {headers.map(h => (
              <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5" style={{ color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontFamily: j > 0 ? "var(--font-jetbrains-mono), monospace" : "inherit" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
