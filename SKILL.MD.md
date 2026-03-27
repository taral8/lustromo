# Lustrumo — Jewellery Intelligence Platform
## SKILL: Data Normalisation, Valuation Logic & Platform Standards

> **Lustrumo** — Independent Jewellery Intelligence
> Diamond prices, gold valuations, retailer ratings, and certification verification — the data you need before you buy.

---

## 1. Platform Overview

Lustrumo is a consumer and retailer-facing jewellery intelligence platform. It ingests product data from Australian jewellery retailers (Shopify, WooCommerce, custom stores), normalises it into a structured schema, and delivers four core intelligence products:

| Pillar | Description |
|--------|-------------|
| **Diamond Price Intelligence** | Real-time and historical pricing for natural and lab-grown diamonds by cut, carat, colour, clarity, shape, and certification |
| **Gold Valuation Engine** | Live gold spot price-based valuation of gold jewellery by karat and gram weight |
| **Certification Verification** | GIA and IGI certificate lookup, validation, and cross-reference against listed product specs |
| **Retailer Ratings** | Retailer scoring based on pricing accuracy, data completeness, certification compliance, and customer signals |

**Primary users:** Both consumers researching before purchase, and retailers benchmarking their pricing and data quality.

**Strategic positioning:** Lustrumo is NOT a price comparison site. It is a value intelligence platform — a truth engine. The nuance in jewellery pricing is not an obstacle, it is the moat. Anyone can list prices side by side. Only Lustrumo structures the variables that retailers intentionally hide.

> "Morningstar for jewellery" — know what it's really worth.

**Platform voice:** Analytical, authoritative, precise. Bloomberg/Moody's aesthetic — data-first, no fluff. Never sensationalise. State facts, flag anomalies, let data speak.

### 1.1 User Segments

**Consumer (B2C):**
- Researching before buying an engagement ring, gold piece, or certified diamond
- Wants to know: "Is this worth it?" — not "Is this cheaper than that?"
- Primary entry point: Deal Checker → Diamond Price Tracker → Certification Verifier

**Retailer / B2B:**
- Jewellers benchmarking their pricing against competitors and market fundamentals
- Diamond labs and wholesalers tracking pricing trends (especially lab-grown collapse vs natural stability)
- Investors monitoring lab-grown vs natural diamond price divergence over time
- B2B access via API or dashboard — separate product tier, higher revenue per user

### 1.2 Entry Point Strategy

Build in this order — easiest data, highest consumer confusion first:

```
1. Lab-grown diamonds  ← START HERE
   - Most standardised specs
   - Prices collapsing → massive consumer confusion → high demand for clarity
   - Easiest to scrape and benchmark

2. Gold jewellery
   - Fully formula-driven (weight × purity × spot price)
   - Quick win, clear value demonstration

3. Natural diamonds
   - More complex, Rapaport-dependent
   - Higher value per transaction

4. Custom / bespoke jewellery  ← last, hardest
```

**Tech stack:** Next.js 14, TypeScript, Tailwind, Supabase, Claude API, Stripe, Apify, shadcn/ui.

---

## 2. Site Structure & Approved Copy

The Lustrumo website has already been built. Claude Code must reference this section before making any changes to copy, navigation, page structure, or tool names. Do not rename tools, change taglines, or restructure navigation without explicit instruction.

### 2.1 Brand Tagline & Hero

```
Lustrumo
Independent Jewellery Intelligence

Diamond prices, gold valuations, retailer ratings, and certification verification —
the data you need before you buy.

[Check Diamond Prices]  [Calculate Gold Value]
```

### 2.2 Hero Stats Bar

| Stat | Value |
|------|-------|
| Diamonds Tracked | 50,000+ |
| Gold Prices | Live |
| Retailers Rated | 100+ |
| Report Delivery | 24hr |

### 2.3 Diamond Shape Search

Available shapes on the search interface (in order):
`Round` `Cushion` `Oval` `Princess` `Emerald` `Pear` `Radiant` `Asscher` `Marquise` `Heart`

### 2.4 Tools Section — "Our Tools"

Section heading: **"Everything you need to make a smarter jewellery purchase"**

