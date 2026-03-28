import Stripe from "stripe"

// Server-side Stripe client
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key)
}

// Product price IDs — set these in env after creating products in Stripe Dashboard
export const STRIPE_PRICES = {
  diamond_report: process.env.STRIPE_PRICE_DIAMOND_REPORT || "",
  gold_report: process.env.STRIPE_PRICE_GOLD_REPORT || "",
  retailer_report: process.env.STRIPE_PRICE_RETAILER_REPORT || "",
  annual_membership: process.env.STRIPE_PRICE_ANNUAL_MEMBERSHIP || "",
} as const

export type ProductType = keyof typeof STRIPE_PRICES

export const PRODUCT_META: Record<ProductType, { name: string; mode: "payment" | "subscription" }> = {
  diamond_report: { name: "Diamond Intelligence Report", mode: "payment" },
  gold_report: { name: "Gold Valuation Report", mode: "payment" },
  retailer_report: { name: "Retailer Due Diligence Report", mode: "payment" },
  annual_membership: { name: "Lustrumo Annual Membership", mode: "subscription" },
}
