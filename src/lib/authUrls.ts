import { siteConfig } from "@/lib/seo"

function normalizeOrigin(value: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    return ""
  }

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`

  return withProtocol.endsWith("/") ? withProtocol.slice(0, -1) : withProtocol
}

export function getTrustedAppOrigin() {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "")

  if (configuredOrigin) {
    return configuredOrigin
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000"
  }

  return normalizeOrigin(siteConfig.url)
}

export function getAuthRedirectUrl(path: string) {
  return new URL(path, `${getTrustedAppOrigin()}/`).toString()
}
