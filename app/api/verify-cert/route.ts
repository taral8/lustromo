import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

/**
 * POST /api/verify-cert
 *
 * Cross-references a certificate number against the Lustrumo products database
 * and provides external verification links for GIA/IGI.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { certNumber, certBody } = body

    if (!certNumber || typeof certNumber !== "string") {
      return NextResponse.json({ error: "Certificate number is required" }, { status: 400 })
    }

    const cleaned = certNumber.replace(/[^a-zA-Z0-9]/g, "").trim()
    if (cleaned.length < 5) {
      return NextResponse.json({ error: "Certificate number must be at least 5 characters" }, { status: 400 })
    }

    const lab = (certBody || "").toUpperCase()
    if (!["GIA", "IGI", "HRD"].includes(lab)) {
      return NextResponse.json({ error: "Grading lab must be GIA, IGI, or HRD" }, { status: 400 })
    }

    // External verification URLs (Section 12)
    const verifyUrls: Record<string, string> = {
      GIA: `https://www.gia.edu/report-check?reportno=${cleaned}`,
      IGI: `https://www.igi.org/verify-your-report?r=${cleaned}`,
      HRD: `https://my.hrdantwerp.com/?record_number=${cleaned}`,
    }

    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json({
        found: false,
        certNumber: cleaned,
        certBody: lab,
        verifyUrl: verifyUrls[lab],
        message: "Database unavailable — use the external link to verify directly.",
      })
    }

    // Cross-reference against our products table
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        lustrumo_id, product_title, product_url, retailer_id, price_aud, price_status,
        diamond_centre_carat, diamond_centre_shape, diamond_centre_color,
        diamond_centre_clarity, diamond_centre_cut, diamond_centre_type,
        diamond_centre_cert_body, diamond_centre_fluorescence,
        diamond_centre_polish, diamond_centre_symmetry,
        setting_style, setting_metal_type, setting_metal_karat,
        evc, data_quality_score, data_quality_flags, image_url, is_available
      `)
      .eq("diamond_centre_cert_number", cleaned)

    if (error) {
      console.error("verify-cert query error:", error.message)
    }

    // Check for cert body mismatch
    const matches = products || []
    const mismatches = matches.filter(
      p => p.diamond_centre_cert_body && p.diamond_centre_cert_body !== lab
    )

    return NextResponse.json({
      found: matches.length > 0,
      certNumber: cleaned,
      certBody: lab,
      verifyUrl: verifyUrls[lab],
      products: matches.map(p => ({
        lustrumoId: p.lustrumo_id,
        title: p.product_title,
        url: p.product_url,
        retailerId: p.retailer_id,
        price: p.price_aud,
        priceStatus: p.price_status,
        imageUrl: p.image_url,
        isAvailable: p.is_available,
        diamond: {
          carat: p.diamond_centre_carat,
          shape: p.diamond_centre_shape,
          color: p.diamond_centre_color,
          clarity: p.diamond_centre_clarity,
          cut: p.diamond_centre_cut,
          type: p.diamond_centre_type,
          certBody: p.diamond_centre_cert_body,
          fluorescence: p.diamond_centre_fluorescence,
          polish: p.diamond_centre_polish,
          symmetry: p.diamond_centre_symmetry,
        },
        setting: {
          style: p.setting_style,
          metalType: p.setting_metal_type,
          metalKarat: p.setting_metal_karat,
        },
        evc: p.evc,
        dataQualityScore: p.data_quality_score,
        dataQualityFlags: p.data_quality_flags,
      })),
      warnings: [
        ...(mismatches.length > 0
          ? [`Certificate ${cleaned} is listed as ${mismatches[0].diamond_centre_cert_body} in our database but you selected ${lab}. Please verify the correct grading lab.`]
          : []),
        ...(matches.length > 1
          ? [`This certificate number appears on ${matches.length} different product listings — this may indicate the same stone is listed by multiple retailers.`]
          : []),
      ],
    })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
