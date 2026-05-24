import type { Metadata } from "next"
import "./globals.css"
import { createMetadata, getOrganizationSchema, siteConfig } from "@/lib/seo"
import { PostHogProvider } from './providers'
import PostHogPageView from './PostHogPageView'
import { Suspense } from 'react'

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : null

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem('theme');if(saved==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`
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

