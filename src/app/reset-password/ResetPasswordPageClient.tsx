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
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
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

      {/* Right Column Choose Password Form */}
      <div className="flex-1 bg-white p-6 md:p-12 lg:p-20 flex flex-col justify-center items-center md:items-start min-h-[500px]">
        <div className="w-full max-w-md space-y-10">
          
          {/* Header */}
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Choose a New Password
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Use a new password you have not used elsewhere, then sign in again with the updated password.
            </p>
          </div>

          {!hasRecoverySession ? (
            <div className="w-full space-y-5">
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-center text-xs font-semibold border border-red-200">
                This reset session is missing or has expired. Request a fresh password reset link to continue.
              </div>
              <Link
                href="/forgot-password"
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Request New Reset Link
              </Link>
            </div>
          ) : (
            <form className="w-full space-y-4" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-center text-xs font-semibold border border-red-200 animate-in fade-in duration-200">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-center text-xs font-semibold border border-emerald-200 animate-in fade-in duration-200">
                  {successMsg}
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-4 pr-12 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
