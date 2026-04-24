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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
