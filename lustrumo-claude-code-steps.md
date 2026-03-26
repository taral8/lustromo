# LUSTRUMO — Claude Code Build Sequence
## lustrumo.com | Independent Jewellery Intelligence
## Paste each step into Claude Code ONE AT A TIME. Wait for completion before moving to the next.

---

## BEFORE YOU START: Screenshot Reference Guide

Claude Code produces dramatically better design output when you include a screenshot alongside each prompt. Text descriptions are lossy — screenshots close the gap.

### Screenshots you need to take BEFORE starting:

Open https://www.stonealgo.com/ in your browser and take these screenshots. Save them in a folder so you can drag-and-drop them into Claude Code at each step.

| Screenshot # | What to Capture | URL / Location | Used in Step |
|---|---|---|---|
| **SS-1** | The **full navbar** — logo, nav links, dropdown open if possible | stonealgo.com (top of any page) | Step 1 |
| **SS-2** | The **"Search diamonds by shape"** section — the blue/purple gradient card with diamond shape icons in a horizontal row with carousel arrows | stonealgo.com (homepage, scroll down past hero) | Step 4 |
| **SS-3** | The **"How StoneAlgo helps you buy better"** section — the heading with brand name in colour, the feature cards below with icons | stonealgo.com (homepage, below shape selector) | Step 5 |
| **SS-4** | The **full homepage hero** — the top section with headline, CTAs, and the stats/metrics below | stonealgo.com (top of homepage) | Step 3 |
| **SS-5** | The **Diamond Price Calculator** — the full page showing input panel (shape selector, carat slider, color/clarity pills) and output panel (fair price estimate, range, 30-day change) | stonealgo.com/diamond-price-calculator/ | Step 9 |
| **SS-6** | The **Diamond Prices / Price Index** page — the shape selector row at top, the price summary cards (0.5ct, 1ct, 2ct, 3ct), and the data table with sparklines | stonealgo.com/diamond-prices/ | Step 8 |
| **SS-7** | The **Diamond Check Tool** page — the input area and any output/result layout | stonealgo.com/diamond-details/ | Step 10 |
| **SS-8** | The **footer** — the multi-column link layout at the bottom | stonealgo.com (bottom of any page) | Step 2 |

### How to use screenshots in Claude Code:

When you reach a step that says **"📸 Attach: SS-X"**, do this:

1. **Drag and drop** the screenshot image file directly into the Claude Code chat input area (or click the attachment/paperclip icon and select it)
2. The screenshot will appear as an attached image in your message
3. **Then paste the step's prompt text** in the same message, below the image
4. Claude Code will see both the image AND the text instructions together

**Example of what you type in Claude Code:**

