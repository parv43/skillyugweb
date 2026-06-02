/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function ResetPasswordPageClient() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (mounted) {
        setHasRecoverySession(Boolean(session))
        setCheckingSession(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setHasRecoverySession(Boolean(session))
        setCheckingSession(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (!hasRecoverySession) {
      setErrorMsg("Your reset session is no longer valid. Request a fresh reset link.")
      return
    }

    if (password.length < 6) {
      setErrorMsg("Use at least 6 characters for your new password.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg("Your new password and confirmation do not match.")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    setSuccessMsg("Password updated. Redirecting you to login...")
    await supabase.auth.signOut()
    router.replace("/login?reset=success")
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen selection:bg-blue-500/10 relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-slate-50/80 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(85,22,190,0.02)_0%,_transparent_55%)] z-20"></div>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[520px]">
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
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-blue-600">SECURE RESET</p>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    New Password
                  </h1>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                Use a new password you have not used elsewhere, then sign in again with the updated
                password.
              </p>
            </header>

            {!hasRecoverySession ? (
              <div className="relative z-10 space-y-5">
                <div className="p-4 bg-blue-50 text-blue-755 rounded-xl text-sm font-semibold border border-blue-250">
                  This reset session is missing or has expired. Request a fresh password reset link to continue.
                </div>
                <Link
                  href="/forgot-password"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-full shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center"
                >
                  Request New Reset Link
                </Link>
              </div>
            ) : (
              <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-750 rounded-xl text-center text-sm font-semibold border border-red-250">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-semibold border border-emerald-200">
                    {successMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-slate-500 tracking-[0.05em] uppercase font-bold text-xs">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg py-4 px-5 pr-12 text-slate-800 placeholder:text-slate-455 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 outline-none"
                      placeholder="Create a new password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-500 tracking-[0.05em] uppercase font-bold text-xs">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg py-4 px-5 pr-12 text-slate-800 placeholder:text-slate-455 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 outline-none"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-full shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? "Updating password..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
