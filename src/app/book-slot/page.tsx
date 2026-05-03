import type { Metadata } from "next"
import BookSlotPageClient from "@/app/book-slot/BookSlotPageClient"
import { BOOK_SLOT_AMOUNT_LABEL } from "@/lib/pricing"
import { createMetadata, noIndexRobots } from "@/lib/seo"
import { headers } from "next/headers"

export const metadata: Metadata = {
  ...createMetadata({
    title: `${BOOK_SLOT_AMOUNT_LABEL} Bootcamp Enrollment`,
    description: `Reserve a Skillyug bootcamp seat through the ${BOOK_SLOT_AMOUNT_LABEL} enrollment flow.`,
    path: "/book-slot",
    robots: noIndexRobots,
  }),
}

export default async function BookSlotPage() {
  const nonce = (await headers()).get("x-nonce") ?? ""
  return <BookSlotPageClient nonce={nonce} />
}
