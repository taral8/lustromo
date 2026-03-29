export interface Article {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  image: string        // path under /images/learn/
  featured?: boolean   // cornerstone articles shown first
  content?: ArticleSection[]
}

export interface ArticleSection {
  heading: string
  body: string
}

export const articles: Article[] = [
  // ─── Cornerstone SEO articles (dedicated page routes) ───
  {
    slug: "lab-grown-diamonds-guide",
    title: "Lab-Grown Diamonds: The Complete 2026 Guide",
    excerpt: "Current prices, CVD vs HPHT, IGI vs GIA certification, resale value, and how to check if you're getting a fair price. Based on 9,400+ products from Australian retailers.",
    category: "Lab-Grown Diamonds",
    readTime: "12 min",
    image: "/images/learn/lab-grown-diamonds-guide.jpg",
    featured: true,
  },
  {
    slug: "gold-making-charges",
    title: "Gold Making Charges Explained: What's Fair in Australia?",
    excerpt: "Making charges range from 15% to over 50%. Learn what's normal for rings, chains, bangles and necklaces using data from 6,600+ Australian gold products.",
    category: "Gold Buying",
    readTime: "8 min",
    image: "/images/learn/gold-making-charges.jpg",
    featured: true,
  },
  {
    slug: "diamond-certificate-verification",
    title: "How to Verify a Diamond Certificate (IGI & GIA)",
    excerpt: "Step-by-step guide to verifying IGI and GIA certificates online. Check if your diamond's grading is legitimate and matches what the retailer claims.",
    category: "Certification",
    readTime: "6 min",
    image: "/images/learn/diamond-certificate-verification.jpg",
    featured: true,
  },
  // ─── Additional articles (dynamic [slug] route) ───
  {
    slug: "gold-buying-guide",
    title: "Gold Buying Guide: Karat, Weight & Making Charges",
    excerpt: "Understand gold purity, making charges, and how to calculate the real value of any gold piece in Australia.",
    category: "Gold Buying",
    readTime: "8 min",
    image: "/images/learn/gold-buying-guide.jpg",
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
    image: "/images/learn/4cs-explained.jpg",
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
    slug: "lab-grown-vs-natural",
    title: "Lab-Grown vs Natural: The Real Differences",
    excerpt: "A data-driven comparison of lab-grown and natural diamonds — price, quality, resale value, and what matters most.",
    category: "Lab-Grown Diamonds",
    readTime: "10 min",
    image: "/images/learn/lab-grown-vs-natural.jpg",
  },
  {
    slug: "how-much-1-carat",
    title: "How Much Should You Pay for a 1 Carat Diamond?",
    excerpt: "Fair price ranges for 1 carat diamonds across all origins, shapes, and quality grades in the Australian market.",
    category: "Market Trends",
    readTime: "7 min",
    image: "/images/learn/how-much-1-carat.jpg",
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}
