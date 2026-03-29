# LUSTRUMO — Next Steps Roadmap
## Last updated: March 29, 2026
## Resume from here anytime — all context and prompts are saved below

---

## CURRENT STATUS

**Live site:** https://lustrumo.com
**Domain:** lustrumo.com (Vercel)
**SKILL.md:** /mnt/skills/user/lustrumo/SKILL.md
**Database:** Supabase
**Stack:** Next.js 14, TypeScript, Tailwind, shadcn/ui, Recharts, Supabase

### Data:
- **11,910+ total products** (9,085 gold + diamonds)
- **22 retailers** in registry (10 scraped, 12+ directory listings)
- **Scraped retailers:** RB Diamond, Armans, Luke Rose, Shiels, Bevilles, Lindelli, Diamond Lab, Australian Diamond Network
- **Blocked:** Novita (403), My Jewellery Story (404), Michael Hill, Glamira, Oroginale
- **Directory retailers:** ~12 manually added, 30 more being added by Cowork

### Completed Phases:
- ✅ Phase 1: MVP build (all tool pages, homepage, auth placeholders)
- ✅ Phase 2: Gold jewellery ingestion (scraper + valuation + UI)
- ✅ Phase 3: Natural diamond ingestion (detection + valuation + UI)
- ✅ Retailer Scorecard with real data + directory listings
- ✅ Sitemap + Google Search Console submitted
- ✅ Live gold spot price (goldapi.io — needs migration to free API)
- ✅ Diamond shape SVG icons across all pages
- ✅ 3 SEO articles (lab-grown guide, gold making charges, cert verification)

### Pending / In Progress:
- ⏳ 30 more directory retailers (Cowork working on this)
- ⏳ Gold price API migration (remove $99/month goldapi.io, switch to free gold-api.com)
- ⏳ Vercel cron jobs for daily re-scrape + hourly gold price refresh
- ⏳ Stripe integration (deferred by Tara — do later)
- ⏳ Email capture flows
- ⏳ Deal Checker URL fetching (currently static mockup)

---

## PRIORITY FEATURES TO BUILD (in order)

### PRIORITY 1: Price Alerts + Email Capture
**Why:** Growth engine. Gets emails, creates return visits.

**Claude Code prompt:**
```
Read /mnt/skills/user/lustrumo/SKILL.md for context.

Build a Price Alert system for Lustrumo.

1. Create a price_alerts table in Supabase:

CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'price_drop', 'below_threshold', 'similar_cheaper'
  product_type TEXT, -- 'diamond', 'gold'
  origin TEXT, -- 'natural', 'lab_grown'
  shape TEXT,
  carat_min DECIMAL,
  carat_max DECIMAL,
  color_min TEXT,
  clarity_min TEXT,
  karat INTEGER, -- for gold
  max_price DECIMAL, -- alert if price drops below this
  target_pct_drop DECIMAL, -- alert if price drops by this percentage
  is_active BOOLEAN DEFAULT true,
  last_notified TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

2. Create an alert signup component (components/tools/price-alert-signup.tsx):
   - Simple form: email + what to track
   - "Alert me when 1ct lab-grown round diamonds drop below $X"
   - "Alert me when gold making charges fall below X%"
   - Teal CTA: "Set Alert — Free"
   - Show on Diamond Prices page, Gold Prices page, and after 
     any calculator result

3. Create app/api/alerts/route.ts:
   - POST: create new alert
   - GET: list alerts for an email
   - DELETE: unsubscribe from an alert

4. Add alert signup prompts to these pages:
   - Diamond Prices: "Get notified when prices drop" below the 
     price index table
   - Gold Prices: "Alert me when gold spot price changes" in the 
     spot price banner
   - Diamond Calculator: "Track this spec" after showing a result
   - Gold Calculator: "Watch making charges for this type" after results
   - Deal Checker: "Monitor this product" after showing a verdict

5. Create a simple email capture component for pages without 
   specific alert context:
   - "Get weekly market intelligence — free"
   - Just email input + submit
   - Add to: homepage (above footer), Learn page, Premium page

6. Store all emails in a subscribers table:

CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT, -- 'price_alert', 'newsletter', 'deal_checker', 'calculator'
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

Don't build the email sending logic yet — just capture the emails 
and store them. We'll connect Resend or Loops later.
```

---

### PRIORITY 2: Weekly Market Intelligence Email
**Why:** Retention engine. Keeps subscribers engaged between purchases.