| Tool Name | Description | CTA |
|-----------|-------------|-----|
| Diamond Price Tracker | Real-time price comparison across leading retailers. Lab-grown and natural diamonds. | Explore → |
| Gold Price Calculator | Spot price × karat × weight. See the real value of any gold piece instantly. | Explore → |
| Is This a Good Deal? | Paste any jeweller's product URL. Get an instant fair price verdict. | Explore → |
| Certification Verifier | Verify IGI and GIA certificates. Flag misrepresentation before you buy. | Explore → |

### 2.5 How It Works — 3-Step Flow

```
1. Search & Compare
   Browse diamond and gold prices across top retailers

2. Verify & Validate
   Check certifications, compare against fair prices

3. Buy with Confidence
   Get a personalised intelligence report before you commit
```

### 2.6 Live Price Snapshot — Data Format

Section heading: **"Live Price Snapshot"** — CTA: `View All Prices →`

| Item | Price AUD | 30-day trend |
|------|-----------|-------------|
| 1ct Lab-Grown Round | $1,420 AUD | -3.2% (30d) |
| 1ct Natural Round | $8,850 AUD | -1.8% (30d) |
| 22K Gold per gram | $98.40 AUD | +2.1% (30d) |
| 18K Gold per gram | $72.30 AUD | +1.9% (30d) |

*Seed/example values only. Live data feeds from actual market rates.*

### 2.7 Testimonials — Approved Copy

Section heading: **"Trusted by Buyers Across Australia"**

> "Lustrumo's gold calculator saved me from overpaying for my wedding necklace. The making charge breakdown was eye-opening."
> — Priya K., Melbourne, 22K Gold Necklace Buyer

> "I used the deal checker before purchasing my engagement ring. Turns out the retailer was 18% above fair value. Found a better deal the same day."
> — James T., Sydney, Engagement Ring Buyer

> "As a first-time diamond buyer, the certification verifier gave me confidence that what I was buying was genuine and fairly priced."
> — Sarah M., Brisbane, Lab-Grown Diamond Buyer

### 2.8 Navigation Structure

**Header nav:** Diamond Prices · Gold Calculator · Deal Checker · Tools *(dropdown)* · Learn

**Footer columns:**

| Tools | Learn | Company |
|-------|-------|---------|
| Diamond Prices | Lab-Grown Diamonds Guide | About |
| Gold Calculator | Gold Buying Guide | Contact |
| Diamond Calculator | 4Cs Explained | Privacy Policy |
| Deal Checker | All Guides | Terms of Service |
| Certification Verifier | | |

### 2.9 URL / Route Conventions

```
/                          → Homepage
/diamond-prices            → Diamond Price Tracker
/gold-calculator           → Gold Price Calculator
/deal-checker              → Is This a Good Deal? tool
/certification-verifier    → Certification Verifier
/diamond-calculator        → Diamond Calculator
/guides                    → All Guides index
/guides/lab-grown-diamonds → Lab-Grown Diamonds Guide
/guides/gold-buying        → Gold Buying Guide
/guides/4cs                → 4Cs Explained
/about                     → About
/contact                   → Contact
/privacy                   → Privacy Policy
/terms                     → Terms of Service
```

---

## 3. Core Data Schema — Normalised Product Record

Every retailer product ingested into Lustrumo must be normalised to this schema before storage or analysis. Fields marked `[REQUIRED]` must be present for a record to be considered valid. Missing required fields trigger a data quality flag.

### 2.1 Product Identity

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `lustrumo_id` | uuid | ✅ | Internal Lustrumo record ID | `lus_abc123` |
| `retailer_id` | string | ✅ | Retailer identifier in Lustrumo | `rbdiamond_au` |
| `retailer_product_id` | string | ✅ | Original product ID at source | `9391641297152` |
| `retailer_sku` | string | — | Retailer SKU if available | `CELE-GIA-001` |
| `product_url` | url | ✅ | Canonical product page URL | `https://rbdiamond.com.au/products/...` |
| `product_title` | string | ✅ | Original product title | `Celeste 1ct Oval GIA Natural` |
| `product_type` | enum | ✅ | Normalised product type — see 2.2 | `engagement_ring_natural` |
| `platform` | enum | ✅ | Source platform | `shopify` / `woocommerce` / `custom` |
| `date_ingested` | datetime | ✅ | When Lustrumo first ingested | `2026-03-25T16:50:33Z` |
| `date_updated` | datetime | ✅ | Last seen / last updated | `2026-03-26T20:31:03Z` |
| `is_available` | boolean | ✅ | In stock at time of ingestion | `true` |

