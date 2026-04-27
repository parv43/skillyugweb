import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getAuthRedirectUrl } from "@/lib/authUrls"
import { validateEmail } from "@/lib/emailValidation"

export const runtime = "nodejs"

const REQUEST_WINDOW_MS = 10 * 60 * 1000
const MAX_IP_ATTEMPTS = 5
const MAX_EMAIL_ATTEMPTS = 3
const MIN_RESPONSE_TIME_MS = 800
const GENERIC_MESSAGE =
  "If an account exists for that email, we will send password reset instructions shortly."

const ipAttempts = new Map<string, number[]>()
const emailAttempts = new Map<string, number[]>()

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function pruneAttempts(map: Map<string, number[]>, key: string) {
  const now = Date.now()
  const attempts = map.get(key)?.filter((timestamp) => now - timestamp < REQUEST_WINDOW_MS) ?? []
  map.set(key, attempts)
  return attempts
}

function recordAttempt(map: Map<string, number[]>, key: string, maxAttempts: number) {
  const attempts = pruneAttempts(map, key)

  if (attempts.length >= maxAttempts) {
    return false
  }

  attempts.push(Date.now())
  map.set(key, attempts)
  return true
}

function getIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown-ip"
  }

  return request.headers.get("x-real-ip") ?? "unknown-ip"
}

async function enforceMinimumDuration(startedAt: number) {
  const elapsed = Date.now() - startedAt
  if (elapsed < MIN_RESPONSE_TIME_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_TIME_MS - elapsed))
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now()

  try {
    const body = (await request.json()) as { company?: string; email?: string }
    const company = typeof body.company === "string" ? body.company.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

    if (company) {
      await enforceMinimumDuration(startedAt)
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE })
    }

    const validation = validateEmail(email)
    if (!email || validation.error) {
      await enforceMinimumDuration(startedAt)
      return NextResponse.json(
        { error: validation.error ?? "Enter a valid email address." },
        { status: 400 }
      )
    }

    const ipAddress = getIpAddress(request)
    const withinIpLimit = recordAttempt(ipAttempts, ipAddress, MAX_IP_ATTEMPTS)
    const withinEmailLimit = recordAttempt(emailAttempts, email, MAX_EMAIL_ATTEMPTS)

    if (!withinIpLimit || !withinEmailLimit) {
      await enforceMinimumDuration(startedAt)
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE })
    }

    // Use createServerClient (PKCE flow) so Supabase sends ?code= in the redirect
    // instead of #access_token= in the hash (which the server can never read).
    // The PKCE code verifier is stored as a cookie here and read by /auth/recovery.
    const cookieStore = await cookies()
    const supabase = createServerClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore cookie writes from unsupported execution contexts.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl("/auth/recovery"),
    })

    if (error) {
      console.error("Forgot password request failed:", error)
    }

    await enforceMinimumDuration(startedAt)
    return NextResponse.json({ success: true, message: GENERIC_MESSAGE })
  } catch (error) {
    console.error("Forgot password route error:", error)
    await enforceMinimumDuration(startedAt)
    return NextResponse.json(
      {
        error: "Unable to start password reset right now. Please try again in a few minutes.",
      },
      { status: 500 }
    )
  }
}
