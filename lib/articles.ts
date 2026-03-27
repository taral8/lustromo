export interface Article {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  content?: ArticleSection[]
}

export interface ArticleSection {
  heading: string
  body: string
}

export const articles: Article[] = [
  {
    slug: "lab-grown-diamonds",
    title: "Lab-Grown Diamonds: The Complete 2026 Guide",
    excerpt: "Everything you need to know about buying lab-grown diamonds in Australia — pricing trends, certification, and how to get the best value.",
    category: "Lab-Grown Diamonds",
    readTime: "12 min",
    content: [
      {
        heading: "What Are Lab-Grown Diamonds?",
        body: "Lab-grown diamonds are real diamonds — chemically, physically, and optically identical to mined stones. They are created using two methods: High Pressure High Temperature (HPHT) and Chemical Vapour Deposition (CVD). Both produce genuine carbon crystal structures that grade identically on the GIA and IGI scales.\n\nThe key difference is origin, not quality. A lab-grown diamond will pass every standard gemological test. The distinction matters for pricing and resale — not for brilliance, hardness, or beauty.",
      },
      {
        heading: "How Lab-Grown Pricing Works in Australia",
        body: "Lab-grown diamond prices have dropped significantly since 2021 — a 1ct round brilliant that retailed for $4,500 AUD in 2022 now typically sells between $1,200–$2,000 AUD in 2026. This collapse is driven by increasing production capacity, primarily from India and China.\n\nPrices are falling fastest in the 1–2ct round brilliant category. Fancy shapes (oval, cushion, emerald) have held slightly better due to lower production volumes. Expect continued downward pressure through 2026–2027.\n\nThe Lustrumo Diamond Price Tracker monitors these trends across Australian retailers in real time.",
      },
      {
        heading: "Certification: IGI vs GIA",
        body: "Most lab-grown diamonds sold in Australia are certified by IGI (International Gemological Institute). GIA also grades lab-grown stones but is less commonly used for them in the Australian market.\n\nBoth labs assess the same 4Cs — carat, colour, clarity, and cut. However, IGI grading can occasionally be one grade more generous than GIA on colour and clarity. When comparing prices, always ensure you're comparing within the same certifying body.\n\nAlways verify the certificate number directly with the lab before purchasing. Lustrumo's Certification Verifier cross-references cert numbers against retailer listings to flag misrepresentation.",
      },
      {
        heading: "What to Look For When Buying",
        body: "Focus on the 4Cs in this priority order for lab-grown diamonds:\n\n1. Cut — This has the biggest impact on brilliance. Insist on Excellent or Ideal cut grades.\n2. Carat — Lab-grown prices per carat drop significantly above 1.5ct, making larger stones better value.\n3. Colour — G or H colour is the sweet spot. D–F commands a premium but the difference is invisible to most people.\n4. Clarity — VS2 or better is eye-clean. Don't pay for VVS or IF unless you're a collector.\n\nAlso check: fluorescence (None or Faint is ideal), polish (Excellent), and symmetry (Excellent). These secondary factors affect light performance but are often overlooked by retailers.",
      },
      {
        heading: "Fair Price Ranges (2026)",
        body: "These are indicative fair value ranges for IGI-certified lab-grown diamonds in Australia as of early 2026. Prices include GST.\n\n• 0.50ct Round, G VS2, Excellent cut: $450–$700 AUD\n• 1.00ct Round, G VS2, Excellent cut: $1,200–$1,800 AUD\n• 1.50ct Round, G VS2, Excellent cut: $1,800–$2,800 AUD\n• 2.00ct Round, G VS2, Excellent cut: $2,500–$4,000 AUD\n• 1.00ct Oval, F VS1, Excellent cut: $1,000–$1,600 AUD\n\nPrices above these ranges warrant scrutiny. Use Lustrumo's Deal Checker to get a fair value estimate for any specific product.",
      },
      {
        heading: "Resale Value",
        body: "Lab-grown diamonds have minimal resale value — typically 10–20% of retail. This is an important factor if investment value matters to you. The rapid price decline means a stone purchased today will cost significantly less to replace in 12–24 months.\n\nIf resale matters, consider natural diamonds. If you're optimising for the best-looking stone at the lowest price, lab-grown is the clear winner.",
      },
      {
        heading: "Common Retailer Tactics to Watch For",
        body: "• Inflated compare-at prices — Some retailers show 'was $5,000, now $1,800' when the stone was never worth $5,000.\n• Mixing lab-grown side stones with natural centre stones (or vice versa) without clear disclosure.\n• Claiming IGI certification without providing a verifiable certificate number.\n• Bundling setting costs into the diamond price to make the stone appear more expensive than it is.\n\nLustrumo's unbundled valuation separates centre stone, setting, and side stone costs so you can see exactly what you're paying for.",
      },
    ],
  },
  {
    slug: "gold-buying-guide",
    title: "Gold Buying Guide: Karat, Weight & Making Charges",
    excerpt: "Understand gold purity, making charges, and how to calculate the real value of any gold piece in Australia.",
    category: "Gold Buying",
    readTime: "8 min",
    content: [
      {
        heading: "Understanding Gold Purity",
        body: "Gold purity is measured in karats (K). Pure gold is 24K — soft and impractical for most jewellery. Lower karats mix gold with alloy metals for durability and colour.\n\n• 24K = 99.9% gold — investment bars, some traditional jewellery\n• 22K = 91.6% gold — popular for traditional/Indian jewellery in Australia\n• 18K = 75.0% gold — standard for engagement rings and fine jewellery\n• 14K = 58.5% gold — durable, affordable, common in the US market\n• 9K = 37.5% gold — minimum purity to be called 'gold' in Australia\n\nHigher karat means more gold content, richer colour, but also softer metal. 18K is the sweet spot for most fine jewellery — it balances purity with durability.",
      },
      {
        heading: "How to Calculate Gold Value",
        body: "The intrinsic value of a gold piece is straightforward:\n\nIntrinsic Value = Weight (grams) × Purity × Gold Spot Price per gram (AUD)\n\nFor example, a 22K gold bangle weighing 15 grams:\n• Purity: 0.916\n• Spot price (example): $128.50/gram\n• Intrinsic value: 15 × 0.916 × $128.50 = $1,765.74\n\nThis is the melt value — what the gold alone is worth. The retail price will always be higher due to making charges.",
      },
      {
        heading: "Making Charges Explained",
        body: "Making charges (also called fabrication charges or labour charges) are the cost of turning raw gold into jewellery. They vary dramatically by piece type:\n\n• Machine-made chains: 15–30% above melt value\n• Cast rings and bangles: 25–50% above melt value\n• Handmade/traditional pieces: 50–150% above melt value\n• Designer or custom pieces: 100–250%+ above melt value\n\nA making charge of 25–40% is standard for most mass-produced gold jewellery in Australia. If a retailer's making charge exceeds 50% on a standard item, ask why — you may be paying a brand premium.\n\nLustrumo's Gold Calculator shows the intrinsic value alongside the estimated retail range so you can see the making charge as a percentage.",
      },
      {
        heading: "Hallmarking & Verification",
        body: "In Australia, gold jewellery should be hallmarked with its karat purity (e.g. '750' for 18K, '916' for 22K, '375' for 9K). Look for this stamp — usually on the inside of a ring band, the clasp of a chain, or the edge of a bangle.\n\nIf there's no hallmark, ask the retailer for a certificate of authenticity or have the piece tested by an independent jeweller. Acid testing and electronic gold testers are both reliable methods.\n\nBe cautious of pieces described as 'gold-plated', 'gold-filled', or 'gold-tone' — these contain minimal actual gold.",
      },
      {
        heading: "Buying Gold in Australia: Tips",
        body: "• Always know the current spot price — check the Lustrumo Gold Calculator before you walk into a store.\n• Ask for the gram weight before the price. Calculate the intrinsic value yourself.\n• Compare making charges across retailers for equivalent pieces.\n• For 22K traditional jewellery, specialist South Asian jewellers often offer lower making charges than mainstream retailers.\n• Gold prices are quoted in AUD per troy ounce or per gram. 1 troy ounce = 31.1035 grams.\n• All prices in Australia must be GST-inclusive for consumer sales.",
      },
    ],
  },
  {
    slug: "4cs-explained",
    title: "The 4Cs of Diamonds Explained",
    excerpt: "A data-driven breakdown of carat, colour, clarity, and cut — what actually matters for value and appearance.",
    category: "Certification",
    readTime: "10 min",
    content: [
      {
        heading: "The 4Cs Framework",
        body: "Every diamond is graded on four characteristics — Carat, Colour, Clarity, and Cut. This system, standardised by the GIA (Gemological Institute of America), is the universal language for describing diamond quality.\n\nNot all Cs are created equal. Cut has the biggest impact on how a diamond looks. Carat has the biggest impact on price. Colour and clarity matter, but their effect on appearance is often overstated by retailers trying to upsell premium grades.",
      },
      {
        heading: "Cut — The Most Important C",
        body: "Cut refers to how well a diamond's facets interact with light. It's the only C that's influenced by human craftsmanship rather than nature (or a lab).\n\nGrades: Excellent > Very Good > Good > Fair > Poor\n\nAn Excellent cut diamond will have superior brilliance (white light reflection), fire (spectral colour dispersion), and scintillation (sparkle when moved). The difference between Excellent and Good cut is visible to the naked eye.\n\nRecommendation: Always insist on Excellent or Ideal cut. This is the one grade you should not compromise on. A well-cut 0.90ct diamond will look larger and more brilliant than a poorly cut 1.00ct.",
      },
      {
        heading: "Carat — Weight, Not Size",
        body: "Carat is a unit of weight (1 carat = 0.2 grams), not physical size. However, higher carat weight generally means a larger-appearing stone.\n\nPricing is not linear — diamonds jump in price at 'magic numbers': 0.50ct, 0.70ct, 1.00ct, 1.50ct, and 2.00ct. A 0.98ct diamond can cost 15–20% less than a 1.01ct with identical specs, despite being visually indistinguishable.\n\nRecommendation: Consider buying just under a carat threshold (0.90–0.99ct instead of 1.00ct) for better value. The visual difference is negligible but the price difference is significant.",
      },
      {
        heading: "Colour — The D to Z Scale",
        body: "Diamond colour grades range from D (colourless) to Z (light yellow). Most diamonds sold in Australia fall between D and J.\n\n• D–F: Colourless — premium grades, differences only visible under magnification\n• G–H: Near-colourless — face-up white, the value sweet spot\n• I–J: Faint tint — slight warmth visible in some lighting, significantly cheaper\n• K+: Noticeable tint — not recommended unless you want a warm-toned stone\n\nRecommendation: G or H colour offers the best value. The difference between D and G is invisible in a mounted ring under normal lighting. Save the premium for a better cut grade instead.",
      },
      {
        heading: "Clarity — What the Eye Can See",
        body: "Clarity grades describe the presence of inclusions (internal) and blemishes (external):\n\n• FL / IF: Flawless / Internally Flawless — no visible inclusions at 10× magnification\n• VVS1 / VVS2: Very Very Slightly Included — inclusions extremely difficult to see at 10×\n• VS1 / VS2: Very Slightly Included — inclusions minor, not visible to naked eye\n• SI1 / SI2: Slightly Included — inclusions may be visible to naked eye in SI2\n• I1 / I2 / I3: Included — inclusions visible to naked eye, may affect brilliance\n\nRecommendation: VS2 is the sweet spot for most buyers — 'eye-clean' (no inclusions visible without magnification) at a significantly lower price than VVS or IF grades. For lab-grown diamonds, VS1 is often available at minimal premium over VS2.",
      },
      {
        heading: "How the 4Cs Affect Price",
        body: "In order of price impact:\n\n1. Carat: Exponential impact. A 2ct diamond costs 3–4× a 1ct of the same grade, not 2×.\n2. Colour: Each grade step changes price by roughly 5–8%.\n3. Clarity: Each grade step changes price by roughly 3–6%.\n4. Cut: Premium cut grades add 10–20%, but the value in appearance is disproportionately high.\n\nThe most common mistake is overspending on colour and clarity while accepting a lower cut grade. Optimise in this order: Cut first, then Carat for the size you want, then Colour (G–H), then Clarity (VS2).\n\nUse Lustrumo's Diamond Calculator to see how different specs affect fair value in the Australian market.",
      },
    ],
  },
  {
    slug: "making-charges",
    title: "22K Gold Making Charges Explained",
    excerpt: "Understand gold making charges, how they're calculated, and what's a fair premium for different types of jewellery.",
    category: "Gold Buying",
    readTime: "8 min",
  },
  {
    slug: "verify-diamond-certificate",
    title: "How to Verify a Diamond Certificate",
    excerpt: "Step-by-step guide to verifying IGI and GIA diamond certificates, spotting fakes, and understanding what each section means.",
    category: "Certification",
    readTime: "6 min",
  },
  {
    slug: "lab-grown-vs-natural",
    title: "Lab-Grown vs Natural: The Real Differences",
    excerpt: "A data-driven comparison of lab-grown and natural diamonds — price, quality, resale value, and what matters most.",
    category: "Lab-Grown Diamonds",
    readTime: "10 min",
  },
  {
    slug: "how-much-1-carat",
    title: "How Much Should You Pay for a 1 Carat Diamond?",
    excerpt: "Fair price ranges for 1 carat diamonds across all origins, shapes, and quality grades in the Australian market.",
    category: "Market Trends",
    readTime: "7 min",
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}
