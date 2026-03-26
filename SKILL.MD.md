---
name: lustrumo
description: "Lustrumo platform skill. Use this skill whenever working on any aspect of lustrumo.com — including frontend development, backend APIs, content creation, SEO, marketing copy, product pages, tool interfaces, data pipeline work, or any code changes. This skill contains the authoritative brand voice, design system, SEO strategy, content guidelines, product architecture, and growth rules. MUST be consulted before making ANY changes to the Lustrumo codebase, writing any content, or creating any marketing materials."
---

# Lustrumo Platform Skill

## Purpose

This is the single source of truth for Lustrumo (lustrumo.com). Every developer session, content creation task, design decision, and marketing asset must align with this document. If something contradicts this file, this file wins.

---

## 1. Brand Identity

### Core

- **Name:** Lustrumo
- **Domain:** lustrumo.com
- **Tagline:** "Independent Jewellery Intelligence"
- **What it is:** An independent, data-driven platform that helps consumers make informed diamond and gold jewellery purchasing decisions through price intelligence, certification verification, retailer ratings, and premium reports.
- **What it is NOT:** A jewellery store. A retailer. An affiliate blog. A marketplace. A jeweller directory.

### Brand Positioning

Lustrumo is the Bloomberg of jewellery buying. It sits between the consumer and the jewellery industry as an independent intelligence layer. It does not sell jewellery. It sells confidence.

**Position statement:** "For consumers making $1,000–$50,000+ jewellery purchases, Lustrumo provides independent price intelligence, certification verification, and retailer ratings so they can buy with confidence — not hope."

### Logo Treatment

