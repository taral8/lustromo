"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileCheck } from "lucide-react"

const labs = ["IGI", "GIA", "GCAL"]

export default function VerifyPage() {
  const [lab, setLab] = useState("IGI")
  const [certNumber, setCertNumber] = useState("")
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="mx-auto max-w-[560px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <FileCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Verify a Diamond Certificate
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Enter a certificate number to verify its authenticity and get a fair price estimate.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Certificate Number</label>
            <Input
              placeholder="e.g. LG12345678"
              value={certNumber}
              onChange={e => setCertNumber(e.target.value)}
              className="text-lg"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Grading Lab</label>
            <div className="flex gap-2">
              {labs.map(l => (
                <button key={l} onClick={() => setLab(l)}
                  className="rounded-lg px-5 py-2 text-sm font-medium"
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

          <Button className="w-full py-3 font-semibold" onClick={() => setSubmitted(true)}>
            Verify Certificate
          </Button>
        </CardContent>
      </Card>

      {submitted && (
        <Card className="mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Certificate verification will be available soon. Enter your email to be notified when this tool launches.
            </p>
            <form className="mx-auto mt-4 flex max-w-sm gap-2">
              <Input placeholder="your@email.com" type="email" />
              <Button>Notify Me</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
