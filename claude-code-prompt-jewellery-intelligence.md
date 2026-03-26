# CLAUDE CODE PROMPT — Lustrumo (lustrumo.com)
# Jewellery Intelligence Platform — Australia-First
# Copy everything below this line into Claude Code

---

## Project Overview

Build **Lustrumo** (lustrumo.com) — a world-class jewellery buyer intelligence platform — an independent, data-driven tool that helps consumers make informed diamond and gold purchasing decisions. Think "StoneAlgo but global-ready" — expanded to cover gold jewellery, lab-grown diamonds, retailer ratings, and South Asian cultural buying contexts. Launching in Australia first, architected for worldwide expansion via locale subdirectories.

**Brand name:** Lustrumo
**Domain:** lustrumo.com
**URL structure:** lustrumo.com/au (Australia — launch market), lustrumo.com/nz, lustrumo.com/uk, lustrumo.com/us (future expansions)
**Tagline:** "Independent Jewellery Intelligence"

**Internationalisation approach:**
- Launch with `/au` as the default market. Root domain `lustrumo.com` redirects to `lustrumo.com/au` initially.
- All prices display in the local currency for the active market (AUD for /au, NZD for /nz, GBP for /uk, USD for /us).
- Retailer data, SEO content, and regulatory context are market-specific.
- Tools (calculators, cert verifier) work globally — currency is the only variable.
- Build the `/[locale]` routing into the Next.js App Router from day one using dynamic route segments `app/[locale]/...` so expansion requires no architectural changes — just new content and currency config.
- Use a simple market selector in the footer or nav (small flag icon + country code) for future use. For MVP, only `/au` is active.

**Reference site to emulate:** https://www.stonealgo.com/
Study this site's design patterns, layout, navigation, colour scheme, tool UX, and information architecture closely. We are building a platform that matches its level of sophistication and data density while improving on visual polish and expanding the product scope.

**Tech stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Edge Functions)
- shadcn/ui components
- Recharts (for price charts and data visualisation)
- Stripe (for premium products — integrate later)
- Deployed on Vercel (lustrumo.com → Vercel, with `/au` as default locale)

---

## Design System — Emulating StoneAlgo's Aesthetic

### Colour Palette
StoneAlgo uses a clean, professional palette with a white/light grey background, dark navy text, and teal/green accent colours. Emulate this approach:

```
--background: #FFFFFF
--background-alt: #F8FAFC (light grey for alternating sections)
--background-card: #FFFFFF
--border: #E2E8F0
--border-hover: #CBD5E1

--text-primary: #0F172A (near-black navy — headings, primary text)
--text-secondary: #475569 (slate — body text, descriptions)
--text-muted: #94A3B8 (light slate — hints, timestamps, metadata)

--accent-primary: #0D9488 (teal — primary CTAs, active states, positive indicators)
--accent-primary-hover: #0F766E
--accent-secondary: #3B82F6 (blue — links, secondary actions)
--accent-danger: #EF4444 (red — price drops, negative changes, warnings)
--accent-success: #10B981 (green — price rises, positive changes, good deals)
--accent-warning: #F59E0B (amber — caution, moderate ratings)

--surface-dark: #0F172A (dark navy — hero sections, premium feature backgrounds)
--surface-dark-text: #F1F5F9
```

### Typography
StoneAlgo uses a clean sans-serif system. Use:
- **Headings:** `Inter` or `Plus Jakarta Sans` — weight 700 for h1/h2, 600 for h3/h4
- **Body:** `Inter` — weight 400, line-height 1.6
- **Data/numbers:** `JetBrains Mono` or `IBM Plex Mono` — for prices, percentages, calculator outputs (gives a financial data terminal feel)
- **Size scale:** text-xs (12), text-sm (14), text-base (16), text-lg (18), text-xl (20), text-2xl (24), text-3xl (30), text-4xl (36)

### Layout Patterns (from StoneAlgo)
1. **Sticky top navigation bar** — logo left, main nav centre, auth/vault right. Clean horizontal nav with dropdown "More" for secondary tools.
2. **Hero sections** — large heading + subheading + primary CTA. Stats bar below hero (e.g., "2M+ diamonds indexed | 1.5M+ users | 4.9★ Trustpilot"). StoneAlgo uses subtle animated backgrounds — we can use a subtle gradient mesh or particle effect.
3. **Tool pages** — left sidebar for inputs (filters, selectors), main content area for results/output. Calculator-style layout with clear input → output flow.
4. **Price index pages** — horizontal shape selector (icon pills), then data table with inline sparkline charts, percentage changes colour-coded (green up, red down).
5. **Card components** — white cards with subtle border and shadow, hover state with slightly elevated shadow. Used for diamond listings, tool descriptions, feature showcases.
6. **Trust signals** — stats bar with large numbers + labels. Testimonial carousel. Retailer logo bar. These appear on the homepage and key landing pages.
7. **Footer** — multi-column with quick links, tool links, legal, social. Clean and minimal.

