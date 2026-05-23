/* eslint-disable @next/next/no-img-element */
"use client"

import React, { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, Mail } from "lucide-react"
import { validateEmail } from "@/lib/emailValidation"

function ForgotPasswordForm() {
  const router = useRouter()
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col md:flex-row relative font-sans select-none overflow-x-hidden">
      
      {/* Left Column Sidebar */}
      <div className="md:w-[40%] bg-gradient-to-b from-[#2a1b6d] to-[#100735] text-white p-8 flex flex-col justify-between relative md:min-h-screen">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div>
          <button onClick={() => router.push("/")} className="hover:scale-105 transition-transform duration-300 bg-transparent border-none cursor-pointer">
            <img src="/skillyug-optimized.svg" alt="Skillyug Logo" className="h-16 w-auto object-contain brightness-0 invert" />
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center py-12">
          <img src="/onboarding-illustration.png" alt="Skillyug" className="w-full max-w-[320px] md:max-w-full h-auto object-contain rounded-3xl shadow-2xl" />
        </div>
        <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase text-center md:text-left">
          © 2026 Skillyug • AI Bootcamp Portal
        </div>
      </div>

      {/* Right Column Forgot Password Form */}
      <div className="flex-1 bg-white p-6 md:p-12 lg:p-20 flex flex-col justify-center items-center md:items-start min-h-[500px]">
        <div className="w-full max-w-md space-y-10">
          
          {/* Header */}
          <div className="space-y-3 text-center md:text-left">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider mb-2"
            >
              ← Back to Login
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Reset Your Password
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enter the email you use for Skillyug. If an account exists, we&apos;ll send a secure reset link.
            </p>
          </div>

          {infoMsg && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-center text-xs font-semibold border border-blue-200">
              {infoMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-center text-xs font-semibold border border-red-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-center text-xs font-semibold border border-emerald-200 animate-in fade-in duration-200">
              {successMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
                    emailMismatch ? "focus:ring-red-400 border-red-500/50" : ""
                  }`}
                  placeholder="name@gmail.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (emailSuggestion) setEmailSuggestion("")
                    if (emailMismatch) setEmailMismatch(false)
                    if (errorMsg) setErrorMsg("")
                  }}
                  onBlur={handleEmailBlur}
                  required
                />
              </div>
              {emailSuggestion && (
                <div className="mt-2 text-xs text-purple-600 flex items-center gap-1.5 animate-in fade-in duration-200">
                  <span>💡 Did you mean </span>
                  <button
                    type="button"
                    onClick={() => {
                      const [name] = email.split("@")
                      setEmail(`${name}@${emailSuggestion}`)
                      setEmailSuggestion("")
                    }}
                    className="font-bold underline hover:text-purple-800 transition-colors"
                  >
                    {emailSuggestion}?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Email Reset Link
            </button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-slate-400 text-sm">
              Signed up with Google? Use{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Continue with Google
              </Link>{" "}
              on the login page.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  )
}