### 2.2 Product Type Enum

Always normalise retailer product types to one of these values:

```
engagement_ring_natural
engagement_ring_labgrown
diamond_ring_natural
diamond_ring_labgrown
gold_ring
gold_bangle
gold_chain
gold_necklace
gold_earring
gold_bracelet
gold_pendant
silver_jewellery
traditional_jewellery
other
unknown
```

**Classification rules:**
- If product title or body contains "GIA" or "IGI" + diamond specs → use `engagement_ring_*` or `diamond_ring_*`
- If `side_stone_type = Labgrown` or title contains "Labgrown" → suffix `_labgrown`
- If product_type field = "AUTO-GEN-DIA" (Shopify) → parse body HTML for diamond specs
- If no diamond specs found → classify as `gold_*` or `silver_jewellery` based on metal
- If classification cannot be determined → set `unknown` and flag for review

### 2.3 Pricing

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `price_aud` | decimal | ✅ | Listed price in AUD | `8614.00` |
| `price_aud_raw` | string | ✅ | Raw price string as scraped | `"8614.00"` |
| `compare_at_price_aud` | decimal | — | Original/RRP if on sale | `9200.00` |
| `is_gst_inclusive` | boolean | ✅ | Is price GST inclusive | `true` |
| `price_valid_date` | date | ✅ | Date price was verified | `2026-03-26` |
| `price_status` | enum | ✅ | See price status enum below | `valid` |

**Price status enum:**
```
valid           — price present and passes validation
zero            — price is $0.00 (unpublished / placeholder)
suspicious      — price fails decimal or range validation
missing         — no price field found
needs_review    — flagged for manual check
```

**Price validation rules — always run on ingestion:**
1. Parse price as float — if result is `0` → status = `zero`
2. If price > $500,000 AUD → status = `suspicious` (likely decimal error)
3. If price < $50 AUD for a diamond product → status = `suspicious`
4. Compare raw string: if `price_aud * 100 == parseInt(price_aud_raw)` → decimal error detected, divide by 100 and flag
5. If `price_aud` cannot be parsed as a number → status = `missing`

### 2.4 Diamond Fields

Only populated for product_type containing `diamond` or `engagement_ring`.

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `diamond.centre_carat` | decimal | ✅ | Centre stone carat weight | `1.00` |
| `diamond.centre_shape` | string | ✅ | Oval / Round / Emerald / Pear etc | `Oval` |
| `diamond.centre_color` | string | ✅ | GIA colour grade D–Z | `H` |
| `diamond.centre_clarity` | string | ✅ | GIA clarity grade | `VS1` |
| `diamond.centre_cut` | string | — | Excellent / Very Good / Good | `Excellent` |
| `diamond.centre_type` | enum | ✅ | `natural` / `lab_grown` | `natural` |
| `diamond.centre_cert_number` | string | ✅ | Certificate number | `1548318613` |
| `diamond.centre_cert_body` | enum | ✅ | `GIA` / `IGI` / `HRD` / `none` | `GIA` |
| `diamond.centre_fluorescence` | string | — | None / Faint / Medium / Strong | `None` |
| `diamond.centre_polish` | string | — | Excellent / VG / Good | `Excellent` |
| `diamond.centre_symmetry` | string | — | Excellent / VG / Good | `Excellent` |
| `diamond.side_stone_type` | enum | — | `natural` / `lab_grown` / `none` | `natural` |
| `diamond.side_stone_total_carat` | decimal | — | Total side stone carat weight | `0.30` |
| `diamond.side_stone_count` | integer | — | Number of side stones | `24` |
| `diamond.side_stone_quality` | string | — | Approx grade | `F/VS` |

### 2.5 Setting Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `setting.style` | string | ✅ | Solitaire / Halo / Pavé / Tension | `Tension` |
| `setting.tier` | enum | — | `basic` / `standard` / `premium` / `custom` | `premium` |
| `setting.metal_type` | string | ✅ | 18K Yellow Gold / Platinum etc | `18K Yellow Gold` |
| `setting.metal_karat` | string | ✅ | 9K / 14K / 18K / 22K / 24K / Plat | `18K` |
| `setting.metal_weight_grams` | decimal | — | Metal weight in grams | `3.8` |
| `setting.ring_size_au` | string | — | Australian ring size | `M` |
| `setting.is_au_made` | boolean | — | Australian-made setting | `true` |

