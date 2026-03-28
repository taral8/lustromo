/**
 * Lustrumo — Retailer Registry
 *
 * Central config for all Australian Shopify jewellery retailers
 * that Lustrumo scrapes for price intelligence.
 */

export interface RetailerConfig {
  name: string
  baseUrl: string
  locale: string
  platform: "shopify" | "woocommerce" | "custom"
  categories: ("gold" | "diamond" | "lab_grown" | "silver" | "traditional")[]
  active: boolean
}

export const retailers: RetailerConfig[] = [
  {
    name: "RB Diamond Jewellers",
    baseUrl: "https://rbdiamond.com.au",
    locale: "au",
    platform: "shopify",
    categories: ["gold", "diamond", "silver", "traditional"],
    active: true,
  },
  {
    name: "Bevilles Jewellers",
    baseUrl: "https://www.bevilles.com.au",
    locale: "au",
    platform: "shopify",
    categories: ["gold", "diamond", "silver", "lab_grown"],
    active: true,
  },
  {
    name: "My Jewellery Story",
    baseUrl: "https://www.myjewellerystory.com.au",
    locale: "au",
    platform: "shopify",
    categories: ["lab_grown", "diamond"],
    active: true,
  },
  {
    name: "Armans Fine Jewellery",
    baseUrl: "https://armansfinejewellery.com",
    locale: "au",
    platform: "shopify",
    categories: ["diamond", "lab_grown", "gold"],
    active: true,
  },
  {
    name: "Shiels Jewellers",
    baseUrl: "https://www.shiels.com.au",
    locale: "au",
    platform: "shopify",
    categories: ["diamond", "gold", "lab_grown", "silver"],
    active: true,
  },
  {
    name: "Novita Diamonds",
    baseUrl: "https://novitadiamonds.com",
    locale: "au",
    platform: "shopify",
    categories: ["lab_grown", "diamond"],
    active: true,
  },
  {
    name: "Luke Rose Jewellery",
    baseUrl: "https://lukerosejewellery.com",
    locale: "au",
    platform: "shopify",
    categories: ["gold", "diamond"],
    active: true,
  },
  {
    name: "Lindelli",
    baseUrl: "https://www.lindelli.com",
    locale: "au",
    platform: "shopify",
    categories: ["lab_grown", "diamond"],
    active: true,
  },
]

export function getActiveRetailers(): RetailerConfig[] {
  return retailers.filter(r => r.active)
}

export function deriveRetailerId(config: RetailerConfig): string {
  return config.baseUrl
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\.com\.au$|\.com$/, "")
    .replace(/[^a-z0-9]/g, "") + "_" + config.locale
}
