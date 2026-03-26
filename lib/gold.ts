export const karatPurity: Record<string, number> = {
  "9K": 0.375,
  "14K": 0.5833,
  "18K": 0.75,
  "22K": 0.9167,
  "24K": 0.9999,
}

export const makingCharges = [
  { type: "Plain chain", range: [8, 12] as [number, number] },
  { type: "Simple ring", range: [12, 18] as [number, number] },
  { type: "Detailed pendant", range: [15, 25] as [number, number] },
  { type: "Intricate necklace", range: [20, 35] as [number, number] },
]

export const placeholderGoldSpot = {
  pricePerGram: 135.20,
  pricePerOunce: 4205.50,
  change24h: 1.40,
  changePercent24h: 1.05,
}

export function calculateMeltValue(weightGrams: number, karat: string, spotPricePerGram: number): number {
  const purity = karatPurity[karat] ?? 0.75
  return weightGrams * purity * spotPricePerGram
}
