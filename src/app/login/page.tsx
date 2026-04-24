import type { Metadata } from "next"
import LoginPageClient from "@/app/login/LoginPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "Student Login",
    description: "Log in to continue with your Skillyug account and bookings.",
    path: "/login",
    robots: noIndexRobots,
  }),
}

export default function LoginPage() {
  return <LoginPageClient />
}
