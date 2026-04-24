import type { Metadata } from "next"
import SignUpPageClient from "@/app/signup/SignUpPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "Student Sign Up",
    description: "Create a Skillyug account to book demos, reserve bootcamp spots, and access student flows.",
    path: "/signup",
    robots: noIndexRobots,
  }),
}

export default function SignUpPage() {
  return <SignUpPageClient />
}
