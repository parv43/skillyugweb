import type { Metadata } from "next"
import "./globals.css"
import { createMetadata, getOrganizationSchema, siteConfig } from "@/lib/seo"

export const metadata: Metadata = {
  ...createMetadata({
    title: "AI Education Bootcamp for Students in Classes 6–12",
    description: siteConfig.description,
  }),
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "AI Education Bootcamp for Students in Classes 6–12",
    template: "%s | Skillyug",
  },
  icons: {
    icon: "/favicon-sy.png",
    shortcut: "/favicon-sy.png",
    apple: "/favicon-sy.png",
  },
}

const organizationSchema = getOrganizationSchema()

import { headers } from "next/headers"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get("x-nonce") ?? ""

  return (
    <html lang="en">
      <head>
        {/* Link to llms.txt so AI crawlers and Semrush can discover it without following internal links */}
        <link rel="llms" href="/llms.txt" />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