> [drag SS-2 screenshot into chat]
>
> Build the diamond shape selector at components/home/shape-selector.tsx
>
> See the attached screenshot. This is StoneAlgo's shape selector section. Recreate this EXACT layout pattern for Lustrumo — but use our teal-to-dark gradient instead of their blue/purple. Match the spacing, icon sizes, border-radius, and overall composition exactly.
>
> [rest of the step's prompt text...]

### Tips for best results:

- **Crop screenshots tightly** to just the section you're referencing. Don't send a full-page screenshot when you only need Claude Code to look at the navbar — crop to just the navbar.
- **Annotate if needed** — if there's a specific detail you want Claude Code to notice (like the exact border-radius or a particular spacing), circle it or add an arrow in your screenshot tool before attaching.
- **One screenshot per step** is usually enough. If a step has multiple sections, you can attach 2 screenshots.
- **If the output doesn't match**, take a screenshot of CLAUDE CODE'S OUTPUT, attach it alongside the StoneAlgo reference screenshot, and say: "The left screenshot is what you built. The right screenshot is what it should look like. Fix the differences — specifically [list what's wrong: spacing, colours, proportions, etc.]"

---

## STEP 0: Project Setup
**Paste this first to scaffold the project:**

```
Create a new Next.js 14 project called "lustrumo" with the following setup:

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- src/ directory: NO (use app/ at root)
- ESLint: YES

After creating the project:
1. Install dependencies: shadcn/ui, recharts, @supabase/supabase-js, lucide-react
2. Initialize shadcn/ui with the "default" style, slate base color
3. Add these shadcn/ui components: button, card, input, tabs, table, badge, dialog, sheet, tooltip, select, separator, dropdown-menu
4. Install Google Fonts: "Inter" (400, 500, 600, 700) and "JetBrains Mono" (400, 600, 700)
5. Set up the app/ directory with locale-based routing:
   app/
     [locale]/
       layout.tsx
       page.tsx
     layout.tsx (root)
     globals.css

6. In globals.css, set up these CSS variables:
   --background: #FFFFFF
   --background-alt: #F8FAFC
   --border: #E2E8F0
   --text-primary: #0F172A
   --text-secondary: #475569
   --text-muted: #94A3B8
   --accent-primary: #0D9488
   --accent-primary-hover: #0F766E
   --accent-danger: #EF4444
   --accent-success: #10B981
   --accent-warning: #F59E0B
   --surface-dark: #0F172A

7. Create lib/locale.ts with this config:
   export const locales = {
     au: { currency: 'AUD', symbol: '$', flag: '🇦🇺', label: 'Australia', spelling: 'jewellery', goldUnit: 'gram' },
     us: { currency: 'USD', symbol: '$', flag: '🇺🇸', label: 'United States', spelling: 'jewelry', goldUnit: 'gram' },
     uk: { currency: 'GBP', symbol: '£', flag: '🇬🇧', label: 'United Kingdom', spelling: 'jewellery', goldUnit: 'gram' },
     nz: { currency: 'NZD', symbol: '$', flag: '🇳🇿', label: 'New Zealand', spelling: 'jewellery', goldUnit: 'gram' },
   }
   export const defaultLocale = 'au'

8. Set up the root layout.tsx to redirect / to /au
9. Set up [locale]/layout.tsx to read the locale param and pass it via context

Domain: lustrumo.com
Brand: Lustrumo
Tagline: "Independent Jewellery Intelligence"
```

---

## STEP 1: Navbar Component
**📸 Attach: SS-1 (StoneAlgo navbar screenshot)**
**Paste the screenshot + this prompt:**

```
Build the Lustrumo navbar component at components/layout/navbar.tsx

Reference: StoneAlgo's navbar (see screenshot). Emulate this EXACT pattern:
- Sticky, top: 0, z-50, white background, 1px bottom border (#E2E8F0), height 64px
- Left: "Lustrumo" text logo — the word "Lustrumo" in #0F172A, font-weight 700, text-xl. Optionally render the trailing "o" in #0D9488 (teal) for subtle accent.
- Centre: horizontal nav links — "Diamond Prices", "Gold Calculator", "Deal Checker"
- A "Tools" dropdown with: Diamond Price Calculator, Certification Verifier, Retailer Scorecard
- A "Learn" link
- Right: "Sign In" text button
- Mobile: hamburger menu with sheet/drawer

EXACT CSS:
- background: #FFFFFF
- border-bottom: 1px solid #E2E8F0
- height: 64px
- nav links: font-size 15px, font-weight 500, color #475569, hover color #0F172A
- padding: 0 24px

Use shadcn/ui DropdownMenu for the Tools dropdown.
Use shadcn/ui Sheet for mobile menu.
All links should use Next.js Link pointing to /[locale]/diamond-prices, /[locale]/gold-calculator etc.
```

---

## STEP 2: Footer Component
**📸 Attach: SS-8 (StoneAlgo footer screenshot)**
**Paste the screenshot + this prompt:**

```
Build the Lustrumo footer component at components/layout/footer.tsx

Clean, professional multi-column footer on white background:

Column 1 — "Tools": Diamond Prices, Gold Calculator, Diamond Calculator, Deal Checker, Certification Verifier
Column 2 — "Learn": Lab-Grown Diamonds Guide, Gold Buying Guide, 4Cs Explained, All Guides
Column 3 — "Company": About, Contact, Privacy Policy, Terms of Service
Column 4 — "Stay Updated": Newsletter email signup with input + teal submit button

Below the columns:
- Left: "© 2026 Lustrumo. Independent jewellery intelligence."
- Right: small text "Lustrumo may earn a commission from retailer links. This never affects our ratings."

Footer padding: py-16 px-8
Section spacing: gap-8 between columns
Font sizes: column headers 14px weight 600 uppercase tracking-wider #0F172A; links 14px weight 400 #475569; hover #0F172A
Separator line (1px #E2E8F0) above the copyright row
```

---

## STEP 3: Homepage Hero Section
**📸 Attach: SS-4 (StoneAlgo hero/top of homepage screenshot)**
**Paste the screenshot + this prompt:**

```
Build the homepage hero section at components/home/hero-section.tsx

This is the first thing visitors see. It must feel authoritative and premium — like a fintech platform, not a jewellery store.

Layout:
- Full-width section, min-height 500px
- Subtle background: either a slow-moving gradient mesh animation (dark navy #0F172A to teal #134E4A, very subtle, low opacity) OR a clean white background with a geometric diamond pattern watermark at 5% opacity
- Centred content:
  - H1: "Independent Jewellery Intelligence" — text-4xl (desktop) / text-3xl (mobile), font-weight 700, color #0F172A, max-width 600px
  - Subheading: "Diamond prices, gold valuations, retailer ratings, and certification verification — the data you need before you buy" — text-lg, color #475569, max-width 560px, margin-top 16px
  - CTA row (margin-top 32px, gap-12px):
    - Primary: "Check Diamond Prices" — teal bg (#0D9488), white text, px-6 py-3, rounded-lg, font-weight 600
    - Secondary: "Calculate Gold Value" — outlined, border #E2E8F0, text #475569, hover border #0D9488

Below the hero, add a stats bar:
- Horizontal row, centred, gap-48px (mobile: 2x2 grid, gap-24px)
- Top and bottom borders: 1px #E2E8F0
- Padding: 32px 0
- Each stat:
  - Number: font-family JetBrains Mono, text-3xl, font-weight 700, #0F172A
  - Label: text-sm, #94A3B8, margin-top 4px
- Stats: "50,000+" / "Diamonds Tracked" | "Live" / "Gold Prices" | "100+" / "Retailers Rated" | "24hr" / "Report Delivery"
```

---

## STEP 4: Shape Selector Component
**📸 Attach: SS-2 (StoneAlgo "Search diamonds by shape" gradient card screenshot)**
**This is the most important screenshot — crop tightly to just the gradient card with the diamond icons.**
**Paste the screenshot + this prompt:**

```
Build the diamond shape selector at components/home/shape-selector.tsx

THIS IS A SIGNATURE COMPONENT — get it visually perfect.

Reference: StoneAlgo's "Search diamonds by shape" section (see screenshot). It's a gradient card containing diamond shape icons in a horizontal row.

For Lustrumo, adapt to our palette:
- Card: background linear-gradient(135deg, #0F172A 0%, #134E4A 50%, #0D9488 100%)
- border-radius: 16px
- padding: 48px 32px 40px
- max-width: 900px, centred
- Heading: "Search diamonds by shape" — text-xl, white, font-weight 600, centred, margin-bottom 32px

Diamond shape icons in a horizontal scrollable row:
- 10 shapes: Round, Cushion, Oval, Princess, Emerald, Pear, Radiant, Asscher, Marquise, Heart
- Each icon: 60px × 60px SVG, white stroke (rgba(255,255,255,0.85)), stroke-width 1.5, no fill
- Label below each: 14px, font-weight 500, rgba(255,255,255,0.9), margin-top 8px
- Gap between shapes: 32px
- Desktop: all 10 visible. Mobile: horizontal scroll with left/right chevron arrows (semi-transparent white circles)
- Hover state: icon opacity goes to 1.0, slight scale(1.05) with 150ms transition
- Each shape links to /[locale]/diamond-prices?shape=[shape]

For the diamond SVGs, use simple geometric line-art outlines — not detailed realistic renders. Think clean wireframe-style diamond silhouettes. Use Lucide icons where available (Diamond for round), create simple SVG paths for others.
```

---

## STEP 5: Tools Grid & How It Works
**📸 Attach: SS-3 (StoneAlgo "How StoneAlgo helps you buy better" section with feature cards)**
**Paste the screenshot + this prompt:**

```
Build two homepage sections:

1. components/home/tools-grid.tsx — "Our Tools"
3-column grid (desktop), single column (mobile):

Card 1: "Diamond Price Tracker"
- Icon: TrendingUp (Lucide), in teal icon container (32px, bg #F0FDFA, rounded-lg)
- Description: "Real-time price comparison across leading retailers. Lab-grown and natural diamonds."
- Link: /[locale]/diamond-prices

Card 2: "Gold Price Calculator"
- Icon: Calculator (Lucide)
- Description: "Spot price × karat × weight. See the real value of any gold piece instantly."
- Link: /[locale]/gold-calculator

Card 3: "Is This a Good Deal?"
- Icon: ShieldCheck (Lucide)
- Description: "Paste any jeweller's product URL. Get an instant fair price verdict."
- Link: /[locale]/deal-check

Card 4: "Certification Verifier"
- Icon: FileCheck (Lucide)
- Description: "Verify IGI and GIA certificates. Flag misrepresentation before you buy."
- Link: /[locale]/verify

Card CSS:
- bg white, border 1px #E2E8F0, rounded-xl, padding 24px
- hover: shadow-md transition 200ms
- Title: 18px, weight 600, #0F172A, flex with icon, gap 8px
- Description: 14px, #475569, margin-top 8px
- Arrow link at bottom: "Explore →" in teal, 14px, weight 500

2. components/home/how-it-works.tsx — "How Lustrumo helps you buy better"
- Heading: "How **Lustrumo** helps you buy better" — the word "Lustrumo" in teal (#0D9488), rest in #0F172A
- 3-step horizontal flow (desktop) / vertical (mobile):
  Step 1: "Search & Compare" — "Browse diamond and gold prices across top retailers"
  Step 2: "Verify & Validate" — "Check certifications, compare against fair prices"
  Step 3: "Buy with Confidence" — "Get a personalised intelligence report before you commit"
- Each step has a number badge (1, 2, 3) in a teal circle, connected by a dashed line on desktop
```

---

## STEP 6: Price Snapshot + Testimonials + Compose Homepage
**📸 No screenshot needed for this step — you're composing components you already built.**
**Paste this prompt:**

```
Build two more homepage components, then compose the full homepage:

1. components/home/price-snapshot.tsx
Section heading: "Live Price Snapshot"
4-column grid (desktop), 2-column (mobile):

Card format (for each):
- Category label: bold, 14px, #0F172A
- Price: JetBrains Mono, text-2xl, weight 700, #0F172A
- Change: JetBrains Mono, 14px, weight 600 — green (#10B981) with ▲ if positive, red (#EF4444) with ▼ if negative
- Mini sparkline: 120px wide, 32px tall, teal line, no axes (use Recharts LineChart with no grid/axes)

Cards (use placeholder data for now):
- "1ct Lab-Grown Round" / "$1,420 AUD" / "▼ -3.2% (30d)" / sparkline
- "1ct Natural Round" / "$8,850 AUD" / "▼ -1.8% (30d)" / sparkline  
- "22K Gold per gram" / "$98.40 AUD" / "▲ +2.1% (30d)" / sparkline
- "18K Gold per gram" / "$72.30 AUD" / "▲ +1.9% (30d)" / sparkline

"View All Prices →" link below in teal

2. components/home/testimonials.tsx
Simple horizontal scroll of 3 testimonial cards:
- 5 star icons (filled, amber/yellow)
- Quote text: 16px, italic, #334155
- Name + context: 14px, #94A3B8 — e.g. "— Sarah M, Sydney, Engagement Ring Buyer"
Use placeholder testimonials for now.

3. NOW COMPOSE THE FULL HOMEPAGE at app/[locale]/page.tsx:
Order of sections:
<Navbar />
<HeroSection />  (includes stats bar)
<ShapeSelector />
<ToolsGrid />
<HowItWorks />
<PriceSnapshot />
<Testimonials />
<Footer />

Each section wrapped with appropriate vertical padding (py-16 or py-20).
Alternating backgrounds: white → #F8FAFC → white → #F8FAFC for visual rhythm.
```

---

## STEP 7: Gold Price Calculator Page
**📸 Attach: SS-5 (StoneAlgo Diamond Price Calculator page — we're adapting this layout for gold)**
**The gold calculator doesn't exist on StoneAlgo, but we're using their calculator layout as the template. Paste the screenshot + this prompt:**

```
Build the Gold Price Calculator at app/[locale]/gold-calculator/page.tsx

Reference StoneAlgo's Diamond Price Calculator layout (see their site). Split layout: input panel left, output panel right (stack on mobile).

PAGE TITLE: "Gold Price Calculator | Lustrumo"
H1: "Gold Price Calculator"
Subtitle: "Calculate the real value of any gold piece instantly. See melt value, making charges, and fair price ranges."

INPUT PANEL (left side, or top on mobile):
White card, border, rounded-xl, padding 24px

- Karat selector: horizontal pills (like StoneAlgo's shape selector but smaller)
  Options: 9K | 14K | 18K | 22K | 24K
  Active: teal bg, white text. Inactive: #F8FAFC bg, #475569 text
  Default: 22K selected

- Weight input: "Weight in grams"
  Numeric input with +/- stepper buttons on sides
  Default: 5.0g
  
- Gold colour selector (optional, informational):
  Pills: Yellow | White | Rose
  Default: Yellow

- "Calculate" button: full-width, teal bg, white text, rounded-lg, py-3, font-weight 600

OUTPUT PANEL (right side, or bottom on mobile):
White card, border, rounded-xl, padding 24px

Show these results (calculate client-side using placeholder gold spot price of $135.20/gram for 24K):

1. MELT VALUE (the big number):
   - Label: "Pure Gold Value" in 14px #94A3B8
   - Value: JetBrains Mono, text-3xl, weight 700, #0F172A
   - Formula shown below: "5g × 91.67% (22K purity) × $135.20/g = $619.80"
   - Formula text: JetBrains Mono, 13px, #94A3B8

2. TYPICAL RETAIL RANGE:
   - Label: "Estimated Retail Price"
   - Range: "$669 – $775 AUD"
   - Subtext: "Including typical making charges of 8–25%"

3. MAKING CHARGE GUIDE (expandable accordion):
   Small table:
   | Type | Making Charge |
   | Plain chain | 8–12% |
   | Simple ring | 12–18% |
   | Detailed pendant | 15–25% |
   | Intricate necklace | 20–35% |

4. LIVE GOLD SPOT PRICE sidebar:
   - "24K Gold Spot: $135.20 AUD/gram"
   - 24hr change: "+$1.40 (+1.05%)" in green
   - Mini sparkline showing 30-day trend

Karat purity percentages for calculation:
9K = 37.50%, 14K = 58.33%, 18K = 75.00%, 22K = 91.67%, 24K = 99.99%

Add metadata: title "Gold Price Calculator — Check Gold Value Instantly | Lustrumo"
Meta description: "Calculate the real value of any gold jewellery piece. See melt value, making charges, and fair retail prices. Free tool from Lustrumo."
```

---

## STEP 8: Diamond Price Tracker Page
**📸 Attach: SS-6 (StoneAlgo /diamond-prices/ page — the full page showing shape row, price cards, and data table with sparklines)**
**This is the core data page. Crop to show the shape selector row, the 4 price summary cards, AND at least a few rows of the price index table. Paste the screenshot + this prompt:**

```
Build the Diamond Price Tracker at app/[locale]/diamond-prices/page.tsx

DIRECTLY emulate StoneAlgo's /diamond-prices/ page layout (see screenshot).

H1: "Diamond Prices"
Subtitle: "Track lab-grown and natural diamond prices with daily updates from leading retailers."

COMPONENTS:

1. Origin toggle (top):
   Two tabs: "Natural" | "Lab Grown" 
   Active: teal underline + bold. Inactive: grey text.
   Default: Lab Grown selected.

2. Shape selector row:
   Horizontal row of 10 diamond shape icons (same component as homepage but smaller — 40px icons)
   Active shape: teal highlight. Default: Round.

3. Price summary cards (top row):
   4 cards side by side: 0.5ct, 1ct, 2ct, 3ct
   Each card shows:
   - Carat label: "1 Carat Diamond Prices"
   - Current avg price: JetBrains Mono, text-xl, weight 700
   - 30-day change: percentage, colour-coded green/red
   - Inline sparkline (80px wide)
   - Inventory count: "151K stones" in muted text

4. Price index table (main content):
   Columns: Price Index | Chart | Price (AUD) | % Change (1m) | Range (1m) | Inventory | Action
   - Price Index: linked text (e.g., "0.5 Carat Diamond Prices")
   - Chart: inline sparkline SVG
   - Price: JetBrains Mono, weight 600
   - % Change: colour-coded, JetBrains Mono
   - Range: "Low – High"
   - Inventory: count
   - Action: "View Charts →" in teal

5. Timeframe selector above table:
   Pills: 1M | 3M | 6M | 1Y
   Active: teal bg. Default: 1M.

Use PLACEHOLDER DATA for all prices. Seed with realistic values:
- 0.5ct lab-grown round: $380 AUD avg
- 1ct lab-grown round: $1,420 AUD avg
- 2ct lab-grown round: $3,200 AUD avg
- 3ct lab-grown round: $5,800 AUD avg

Mark all placeholder data with a small badge: "[Sample Data]" in amber.

Use Recharts for all charts. Teal line (#0D9488), no grid, no axes on sparklines. Full charts on click-through.
```

---

## STEP 9: Diamond Price Calculator Page
**📸 Attach: SS-5 (StoneAlgo /diamond-price-calculator/ page — showing both the input panel with pills/selectors AND the output panel with fair price estimate)**
**Take TWO screenshots if needed — one of the input panel, one of the output. Paste them + this prompt:**

```
Build the Diamond Price Calculator at app/[locale]/diamond-calculator/page.tsx

DIRECTLY emulate StoneAlgo's /diamond-price-calculator/ layout (see screenshot).

Split layout: input left, output right.

INPUT PANEL:
- Diamond Origin: "Natural" | "Lab Grown" toggle pills (default: Lab Grown)
- Shape: visual icon selector — 10 shapes in 2 rows of 5 (40px icons). Active: teal border.
- Carat: slider + numeric input side by side. Range 0.30–5.00, step 0.05. Default: 1.00
- Color: pill selector row — D, E, F, G, H, I, J, K. Active: teal. Default: G
- Clarity: pill selector row — FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2. Active: teal. Default: VS2
- "Calculate" button: full-width teal

"More Inputs" expandable section:
- Cut: Fair, Good, V.Good, Excellent pills
- Symmetry: same
- Polish: same  
- Fluorescence: VSTG, STG, MED, FNT, NON pills

OUTPUT PANEL:
White card showing:

1. Fair Price Estimate:
   - Large number: JetBrains Mono, text-3xl, weight 700, #0F172A
   - Badge below: "Round 1 Carat G VS2 — Lab Grown Diamond"
   
2. Estimate Range:
   - "Low – High" in JetBrains Mono

3. 30-Day Change:
   - Percentage, colour-coded

4. Price Per Carat:
   - Calculated value

5. Comparison callout:
   - "This is 78% cheaper than a comparable natural diamond ($6,450)"
   - Green badge with down arrow icon

Use placeholder calculation logic:
- Lab grown base prices: 0.5ct=$380, 1ct=$1420, 1.5ct=$2100, 2ct=$3200, 3ct=$5800
- Adjust ±5% per color grade step, ±3% per clarity grade step
- Natural prices: multiply lab grown × 4.5 approximately

Mark with "[Sample Data]" badge.
```

---

## STEP 10: Remaining Tool Pages (Deal Checker, Cert Verifier, Retailer Scorecard)
**📸 Attach: SS-7 (StoneAlgo Diamond Check Tool page — we're adapting this input/output pattern for the Deal Checker)**
**Paste the screenshot + this prompt:**

```
Build three more tool pages. These can be simpler for MVP — the core UX pattern matters more than data depth right now.

1. app/[locale]/deal-check/page.tsx — "Is This a Good Deal?"

Centred layout, max-width 640px:
- H1: "Is This a Good Deal?"
- Subtitle: "Paste any jeweller's product URL and get an instant fair price verdict."
- URL input: large input field, placeholder "https://jeweller.com.au/product/..."
- OR divider: "— or enter details manually —"
- Manual fields: Shape (select), Carat (input), Color (select), Clarity (select), Asking Price (input with $ prefix)
- "Check This Deal" button: full-width teal

Output (show after submit with demo data):
- Verdict badge: large rounded pill — "Fair Price" in blue, or "Great Deal" in green, or "Overpriced" in amber
- "This stone is priced at $1,800. Our fair price estimate is $1,420. That's 27% above fair value."
- Confidence score: 0–100 circular gauge
- Remaining checks: "You have 2 free checks remaining this month"
- Upsell: "Unlock unlimited checks — $149/year"

2. app/[locale]/verify/page.tsx — "Certification Verifier"

Centred layout:
- H1: "Verify a Diamond Certificate"
- Certificate number input (large, prominent)
- Lab selector: IGI | GIA | GCAL pills
- "Verify" button: teal
- Output: placeholder message "Certificate verification will be available soon. Enter your email to be notified when this tool launches."
- Email capture input + submit

3. app/[locale]/retailers/page.tsx — "Retailer Scorecard"

- H1: "Retailer Scorecard"
- Subtitle: "Independent ratings for jewellery retailers."
- "Coming Soon" state: description of what this will include + email capture
- Preview: 3 placeholder retailer cards showing the format (name, score 0-100, sub-scores, location)
```

---

## STEP 11: Learning Centre + Premium Products + Auth
**📸 No screenshot needed — these are standard content/product pages. Use the design system already established.**
**Paste this prompt:**

```
Build the remaining pages:

1. app/[locale]/learn/page.tsx — Learning Centre

Article listing page:
- H1: "Learn"
- Category filter: pills row — "All", "Lab-Grown Diamonds", "Gold Buying", "Certification", "Market Trends"
- Article grid (2-col desktop, 1-col mobile):
  Each card: placeholder image (grey bg with diamond icon), title, category badge, reading time, excerpt
- Seed with 5 placeholder articles:
  1. "Lab-Grown Diamonds: The Complete 2026 Guide" / Lab-Grown Diamonds / 12 min
  2. "22K Gold Making Charges Explained" / Gold Buying / 8 min
  3. "How to Verify a Diamond Certificate" / Certification / 6 min
  4. "Lab-Grown vs Natural: The Real Differences" / Lab-Grown Diamonds / 10 min
  5. "How Much Should You Pay for a 1 Carat Diamond?" / Market Trends / 7 min

2. app/[locale]/premium/page.tsx — Premium Products

- H1: "Premium Intelligence Reports"
- Subtitle: "Go deeper with personalised analysis."
- 3 product cards + 1 membership card:

Card 1: "Diamond Intelligence Report" / $49–$97
- "Personalised top-5 stone recommendations, fair price analysis, and certification verification."
- CTA: "Get Your Report — from $49"

Card 2: "Gold Valuation Report" / $29–$49
- "Melt value analysis, making charge assessment, and comparable pricing for any gold piece."
- CTA: "Get Gold Valuation — from $29"

Card 3: "Retailer Due Diligence Report" / $29–$49
- "Business verification, complaint history, pricing analysis, and review sentiment for any retailer."
- CTA: "Check a Retailer — from $29"

Card 4 (highlighted, teal border): "Annual Membership" / $149–$249/year
- "Unlimited deal checks, 50% off all reports, monthly market intelligence, priority access."
- CTA: "Join Lustrumo — $149/year"
- Badge: "Best Value"

3. app/[locale]/sign-in/page.tsx and app/[locale]/sign-up/page.tsx

Simple centred auth forms:
- Lustrumo logo at top
- Email + password inputs
- "Sign In" / "Create Account" teal button
- "Or continue with Google" social button
- Link to switch between sign-in/sign-up
- Placeholder only — Supabase Auth integration comes later
```

---

## STEP 12: Final Polish & SEO
**📸 No screenshot needed — this is a polish/QA pass.**
**Paste this prompt:**

```
Final polish pass across the entire Lustrumo site:

1. METADATA: Add proper <title> and meta descriptions to every page:
   - Homepage: "Lustrumo — Independent Diamond & Gold Price Intelligence"
   - Diamond Prices: "Diamond Prices — Lab-Grown & Natural Price Tracker | Lustrumo"
   - Gold Calculator: "Gold Price Calculator — Check Gold Value Instantly | Lustrumo"
   - Diamond Calculator: "Diamond Price Calculator — Fair Price Estimate | Lustrumo"
   - Deal Checker: "Is This a Good Deal? — Diamond Price Checker | Lustrumo"
   - Verify: "Verify Diamond Certificate — IGI & GIA Lookup | Lustrumo"
   - Retailers: "Retailer Scorecard — Independent Jeweller Ratings | Lustrumo"
   - Learn: "Learn — Diamond & Gold Buying Guides | Lustrumo"
   - Premium: "Premium Intelligence Reports | Lustrumo"

2. OPEN GRAPH: Add og:title, og:description, og:image (placeholder), og:url to every page.

3. RESPONSIVE CHECK: Verify every page renders correctly at 375px (mobile), 768px (tablet), 1280px (desktop). Fix any overflow, text truncation, or layout breaks.

4. NAVIGATION: Ensure all navbar and footer links point to correct /[locale]/ routes. Active page should have teal text/underline in nav.

5. 404 PAGE: Create a clean 404 page at app/not-found.tsx with the Lustrumo branding and a "Return Home" button.

6. LOADING STATES: Add skeleton loaders for the price snapshot cards and diamond price table (they'll eventually load from API).

7. FAVICON: Generate a simple favicon — "L" lettermark in teal on dark navy rounded square. Save as app/favicon.ico.

8. PERFORMANCE: Ensure all images use Next.js Image component. Verify no unnecessary client-side JS on static pages.
```

---

## DONE — What You Should Have

After completing all 12 steps, you'll have:

- ✅ Fully functional Next.js 14 site with locale-based routing (/au default)
- ✅ Homepage with 8 polished sections matching StoneAlgo's quality standard
- ✅ Gold Price Calculator (working with placeholder spot price)
- ✅ Diamond Price Tracker (with placeholder data, StoneAlgo-style layout)
- ✅ Diamond Price Calculator (with placeholder pricing logic)
- ✅ Deal Checker (MVP with demo output)
- ✅ Certification Verifier (coming soon state with email capture)
- ✅ Retailer Scorecard (coming soon state with preview cards)
- ✅ Learning Centre (5 placeholder articles)
- ✅ Premium Products page (4 products with pricing)
- ✅ Sign In / Sign Up pages (placeholder, ready for Supabase)
- ✅ Full SEO metadata on every page
- ✅ Mobile-responsive across all breakpoints
- ✅ Design system consistent with StoneAlgo's premium data-platform aesthetic

**Next steps after this build:**
1. Register lustrumo.com and deploy to Vercel
2. Connect Supabase for auth + database
3. Set up Apify scrapers to start populating real price data
4. Write the first 3 real articles for the Learning Centre
5. Connect Stripe for premium products
6. Launch 🚀

---

## TROUBLESHOOTING: When Claude Code Gets the Design Wrong

Even with screenshots, Claude Code sometimes produces output that's structurally correct but visually off. Here's how to fix it fast.

### Problem: "It looks generic / like a template"

**Fix prompt:**
```
The current output looks like a generic SaaS template. Compare it to the 
attached StoneAlgo screenshot. Specific problems:

1. [describe what's wrong — e.g., "the cards have too much padding", 
   "the gradient is too light", "the icons are too small"]
2. [another issue]
3. [another issue]

Fix each of these. Match the StoneAlgo reference for proportions, 
spacing, and visual weight. Our palette is teal/navy instead of 
blue/purple, but the LAYOUT and PROPORTIONS should match exactly.
```

### Problem: "Spacing/proportions are off"

**Fix prompt:**
```
The spacing is wrong on [component name]. Compare my screenshot 
(attached, left) to the StoneAlgo reference (attached, right).

Specific fixes needed:
- Padding inside the card should be 48px 32px, not [what it currently is]
- Gap between icons should be 32px, not [current]
- The heading should have 32px margin-bottom, not [current]
- [etc.]

Apply these exact values. Don't approximate.
```

### Problem: "The shape selector / gradient card doesn't look right"

This is the hardest component. If it's wrong, try this:

**Fix prompt:**
```
The shape selector card doesn't match the reference. Here's exactly 
what it should look like:

[attach SS-2 screenshot]

Specific CSS that MUST be applied:
- background: linear-gradient(135deg, #0F172A 0%, #134E4A 50%, #0D9488 100%)
- border-radius: 16px
- padding: 48px 32px 40px
- The diamond shape icons must be 60px × 60px, white stroke, no fill
- Icons must be in a single horizontal row with 32px gap
- On mobile: horizontal scroll with semi-transparent chevron arrows
- The heading "Search diamonds by shape" must be centred, white, 20px, weight 600

Rebuild this component from scratch using these exact values.
```

### Problem: "Charts/sparklines look wrong or don't render"

**Fix prompt:**
```
The sparklines in the price table aren't rendering correctly. 
They should be:
- 80px wide, 24px tall
- Single teal line (#0D9488), stroke-width 2
- No axes, no grid, no labels, no dots
- Smooth curve (type="monotone" in Recharts)
- Transparent background

Use this exact Recharts setup:
<LineChart width={80} height={24} data={data}>
  <Line type="monotone" dataKey="price" stroke="#0D9488" 
        strokeWidth={2} dot={false} />
</LineChart>

No ResponsiveContainer wrapper — use fixed dimensions for sparklines.
```

### Problem: "Mobile layout is broken"

**Fix prompt:**
```
The mobile layout at 375px width has these issues:
1. [describe — e.g., "horizontal overflow on the shape selector"]
2. [describe — e.g., "nav links are visible instead of hamburger menu"]
3. [describe — e.g., "price cards don't stack to single column"]

Fix each. Test at exactly 375px width. The shape selector must 
horizontal-scroll on mobile with overflow-x-auto. The stats bar 
must go to a 2×2 grid. All cards must stack to single column below 768px.
```

### The "Screenshot Sandwich" technique (most effective):

When a component is wrong, take three screenshots:
1. **What Claude Code built** (your current output)
2. **What it should look like** (StoneAlgo reference)
3. **Annotate the differences** (circle or arrow the specific problems)

Attach all three and say:

```
Image 1 is what you built. Image 2 is the reference. Image 3 shows 
the specific differences circled in red.

Fix every circled issue. The reference is the target — match it exactly, 
but use Lustrumo's teal/navy palette instead of StoneAlgo's blue/purple.
```

This "screenshot sandwich" approach gets the best results because Claude Code can literally see the gap between its output and the target.
