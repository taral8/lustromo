import { Search, FileCheck, ShieldCheck } from "lucide-react"

const steps = [
  {
    num: "1",
    icon: Search,
    title: "Search & Compare",
    description: "Browse diamond and gold prices across top retailers",
  },
  {
    num: "2",
    icon: FileCheck,
    title: "Verify & Validate",
    description: "Check certifications, compare against fair prices",
  },
  {
    num: "3",
    icon: ShieldCheck,
    title: "Buy with Confidence",
    description: "Get a personalised intelligence report before you commit",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          How <span style={{ color: "var(--accent-primary)" }}>Lustrumo</span> helps you buy better
        </h2>

        <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
          {/* Connecting dashed line (desktop only) */}
          <div className="absolute left-[16.7%] right-[16.7%] top-7 hidden h-px sm:block"
            style={{ borderTop: "2px dashed var(--border)" }} />

          {steps.map((step) => (
            <div key={step.num} className="relative text-center">
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "#F0FDFA", color: "var(--accent-primary)" }}>
                <step.icon className="h-6 w-6" />
                <span
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: "var(--accent-primary)" }}
                >
                  {step.num}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                {step.title}
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
