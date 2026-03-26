export interface Article {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
}

export const articles: Article[] = [
  {
    slug: "lab-grown-diamonds",
    title: "Lab-Grown Diamonds: The Complete 2026 Guide",
    excerpt: "Everything you need to know about buying lab-grown diamonds in Australia — pricing trends, certification, and how to get the best value.",
    category: "Lab-Grown Diamonds",
    readTime: "12 min",
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