### 2.6 Gold Fields

Only populated for `gold_*` product types.

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `gold.karat` | string | ✅ | 9K / 14K / 18K / 22K / 24K | `22K` |
| `gold.weight_grams` | decimal | ✅ | Total gold weight in grams | `8.5` |
| `gold.purity` | decimal | ✅ | Gold purity as decimal | `0.916` |
| `gold.spot_price_date` | date | — | Gold spot price date used | `2026-03-26` |
| `gold.spot_price_aud_per_gram` | decimal | — | AUD per gram at ingestion | `128.50` |
| `gold.intrinsic_value_aud` | decimal | — | weight × purity × spot price | `1000.14` |

**Gold purity reference:**
```
9K  = 0.375
14K = 0.585
18K = 0.750
22K = 0.916
24K = 0.999
```

---

## 4. Data Quality Flags

Every ingested record receives a `data_quality_score` (0–100) and a set of flags. Flags drive the retailer rating system.

### 3.1 Flag Types

| Flag | Severity | Trigger |
|------|----------|---------|
| `price_zero` | HIGH | price_aud = 0 |
| `price_suspicious` | HIGH | Fails price validation rules |
| `price_decimal_error` | HIGH | Detected ×100 or ÷100 error |
| `product_type_unknown` | MEDIUM | Could not classify product type |
| `product_type_mismatch` | MEDIUM | Tool classified differently to retailer |
| `missing_cert_number` | MEDIUM | Diamond product with no cert |
| `cert_unverifiable` | HIGH | Cert number not found in GIA/IGI API |
| `missing_metal_weight` | LOW | gold_* product with no gram weight |
| `missing_carat` | MEDIUM | Diamond product with no carat weight |
| `missing_cut_grade` | LOW | Diamond with no cut grade |
| `description_only_data` | MEDIUM | Diamond specs only in HTML, not structured |
| `image_missing` | LOW | No product image |
| `duplicate_product` | MEDIUM | Same cert number found on multiple listings |

### 3.2 Data Quality Score Calculation

```
Start at 100
-30  price_zero or price_suspicious
-20  cert_unverifiable
-15  missing_cert_number (diamond product)
-10  product_type_unknown
-10  missing_carat (diamond product)
-10  description_only_data
-5   missing_metal_weight (gold product)
-5   missing_cut_grade
-5   image_missing
-5   duplicate_product (per occurrence)
Minimum score = 0
```

---

## 5. Valuation Logic

### 4.1 Diamond Valuation — Unbundled Components

Never value a piece as a single unit. Always split into three components:

```
Total Fair Value = Centre Stone Value + Setting Value + Side Stone Value
```

**Centre stone value:**
- Source: Rapaport price list (natural) or IDEX (lab-grown) — updated weekly
- Apply: discount/premium based on cut, fluorescence, polish, symmetry
- Natural premium: +15–25% over rap for GIA Excellent cut rounds
- Lab-grown discount: currently 80–90% below equivalent natural

**Setting value tiers (AUD, indicative):**
```
Basic solitaire (9K/14K)     $300 – $600
Standard solitaire (18K)     $500 – $900
Pavé / Halo (18K)            $800 – $1,500
Premium custom (18K/Plat)    $1,500 – $3,500
Platinum setting             $2,000 – $5,000+
```

**Side stone value:**
- Calculate: total_carat × per_carat_rate × quality_multiplier
- Quality multiplier: F/VS = 1.0, G/SI = 0.7, H/SI2 = 0.5
- Lab-grown sides: apply 80% discount vs natural equivalent

### 4.2 Gold Valuation Formula

```
intrinsic_value = weight_grams × purity × spot_price_aud_per_gram
retail_value = intrinsic_value × making_charge_multiplier
```

Making charge multipliers (indicative):
```
Machine-made chain:    1.15 – 1.30
Cast ring/bangle:      1.25 – 1.50
Handmade/traditional:  1.50 – 2.50
```

### 4.3 Fair Value Range

Always express fair value as a range, not a single number:

