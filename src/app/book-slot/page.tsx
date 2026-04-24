import type { Metadata } from "next"
import BookSlotPageClient from "@/app/book-slot/BookSlotPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "₹299 Bootcamp Spot Booking",
    description: "Reserve a Skillyug bootcamp seat through the ₹299 spot booking flow.",
    path: "/book-slot",
    robots: noIndexRobots,
  }),
}

export default function BookSlotPage() {
  return <BookSlotPageClient />
}
