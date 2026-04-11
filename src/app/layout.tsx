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

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.skillyugedu.com/#organization",
      "name": "Skillyug",
      "url": "https://www.skillyugedu.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.skillyugedu.com/skillyug.png",
        "width": 512,
        "height": 512,
      },
      "sameAs": [
        "https://www.skillyugedu.com",
        "https://www.linkedin.com/company/skillyug",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "availableLanguage": ["English", "Hindi"],
      },
      "description":
        "Skillyug is an AI education platform that teaches Class 6\u201312 students in India how to use artificial intelligence tools through a structured, hands-on bootcamp.",
      "foundingDate": "2024",
      "areaServed": "IN",
      "keywords":
        "AI Bootcamp for Students, AI Education India, Learn AI for Kids, ChatGPT for Students",
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://www.skillyugedu.com/#educational-org",
      "name": "Skillyug AI Bootcamp",
      "url": "https://www.skillyugedu.com",
      "description":
        "Skillyug runs an AI Creator Bootcamp for students in Classes 6\u201312. Students learn to use ChatGPT, Canva AI, Gamma, and other modern AI tools through live, project-based sessions.",
      "educationalCredentialAwarded": "AI Creator Certificate",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "AI Bootcamp Programs",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Course",
              "name": "AI Creator Bootcamp for Students (Class 6\u201312)",
              "description":
                "A structured, hands-on AI bootcamp for school students in India. Covers prompt engineering, AI tools, and real-world project building.",
              "provider": {
                "@type": "Organization",
                "name": "Skillyug",
                "url": "https://www.skillyugedu.com",
              },
              "educationalLevel": "Middle School, High School",
              "audience": {
                "@type": "EducationalAudience",
                "educationalRole": "student",
                "audienceType": "Students aged 11\u201318, Class 6 to Class 12",
              },
              "teaches": [
                "Prompt Engineering",
                "ChatGPT for Education",
                "Canva AI",
                "Gamma AI",
                "AI Ethics",
                "Problem Solving with AI",
              ],
              "inLanguage": "en-IN",
              "url": "https://www.skillyugedu.com/#curriculum",
              "offers": {
                "@type": "Offer",
                "category": "Demo Class",
                "url": "https://www.skillyugedu.com/book-demo",
              },
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://www.skillyugedu.com/#website",
      "url": "https://www.skillyugedu.com",
      "name": "Skillyug",
      "description": "AI education platform for Class 6\u201312 students in India.",
      "publisher": {
        "@id": "https://www.skillyugedu.com/#organization",
      },
      "inLanguage": "en-IN",
    },
  ],
};

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
