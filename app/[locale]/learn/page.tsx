"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale-context"
import { articles } from "@/lib/articles"

const categories = ["All", "Lab-Grown Diamonds", "Gold Buying", "Certification", "Market Trends"]

export default function LearnPage() {
  const locale = useLocale()
  const prefix = `/${locale}`
  const [category, setCategory] = useState("All")

  const filtered = category === "All" ? articles : articles.filter(a => a.category === category)
  const featured = filtered.filter(a => a.featured)
  const rest = filtered.filter(a => !a.featured)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>Learn</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Expert guides for smarter jewellery buying.</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: category === cat ? "var(--accent-primary)" : "#fff",
              color: category === cat ? "#fff" : "var(--text-secondary)",
              border: category === cat ? "none" : "1px solid var(--border)",
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Featured cornerstone articles */}
      {featured.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>In-depth guides</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(article => (
              <Link key={article.slug} href={`${prefix}/learn/${article.slug}`}>
                <Card className="group h-full cursor-pointer transition-shadow hover:shadow-md" style={{ borderColor: "rgba(13,148,136,0.2)", borderWidth: 2 }}>
                  <CardContent className="p-0">
                    <div className="h-40 overflow-hidden rounded-t-lg">
                      <img src={article.image} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Badge>{article.category}</Badge>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{article.readTime} read</span>
                      </div>
                      <h2 className="mt-3 font-semibold transition-colors group-hover:text-[var(--accent-primary)]" style={{ color: "var(--text-primary)" }}>
                        {article.title}
                      </h2>
                      <p className="mt-2 text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                        {article.excerpt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other articles */}
      {rest.length > 0 && (
        <div className="mt-10">
          {featured.length > 0 && (
            <span className="mb-4 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>More guides</span>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map(article => (
              <Link key={article.slug} href={`${prefix}/learn/${article.slug}`}>
                <Card className="group h-full cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="h-40 overflow-hidden rounded-t-lg">
                      <img src={article.image} alt={article.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Badge>{article.category}</Badge>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{article.readTime} read</span>
                      </div>
                      <h2 className="mt-3 font-semibold transition-colors group-hover:text-[var(--accent-primary)]" style={{ color: "var(--text-primary)" }}>
                        {article.title}
                      </h2>
                      <p className="mt-2 text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {article.excerpt}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
