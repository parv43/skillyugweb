import type { Metadata } from "next"
import ForgotPasswordPageClient from "@/app/forgot-password/ForgotPasswordPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "Forgot Password",
    description: "Request a secure password reset link for your Skillyug account.",
    path: "/forgot-password",
    robots: noIndexRobots,
  }),
  referrer: "no-referrer",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClient />
}
