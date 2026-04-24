import type { Metadata } from "next"
import ResetPasswordPageClient from "@/app/reset-password/ResetPasswordPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "Choose New Password",
    description: "Set a new password for your Skillyug account after verifying your recovery link.",
    path: "/reset-password",
    robots: noIndexRobots,
  }),
  referrer: "no-referrer",
}

export default function ResetPasswordPage() {
  return <ResetPasswordPageClient />
}
