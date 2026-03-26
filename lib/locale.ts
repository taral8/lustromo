export type Locale = "au" | "us" | "uk" | "nz"

export const locales = {
  au: { currency: "AUD", symbol: "$", flag: "\u{1F1E6}\u{1F1FA}", label: "Australia", spelling: "jewellery" as const, goldUnit: "gram" },
  us: { currency: "USD", symbol: "$", flag: "\u{1F1FA}\u{1F1F8}", label: "United States", spelling: "jewelry" as const, goldUnit: "gram" },
  uk: { currency: "GBP", symbol: "\u00A3", flag: "\u{1F1EC}\u{1F1E7}", label: "United Kingdom", spelling: "jewellery" as const, goldUnit: "gram" },
  nz: { currency: "NZD", symbol: "$", flag: "\u{1F1F3}\u{1F1FF}", label: "New Zealand", spelling: "jewellery" as const, goldUnit: "gram" },
} as const

export const defaultLocale: Locale = "au"

export function isValidLocale(locale: string): locale is Locale {
  return locale in locales
}

export function getLocaleConfig(locale: Locale) {
  return locales[locale]
}

export function formatPrice(amount: number, locale: Locale = "au"): string {
  const config = locales[locale]
  return `${config.symbol}${amount.toLocaleString("en-AU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function formatPriceDecimal(amount: number, locale: Locale = "au"): string {
  const config = locales[locale]
  return `${config.symbol}${amount.toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
