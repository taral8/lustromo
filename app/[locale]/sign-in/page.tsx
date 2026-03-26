import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SignInPage({ params }: { params: { locale: string } }) {
  const prefix = `/${params.locale}`

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[400px]">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <Link href={prefix} className="text-2xl font-bold">
              <span style={{ color: "var(--text-primary)" }}>Lustrum</span>
              <span style={{ color: "var(--accent-primary)" }}>o</span>
            </Link>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Sign in to your account</p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email</label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Password</label>
              <Input type="password" placeholder="Enter your password" />
            </div>
            <Button className="w-full font-semibold">Sign In</Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          </div>

          <Button variant="outline" className="w-full">
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href={`${prefix}/sign-up`} style={{ color: "var(--accent-primary)" }} className="font-medium">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
