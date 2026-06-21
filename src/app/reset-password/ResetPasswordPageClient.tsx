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
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0060aa] dark:text-[#ff9d3b]" />
      </div>
    )
  }

  return (
    <div className="bg-transparent text-slate-800 dark:text-slate-200 min-h-screen relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,96,170,0.03)_0%,_transparent_55%)] z-20"></div>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-[520px]">
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
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#ff8b12] ring-1 ring-orange-100 dark:bg-orange-950/40 dark:text-[#ff9d3b] dark:ring-orange-900/30">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#0060aa] dark:text-[#ff9d3b]">SECURE RESET</p>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    New Password
                  </h1>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Use a new password you have not used elsewhere, then sign in again with the updated
                password.
              </p>
            </header>

            {!hasRecoverySession ? (
              <div className="relative z-10 space-y-5">
                <div className="p-4 bg-blue-50 text-blue-755 border border-blue-250 rounded-xl text-sm font-semibold dark:bg-blue-950/40 dark:text-blue-450 dark:border-blue-900/30">
                  This reset session is missing or has expired. Request a fresh password reset link to continue.
                </div>
                <Link
                  href="/forgot-password"
                  className="w-full bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white font-bold py-4 rounded-full shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center cursor-pointer"
                >
                  Request New Reset Link
                </Link>
              </div>
            ) : (
              <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-755 border border-red-255 rounded-xl text-center text-sm font-semibold dark:bg-red-950/45 dark:text-red-400 dark:border-red-900/30">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-semibold dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                    {successMsg}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-slate-500 dark:text-slate-400 tracking-[0.05em] uppercase font-bold text-xs">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-white/70 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all duration-300 outline-none rounded-lg py-4 px-5 pr-12 dark:bg-[#020617]/70 dark:border-white/10 dark:text-white dark:placeholder:text-slate-550"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0060aa] dark:text-slate-500 dark:hover:text-[#ff9d3b] transition-colors cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-500 dark:text-slate-400 tracking-[0.05em] uppercase font-bold text-xs">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full bg-white/70 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all duration-300 outline-none rounded-lg py-4 px-5 pr-12 dark:bg-[#020617]/70 dark:border-white/10 dark:text-white dark:placeholder:text-slate-550"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0060aa] dark:text-slate-500 dark:hover:text-[#ff9d3b] transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white font-bold py-4 rounded-full shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 cursor-pointer"
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
