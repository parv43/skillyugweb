import type { Metadata } from "next"
import BookDemoPageClient from "@/app/book-demo/BookDemoPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "₹49 Demo Class Booking",
    description: "Secure the ₹49 Skillyug demo class booking flow for parents and students.",
    path: "/book-demo",
    robots: noIndexRobots,
  }),
}

export default function BookDemoPage() {
  return <BookDemoPageClient />
}
