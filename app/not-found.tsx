import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-6xl font-bold" style={{ color: "var(--accent-primary)" }}>404</p>
        <h1 className="mt-4 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Page not found</h1>
        <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/au">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