```
fair_value_low  = centre_stone_low + setting_low + side_stone_low
fair_value_high = centre_stone_high + setting_high + side_stone_high
fair_value_mid  = (fair_value_low + fair_value_high) / 2
```

Display format: `$6,271 – $8,813 (mid: $7,507)`

### 4.4 Equivalent Value Class (EVC)

The core concept that separates Lustrumo from a simple comparison site. Instead of comparing SKUs directly, assign every product an EVC — a standardised value bucket based on its deconstructed components.

**EVC is defined by:**
```
diamond_type + carat_band + color_band + clarity_band + shape + cert_body
```

**Example EVC:**
```
LAB-1.00-FG-VS-OVAL-IGI
NAT-1.00-GH-VS1-ROUND-GIA
```

**Rules:**
- Carat bands: 0.50–0.69 / 0.70–0.89 / 0.90–1.09 / 1.10–1.49 / 1.50–1.99 / 2.00+
- Color bands: DEF / GH / IJ / KL+
- Clarity bands: FL-IF / VVS / VS / SI1 / SI2 / I+
- Products in the same EVC are directly comparable
- Products in different EVCs are NOT directly comparable — show EVC alongside any comparison
- Always display: "Comparing within value class: LAB-1.00-FG-VS-OVAL-IGI"

**Why this matters:**
Retailers intentionally avoid standardisation to prevent comparison. EVC forces like-for-like benchmarking without requiring identical products. This is the technical moat.

---

## 6. Comparison Tool Rules

When running a price comparison or deal check:

1. **Always validate price first** — run price validation rules before comparison
2. **Never compare a zero-price product** — return `insufficient_data` status
3. **Check product type classification** — if classified as wrong type, flag and skip valuation
4. **Require minimum fields** — need at minimum: carat, color, clarity, cert_body, metal_type
5. **Show confidence score** — every comparison result includes a `data_confidence` rating (0–100) based on how many fields are populated
6. **Never display "Great Deal" or "Overpriced"** without confidence ≥ 60
7. **Always show unbundled breakdown** — never a single opaque number

**Comparison result statuses:**
```
great_deal        — price < 85% of fair_value_low
good_value        — price within 85–100% of fair_value_low
fair_price        — price within fair range
slightly_above    — price 100–115% of fair_value_high
overpriced        — price > 115% of fair_value_high
insufficient_data — missing required fields for comparison
needs_review      — data quality flags present
```

---

## 7. Disclaimer Copy

### 6.1 Platform-Level Disclaimer (Comparison Results Page)

> Lustrumo fair value estimates are based on current diamond market data, live gold spot prices, and indicative setting costs. Estimates reflect the assessed intrinsic and market value of the specific diamond grade, metal type, and setting style. They do not account for brand premium, bespoke craftsmanship, or retailer-specific factors. Results should be used as a guide only. Always request a detailed breakdown from your retailer before purchasing.

### 6.2 Condensed Disclaimer (Below Price Comparison Widget)

> Fair value estimate based on diamond grade, metal weight, and setting complexity. Individual retailer pricing may vary. Data confidence: [SCORE]/100.

### 6.3 Insufficient Data Warning

> We couldn't generate a reliable estimate for this product. Key data — such as diamond grade, metal weight, or certified stone details — was not available in the retailer's listing. Ask your retailer for a full specification sheet before comparing prices.

### 6.4 Data Quality Warning (Low Confidence)

> This estimate is based on incomplete product data. Some fields were missing or could not be verified. Treat this result as indicative only.

### 6.5 Zero Price / Unpriced Product

> This product does not have a published price. Contact the retailer directly for pricing. Lustrumo cannot generate a comparison without a verified listed price.

---

## 8. Retailer Rating System

Retailers are scored across four dimensions, each weighted:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Data Completeness | 30% | % of required fields populated across all products |
| Pricing Accuracy | 30% | % of products with valid, non-zero, non-suspicious prices |
| Certification Compliance | 25% | % of diamond products with verifiable cert numbers |
| Response/Recency | 15% | How frequently product data is updated |

**Overall retailer score = weighted average × 100**

Rating tiers:
```
90–100  Lustrumo Verified ✦
75–89   High Confidence
50–74   Moderate Confidence
25–49   Low Confidence
0–24    Insufficient Data
```

---

## 9. Ingestion Pipeline Rules

