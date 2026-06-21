"use client"

/**
 * /auth/recovery — Universal password-reset callback handler
 *
 * WHY THIS IS A CLIENT PAGE (not a server route):
 * ─────────────────────────────────────────────────
 * Supabase can send password-reset links in three different formats depending
 * on the project's auth settings and SDK version:
 *
 *  1. IMPLICIT / HASH flow:  /auth/recovery#access_token=XXX&type=recovery
 *     → Hash fragments (#...) are NEVER sent to the server. A server route
 *       handler can never see this data. This was causing the "invalid or
 *       expired" error — the server fell through to the failure redirect.
 *
 *  2. PKCE flow:            /auth/recovery?code=XXX
 *     → Requires the matching code_verifier cookie, which is often missing
 *       when clicking from Gmail's in-app WebView or a different device.
 *
 *  3. OTP / token_hash:     /auth/recovery?token_hash=XXX&type=recovery
 *     → Stateless — no cookie needed, works from any device.
 *
 * A client-side page can read ALL three (window.location.hash + searchParams),
 * making the reset flow bulletproof across every email client and device.
 */

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { Suspense } from "react"

function RecoveryHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"processing" | "error">("processing")

  useEffect(() => {
    async function handleRecovery() {
      try {
        // ── 1. Hash-based implicit flow ──────────────────────────────────────
        // Supabase sends: /auth/recovery#access_token=XXX&refresh_token=YYY&type=recovery
        // The hash is only visible client-side (window.location.hash).
        const hash = window.location.hash
        if (hash && hash.includes("access_token")) {
          const params = new URLSearchParams(hash.slice(1)) // strip leading '#'
          const accessToken = params.get("access_token")
          const refreshToken = params.get("refresh_token") ?? ""
          const type = params.get("type")

          if (accessToken && type === "recovery") {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })

            if (!error) {
              router.replace("/reset-password?recovery=1")
              return
            }
            console.error("Hash-based session error:", error)
          }
        }

        // ── 2. OTP / token_hash flow ─────────────────────────────────────────
        // Stateless — no cookie needed. Works on any device/browser.
        const tokenHash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (tokenHash && type === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          })

          if (!error) {
            router.replace("/reset-password?recovery=1")
            return
          }
          console.error("token_hash OTP error:", error)
        }

        // ── 3. PKCE code flow ────────────────────────────────────────────────
        // Requires matching code_verifier cookie. May fail cross-device.
        const code = searchParams.get("code")

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)

          if (!error) {
            router.replace("/reset-password?recovery=1")
            return
          }
          console.error("PKCE code exchange error:", error)
        }

        // ── All methods failed ───────────────────────────────────────────────
        setStatus("error")
        router.replace("/forgot-password?error=invalid_or_expired")
      } catch (err) {
        console.error("Recovery handler exception:", err)
        setStatus("error")
        router.replace("/forgot-password?error=invalid_or_expired")
      }
    }

    handleRecovery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
      {status === "processing" ? (
        <>
          <Loader2 className="w-8 h-8 text-[#0060aa] dark:text-[#ff9d3b] animate-spin" />
          <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Verifying your reset link…</p>
        </>
      ) : (
        <p className="text-rose-600 dark:text-rose-450 text-sm font-medium">Something went wrong. Redirecting…</p>
      )}
    </div>
  )
}

export default function AuthRecoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0060aa] dark:text-[#ff9d3b] animate-spin" />
        </div>
      }
    >
      <RecoveryHandler />
    </Suspense>
  )
}
