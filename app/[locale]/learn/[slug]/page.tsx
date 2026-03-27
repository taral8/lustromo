import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { articles, getArticleBySlug } from "@/lib/articles"

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export default function ArticlePage({ params }: { params: { locale: string; slug: string } }) {
  const article = getArticleBySlug(params.slug)
  if (!article) notFound()

  const prefix = `/${params.locale}`
  const hasContent = article.content && article.content.length > 0
  const related = articles.filter(a => a.category === article.category && a.slug !== params.slug).slice(0, 2)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Back link */}
      <Link href={`${prefix}/learn`} className="mb-6 inline-flex items-center gap-1 text-sm" style={{ color: "var(--accent-primary)" }}>
        <ArrowLeft className="h-4 w-4" /> All guides
      </Link>

      {/* Article header */}
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

      {/* Full article content */}
      {hasContent ? (
        <>
          <div className="space-y-10">
            {article.content!.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold sm:text-2xl" style={{ color: "var(--text-primary)" }}>
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-4">
                  {section.body.split("\n\n").map((para, j) => (
                    <p key={j} className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Tools CTA */}
          <Card className="mt-12">
            <CardContent className="p-6 text-center">
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Ready to check prices?
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                Use Lustrumo&apos;s free tools to verify fair value before you buy.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link href={`${prefix}/diamond-prices`}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                  style={{ background: "var(--accent-primary)" }}>
                  Check Diamond Prices
                </Link>
                <Link href={`${prefix}/gold-calculator`}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium"
                  style={{ color: "var(--accent-primary)", border: "1px solid var(--border)" }}>
                  Gold Calculator
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Coming soon state for articles without content */
        <>
          <article className="space-y-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <div className="flex items-center gap-3 rounded-lg p-4" style={{ background: "var(--background-alt)" }}>
              <BookOpen className="h-5 w-5 shrink-0" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm">This guide is coming soon. We&apos;re working with industry experts to bring you the most accurate, data-driven guide available.</p>
            </div>
            <p>In the meantime, try our free tools:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li><Link href={`${prefix}/diamond-prices`} style={{ color: "var(--accent-primary)" }}>Diamond Price Tracker</Link> — live prices updated daily</li>
              <li><Link href={`${prefix}/gold-calculator`} style={{ color: "var(--accent-primary)" }}>Gold Price Calculator</Link> — melt value and fair retail ranges</li>
              <li><Link href={`${prefix}/deal-check`} style={{ color: "var(--accent-primary)" }}>Deal Checker</Link> — instant fair price verdicts</li>
            </ul>
          </article>

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
        </>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <div className="mt-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Related Guides
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map(r => (
              <Link key={r.slug} href={`${prefix}/learn/${r.slug}`}>
                <Card className="group h-full cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <Badge>{r.category}</Badge>
                    <h4 className="mt-2 font-semibold transition-colors group-hover:text-[var(--accent-primary)]" style={{ color: "var(--text-primary)" }}>
                      {r.title}
                    </h4>
                    <p className="mt-1 text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>{r.excerpt}</p>
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
