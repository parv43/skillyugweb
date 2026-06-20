import type { Metadata } from "next"
import "./globals.css"
import { createMetadata, getOrganizationSchema, siteConfig } from "@/lib/seo"
import { PostHogProvider } from './providers'
import PostHogPageView from './PostHogPageView'
import { Suspense } from 'react'
import { Montserrat, Chivo, Figtree } from "next/font/google"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

const chivo = Chivo({
  subsets: ["latin"],
  variable: "--font-chivo",
  display: "swap",
})

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : null

  return (
    <html lang="en" className={`${montserrat.variable} ${chivo.variable} ${figtree.variable}`}>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        {/* Link to llms.txt so AI crawlers and Semrush can discover it without following internal links */}
        <link rel="llms" href="/llms.txt" />
        {supabaseHost && (
          <>
            <link rel="preconnect" href={`https://${supabaseHost}`} />
            <link rel="dns-prefetch" href={`https://${supabaseHost}`} />
          </>
        )}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}

