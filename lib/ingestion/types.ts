// SKILL.md Section 2.2 — Product Type Enum
export type ProductType =
  | "engagement_ring_natural"
  | "engagement_ring_labgrown"
  | "diamond_ring_natural"
  | "diamond_ring_labgrown"
  | "gold_ring"
  | "gold_bangle"
  | "gold_chain"
  | "gold_necklace"
  | "gold_earring"
  | "gold_bracelet"
  | "gold_pendant"
  | "silver_jewellery"
  | "traditional_jewellery"
  | "other"
  | "unknown"

// SKILL.md Section 2.3 — Price Status Enum
export type PriceStatus = "valid" | "zero" | "suspicious" | "missing" | "needs_review"

// SKILL.md Section 3.1 — Data Quality Flag Types
export type FlagType =
  | "price_zero"
  | "price_suspicious"
  | "price_decimal_error"
  | "product_type_unknown"
  | "product_type_mismatch"
  | "missing_cert_number"
  | "cert_unverifiable"
  | "missing_metal_weight"
  | "missing_carat"
  | "missing_cut_grade"
  | "description_only_data"
  | "image_missing"
  | "duplicate_product"

export type FlagSeverity = "HIGH" | "MEDIUM" | "LOW"

export const FLAG_SEVERITY: Record<FlagType, FlagSeverity> = {
  price_zero: "HIGH",
  price_suspicious: "HIGH",
  price_decimal_error: "HIGH",
  product_type_unknown: "MEDIUM",
  product_type_mismatch: "MEDIUM",
  missing_cert_number: "MEDIUM",
  cert_unverifiable: "HIGH",
  missing_metal_weight: "LOW",
  missing_carat: "MEDIUM",
  missing_cut_grade: "LOW",
  description_only_data: "MEDIUM",
  image_missing: "LOW",
  duplicate_product: "MEDIUM",
}

// SKILL.md Section 3.2 — Score deductions per flag
export const FLAG_SCORE_DEDUCTION: Record<FlagType, number> = {
  price_zero: 30,
  price_suspicious: 30,
  price_decimal_error: 30,
  product_type_unknown: 10,
  product_type_mismatch: 10,
  missing_cert_number: 15,
  cert_unverifiable: 20,
  missing_metal_weight: 5,
  missing_carat: 10,
  missing_cut_grade: 5,
  description_only_data: 10,
  image_missing: 5,
  duplicate_product: 5,
}

export interface DataQualityFlag {
  type: FlagType
  severity: FlagSeverity
  message: string
  rawValue?: string
}

export interface NormalisedProduct {
  lustrumo_id: string
  retailer_id: string
  retailer_product_id: string
  retailer_sku: string | null
  product_url: string
  product_title: string
  product_type: ProductType
  platform: "shopify" | "woocommerce" | "custom"
  image_url: string | null
  is_available: boolean

  price_aud: number | null
  price_aud_raw: string | null
  compare_at_price_aud: number | null
  is_gst_inclusive: boolean
  price_status: PriceStatus

  diamond_centre_carat: number | null
  diamond_centre_shape: string | null
  diamond_centre_color: string | null
  diamond_centre_clarity: string | null
  diamond_centre_cut: string | null
  diamond_centre_type: "natural" | "lab_grown" | null
  diamond_centre_cert_number: string | null
  diamond_centre_cert_body: "GIA" | "IGI" | "HRD" | "none" | null
  diamond_centre_fluorescence: string | null
  diamond_centre_polish: string | null
  diamond_centre_symmetry: string | null
  diamond_side_stone_type: "natural" | "lab_grown" | "none" | null
  diamond_side_stone_total_carat: number | null
  diamond_side_stone_count: number | null
  diamond_side_stone_quality: string | null

  setting_style: string | null
  setting_tier: string | null
  setting_metal_type: string | null
  setting_metal_karat: string | null
  setting_metal_weight_grams: number | null
  setting_ring_size_au: string | null

  gold_karat: string | null
  gold_weight_grams: number | null
  gold_purity: number | null

  // Section 4.4 — Equivalent Value Class
  evc: string | null

  data_quality_score: number
  data_quality_flags: FlagType[]

  locale: string
  raw_body_html: string | null
}

// Shopify product as returned by /products.json
export interface ShopifyProduct {
  id: number
  title: string
  handle: string
  body_html: string
  vendor: string
  product_type: string
  tags: string[]
  images: { src: string }[]
  variants: {
    id: number
    price: string
    compare_at_price: string | null
    sku: string | null
    available: boolean
  }[]
}
