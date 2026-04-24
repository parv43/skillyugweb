import type { Metadata } from "next"
import type { BlogPost } from "@/lib/blogData"
import { homeFaqItems } from "@/lib/homeFaq"

export const siteConfig = {
  name: "Skillyug",
  legalName: "SKILLYUG LLP",
  url: "https://www.skillyugedu.com",
  locale: "en_IN",
  description:
    "Skillyug helps Class 6–12 students learn ChatGPT, Canva AI, Gamma, and real project workflows through a hands-on AI bootcamp in India.",
  ogImagePath: "/opengraph-image",
  email: "contact@skillyugedu.com",
  phone: "07941057514",
  linkedIn: "https://www.linkedin.com/company/skillyug-official/",
}

export const noIndexRobots: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
    "max-image-preview": "none",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
}

interface MetadataOptions {
  title: string
  description: string
  path?: string
  type?: "website" | "article"
  robots?: Metadata["robots"]
}

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString()
}

export function createMetadata({
  title,
  description,
  path = "/",
  type = "website",
  robots,
}: MetadataOptions): Metadata {
  const ogImage = absoluteUrl(siteConfig.ogImagePath)

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} preview image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots,
  }
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/skillyug.png"),
          width: 512,
          height: 512,
        },
        description: siteConfig.description,
        email: siteConfig.email,
        telephone: siteConfig.phone,
        areaServed: "IN",
        sameAs: [siteConfig.linkedIn],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Customer Support",
          email: siteConfig.email,
          telephone: siteConfig.phone,
          availableLanguage: ["English", "Hindi"],
        },
      },
      {
        "@type": "EducationalOrganization",
        "@id": absoluteUrl("/#educational-organization"),
        name: "Skillyug AI Bootcamp",
        url: siteConfig.url,
        description:
          "Skillyug runs a structured AI bootcamp for Class 6–12 students in India, covering practical AI tools, project workflows, and guided prompt practice.",
        parentOrganization: {
          "@id": absoluteUrl("/#organization"),
        },
      },
      {
        "@type": "Course",
        "@id": absoluteUrl("/#ai-bootcamp-course"),
        name: "Skillyug AI Bootcamp for Students",
        description:
          "A hands-on AI bootcamp for Class 6–12 students covering ChatGPT, Canva AI, Gamma, research workflows, and real project building.",
        provider: {
          "@id": absoluteUrl("/#educational-organization"),
        },
        educationalLevel: "Middle School, High School",
        inLanguage: "en-IN",
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
          audienceType: "Class 6 to Class 12 students in India",
        },
        teaches: [
          "ChatGPT for students",
          "Canva AI",
          "Gamma AI",
          "Prompt engineering",
          "AI-powered research",
          "Project presentation skills",
        ],
        offers: {
          "@type": "Offer",
          price: "299",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: absoluteUrl("/book-slot"),
          category: "Bootcamp Spot Booking",
        },
      },
      {
        "@type": "Offer",
        "@id": absoluteUrl("/#demo-class-offer"),
        price: "49",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: absoluteUrl("/book-demo"),
        category: "Demo Class",
        itemOffered: {
          "@type": "Service",
          name: "Skillyug Live Demo Class",
          description:
            "A live introductory demo class for parents and students to experience the Skillyug AI bootcamp format before reserving a bootcamp seat.",
        },
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          "@id": absoluteUrl("/#organization"),
        },
        inLanguage: "en-IN",
      },
    ],
  }
}

export function getHomeFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }
}

export function getBlogCollectionSchema(blogs: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/blog/#collection"),
        url: absoluteUrl("/blog"),
        name: "Skillyug AI Learning Blog",
        description:
          "Guides, tutorials, and insights on AI tools, projects, and future-ready learning for Class 6–12 students in India.",
        isPartOf: {
          "@id": absoluteUrl("/#website"),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: absoluteUrl("/blog"),
          },
        ],
      },
      {
        "@type": "ItemList",
        itemListElement: blogs.map((blog, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/blog/${blog.slug}`),
          name: blog.title,
        })),
      },
    ],
  }
}

export function getBlogPostingSchema(blog: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: blog.title,
        description: blog.metaDescription,
        image: absoluteUrl(siteConfig.ogImagePath),
        url: absoluteUrl(`/blog/${blog.slug}`),
        inLanguage: "en-IN",
        articleSection: blog.category,
        keywords: blog.keywords.join(", "),
        author: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        publisher: {
          "@id": absoluteUrl("/#organization"),
        },
        audience: {
          "@type": "EducationalAudience",
          educationalRole: "student",
          audienceType: "Class 6–12 students in India",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": absoluteUrl(`/blog/${blog.slug}`),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: absoluteUrl("/blog"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: blog.title,
            item: absoluteUrl(`/blog/${blog.slug}`),
          },
        ],
      },
    ],
  }
}