- "Lustrumo" rendered as a single word in `--text-primary` (#0F172A), weight 700
- The "o" at the end can optionally be rendered in `--accent-primary` (#0D9488) for subtle brand accent — or keep fully navy for a cleaner look. Test both.
- Always render as one word: Lustrumo (not LUSTRUMO, not lustrumo in body copy)
- Minimum clear space: 8px on all sides
- On dark backgrounds: "Lustrumo" in white (#F1F5F9), with optional teal "o" accent
- Favicon: "L" lettermark in teal (#0D9488) on dark navy (#0F172A) rounded square

### Internationalisation

- URL structure: `lustrumo.com/[locale]/...` where locale = au, nz, uk, us
- Root domain `lustrumo.com` redirects to `/au` (launch market)
- Locale config object determines currency, spelling, flag, and market-specific content
- Launch market: Australia (/au). Expansion: NZ, UK, US.
- Use "jewellery" spelling for AU/UK/NZ markets, "jewelry" for US market
- All locale-specific text must use the locale config — never hardcode currency symbols or country names

```ts
const locales = {
  au: { currency: 'AUD', symbol: '$', flag: '🇦🇺', label: 'Australia', spelling: 'jewellery', goldUnit: 'gram' },
  us: { currency: 'USD', symbol: '$', flag: '🇺🇸', label: 'United States', spelling: 'jewelry', goldUnit: 'gram' },
  uk: { currency: 'GBP', symbol: '£', flag: '🇬🇧', label: 'United Kingdom', spelling: 'jewellery', goldUnit: 'gram' },
  nz: { currency: 'NZD', symbol: '$', flag: '🇳🇿', label: 'New Zealand', spelling: 'jewellery', goldUnit: 'gram' },
}
```

---

## 2. Brand Voice & Copy Guidelines

### How Lustrumo Sounds

- **Authoritative but approachable.** We know the data. We explain it simply.
- **Direct.** Short sentences. Clear conclusions. No hedging.
- **Data-first.** Every claim is backed by a number. "Lab-grown diamonds cost 60–82% less" not "lab-grown diamonds are much cheaper."
- **Independent.** We never favour a retailer, brand, or product category. Our opinions are based on data, not relationships.
- **Australian English for /au** (colour, jewellery, analyse, centre). American English for /us (color, jewelry, analyze, center). Controlled by locale config.

### We Sound Like:
- A knowledgeable friend who works in the diamond industry and has no agenda
- A financial analyst who happens to specialise in jewellery markets
- The person you'd text before making a big jewellery purchase

### We DO:
- Use plain language (not industry jargon unless explained)
- Lead with numbers and data
- Use second person: "you", "your"
- Acknowledge that buying jewellery is both emotional and financial
- Present comparisons fairly (lab-grown vs natural, gold vs diamond)
- Use short paragraphs (3 lines max on desktop)
- Include specific dollar amounts in AUD (or locale currency) where possible

### We DO NOT:
- Use hype words: "stunning", "breathtaking", "amazing", "incredible", "revolutionary"
- Use urgency tactics: "limited time", "only X left", "act now", "don't miss out"
- Use corporate jargon: "leverage", "synergies", "ecosystem", "empower", "best-in-class"
- Reference AI, AI-generated, AI-powered, or machine learning in consumer-facing copy — EVER
- Criticise specific retailers by name (data speaks for itself)
- Promise outcomes: "you will save money", "guaranteed best price"
- Sound like a jewellery store marketing page
- Use exclamation marks (one per page maximum)

### Tone Calibration:
- 60% informative, 25% empathetic, 15% assertive
- Never condescending. Never salesy. Never preachy.
- If copy sounds like a brochure, rewrite it.
- If copy sounds like a data terminal, add one human sentence.
- Read it aloud — if it sounds like a person talking to a friend over coffee about diamonds, it's right.

### Headlines Formula:
- BAD: "Lustrumo Diamond Price Calculator — Advanced Price Estimation Tool"
- GOOD: "How much should this diamond actually cost?"
- Rule: Headlines are about THE BUYER'S SITUATION, not the product's features.

### CTA Copy:
- BAD: "Submit" / "Buy Now" / "Click Here"
- GOOD: "Check This Price" / "Calculate Gold Value" / "Verify Certificate" / "Get Your Report — $49"
- Rule: CTA text describes WHAT HAPPENS NEXT, not the action of clicking.

---

## 3. Design System

### Colour Palette

```css
/* Backgrounds */
--background: #FFFFFF;
--background-alt: #F8FAFC;
--background-card: #FFFFFF;
--surface-dark: #0F172A;
--surface-dark-text: #F1F5F9;

/* Borders */
--border: #E2E8F0;
--border-hover: #CBD5E1;

/* Text */
--text-primary: #0F172A;
--text-secondary: #475569;
--text-muted: #94A3B8;

/* Accents */
--accent-primary: #0D9488;      /* Teal — primary CTAs, active states */
--accent-primary-hover: #0F766E;
--accent-secondary: #3B82F6;    /* Blue — links, secondary actions */
--accent-danger: #EF4444;       /* Red — price drops, negative changes */
--accent-success: #10B981;      /* Green — price rises, good deals */
--accent-warning: #F59E0B;      /* Amber — caution, moderate ratings */
```

### Typography

- **Headings:** `Inter` or `Plus Jakarta Sans` — 700 for h1/h2, 600 for h3/h4
- **Body:** `Inter` — 400, line-height 1.6
- **Data/numbers/prices:** `JetBrains Mono` or `IBM Plex Mono` — monospace for all financial figures, percentages, calculator outputs
- **Never use:** Arial, Roboto, system fonts, decorative/script fonts
- **Size scale:** Follow Tailwind defaults (text-xs through text-4xl)

### Layout Rules

1. **Max content width:** 1280px (max-w-7xl), centred
2. **Page padding:** px-4 on mobile, px-6 on tablet, px-8 on desktop
3. **Section spacing:** py-16 minimum between major page sections
4. **Card spacing:** gap-6 in grids
5. **Mobile-first:** Every layout must work on 375px width. No horizontal scrolling ever.
6. **Tool pages:** Input panel left (or top on mobile), output panel right (or bottom on mobile). Clear visual separation between input and output.

### Component Patterns (shadcn/ui base)

- **Cards:** white bg, 1px border (#E2E8F0), rounded-lg, shadow-sm. Hover: shadow-md transition.
- **Buttons:** Primary = teal bg (#0D9488), white text, rounded-lg. Secondary = outlined with border. Ghost = no bg/border.
- **Pills/Tabs:** Horizontal row of selectable options (shape selectors, timeframe selectors, origin toggles). Active state: teal bg + white text. Inactive: grey bg + dark text.
- **Price changes:** Green text + ▲ for positive, red text + ▼ for negative. Always show percentage with one decimal place.
- **Charts:** Recharts. Teal line (#0D9488) for primary data. Grey (#94A3B8) for secondary/comparison. Red/green fill for negative/positive areas. Responsive containers. Tooltips on hover.
- **Tables:** Alternating row backgrounds (#FFFFFF / #F8FAFC). Sticky header. Sortable columns where applicable.
- **Sparklines:** Inline mini charts in table cells. 80px wide, 24px tall. Single teal line, no axes, no labels.
- **Trust badges:** Small pill-shaped badges — "Independent" (teal), "Updated Daily" (blue), "Free Tool" (green), "Premium" (amber).

### Responsive Breakpoints

- Mobile: < 768px — single column, stacked layouts, hamburger nav
- Tablet: 768–1024px — 2-column grids, condensed nav
- Desktop: > 1024px — full layout, sticky sidebar on tool pages, expanded nav

### Animation Rules

- Subtle only. No flashy transitions, no parallax, no scroll-jacking.
- Page load: fade-in (200ms) for content sections
- Charts: draw-in animation on first render (500ms)
- Hover states: 150ms transition on all interactive elements
- Number counters: count-up animation on stats bar (homepage only)
- If in doubt, don't animate.

---

## 4. SEO Strategy

### Technical SEO

- **Title format:** `{Page Title} | Lustrumo — Independent Jewellery Intelligence`
- **Meta descriptions:** 150–160 characters. Include primary keyword + value proposition. Action-oriented.
- **Canonical URLs:** Always set. Self-referencing on standalone pages.
- **Structured data (JSON-LD):** Required on every page:
  - Homepage: Organization + WebSite schema
  - Tool pages: WebApplication schema
  - Articles: Article schema with author, datePublished, dateModified
  - Premium products: Product schema with price, currency, availability
  - FAQ sections: FAQPage schema
- **Open Graph:** Every page needs og:title, og:description, og:image, og:url, og:type
- **Sitemap:** Auto-generated, submitted to Google Search Console
- **Robots.txt:** Allow all public pages. Block /api/, /admin/, auth pages.
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1. Test every deploy.

### Keyword Strategy

**Tier 1 — High intent, tool pages (target with tools + landing pages):**
- "diamond price calculator"
- "lab grown diamond prices [locale]"
- "gold price per gram today"
- "diamond price comparison"
- "is this diamond a good deal"
- "verify diamond certificate"
- "22K gold price today [currency]"

**Tier 2 — Educational, content pages (target with articles):**
- "lab grown diamonds vs natural"
- "are lab grown diamonds worth it"
- "how much should a 1 carat diamond cost"
- "what is a making charge gold"
- "IGI vs GIA certification"
- "CVD vs HPHT diamonds"
- "how to verify a diamond certificate"

**Tier 3 — Long-tail, locale-specific (target with localised content):**
- "lab grown diamonds [city]"
- "best diamond jeweller [city]"
- "gold jewellery making charges [country]"
- "diamond engagement ring fair price [country]"

### Content SEO Rules

- Every article must target ONE primary keyword in the title, H1, first paragraph, and meta description
- Use H2s for subtopics, H3s for detail — proper heading hierarchy, no skipping levels
- Internal linking: every article links to at least 2 tools and 2 other articles
- External linking: cite data sources (IGI, GIA, industry reports) — builds authority
- Article length: 1,500–3,000 words for cornerstone guides, 800–1,200 for news/updates
- URL slugs: short, keyword-rich, lowercase, hyphens only (e.g., `/learn/lab-grown-vs-natural`)
- Image alt text: descriptive, includes keyword naturally
- Schema FAQ: add FAQ section with 3–5 questions to every tool page and cornerstone article

### Content Calendar Framework

| Month | Anchor Content | Supporting Content | SEO Target |
|-------|---------------|-------------------|-----------|
| Launch | Lab-Grown Diamonds Complete Guide | 4Cs Explained, CVD vs HPHT | "lab grown diamonds [locale]" |
| Month 2 | Gold Buying Guide + Making Charges | 22K vs 24K, Gold Purity Explained | "gold price [currency]", "making charges" |
| Month 3 | How to Verify a Diamond Certificate | IGI vs GIA, Reading a Cert | "verify diamond certificate" |
| Month 4 | Fair Price Guide (What Should You Pay?) | Price Trends Report Q1, Shape Comparison | "diamond prices", "how much should I pay" |
| Month 5 | Retailer Selection Guide | Top 10 Retailers Review, Red Flags | "best jeweller [locale]" |
| Month 6 | Engagement Ring Buying Complete Guide | Setting Styles, Metal Comparison | "engagement ring guide" |
| Quarterly | Market Intelligence Report | Price trend analysis, market update | Email list growth + authority |

---

## 5. Marketing Guidelines

### Brand Channels

| Channel | Purpose | Tone | Frequency |
|---------|---------|------|-----------|
| Website (tools) | Primary traffic engine | Data-dense, functional | Always-on |
| Blog / Learn | SEO + authority | Educational, thorough | 2–4 articles/month |
| Email (Klaviyo/Loops) | Retention + monetisation | Personal, helpful | Weekly market update + triggered flows |
| Instagram | Brand awareness + traffic | Visual, educational carousel posts | 3–5 posts/week |
| Facebook | Community + retargeting | Conversational, helpful | 2–3 posts/week |
| Google Ads | High-intent traffic | Direct, benefit-focused | Always-on (tool keywords) |
| Reddit | Community building | Helpful, never promotional | Participate authentically |

### Email Flows (Klaviyo/Loops)

| Flow | Trigger | Emails | Goal |
|------|---------|--------|------|
| Welcome Series | Email signup | 3 emails over 7 days | Educate, build trust, drive first tool use |
| Abandoned Check | Started deal check but didn't finish | 1 email, 24hr delay | Complete the check |
| Post-Report | Purchased a premium report | 2 emails over 14 days | Review request, cross-sell membership |
| Price Alert | Tracked price drops below threshold | Immediate | Drive return visit + conversion |
| Market Update | Weekly (Thursdays) | 1 email | Keep subscribers engaged, drive traffic |
| Festival/Seasonal | 4 weeks before major buying seasons | 2–3 email series | Capture seasonal purchase intent |

### Social Media Content Pillars

1. **Data drops** (40%) — "1ct lab-grown diamond prices dropped 8.4% this month. Here's what that means for buyers." Charts, numbers, trends.
2. **Education** (30%) — "What does 'VS2 clarity' actually mean? Here's the 30-second version." Carousel posts, short videos.
3. **Tool showcases** (20%) — "We just checked this diamond from [retailer]. Here's what we found." Screenshots of tool output (anonymised).
4. **Community/UGC** (10%) — Customer stories, testimonials, "I saved $X using Lustrumo" features.

### Paid Advertising Rules

- **Never** run ads that look like jewellery store ads (no sparkly product shots, no "shop now" CTAs)
- **Always** lead with the tool/insight (e.g., "Check if your diamond is fairly priced — free tool")
- **Ad creative:** Data-forward. Show the calculator output, the price chart, the deal verdict. The tool IS the ad.
- **Landing pages:** Ads link to the relevant tool page, not the homepage
- **Retargeting:** Users who used a free tool but didn't convert → show premium report ads
- **Exclude:** Never retarget users who already purchased a premium product with the same product ad

### Affiliate & Partnership Rules

- Lustrumo earns affiliate commissions from some retailers. This is disclosed in the footer and on relevant pages.
- Affiliate relationships NEVER influence ratings, fair price calculations, deal verdicts, or retailer scores.
- Disclosure text: "Lustrumo may earn a commission when you purchase through retailer links. This never affects our ratings or recommendations."
- Disclosure must appear: in the footer, on the Retailer Scorecard page, and adjacent to any "Shop at [Retailer]" links.
- No retailer gets preferential placement, ranking, or visibility based on affiliate status.

---

## 6. Product Architecture

### Product Hierarchy

**Free Tools (Traffic Engine):**
1. Diamond Price Tracker — real-time price comparison, historical charts
2. Gold Price Calculator — spot price × karat × weight, making charge guide
3. Diamond Price Calculator — fair price estimate by specs
4. Certification Verifier — IGI/GIA cert lookup + validation
5. Education Hub — articles, guides, explainers

**Freemium Tools (Conversion Engine):**
6. "Is This a Good Deal?" Checker — 3 free/month, unlimited with membership
7. Retailer Scorecard — free aggregate scores, premium detailed breakdowns

**Premium Products (Revenue Engine):**
8. Diamond Intelligence Report — $49–$97
9. Gold Valuation Report — $29–$49
10. Retailer Due Diligence Report — $29–$49
11. Annual Membership — $149–$249/year

### Pricing Rules

- All prices displayed in locale currency
- Premium report prices are fixed per product (not dynamic)
- Membership discount: 50% off all reports for active members
- No "sale" pricing, no countdown timers, no artificial urgency — EVER
- Price shown on CTA button: "Get Your Report — $49" not just "Buy Now"
- Stripe handles all payments. No other payment processors.

### Rate Limiting (Free Tier)

- Deal Checker: 3 checks per calendar month per user (authenticated) or per browser fingerprint (anonymous)
- Show remaining count: "You have 2 free checks remaining this month"
- At limit: show upgrade prompt to membership, not a hard block
- Premium/Members: unlimited everything

---

## 7. Data & Trust Rules

### Data Integrity — NON-NEGOTIABLE

1. **Fair price calculations** are based on scraped market data only. Never manually adjusted. Never influenced by affiliate relationships. Never biased toward any retailer.
2. **Retailer scores** are calculated from factual, verifiable criteria only. Never subjective. Never influenced by commercial relationships.
3. **Certification data** is pulled directly from grading lab sources (IGI, GIA). Never fabricated. If a cert can't be verified, say so explicitly.
4. **Price data** includes source attribution and timestamp. Users can see when data was last updated.
5. **Placeholder data** during development must be clearly marked with a "[SAMPLE DATA]" badge. Never present placeholder data as real market data.

### Trust Signals (Display on Every Page)

- Footer: "Independent. Data-driven. No jewellery sales."
- Tool pages: "Last updated: [timestamp]" on all price data
- Report pages: "This report was generated from [X] data points across [Y] retailers"
- Affiliate disclosure: visible wherever retailer links appear

### Privacy & Data

- Email addresses collected only with explicit consent
- No selling of user data — EVER
- Deal check history is private to the user
- Analytics: PostHog or Plausible (privacy-focused). No Google Analytics.
- Cookie banner: minimal, compliant, not annoying

---

## 8. Technical Architecture Reference

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Components | shadcn/ui (customised to Lustrumo design system) |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + Google OAuth) |
| Payments | Stripe |
| Email | Resend or Loops |
| Scraping | Apify |
| AI (reports) | Claude API (Anthropic) |
| Analytics | PostHog or Plausible |
| Hosting | Vercel |
| Domain | lustrumo.com |

### File Structure Convention

```
app/
  [locale]/
    page.tsx                    # Homepage
    diamond-prices/
      page.tsx                  # Diamond price tracker
    gold-calculator/
      page.tsx                  # Gold price calculator
    diamond-calculator/
      page.tsx                  # Diamond price calculator
    deal-check/
      page.tsx                  # Deal checker
    verify/
      page.tsx                  # Certification verifier
    retailers/
      page.tsx                  # Retailer scorecard
    learn/
      page.tsx                  # Article listing
      [slug]/
        page.tsx                # Individual article
    premium/
      page.tsx                  # Premium products
    sign-in/
      page.tsx
    sign-up/
      page.tsx
  api/
    gold-price/
      route.ts                  # Gold price API
    diamond-price/
      route.ts                  # Diamond price API
    deal-check/
      route.ts                  # Deal check API
    webhooks/
      stripe/
        route.ts                # Stripe webhook handler
components/
  ui/                           # shadcn/ui components
  layout/
    nav.tsx
    footer.tsx
    locale-selector.tsx
  tools/
    diamond-shape-selector.tsx
    price-chart.tsx
    sparkline.tsx
    fair-price-badge.tsx
    deal-verdict.tsx
  marketing/
    stats-bar.tsx
    testimonial-carousel.tsx
    cta-section.tsx
lib/
  locale.ts                     # Locale config + helpers
  supabase.ts                   # Supabase client
  stripe.ts                     # Stripe helpers
  price-utils.ts                # Price formatting, fair price calculations
  seo.ts                        # Metadata generators
```

### Performance Rules

- **Server Components** by default. Client Components only for interactive elements (calculators, charts, forms).
- **ISR** (Incremental Static Regeneration) for price pages — revalidate every 3600 seconds (1 hour).
- **Dynamic rendering** for personalised pages (deal checker results, user vault).
- **Image optimisation:** Next.js Image component for all images. WebP format. Lazy loading below the fold.
- **Bundle size:** Monitor with `next build` output. No client-side package > 50KB without justification.
- **Core Web Vitals targets:** LCP < 2.5s, FID < 100ms, CLS < 0.1.

---

## 9. Growth Metrics & KPIs

### North Star Metric
**Monthly Active Tool Users (MATU)** — unique users who use at least one Lustrumo tool per month.

### Primary KPIs

| KPI | Month 6 Target | Month 12 Target | Month 24 Target |
|-----|----------------|-----------------|-----------------|
| Monthly unique visitors | 8,000 | 30,000 | 85,000 |
| Monthly active tool users | 3,500 | 14,000 | 40,000 |
| Email subscribers | 1,800 | 8,000 | 22,000 |
| Paid reports sold/month | 35 | 160 | 500 |
| Active memberships | 30 | 220 | 900 |
| Monthly revenue | $3,400 | $18,500 | $62,500 |
| Gross margin | 97% | 97% | 98% |

### Tracking

- Tool usage: track every tool interaction (which tool, inputs, outputs, time spent)
- Conversion funnels: free tool → email signup → premium report → membership
- Content performance: pageviews, time on page, scroll depth, CTA click rate per article
- SEO: keyword rankings, organic traffic %, backlink growth
- Revenue: MRR, ARPU, churn rate (memberships), report volume by type

---

## 10. Content Quality Checklist

Before publishing ANY content (article, tool page copy, marketing email, social post):

1. [ ] Headline speaks to the BUYER'S situation, not the product's features
2. [ ] The word "you" appears more than "we" (count them)
3. [ ] Every factual claim has a data source or is self-evident
4. [ ] No hype words (stunning, amazing, incredible, revolutionary, game-changing)
5. [ ] No urgency tactics (limited time, act now, don't miss out)
6. [ ] No AI references in consumer-facing copy
7. [ ] Prices are in locale currency with proper formatting
8. [ ] CTA button text describes what happens next + includes price if applicable
9. [ ] Affiliate disclosure is visible where retailer links appear
10. [ ] Spelling matches locale (jewellery vs jewelry)
11. [ ] Mobile preview shows no text walls, CTAs are thumb-reachable
12. [ ] Structured data (JSON-LD) is present and valid
13. [ ] Meta title is under 60 characters, meta description under 160
14. [ ] At least 2 internal links to tools + 2 to other content
15. [ ] Read aloud test: sounds like a person, not a brochure

---

## 11. Competitor Watchlist

Monitor these platforms for feature releases, pricing changes, and market moves:

| Competitor | URL | What to Watch |
|-----------|-----|--------------|
| StoneAlgo | stonealgo.com | New tools, pricing model changes, geographic expansion |
| PriceScope | pricescope.com | Community features, price data coverage |
| Diamond Hedge | diamondhedge.com | AR features, retailer partnerships |
| Brilliant Earth | brilliantearth.com | Lab-grown pricing, DTC trends |
| Novita Diamonds | novitadiamonds.com | Australian market pricing, showroom expansion |
| VRAI | vrai.com | Design aesthetic, brand positioning, pricing |

**Rule:** Never copy features directly. Understand WHY a feature exists, then build a better version that fits Lustrumo's independent intelligence positioning.

---

## 12. Legal & Compliance

- **ABN:** Required before accepting payments. Register as sole trader or Pty Ltd.
- **GST:** Register when revenue exceeds $75K/year (will happen within Year 1).
- **Consumer guarantees:** Australian Consumer Law applies to all digital products sold to Australian consumers. Reports must match their description. Refund policy required.
- **Affiliate disclosure:** FTC (US) and ACCC (AU) require clear disclosure of material connections with retailers. Disclosure must be "clear and conspicuous."
- **Data protection:** Privacy Act 1988 (AU) + APP principles. Privacy policy required. Cookie consent for non-essential cookies.
- **Trademark:** Register "Lustrumo" as a trademark in Australia (IP Australia) once revenue justifies the cost (~$330 per class).
- **Terms of service:** Required. Must cover: limitation of liability (Lustrumo provides information, not financial advice), disclaimer on price estimates, user account terms, payment terms.

---

*This skill file is the authoritative reference for all Lustrumo development, content, and marketing. Update it as the platform evolves. Every team member, contractor, and AI assistant working on Lustrumo should read this first.*
