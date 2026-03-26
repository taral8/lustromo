export type DiamondShape = "round" | "cushion" | "oval" | "princess" | "emerald" | "pear" | "radiant" | "asscher" | "marquise" | "heart"
export type DiamondOrigin = "natural" | "lab_grown"

export interface DiamondPriceIndex {
  shape: DiamondShape
  carat: number
  origin: DiamondOrigin
  avgPrice: number
  minPrice: number
  maxPrice: number
  change30d: number
  inventoryCount: number
  sparklineData: number[]
}

export const shapeLabels: Record<DiamondShape, string> = {
  round: "Round", cushion: "Cushion", oval: "Oval", princess: "Princess",
  emerald: "Emerald", pear: "Pear", radiant: "Radiant", asscher: "Asscher",
  marquise: "Marquise", heart: "Heart",
}

export const diamondPriceData: DiamondPriceIndex[] = [
  // Lab-Grown Round
  { shape: "round", carat: 0.5, origin: "lab_grown", avgPrice: 380, minPrice: 200, maxPrice: 650, change30d: -5.2, inventoryCount: 45200, sparklineData: [405, 400, 395, 390, 388, 385, 382, 380, 380] },
  { shape: "round", carat: 1.0, origin: "lab_grown", avgPrice: 1420, minPrice: 650, maxPrice: 2200, change30d: -3.2, inventoryCount: 151000, sparklineData: [1500, 1490, 1475, 1460, 1445, 1435, 1425, 1420, 1420] },
  { shape: "round", carat: 2.0, origin: "lab_grown", avgPrice: 3200, minPrice: 1600, maxPrice: 5500, change30d: -6.5, inventoryCount: 38700, sparklineData: [3420, 3380, 3340, 3300, 3260, 3230, 3210, 3200, 3200] },
  { shape: "round", carat: 3.0, origin: "lab_grown", avgPrice: 5800, minPrice: 3000, maxPrice: 9500, change30d: -4.8, inventoryCount: 12300, sparklineData: [6090, 6050, 6010, 5970, 5930, 5870, 5820, 5800, 5800] },
  // Natural Round
  { shape: "round", carat: 0.5, origin: "natural", avgPrice: 2150, minPrice: 1500, maxPrice: 3200, change30d: -1.2, inventoryCount: 42100, sparklineData: [2180, 2175, 2170, 2165, 2160, 2155, 2152, 2150, 2150] },
  { shape: "round", carat: 1.0, origin: "natural", avgPrice: 8850, minPrice: 5500, maxPrice: 15000, change30d: -1.8, inventoryCount: 82300, sparklineData: [9010, 8990, 8960, 8940, 8910, 8880, 8860, 8850, 8850] },
  { shape: "round", carat: 2.0, origin: "natural", avgPrice: 28500, minPrice: 17000, maxPrice: 52000, change30d: -0.9, inventoryCount: 21500, sparklineData: [28750, 28700, 28650, 28600, 28560, 28530, 28510, 28500, 28500] },
  { shape: "round", carat: 3.0, origin: "natural", avgPrice: 62000, minPrice: 35000, maxPrice: 120000, change30d: 0.5, inventoryCount: 8760, sparklineData: [61700, 61800, 61850, 61900, 61950, 62000, 62010, 62000, 62000] },
  // Lab-Grown Oval
  { shape: "oval", carat: 1.0, origin: "lab_grown", avgPrice: 1050, minPrice: 550, maxPrice: 1800, change30d: -4.1, inventoryCount: 87600, sparklineData: [1100, 1090, 1080, 1070, 1065, 1060, 1055, 1050, 1050] },
  // Natural Oval
  { shape: "oval", carat: 1.0, origin: "natural", avgPrice: 7200, minPrice: 4200, maxPrice: 12000, change30d: -1.5, inventoryCount: 56700, sparklineData: [7310, 7280, 7260, 7240, 7220, 7210, 7200, 7200, 7200] },
  // Cushion
  { shape: "cushion", carat: 1.0, origin: "lab_grown", avgPrice: 950, minPrice: 500, maxPrice: 1600, change30d: -5.3, inventoryCount: 76500, sparklineData: [1005, 998, 990, 980, 970, 963, 958, 952, 950] },
  { shape: "cushion", carat: 1.0, origin: "natural", avgPrice: 6800, minPrice: 3800, maxPrice: 11500, change30d: -1.1, inventoryCount: 43200, sparklineData: [6875, 6860, 6845, 6830, 6820, 6810, 6805, 6800, 6800] },
  // Princess
  { shape: "princess", carat: 1.0, origin: "lab_grown", avgPrice: 880, minPrice: 450, maxPrice: 1500, change30d: -6.2, inventoryCount: 54300, sparklineData: [940, 930, 920, 910, 900, 895, 888, 882, 880] },
  { shape: "princess", carat: 1.0, origin: "natural", avgPrice: 6200, minPrice: 3500, maxPrice: 10500, change30d: -1.8, inventoryCount: 34500, sparklineData: [6315, 6290, 6270, 6250, 6235, 6220, 6210, 6205, 6200] },
  // Emerald
  { shape: "emerald", carat: 1.0, origin: "lab_grown", avgPrice: 920, minPrice: 480, maxPrice: 1550, change30d: -4.7, inventoryCount: 43200, sparklineData: [965, 958, 950, 942, 935, 930, 925, 922, 920] },
  { shape: "emerald", carat: 1.0, origin: "natural", avgPrice: 6500, minPrice: 3600, maxPrice: 11000, change30d: 0.3, inventoryCount: 28700, sparklineData: [6480, 6485, 6490, 6492, 6495, 6498, 6500, 6500, 6500] },
  // Pear
  { shape: "pear", carat: 1.0, origin: "lab_grown", avgPrice: 980, minPrice: 510, maxPrice: 1650, change30d: -5.8, inventoryCount: 56700, sparklineData: [1040, 1030, 1020, 1010, 1000, 995, 988, 982, 980] },
  { shape: "pear", carat: 1.0, origin: "natural", avgPrice: 7000, minPrice: 4000, maxPrice: 11800, change30d: -0.5, inventoryCount: 32100, sparklineData: [7035, 7025, 7020, 7015, 7010, 7005, 7002, 7000, 7000] },
]

