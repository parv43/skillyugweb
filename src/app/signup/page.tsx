import type { Metadata } from "next"
import SignUpPageClient from "@/app/signup/SignUpPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "Student Sign Up",
    description: "Create a Skillyug account to reserve bootcamp spots and access your student dashboard.",
    path: "/signup",
    robots: noIndexRobots,
  }),
}

export default function SignUpPage() {
  return <SignUpPageClient />
}
