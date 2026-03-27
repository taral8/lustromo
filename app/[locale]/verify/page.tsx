"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileCheck, Loader2, AlertCircle, ExternalLink, ShieldCheck, ShieldX, Info } from "lucide-react"

interface VerifyResult {
  found: boolean
  certNumber: string
  certBody: string
  verifyUrl: string
  products: {
    lustrumoId: string
    title: string
    url: string
    retailerId: string
    price: number | null
    priceStatus: string
    imageUrl: string | null
    isAvailable: boolean
    diamond: {
      carat: number | null
      shape: string | null
      color: string | null
      clarity: string | null
      cut: string | null
      type: string | null
      certBody: string | null
      fluorescence: string | null
      polish: string | null
      symmetry: string | null
    }
    setting: {
      style: string | null
      metalType: string | null
      metalKarat: string | null
    }
    evc: string | null
    dataQualityScore: number
    dataQualityFlags: string[]
  }[]
  warnings: string[]
  message?: string
}

const labs = ["IGI", "GIA", "HRD"] as const

export default function VerifyPage() {
  const [lab, setLab] = useState<string>("IGI")
  const [certNumber, setCertNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VerifyResult | null>(null)

  async function handleVerify() {
    const cleaned = certNumber.replace(/[^a-zA-Z0-9]/g, "").trim()
    if (!cleaned) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/verify-cert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certNumber: cleaned, certBody: lab }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Verification failed")
        return
      }
      setResult(data)
    } catch {
      setError("Network error — could not reach the server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <FileCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Certification Verifier
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Verify IGI, GIA, and HRD certificates. Cross-reference against retailer listings to flag misrepresentation before you buy.
        </p>
      </div>

      {/* Input */}
      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Grading Lab</label>
            <div className="flex gap-2">
              {labs.map(l => (
                <button key={l} onClick={() => setLab(l)}
                  className="rounded-lg px-5 py-2 text-sm font-medium transition-colors"
                  style={{
                    background: lab === l ? "var(--accent-primary)" : "var(--background-alt)",
                    color: lab === l ? "#fff" : "var(--text-secondary)",
                    border: lab === l ? "none" : "1px solid var(--border)",
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Certificate Number</label>
            <div className="flex gap-2">
              <Input
                placeholder={lab === "IGI" ? "e.g. LG12345678" : lab === "GIA" ? "e.g. 1234567890" : "e.g. 12345678"}
                value={certNumber}
                onChange={e => setCertNumber(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleVerify()}
                className="text-base"
              />
              <Button onClick={handleVerify} disabled={loading || !certNumber.trim()} className="shrink-0 px-6">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              Find this on the diamond&apos;s grading report or the retailer&apos;s product page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-danger)" }} />
          <p className="text-sm" style={{ color: "var(--accent-danger)" }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <Card className="mt-6">
          <CardContent className="flex items-center justify-center gap-3 p-8">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent-primary)" }} />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Checking certificate...</span>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && !loading && (
        <>
          {/* External verification link */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{
                  background: result.found ? "rgba(16,185,129,0.1)" : "var(--background-alt)",
                  color: result.found ? "var(--accent-success)" : "var(--text-muted)",
                }}>
                  {result.found ? <ShieldCheck className="h-5 w-5" /> : <ShieldX className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {result.certBody} #{result.certNumber}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {result.found
                      ? `Found in ${result.products.length} retailer listing${result.products.length > 1 ? "s" : ""} in our database.`
                      : "Not found in our database — verify directly with the grading lab."}
                  </p>
                </div>
              </div>

              <a
                href={result.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: "var(--background-alt)", color: "var(--accent-primary)", border: "1px solid var(--border)" }}
              >
                Verify on {result.certBody} website <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-warning)" }} />
                  <p className="text-sm" style={{ color: "var(--accent-warning)" }}>{w}</p>
                </div>
              ))}
            </div>
          )}

          {/* Product listings for this cert */}
          {result.products.map((p) => (
            <Card key={p.lustrumoId} className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Retailer Listing
                  </h3>
                  {p.diamond.type && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{
                      background: p.diamond.type === "natural" ? "#EFF6FF" : "#F0FDFA",
                      color: p.diamond.type === "natural" ? "var(--accent-secondary)" : "var(--accent-primary)",
                    }}>
                      {p.diamond.type === "natural" ? "Natural" : "Lab-Grown"}
                    </span>
                  )}
                  {!p.isAvailable && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#FEF2F2", color: "var(--accent-danger)" }}>
                      Unavailable
                    </span>
                  )}
                </div>

                <div className="mt-3 flex gap-4">
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt="" className="h-20 w-20 rounded-lg object-cover" style={{ border: "1px solid var(--border)" }} />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{p.title}</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {p.retailerId.replace(/_/g, " ")} &middot;{" "}
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1" style={{ color: "var(--accent-primary)" }}>
                        View page <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                    {p.price && (
                      <p className="mt-2 font-mono text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        ${p.price.toLocaleString("en-AU", { minimumFractionDigits: 2 })} AUD
                      </p>
                    )}
                  </div>
                </div>

                {/* Diamond specs table */}
                <div className="mt-4 rounded-lg p-4" style={{ background: "var(--background-alt)" }}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Certificate Specs
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                    {p.diamond.carat && <SpecRow label="Carat" value={`${p.diamond.carat}ct`} />}
                    {p.diamond.shape && <SpecRow label="Shape" value={p.diamond.shape} />}
                    {p.diamond.color && <SpecRow label="Colour" value={p.diamond.color} />}
                    {p.diamond.clarity && <SpecRow label="Clarity" value={p.diamond.clarity} />}
                    {p.diamond.cut && <SpecRow label="Cut" value={p.diamond.cut} />}
                    {p.diamond.certBody && <SpecRow label="Lab" value={p.diamond.certBody} />}
                    {p.diamond.polish && <SpecRow label="Polish" value={p.diamond.polish} />}
                    {p.diamond.symmetry && <SpecRow label="Symmetry" value={p.diamond.symmetry} />}
                    {p.diamond.fluorescence && <SpecRow label="Fluorescence" value={p.diamond.fluorescence} />}
                    {p.setting.metalType && <SpecRow label="Metal" value={p.setting.metalType} />}
                    {p.setting.style && <SpecRow label="Setting" value={p.setting.style} />}
                  </div>
                </div>

                {/* EVC + Data quality */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {p.evc && (
                    <span className="rounded-md px-2 py-1 font-mono text-xs" style={{ background: "var(--background-alt)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                      EVC: {p.evc}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Data quality</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${p.dataQualityScore}%`,
                        background: p.dataQualityScore >= 70 ? "var(--accent-success)" :
                                    p.dataQualityScore >= 50 ? "var(--accent-warning)" : "var(--accent-danger)",
                      }} />
                    </div>
                    <span className="font-mono text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {p.dataQualityScore}/100
                    </span>
                  </div>
                </div>

                {/* Cert body mismatch warning */}
                {p.diamond.certBody && p.diamond.certBody !== result.certBody && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent-danger)" }} />
                    <p className="text-xs" style={{ color: "var(--accent-danger)" }}>
                      This listing shows the certificate as <strong>{p.diamond.certBody}</strong> but you searched for <strong>{result.certBody}</strong>. Verify the correct grading lab before purchasing.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Not found state */}
          {!result.found && (
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--text-muted)" }} />
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      This certificate was not found in our retailer database. This doesn&apos;t mean it&apos;s invalid — we may not track the retailer yet.
                    </p>
                    <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      Use the link above to verify directly with <strong>{result.certBody}</strong>. If a retailer is quoting this cert number,
                      ask them for the full grading report to confirm authenticity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer — Section 7.2 */}
          <p className="mt-6 text-center text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Lustrumo cross-references certificate numbers against publicly listed retailer product data.
            Always verify certificates directly with the issuing lab. Data confidence depends on retailer listing quality.
          </p>
        </>
      )}
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: "var(--text-muted)" }}>{label}: </span>
      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  )
}
