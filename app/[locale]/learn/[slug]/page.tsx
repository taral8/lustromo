import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { articles } from "@/lib/articles"

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export default function ArticlePage({ params }: { params: { locale: string; slug: string } }) {
  const article = articles.find(a => a.slug === params.slug)
  if (!article) notFound()

  const prefix = `/${params.locale}`

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link href={`${prefix}/learn`} className="mb-6 inline-flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Learning Centre
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Badge>{article.category}</Badge>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Clock className="h-3 w-3" /> {article.readTime} read
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>
          {article.title}
        </h1>
        <p className="mt-4 text-lg" style={{ color: "var(--text-secondary)" }}>{article.excerpt}</p>
      </div>

      <article className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <p>This article is coming soon. We&apos;re working with industry experts to bring you the most accurate, data-driven guide available.</p>
        <p>In the meantime, try our free tools:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><Link href={`${prefix}/diamond-prices`} style={{ color: "var(--accent-primary)" }}>Diamond Price Tracker</Link> — live prices updated daily</li>
          <li><Link href={`${prefix}/gold-calculator`} style={{ color: "var(--accent-primary)" }}>Gold Price Calculator</Link> — melt value and fair retail ranges</li>
          <li><Link href={`${prefix}/deal-check`} style={{ color: "var(--accent-primary)" }}>Deal Checker</Link> — instant fair price verdicts</li>
        </ul>
      </article>

      {/* Email CTA */}
      <div className="mt-12 rounded-lg p-6 text-center" style={{ background: "var(--background-alt)" }}>
        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Get notified when this guide is published</p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Plus weekly jewellery intelligence — price alerts, new guides, and market insights.
        </p>
        <form className="mx-auto mt-4 flex max-w-md gap-2">
          <Input placeholder="your@email.com" type="email" />
          <Button>Subscribe</Button>
        </form>
      </div>
    </div>
  )
}