export function getDiamondPrices(origin: DiamondOrigin, shape?: DiamondShape): DiamondPriceIndex[] {
  return diamondPriceData.filter(d => d.origin === origin && (!shape || d.shape === shape))
}

// Base prices for calculator (lab-grown)
export const labGrownBasePrice: Record<number, number> = { 0.5: 380, 1: 1420, 1.5: 2100, 2: 3200, 3: 5800 }

export function estimateDiamondPrice(
  carat: number, color: string, clarity: string, origin: DiamondOrigin
): { fairPrice: number; low: number; high: number } {
  const colorGrades = ["D","E","F","G","H","I","J","K"]
  const clarityGrades = ["FL","IF","VVS1","VVS2","VS1","VS2","SI1","SI2"]
  const colorIdx = colorGrades.indexOf(color)
  const clarityIdx = clarityGrades.indexOf(clarity)

  // Find closest carat base
  const carats = [0.5, 1, 1.5, 2, 3]
  let basePrice = 1420
  let closestDiff = Infinity
  for (const c of carats) {
    const diff = Math.abs(c - carat)
    if (diff < closestDiff) {
      closestDiff = diff
      basePrice = labGrownBasePrice[c]
    }
  }

  // Scale by carat (rough interpolation)
  const caratFactor = carat / (carats.find(c => Math.abs(c - carat) === closestDiff) || 1)
  let price = basePrice * caratFactor

  // Adjust for color (5% per grade from G baseline at index 3)
  price *= 1 + (3 - colorIdx) * 0.05

  // Adjust for clarity (3% per grade from VS2 baseline at index 5)
  price *= 1 + (5 - clarityIdx) * 0.03

  if (origin === "natural") price *= 4.5

  const low = Math.round(price * 0.85)
  const high = Math.round(price * 1.15)
  return { fairPrice: Math.round(price), low, high }
}