When building or modifying the ingestion pipeline:

1. **Always run price validation** before storing any price field
2. **Parse diamond specs from HTML** if structured fields are missing — use regex on body_html for patterns like `1.00ct`, `VS1`, `GIA`, `#[0-9]{10}`
3. **Never store raw Shopify cents as dollars** — divide by 100 if source is Shopify Admin API variants price field (stored as string e.g. `"8614.00"` — this is already in dollars, do NOT divide)
4. **Detect decimal errors** — if scraped price / 100 falls within a plausible range for the product type, flag as potential decimal error
5. **Deduplicate by cert number** — if two retailer products share the same GIA/IGI cert number, flag both as `duplicate_product`
6. **Classify before storing** — always resolve product_type enum before insert
7. **Log every flag** — all data quality flags must be written to the `ingestion_logs` table with timestamp, retailer_id, product_id, and flag type

---

## 10. B2B Intelligence Layer

Lustrumo's B2B tier is a separate product from the consumer tools. Build with future API access in mind from day one.

### 10.1 B2B Use Cases

| User Type | What They Need | Lustrumo Product |
|-----------|---------------|-----------------|
| Independent jeweller | How is my pricing vs market for equivalent products? | Retailer benchmarking dashboard |
| Diamond wholesaler / lab | How are lab-grown prices trending by spec? | Price trend analytics by EVC |
| Jewellery investor | Natural vs lab-grown price divergence over time | Market intelligence reports |
| Retail chain buyer | Which specs are overpriced in the Australian market? | Market anomaly alerts |
| Insurance valuator | Fair replacement value for a given spec | Valuation API |

### 10.2 B2B Data Products

**Retailer Benchmarking Dashboard:**
- Upload your product catalogue
- Lustrumo assigns EVC to each product
- Shows: your price vs market median, percentile ranking, overpriced/underpriced flags
- Delivered as dashboard or CSV export

**Price Trend Analytics:**
- Track average price by EVC over time
- Lab-grown collapse tracking — critical insight as prices drop 80%+ vs natural
- Natural diamond stability index
- Weekly / monthly / quarterly views

**Market Anomaly Alerts:**
- Flag when a retailer prices significantly outside EVC band
- Useful for competitor intelligence and consumer protection

**Valuation API:**
- Input: diamond specs or gold item details
- Output: fair value range, EVC, confidence score, market context
- Pricing: per-call or monthly subscription

### 10.3 B2B Pricing Model (Indicative)

```
Retailer Benchmarking    $297/month   up to 500 products
Wholesaler Analytics     $597/month   full trend data + EVC breakdown
Valuation API            $0.50/call   or $299/month for 1,000 calls
Enterprise               Custom       white-label + dedicated data feed
```

### 10.4 B2B Build Sequence

Do NOT build B2B first. Consumer product must have traction and data volume before B2B is viable:

```
Phase 1 (now)      → Consumer tools — Deal Checker, Gold Calculator
Phase 2            → Data volume — 10,000+ products ingested, EVC assigned
Phase 3            → Retailer Ratings published — creates B2B awareness
Phase 4            → B2B dashboard — retailers respond to their own ratings
Phase 5            → Valuation API — productise the engine
```

---

## 11. Platform Tone & Copy Standards

- **Analytical, not alarmist** — "This product is priced 23% above our fair value estimate" not "OVERPRICED!"
- **Precise** — always show the number, never vague ranges without context
- **Neutral on retailers** — report data, do not editoralise
- **Consumer empowerment framing** — "Here's what the data shows" not "Don't buy this"
- **Confidence transparency** — always show data confidence score alongside estimates
- **AUD by default** — all prices in Australian Dollars inc. GST unless stated
- **Certification-first** — GIA/IGI cert numbers are the source of truth for diamond identity

---

## 12. Key References

- GIA 4Cs grading: https://www.gia.edu/4cs
- IGI certificate lookup: https://www.igi.org/verify-your-report
- GIA certificate lookup: https://www.gia.edu/report-check
- Gold spot price (AUD): use live feed — do not hardcode
- Rapaport price list: weekly update required for natural diamond pricing
- IDEX: lab-grown diamond price index

---

*Last updated: March 2026 — added B2B layer, EVC, entry point strategy | Lustrumo Internal — not for distribution*
