/* eslint-disable @next/next/no-img-element */
"use client"

import React, { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Mail } from "lucide-react"
import { validateEmail } from "@/lib/emailValidation"

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const loginEmail = searchParams.get("loginEmail") || ""
  const [email, setEmail] = useState(loginEmail)
  const [emailSuggestion, setEmailSuggestion] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailMismatch, setEmailMismatch] = useState(false)
  const infoMsg =
    searchParams.get("error") === "invalid_or_expired"
      ? "That reset link is invalid or has expired. Request a fresh password reset email."
      : ""

  const handleEmailBlur = () => {
    const validation = validateEmail(email)
    if (validation.suggestion) {
      setEmailSuggestion(validation.suggestion)
    } else {
      setEmailSuggestion("")
    }
    // Check mismatch if user came from login page with an email
    if (loginEmail && email && email.trim().toLowerCase() !== loginEmail.trim().toLowerCase()) {
      setEmailMismatch(true)
    } else {
      setEmailMismatch(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    setEmailSuggestion("")

    const validation = validateEmail(email)
    if (validation.error) {
      setErrorMsg(validation.error)
      if (validation.suggestion) {
        setEmailSuggestion(validation.suggestion)
      }
      return
    }

    // Block if user entered a different email than the one they were logging in with
    if (loginEmail && email.trim().toLowerCase() !== loginEmail.trim().toLowerCase()) {
      setEmailMismatch(true)
      setErrorMsg(`⚠️ That's not the email you were logging in with. You entered "${loginEmail}" on the login page. Please use the same email, or clear the field to reset a different account.`)
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          company: "",
        }),
      })

      const payload = (await response.json()) as { error?: string; message?: string }

      if (!response.ok) {
        setErrorMsg(payload.error ?? "Unable to start password reset right now.")
        return
      }

      setSuccessMsg(payload.message ?? "If an account exists for that email, we will send reset instructions shortly.")
    } catch {
      setErrorMsg("Unable to start password reset right now. Please try again in a few minutes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen selection:bg-blue-500/10 relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-slate-50/80 z-10" />
        <img
          alt="Abstract flow"
          className="w-full h-full object-cover opacity-5 scale-110 blur-3xl"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKcLNe4nCx6jDQ4EVV_02UM6m6QJi_0LiI7l7BOYGCvUfePGpBf-4iq0oD97lRJqplgkKfvQWD0GBG99GEyd5o7D02N-7QpzqTdXC4UupM-OfyKFoKrQi8DHlPUrvTCvJQQ4DSYmJHKMrwmmGcspe4XyEhsPcvtyRW5UHFUk1gh7Oq1ax02nkjQ7vXBzrilSRlKcbMzcGwTuJpnS6BO9md1N6C7rmanrP1-JFEYbcgO-oyUxhepXupvaNomp79iKCHAibUpyvnVGU"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(85,22,190,0.02)_0%,_transparent_70%)] z-20"></div>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <div className="flex justify-center mb-12">
            <Link href="/" className="hover:scale-105 transition-transform duration-300">
              <img
                src="/skillyug-optimized.svg"
                alt="Skillyug Logo"
                className="h-36 md:h-56 w-auto object-contain brightness-0 opacity-85"
              />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 md:p-12 shadow-lg relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <header className="mb-10 relative z-10">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm mb-6 w-fit"
              >
                <span className="font-bold tracking-widest text-xs uppercase pl-2">← BACK TO LOGIN</span>
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-blue-600">PASSWORD HELP</p>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Reset Password
                  </h1>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Enter the email you use for Skillyug. If an account exists, we&apos;ll send a secure reset
                link.
              </p>
            </header>

            {infoMsg && (
              <div className="p-4 mb-6 bg-blue-50 text-blue-750 rounded-xl text-sm font-semibold border border-blue-250 relative z-10">
                {infoMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-4 mb-6 bg-red-50 text-red-750 rounded-xl text-center text-sm font-semibold border border-red-250 relative z-10">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 mb-6 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-semibold border border-emerald-200 relative z-10">
                {successMsg}
              </div>
            )}

            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-slate-500 tracking-[0.05em] uppercase font-bold text-xs">
                  Email Address
                </label>
                <input
                  type="email"
                  className={`w-full bg-slate-50 border border-slate-300 rounded-lg py-4 px-5 text-slate-800 placeholder:text-slate-455 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 outline-none ${
                    emailMismatch ? "focus:ring-red-500 ring-1 ring-red-500/50" : ""
                  }`}
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (emailSuggestion) setEmailSuggestion("")
                    // Clear mismatch as user types
                    if (emailMismatch) setEmailMismatch(false)
                    if (errorMsg) setErrorMsg("")
                  }}
                  onBlur={handleEmailBlur}
                  required
                />
                {emailSuggestion && (
                  <div className="mt-2 text-sm text-blue-600 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span>Did you mean</span>
                    <button
                      type="button"
                      onClick={() => {
                        const [name] = email.split("@")
                        setEmail(`${name}@${emailSuggestion}`)
                        setEmailSuggestion("")
                      }}
                      className="font-bold underline hover:text-blue-800 transition-colors"
                    >
                      {emailSuggestion}?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-full shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Sending reset link..." : "Email Reset Link"}
              </button>
            </form>

            <footer className="mt-10 text-center relative z-10 space-y-3">
              <p className="text-slate-500 text-sm">
                Signed up with Google? Use{" "}
                <Link href="/login" className="text-blue-600 font-bold hover:text-blue-800 transition-colors duration-200">
                  Continue with Google
                </Link>{" "}
                on the login page instead of resetting a password.
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ForgotPasswordPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  )
}