**Claude Code prompt:**
```
Read /mnt/skills/user/lustrumo/SKILL.md for context.

Build a Weekly Market Intelligence report generator.

1. Create app/api/cron/weekly-report/route.ts that:
   - Runs every Thursday at 9am AEST (Vercel cron)
   - Queries the database for this week's data:
     a) Gold spot price change (current vs 7 days ago)
     b) Average lab-grown diamond prices by carat (current vs 7 days ago)
     c) Average natural diamond prices by carat (current vs 7 days ago)
     d) Top 5 "best deals" — products with lowest making charge (gold) 
        or lowest price vs fair value (diamonds)
     e) New products added this week
     f) Any price drops > 10% on tracked products
   - Generates an HTML email template with this data
   - For now, just generate and store the report — don't send yet

2. Create a reports table:

CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  gold_spot_change_pct DECIMAL,
  lab_grown_avg_change_pct DECIMAL,
  natural_avg_change_pct DECIMAL,
  best_deals JSONB,
  new_products_count INTEGER,
  price_drops JSONB,
  html_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

3. Create a public page at app/[locale]/market-update/page.tsx 
   that shows the latest weekly report as a web page. This doubles 
   as content for SEO.

4. Add to vercel.json crons:
   { "path": "/api/cron/weekly-report", "schedule": "0 23 * * 3" }
   (Wednesday 11pm UTC = Thursday 9am AEST)
```

---

### PRIORITY 3: "What Should I Pay?" Quiz
**Why:** Top-of-funnel capture. Gets people who don't know what they want yet.

**Claude Code prompt:**
```
Read /mnt/skills/user/lustrumo/SKILL.md for context.

Build a guided "What Should I Pay?" quiz at app/[locale]/quiz/page.tsx

5-step flow, one question per screen with smooth transitions:

Step 1: "What's the occasion?"
- Engagement ring
- Anniversary gift
- Self-purchase
- Wedding band
- Just browsing / researching

Step 2: "What's your budget?"
- Under $1,000
- $1,000 — $3,000
- $3,000 — $5,000
- $5,000 — $10,000
- $10,000 — $20,000
- $20,000+

Step 3: "Natural or lab-grown diamond?"
- Natural (mined)
- Lab-grown (same stone, lower price)
- I'm not sure yet (show me both)
- Actually, I'm looking at gold jewellery

Step 4: "What shape appeals to you?"
- Show the 10 diamond shape icons from the shape selector component
- Let them pick 1-3 shapes
- If they chose gold in step 3, skip this and ask about karat 
  (9K, 14K, 18K, 22K, 24K) and type (ring, chain, bangle, etc.)

Step 5: "What matters more to you?"
- Size (bigger stone, may compromise on quality)
- Quality (better grade, may be smaller)
- Balance of both

OUTPUT PAGE:
Based on their answers, show:
- "Based on your preferences, here's what to expect:"
- Recommended spec range (e.g., "0.8-1.2ct, G-I color, VS-SI clarity")
- Fair price range: "$X — $Y"
- Top 5 matching products from our database with prices and 
  retailer links
- "Natural vs Lab-Grown comparison" card showing the price 
  difference for their spec
- CTA: "Set a price alert for this spec — free" (captures email)
- CTA: "Get a personalised Diamond Intelligence Report — $49"

Add "What Should I Pay?" to the main nav under Tools dropdown 
and as a prominent CTA on the homepage.
```

---

### PRIORITY 4: Diamond Vault / Saved Stones
**Why:** Turns Lustrumo into a workspace for the buying journey.

**Claude Code prompt:**
```
Read /mnt/skills/user/lustrumo/SKILL.md for context.

Build a "Diamond Vault" feature — a personal collection where 
users save and compare products.

1. Create a vault_items table:

CREATE TABLE vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT, -- for anonymous users (browser fingerprint)
  product_type TEXT NOT NULL, -- 'diamond' or 'gold'
  product_url TEXT NOT NULL,
  retailer_name TEXT,
  title TEXT,
  price DECIMAL,
  specs JSONB, -- carat, color, clarity, shape, karat, etc.
  fair_price_estimate DECIMAL,
  verdict TEXT,
  image_url TEXT,
  notes TEXT, -- user's personal notes
  added_at TIMESTAMPTZ DEFAULT NOW()
);

2. Add a "Save to Vault" button (heart icon or bookmark icon) 
   to every product listing across the platform:
   - Gold product tables
   - Diamond price tables
   - Deal Checker results
   - Calculator results
   - Clicking saves the product with its current specs and price

3. Create app/[locale]/vault/page.tsx:
   - Grid of saved products with all specs
   - "Compare" mode: select 2-3 products, see side-by-side 
     comparison table (specs, price, fair value, verdict, 
     making charge for gold)
   - Filter by: diamonds only, gold only, price range
   - Sort by: date saved, price, value rating
   - Remove items
   - "Share my vault" — generates a public link so they can 
     show their shortlist to a partner

4. For anonymous users (not signed in):
   - Save to localStorage with a session_id
   - Show a prompt: "Sign in to save your vault permanently 
     and access it on any device"
   - When they sign in, migrate localStorage items to their account

5. Add "Vault (X)" count badge to the navbar next to the user's 
   sign-in area

6. This requires Supabase Auth to be connected for persistent 
   vaults. For MVP, just use localStorage for anonymous users.
```

---

### PRIORITY 5: Deal Checker URL Fetching
**Why:** The viral feature — paste a URL, get instant intelligence.

