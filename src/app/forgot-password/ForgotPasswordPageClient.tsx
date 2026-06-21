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
    <div className="bg-transparent text-slate-800 dark:text-slate-200 min-h-screen relative overflow-hidden font-sans transition-colors duration-300">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,96,170,0.03)_0%,_transparent_70%)] z-20"></div>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[480px]">
          <div className="flex justify-center mb-12">
            <Link href="/" className="hover:scale-105 transition-transform duration-300">
              <img
                src="/skillyug-optimized.svg"
                alt="Skillyug Logo"
                className="h-36 md:h-56 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-xl p-8 md:p-12 shadow-lg relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0060aa]/5 blur-[80px] rounded-full pointer-events-none"></div>

            <header className="mb-10 relative z-10">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 bg-white/70 hover:bg-slate-50/80 border border-slate-200 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm mb-6 w-fit dark:bg-[#0a0f1c]/70 dark:hover:bg-[#0f172a]/80 dark:border-white/5 dark:text-slate-400 dark:hover:text-white"
              >
                <span className="font-bold tracking-widest text-xs uppercase pl-2">← BACK TO LOGIN</span>
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#ff8b12] dark:text-[#ff9d3b] ring-1 ring-orange-100 dark:ring-orange-900/35">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#0060aa] dark:text-[#ff9d3b]">PASSWORD HELP</p>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Reset Password
                  </h1>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-550 dark:text-slate-350">
                Enter the email you use for Skillyug. If an account exists, we&apos;ll send a secure reset
                link.
              </p>
            </header>

            {infoMsg && (
              <div className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/20 text-blue-750 dark:text-blue-400 rounded-xl text-sm font-semibold border border-blue-200 dark:border-blue-900/30 relative z-10">
                {infoMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-400 rounded-xl text-center text-sm font-semibold border border-red-200 dark:border-red-900/30 relative z-10">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 mb-6 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-xl text-sm font-semibold border border-emerald-200 dark:border-emerald-900/30 relative z-10">
                {successMsg}
              </div>
            )}

            <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-slate-500 dark:text-slate-455 tracking-[0.05em] uppercase font-bold text-xs">
                  Email Address
                </label>
                <input
                  type="email"
                  className={`w-full bg-white/70 border border-slate-200 rounded-lg py-4 px-5 text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all duration-300 outline-none dark:bg-[#020617]/70 dark:border-white/10 dark:text-white dark:placeholder:text-slate-550 ${
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
                  <div className="mt-2 text-sm text-[#0060aa] dark:text-[#ff9d3b] flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span>Did you mean</span>
                    <button
                      type="button"
                      onClick={() => {
                        const [name] = email.split("@")
                        setEmail(`${name}@${emailSuggestion}`)
                        setEmailSuggestion("")
                      }}
                      className="font-bold underline hover:text-[#005291] dark:hover:text-[#ff8b12] transition-colors"
                    >
                      {emailSuggestion}?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white font-bold py-4 rounded-full shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Sending reset link..." : "Email Reset Link"}
              </button>
            </form>

            <footer className="mt-10 text-center relative z-10 space-y-3">
              <p className="text-slate-500 dark:text-slate-450 text-sm">
                Signed up with Google? Use{" "}
                <Link href="/login" className="text-[#0060aa] dark:text-[#ff9d3b] font-bold hover:text-[#005291] dark:hover:text-[#ff8b12] transition-colors duration-200">
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
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0060aa] dark:text-[#ff9d3b]" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  )
}