### Component Library
Use shadcn/ui as the base, customised to match the palette above:
- `Button` — primary (teal bg, white text), secondary (outlined), ghost
- `Card` — white bg, 1px border, rounded-lg, subtle shadow on hover
- `Input`, `Select`, `Slider` — for calculator/filter interfaces
- `Tabs` — for Natural/Lab-Grown toggles, chart timeframe selectors (1M, 3M, 6M, 1Y)
- `Table` — for price index data with inline charts
- `Badge` — for deal ratings, status indicators
- `Dialog/Sheet` — for mobile filter panels
- `Tooltip` — for explaining metrics (fair price, cut score equivalents)

---

## CRITICAL: Design Fidelity Rules

Claude Code often produces structurally correct but aesthetically flat layouts when working from text descriptions alone. Follow these rules to ensure Lustrumo matches the visual quality of StoneAlgo:

### Rule 1: Build section by section, not page by page
Do NOT attempt to build an entire page in one pass. Build each section as a standalone component, visually verify it, then compose the page. Order for homepage:
1. `<Navbar />` — sticky, clean, matches StoneAlgo's horizontal nav pattern
2. `<HeroSection />` — large heading + CTA + animated background
3. `<StatsBar />` — horizontal metrics row with large numbers
4. `<ShapeSelector />` — gradient card with diamond shape icons in a horizontal scrollable row. This is a SIGNATURE component.
5. `<ToolsGrid />` — 2x2 or 3-col card grid with icons
6. `<HowItWorks />` — 3-step horizontal flow with feature cards
7. `<PriceSnapshot />` — live price cards with sparklines
8. `<Testimonials />` — review carousel
9. `<Footer />` — multi-column links

### Rule 2: Match these exact CSS values for key patterns