**Claude Code prompt:**
```
Read /mnt/skills/user/lustrumo/SKILL.md for context.

Make the Deal Checker actually fetch and parse retailer product pages.

1. Create app/api/deal-check/route.ts:
   - POST with { url: string }
   - Fetch the URL server-side with browser-like User-Agent
   - For Shopify stores: append .json to the product URL and 
     fetch structured data
   - Extract: product name, price, description, images, variants
   - Parse specs from title/description:
     - Diamond: carat, color, clarity, shape, origin, cert lab
     - Gold: karat, weight, product type, gold color
   - Detect product type: diamond, gold, or unknown

2. Run the appropriate valuation:
   - Diamond → natural or lab-grown valuation engine
   - Gold → gold valuation engine with live spot price
   - Return: fair price estimate, verdict, making charge (gold), 
     lab-grown comparison (natural diamonds)

3. Update the Deal Checker UI:
   - Show loading spinner while fetching
   - Display extracted product info with image
   - Show verdict badge: Great Deal / Fair Price / Above Market
   - Show the detailed breakdown
   - If parsing fails: "We couldn't read this page automatically. 
     Enter details manually below."

4. Handle edge cases:
   - Non-Shopify sites: try JSON-LD structured data, meta tags, 
     then HTML parsing
   - Blocked URLs: show manual entry form
   - Timeout after 10 seconds
   - Rate limit: 3 free checks per month per browser fingerprint

Test with:
- https://rbdiamond.com.au/products/24k-yg-unisex-beruwa-ring-1pc-copy
- https://armansfinejewellery.com/products/essence-1-05ct-oval-gia-1537457734-natural
```

---

### PRIORITY 6: Stripe Integration
**Why:** Revenue. Deferred by Tara — build when ready.

**Claude Code prompt:**
```
Read /mnt/skills/user/lustrumo/SKILL.md for context.

Build Stripe integration for premium reports and membership.

1. Install: npm install stripe @stripe/stripe-js

2. Create lib/stripe.ts with server-side Stripe client.
   Env vars: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

3. Products:
   - diamond_report: "Diamond Intelligence Report" — $49 one-time
   - gold_report: "Gold Valuation Report" — $29 one-time
   - retailer_report: "Retailer Due Diligence Report" — $29 one-time
   - annual_membership: "Lustrumo Annual Membership" — $149/year

4. Create app/api/checkout/route.ts — Stripe Checkout Session
5. Create app/api/webhooks/stripe/route.ts — handle completed payments
6. Update premium page CTAs to trigger checkout
7. Create success page at app/[locale]/premium/success/page.tsx

Use placeholder env vars — I'll add real Stripe keys later.
```

---

### PRIORITY 7: Automated Data Refresh (Vercel Crons)
**Why:** Keeps all data fresh without manual scraping.

**Claude Code prompt:**
```
Read /mnt/skills/user/lustrumo/SKILL.md for context.

Set up automated data refresh with Vercel cron jobs.

1. Create app/api/cron/gold-price/route.ts:
   - Fetch 24K gold spot price in AUD from free API (gold-api.com 
     primary, goldpricez.com backup)
   - Store in gold_prices table
   - Recalculate making_charge_pct for ALL gold products
   - Runs every hour

2. Create app/api/cron/scrape/route.ts:
   - Loop through all active scraped retailers
   - Re-scrape gold + diamonds
   - Upsert (update existing, insert new)
   - Log price changes to diamond_price_history table
   - Calculate and store daily price index aggregates
   - Runs daily at 3am AEST

3. Create vercel.json:
{
  "crons": [
    { "path": "/api/cron/gold-price", "schedule": "0 * * * *" },
    { "path": "/api/cron/scrape", "schedule": "0 17 * * *" },
    { "path": "/api/cron/weekly-report", "schedule": "0 23 * * 3" }
  ]
}

4. Auth: check CRON_SECRET header on all cron endpoints.

DON'T run — just build. I'll add CRON_SECRET to Vercel env vars.
```

---

## FILES REFERENCE

| File | Location | Purpose |
|------|----------|---------|
| SKILL.md | /mnt/skills/user/lustrumo/SKILL.md | Brand, design, voice, architecture reference |
| Claude Code prompt | /mnt/user-data/outputs/claude-code-prompt-jewellery-intelligence.md | Master build prompt with design system |
| Build steps | /mnt/user-data/outputs/lustrumo-claude-code-steps.md | 12-step build sequence with screenshot guide |
| SKILL.md (output copy) | /mnt/user-data/outputs/LUSTRUMO-SKILL.md | Backup of skill file |

---

## SCRAPING REFERENCE

**Run scrapers in PowerShell (never through Claude Code):**
```powershell
cd C:\Users\taral\lustrumo
npx tsx scripts/scrape-all-retailers.ts --retailer "domain.com.au"
npx tsx scripts/scrape-all-retailers.ts --retailer "domain.com.au" --force
```

**Debug database:**
```powershell
npx tsx scripts/debug-retailers.ts
```

---

## NOTES
- Claude Code's bash tool times out on long-running scrapers — always run scrapers in a separate PowerShell window
- The SKILL.md path for Claude Code prompts is: /mnt/skills/user/lustrumo/SKILL.md
- Vercel auto-deploys from GitHub main branch
- Gold spot price needs migration from goldapi.io ($99/month) to free alternatives
- Rapaport API deferred — using approximate price tables for natural diamond valuation
