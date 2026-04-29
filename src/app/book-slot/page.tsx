import type { Metadata } from "next"
import BookSlotPageClient from "@/app/book-slot/BookSlotPageClient"
import { createMetadata, noIndexRobots } from "@/lib/seo"
import { headers } from "next/headers"

export const metadata: Metadata = {
  ...createMetadata({
    title: "₹299 Bootcamp Spot Booking",
    description: "Reserve a Skillyug bootcamp seat through the ₹299 spot booking flow.",
    path: "/book-slot",
    robots: noIndexRobots,
  }),
}

export default async function BookSlotPage() {
  const nonce = (await headers()).get("x-nonce") ?? ""
  return <BookSlotPageClient nonce={nonce} />
}

