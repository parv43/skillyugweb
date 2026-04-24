import type { Metadata } from "next"
import MyBatchPageClient from "@/app/my-batch/MyBatchPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "My Batch Workspace",
    description: "Access your Skillyug batch dashboard, schedule, and student resources.",
    path: "/my-batch",
    robots: noIndexRobots,
  }),
}

export default function MyBatchPage() {
  return <MyBatchPageClient />
}
