import type { Metadata } from "next"
import ProfilePageClient from "@/app/profile/ProfilePageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "Student Profile",
    description: "Manage your Skillyug student profile and account settings.",
    path: "/profile",
    robots: noIndexRobots,
  }),
}

export default function ProfilePage() {
  return <ProfilePageClient />
}
