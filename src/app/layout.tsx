import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.skillyugedu.com"),
  title: "Skillyug | AI Creator Bootcamp",
  description: "Equip your child with the AI skills they need to shape the world tomorrow.",
  openGraph: {
    title: "Skillyug | AI Creator Bootcamp",
    description: "Equip your child with the AI skills they need to shape the world tomorrow.",
    siteName: "Skillyug",
    type: "website",
    url: "https://www.skillyugedu.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skillyug | AI Creator Bootcamp",
    description: "Equip your child with the AI skills they need to shape the world tomorrow.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
