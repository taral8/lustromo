import { redirect } from "next/navigation"

export default function CertificationVerifierRedirect({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/verify`)
}
