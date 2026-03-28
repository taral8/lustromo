import { type MetadataRoute } from "next"

const BASE_URL = "https://lustrumo.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Core pages
  const pages = [
    { path: "/au", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/au/diamond-prices", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/au/gold-prices", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/au/gold-calculator", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/au/diamond-calculator", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/au/deal-checker", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/au/certification-verifier", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/au/retailers", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/au/premium", priority: 0.6, changeFrequency: "monthly" as const },
    // Learning Centre
    { path: "/au/learn", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/au/learn/lab-grown-diamonds-guide", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/au/learn/gold-making-charges", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/au/learn/diamond-certificate-verification", priority: 0.8, changeFrequency: "monthly" as const },
    // Info pages
    { path: "/au/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/au/contact", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/au/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/au/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
