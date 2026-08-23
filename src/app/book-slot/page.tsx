import type { Metadata } from "next"
import BookSlotPageClient from "@/app/book-slot/BookSlotPageClient"
import { BOOK_SLOT_AMOUNT_LABEL } from "@/lib/pricing"
import { createMetadata, noIndexRobots } from "@/lib/seo"
import { headers } from "next/headers"

export const metadata: Metadata = {
  ...createMetadata({
    title: "Enroll in Bootcamp",
    description: "Reserve a Skillyug bootcamp seat and start your child's AI journey.",
    path: "/book-slot",
    robots: noIndexRobots,
  }),
}

export default async function BookSlotPage() {
  const nonce = (await headers()).get("x-nonce") ?? ""
  return <BookSlotPageClient nonce={nonce} />
}
