/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useEffect, useState } from "react"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"
import { LogOut, ArrowLeft, User, Mail, Loader2, AlertTriangle } from "lucide-react"
import Avatar from "boring-avatars"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push("/login")
        return
      }

      setUser(session.user)
      setLoading(false)
    }
    
    loadData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    try {
      sessionStorage.clear()
      localStorage.removeItem("user_role")
    } catch {}
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen selection:bg-purple-100 relative overflow-hidden font-sans">
      
      {/* Background Decor (Matching Dashboard and Parent Portal Grid) */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.04),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.04),_transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-slate-200/50 hover:bg-slate-200/80 border border-slate-200/70 px-4 py-2 rounded-xl transition-all duration-200 text-xs font-bold uppercase tracking-wider mb-6 w-fit"
          >
            <ArrowLeft size={14} />
            <span>Back Home</span>
          </Link>

          {/* Card Container */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            
            {/* Header section */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">My Profile</h1>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 relative">
              <div className="relative group rounded-full border-4 border-purple-100 shadow-md overflow-hidden bg-slate-50">
                <Avatar
                  size={120}
                  name={user?.email || user?.id || "User"}
                  variant="beam"
                  colors={["#a4a6ff", "#7c3aed", "#2563eb", "#db2777", "#059669"]}
                />
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 transition-colors hover:bg-slate-50/80">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-slate-800">{user?.user_metadata?.full_name || "Student User"}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 transition-colors hover:bg-slate-50/80">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-slate-800 break-all">{user?.email}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Do you really want to log out?</h3>
              <p className="text-slate-500 text-sm mb-6">
                You will need to log back in to access your dashboard.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  No
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-red-600 hover:bg-red-500 transition-colors shadow-sm"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
