import { NextResponse } from "next/server"
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

    // ── Why service role instead of PKCE? ────────────────────────────────────
    // PKCE stores a code_verifier in a cookie on the API route's JSON response.
    // Browsers silently drop Set-Cookie on fetch() responses (only honored on
    // navigation responses). So when the user clicks the email link — especially
    // from Gmail's in-app WebView or a different device — the verifier cookie is
    // missing and Supabase returns "invalid or expired".
    //
    // The service role admin client calls Supabase directly without PKCE. Supabase
    // sends a token_hash link instead of a ?code= link. token_hash is verified
    // server-side in /auth/recovery via verifyOtp() — no cookie needed — so it
    // works from any browser, device, or email client.
    const { createClient } = await import("@supabase/supabase-js")
    const supabaseAdmin = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
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