**Shape Selector Card (StoneAlgo's signature element — see their homepage):**
```css
/* StoneAlgo uses a blue/purple gradient card with white outlined diamond icons.
   For Lustrumo, adapt to our teal-to-dark palette: */
.shape-selector-card {
  background: linear-gradient(135deg, #0F172A 0%, #134E4A 50%, #0D9488 100%);
  border-radius: 16px;
  padding: 48px 32px 40px;
  margin: 0 auto;
  max-width: 900px;
}
/* Diamond shape icons: white outlined SVGs arranged horizontally */
.shape-icon {
  width: 60px;
  height: 60px;
  stroke: rgba(255, 255, 255, 0.85);
  stroke-width: 1.5;
  fill: none;
}
.shape-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}
/* Horizontal scroll with left/right nav arrows on mobile */
```

**Feature Cards ("How Lustrumo helps you buy better" section):**
```css
.feature-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 24px;
  transition: box-shadow 0.2s ease;
}
.feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.feature-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 8px;
}
.feature-card-icon {
  width: 32px;
  height: 32px;
  background: #F0FDFA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0D9488;
}
```

**Stats Bar:**
```css
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 48px;
  padding: 32px 0;
  border-top: 1px solid #E2E8F0;
  border-bottom: 1px solid #E2E8F0;
}
.stat-number {
  font-size: 32px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #0F172A;
}
.stat-label {
  font-size: 14px;
  color: #94A3B8;
  margin-top: 4px;
}
```

**Price Change Indicators:**
```css
.price-up { color: #10B981; }
.price-down { color: #EF4444; }
.price-change {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
}
```

**Nav Bar:**
```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.nav-link {
  font-size: 15px;
  font-weight: 500;
  color: #475569;
}
.nav-link:hover {
  color: #0F172A;
}
```

### Rule 3: When in doubt, open stonealgo.com and match their pattern
Our platform should feel like a premium, polished evolution of StoneAlgo — not a generic dashboard template. If a layout decision is ambiguous, default to what StoneAlgo does.

### Rule 4: No generic template aesthetics
If the output looks like it could be any SaaS landing page, it's wrong. Every section must feel like it belongs to a jewellery intelligence platform. The shape selector, price charts with sparklines, certification flows, deal verdict badges — these are domain-specific UI patterns that should look unique and purposeful.

### Rule 5: Component-first workflow
When building each page, always:
1. Create the component file first (`components/home/shape-selector.tsx`)
2. Hard-code the exact CSS values above — do not approximate
3. Preview the component in isolation before composing into the page
4. If a component doesn't visually match the reference, fix it before moving on

---

## Site Architecture & Pages

### Navigation Structure
```
Lustrumo Logo | Diamond Prices | Gold Calculator | Deal Checker | Tools ▼ | Learn | [Sign In]

Tools dropdown:
  - Diamond Price Calculator
  - Certification Verifier  
  - Retailer Scorecard
  - Lab vs Natural Comparison

Learn dropdown:
  - Lab-Grown Diamonds Guide
  - Gold Buying Guide
  - 4Cs Explained
  - Making Charges Explained
```

### Pages to Build (Priority Order)

#### 1. Homepage (`/`)
Emulate StoneAlgo's homepage structure:

**Section 1: Hero**
- Large heading: "Independent Jewellery Intelligence"
- Subheading: "Diamond prices, gold valuations, retailer ratings, and certification verification — the data you need before you buy"
- Lustrumo logo top-left in the nav (use text logo "Lustrumo" — optionally with the trailing "o" in teal accent colour. Design a proper logo later)
- Primary CTA: "Check Diamond Prices" (teal button)
- Secondary CTA: "Calculate Gold Value" (outlined button)
- Subtle animated background (gradient mesh or slow-moving geometric shapes)

**Section 2: Stats Bar**
- 4-6 key metrics in a horizontal row with large numbers:
  - "50,000+" diamonds tracked
  - "Live" gold prices updated hourly  
  - "100+" retailers rated
  - "24hr" report delivery
  - "$2B+" jewellery purchases informed (aspirational — update as real data grows)

**Section 3: Tools Grid**
- 2x2 or 3-column grid of tool cards, each with:
  - Icon (use Lucide icons)
  - Tool name
  - 1-line description
  - CTA link
- Tools: Diamond Price Tracker, Gold Price Calculator, "Is This a Good Deal?" Checker, Certification Verifier

**Section 4: How It Works**
- 3-step horizontal flow (like StoneAlgo's "How StoneAlgo helps you buy better"):
  1. "Search & Compare" — browse diamond prices across top retailers
  2. "Verify & Validate" — check certifications, compare fair prices
  3. "Buy with Confidence" — get a personalised intelligence report

**Section 5: Price Snapshot**
- Live price cards for popular categories (similar to StoneAlgo's price index preview):
  - 1 Carat Lab-Grown Round — current avg price, 30-day change %, mini sparkline
  - 1 Carat Natural Round — same format
  - 22K Gold per gram — same format
  - 18K Gold per gram — same format
- "View All Prices →" link

**Section 6: Testimonials**
- Carousel of customer reviews (start with placeholder testimonials, replace with real ones)
- Star ratings, name, context (e.g., "— Sarah M, Sydney, Engagement Ring Buyer")

**Section 7: Education Preview**
- 3 featured article cards from the Learning Centre
- "Browse All Guides →" link

**Section 8: Footer**
- Multi-column: Tools, Learn, Company, Legal
- Newsletter signup
- Social links
- "Made in Australia" badge
- © 2026 Lustrumo. Independent jewellery intelligence.

#### 2. Diamond Price Tracker (`/diamond-prices`)
**Directly emulate StoneAlgo's `/diamond-prices/` page layout:**

- **Tab toggle:** Natural | Lab-Grown (like StoneAlgo's Natural/Lab Grown toggle)
- **Shape selector:** Horizontal row of diamond shape icons (Round, Oval, Cushion, Princess, Emerald, Pear, Radiant, Asscher, Marquise, Heart) — each is a clickable pill with the shape SVG icon
- **Price summary cards:** Top row showing 0.5ct, 1ct, 2ct, 3ct average prices with:
  - Current average price (AUD)
  - 30-day percentage change (colour-coded green/red)
  - Mini sparkline chart (inline SVG or Recharts)
  - Inventory count
- **Price index table:** Below the cards, a data table with columns:
  - Price Index name (linked)
  - Inline sparkline chart
  - Price (AUD)
  - % Change (1m) — colour-coded
  - Range (1m)
  - Inventory count
  - "View Charts" link
- **Timeframe selector:** 1M | 3M | 6M | 1Y tabs above the table
- **Data source note:** "Prices sourced from leading local and international retailers. Updated daily."

**Data structure (Supabase):**
```sql
CREATE TABLE diamond_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shape TEXT NOT NULL,
  carat DECIMAL NOT NULL,
  color TEXT,
  clarity TEXT,
  origin TEXT CHECK (origin IN ('natural', 'lab_grown')),
  avg_price_aud DECIMAL NOT NULL,
  min_price_aud DECIMAL,
  max_price_aud DECIMAL,
  inventory_count INTEGER,
  retailer_source TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_diamond_prices_lookup ON diamond_prices (shape, carat, origin, recorded_at);
```

#### 3. Gold Price Calculator (`/gold-calculator`)
This is our unique differentiation tool — StoneAlgo doesn't have this.

**Layout:** Split layout — input panel left (or top on mobile), output panel right (or bottom on mobile).

**Input Panel:**
- Karat selector: 9K | 14K | 18K | 22K | 24K (horizontal pills, like StoneAlgo's shape selector)
- Weight input: numeric input in grams (with +/- stepper buttons)
- Optional: Gold colour selector (Yellow | White | Rose) — affects alloy composition info displayed

**Output Panel:**
- **Melt Value:** Large number showing pure gold value at current spot price
  - Formula shown: `[Weight] × [Karat Purity %] × [Spot Price/gram]`
  - e.g., "5g × 91.67% (22K) × $135.20/g = $619.80"
- **Typical Retail Range:** Estimated retail price range including making charges
  - Shows: "Typical making charge: 8–25% above melt value"
  - Range: "$669 – $775"
- **Making Charge Guide:**
  - Simple table: Plain chain (8–12%), Simple ring (12–18%), Detailed pendant (15–25%), Intricate necklace (20–35%)
- **Live Gold Spot Price:** Current AUD price per gram and per ounce
  - 24-hour change (colour-coded)
  - Mini chart showing last 30 days

**Data structure:**
```sql
CREATE TABLE gold_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_per_gram_aud DECIMAL NOT NULL,
  price_per_ounce_aud DECIMAL NOT NULL,
  source TEXT DEFAULT 'api',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. Diamond Price Calculator (`/diamond-calculator`)
**Directly emulate StoneAlgo's `/diamond-price-calculator/` layout:**

**Input Panel:**
- Diamond Origin: Natural | Lab Grown (toggle pills)
- Shape: visual icon selector (10 shapes)
- Carat: slider + numeric input (0.3–5.0, step 0.05)
- Color: pill selector (D through K)
- Clarity: pill selector (FL through SI2)
- Submit button
- "More Inputs" expandable: Cut, Symmetry, Polish, Fluorescence

**Output Panel:**
- **Fair Price Estimate:** Large number in AUD with confidence badge
- **Estimate Range:** Low – High range
- **30-Day Change:** Percentage with colour coding
- **Price Per Carat:** Calculated figure
- **Comparison:** "This is X% cheaper/more expensive than natural/lab-grown equivalent"
- **Similar Diamonds:** Card list of matching stones from retailer database (when available)

#### 5. Certification Verifier (`/verify`)
Unique tool — positions platform as consumer advocate.

**Layout:** Simple centered input → result layout.

**Input:**
- Certificate number input field (prominent, large)
- Grading lab selector: IGI | GIA | GCAL
- "Verify" button (teal, prominent)

**Output:**
- Certificate details pulled (or placeholder showing what will be displayed):
  - Shape, Carat, Color, Clarity, Cut
  - Origin (Natural / Lab-Grown)
  - Measurements
  - Grading lab + report number
- **Fair Price Estimate** for this specific stone
- **"Is the retailer's price fair?"** — if user enters the asking price, compare against fair value

#### 6. "Is This a Good Deal?" Checker (`/deal-check`)
The viral tool.

**Layout:** Single input → verdict.

**Input:**
- URL field: "Paste any jeweller's product URL"
- OR manual entry: Shape, Carat, Color, Clarity, Price, Retailer
- "Check This Deal" button

**Output:**
- **Verdict badge:** "Great Deal" (green) | "Fair Price" (blue) | "Overpriced" (amber) | "Significantly Overpriced" (red)
- **Price comparison:** "This stone is priced at $X. Our fair price estimate is $Y. That's Z% above/below fair value."
- **Confidence score:** 0–100 with visual gauge
- **Free tier:** 3 checks/month (show remaining count)
- **Premium upsell:** "Unlock unlimited checks with a membership — $149/year"

#### 7. Retailer Scorecard (`/retailers`)
**Layout:** Filterable directory page.

**Filters:** Location (State/City), Type (Online/Physical/Both), Speciality (Lab-Grown, Gold, Traditional, Engagement)

**Retailer cards:**
- Retailer name + logo
- Overall score (0–100) with colour-coded badge
- Sub-scores: Pricing (5-star), Certification (5-star), Service (5-star), Returns (5-star)
- Location
- "View Full Report" link (premium)

#### 8. Learning Centre (`/learn`)
Blog/article listing page.

**Categories:** Lab-Grown Diamonds, Gold Buying, Certification, Retailer Reviews, Buying Guides, Market Trends

**Article card layout:** Featured image, title, category badge, reading time, excerpt. Grid layout (2-col desktop, 1-col mobile).

**Priority articles to create:**
1. "Lab-Grown Diamonds Australia: The Complete 2026 Guide"
2. "How Much Should You Pay for a Lab-Grown Diamond? Fair Price Guide"
3. "22K Gold Making Charges Explained: What's Fair in Australia?"
4. "How to Verify a Diamond Certificate (IGI & GIA)"
5. "Lab-Grown vs Natural Diamonds: The Real Differences"

#### 9. Premium Products page (`/premium`)
Product showcase for paid reports and membership.

**Products:**
- Diamond Intelligence Report — $49–$97
- Gold Valuation Report — $29–$49
- Retailer Due Diligence Report — $29–$49
- Annual Membership — $149–$249/year

Each product gets a card with: title, price, description, what's included (bullet list), CTA button.

#### 10. Auth pages (`/sign-in`, `/sign-up`)
Supabase Auth integration. Clean, centered form layout. Social login (Google). Magic link option.

---

## Database Schema (Supabase)

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  membership_tier TEXT DEFAULT 'free' CHECK (membership_tier IN ('free', 'premium', 'annual')),
  deal_checks_used INTEGER DEFAULT 0,
  deal_checks_reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diamond price history (scraped daily)
CREATE TABLE diamond_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL DEFAULT 'au', -- au, us, uk, nz
  shape TEXT NOT NULL,
  carat DECIMAL NOT NULL,
  color TEXT,
  clarity TEXT,
  cut TEXT,
  origin TEXT CHECK (origin IN ('natural', 'lab_grown')),
  price_local DECIMAL NOT NULL, -- price in locale currency
  currency TEXT NOT NULL DEFAULT 'AUD',
  retailer_name TEXT,
  retailer_url TEXT,
  product_url TEXT,
  certification_lab TEXT,
  certification_number TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gold spot prices (fetched hourly)
CREATE TABLE gold_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL DEFAULT 'au',
  currency TEXT NOT NULL DEFAULT 'AUD',
  price_per_gram DECIMAL NOT NULL,
  price_per_ounce DECIMAL NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Retailer profiles
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website_url TEXT,
  logo_url TEXT,
  locale TEXT NOT NULL DEFAULT 'au', -- which market this retailer is listed in
  location_city TEXT,
  location_state TEXT,
  location_country TEXT DEFAULT 'AU',
  is_online BOOLEAN DEFAULT true,
  is_physical BOOLEAN DEFAULT false,
  specialities TEXT[], -- ['lab_grown', 'gold', 'traditional', 'engagement']
  overall_score INTEGER, -- 0-100
  pricing_score INTEGER,
  certification_score INTEGER,
  service_score INTEGER,
  returns_score INTEGER,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal checks (rate limiting)
CREATE TABLE deal_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  product_url TEXT,
  retailer_name TEXT,
  stone_specs JSONB,
  asking_price DECIMAL,
  fair_price_estimate DECIMAL,
  verdict TEXT, -- 'great_deal', 'fair', 'overpriced', 'significantly_overpriced'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premium report orders
CREATE TABLE report_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  report_type TEXT CHECK (report_type IN ('diamond_intelligence', 'gold_valuation', 'retailer_dd')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered')),
  input_data JSONB,
  report_url TEXT,
  price_aud DECIMAL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles / Learning Centre
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT, -- MDX or rich text
  category TEXT,
  featured_image_url TEXT,
  reading_time_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email subscribers
CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT, -- 'homepage', 'deal_checker', 'article', 'gold_calculator'
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## SEO & Metadata (Lustrumo Branding)

**Site title format:** `{Page Title} | Lustrumo — Independent Jewellery Intelligence`
**Homepage title:** `Lustrumo — Independent Diamond & Gold Price Intelligence`
**Meta description (homepage):** `Compare diamond prices, calculate gold values, verify certifications, and check retailer ratings. Independent jewellery intelligence for smarter buying decisions. Free tools + premium reports.`

**Open Graph defaults:**
- `og:site_name`: Lustrumo
- `og:image`: Create a branded OG image — dark navy background, "Lustrumo" in white with optional teal "o" accent, tagline below
- `og:type`: website

**Favicon:** "L" lettermark in teal (#0D9488) on dark navy (#0F172A) rounded square.

**Logo treatment:** For the MVP, render the logo as styled text in the nav:
- "Lustrumo" as a single word in `--text-primary` (#0F172A), weight 700
- Optionally render the trailing "o" in `--accent-primary` (#0D9488) for a subtle brand accent — test both versions
- On dark backgrounds: white text with optional teal "o"
- This creates immediate brand recognition without needing a designed logo asset

---

## Key Implementation Notes

1. **Mobile-first:** Every page must work beautifully on mobile. StoneAlgo's mobile experience is decent but not great — we should exceed it. Tool input panels should stack vertically on mobile with full-width inputs.

2. **Performance:** Use Next.js server components for data-heavy pages. Client components only where interactivity is required (calculators, charts). ISR (Incremental Static Regeneration) for price pages with 1-hour revalidation.

3. **Charts:** Use Recharts for all price charts and sparklines. Consistent styling — teal line for primary data, grey for comparison, red/green for negative/positive areas. Responsive chart containers.

4. **SEO:** Every page needs proper metadata, Open Graph tags, and structured data (JSON-LD). Article pages need Article schema. Product pages need Product schema. FAQ pages need FAQPage schema.

5. **Currency handling:** Prices display in the active locale's currency (AUD for /au, USD for /us, GBP for /uk, NZD for /nz). Store a locale config object per market:
   ```ts
   const locales = {
     au: { currency: 'AUD', symbol: '$', flag: '🇦🇺', label: 'Australia', spelling: 'jewellery' },
     us: { currency: 'USD', symbol: '$', flag: '🇺🇸', label: 'United States', spelling: 'jewelry' },
     uk: { currency: 'GBP', symbol: '£', flag: '🇬🇧', label: 'United Kingdom', spelling: 'jewellery' },
     nz: { currency: 'NZD', symbol: '$', flag: '🇳🇿', label: 'New Zealand', spelling: 'jewellery' },
   }
   ```
   For MVP, only `/au` is active. All prices in AUD with proper formatting ($X,XXX.XX). The architecture supports adding markets by adding a config entry + locale content.

6. **Email capture:** Every tool page should have a subtle email capture — either inline ("Get price alerts for this search") or as a result gate ("Enter email to see full results"). Use Supabase to store subscribers.

7. **Rate limiting:** Free tier gets 3 deal checks per month, tracked by user_id (authenticated) or IP/fingerprint (anonymous). Show remaining count. Premium unlocks unlimited.

8. **Placeholder data:** For MVP, seed the database with representative diamond price data and gold prices. The Apify scrapers will replace this with real data post-launch. Mark placeholder data clearly in the UI during development.

---

## Build Order

Phase 1 (Ship first — the traffic engine):
1. Homepage
2. Gold Price Calculator (simplest tool, highest traffic potential)
3. Diamond Price Tracker (with placeholder data)
4. Basic Learning Centre with 2-3 seed articles

Phase 2 (Monetisation layer):
5. Diamond Price Calculator
6. Deal Checker (free tier)
7. Auth (sign up / sign in)
8. Premium products page

Phase 3 (Trust & depth):
9. Certification Verifier
10. Retailer Scorecard
11. Membership system + Stripe integration

---

## What Success Looks Like

When someone lands on Lustrumo, they should immediately feel:
- "This is a serious, data-driven platform" (not a jewellery store, not a blog)
- "These people know what they're talking about" (authority through data density)
- "I can trust this because it's independent" (no retailer branding, no affiliate bias visible)
- "This works for MY market" (locale-aware currency, local retailers, relevant context)

The visual standard is StoneAlgo — but cleaner, more polished, and with broader product scope covering gold and cultural buying contexts that StoneAlgo completely ignores. Lustrumo should feel like the Bloomberg of jewellery buying — authoritative, data-rich, and indispensable. Built to launch in Australia, architected to scale globally from day one.
