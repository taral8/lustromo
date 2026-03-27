"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, MessageSquare, Building2 } from "lucide-react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
          <MessageSquare className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "var(--text-primary)" }}>
          Contact Us
        </h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          Questions, feedback, or partnership enquiries — we&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact options */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg p-5" style={{ background: "var(--background-alt)" }}>
          <Mail className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
          <h3 className="mt-3 font-semibold" style={{ color: "var(--text-primary)" }}>General Enquiries</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Questions about our tools, data, or reports.
          </p>
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--accent-primary)" }}>hello@lustrumo.com.au</p>
        </div>
        <div className="rounded-lg p-5" style={{ background: "var(--background-alt)" }}>
          <Building2 className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
          <h3 className="mt-3 font-semibold" style={{ color: "var(--text-primary)" }}>Retailer Enquiries</h3>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Data corrections, listing removal, or partnership opportunities.
          </p>
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--accent-primary)" }}>retailers@lustrumo.com.au</p>
        </div>
      </div>

      {/* Contact form */}
      <Card className="mt-8">
        <CardContent className="p-6">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(16,185,129,0.1)" }}>
                <Mail className="h-5 w-5" style={{ color: "var(--accent-success)" }} />
              </div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Message sent</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Name</label>
                  <Input placeholder="Your name" required />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email</label>
                  <Input type="email" placeholder="your@email.com" required />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Subject</label>
                <Input placeholder="What is this about?" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Message</label>
                <textarea
                  rows={5}
                  placeholder="Your message..."
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--text-primary)",
                    resize: "vertical",
                  }}
                />
              </div>
              <Button type="submit" className="w-full py-3 font-semibold">
                Send Message
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
