/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useEffect, useState, useRef } from "react"
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
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0060aa] dark:text-[#ff9d3b] animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-transparent text-slate-800 dark:text-slate-200 min-h-screen relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,96,170,0.02)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,_rgba(255,139,18,0.05)_0%,_transparent_50%)] z-20"></div>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#ff8b12] dark:hover:text-[#ff9d3b] bg-white/50 hover:bg-white border border-slate-200 dark:border-white/5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm mb-6 w-fit dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-400">
            <ArrowLeft size={16} />
            <span className="font-bold tracking-widest text-xs uppercase pt-0.5">Back Home</span>
          </Link>

          {/* Card Container */}
          <div className="bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
            
            {/* Header section */}
            <div className="flex justify-between items-start mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12]">My Profile</h1>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 dark:hover:bg-rose-950/20 dark:hover:border-rose-900/30 cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 relative">
              <div className="relative group rounded-full border-2 border-slate-200/60 dark:border-white/5 shadow-md overflow-hidden">
                <Avatar
                  size={120}
                  name={user?.email || user?.id || "User"}
                  variant="beam"
                  colors={["#0060aa", "#8b5cf6", "#ff8b12", "#1e3a5f", "#0f172a"]}
                />
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-4">
              <div className="bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="p-2 bg-orange-50/50 dark:bg-[#ff8b12]/10 rounded-lg text-[#ff8b12] dark:text-[#ff9d3b]">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-0.5">Name</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.user_metadata?.full_name || "Student User"}</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="p-2 bg-orange-50/50 dark:bg-[#ff8b12]/10 rounded-lg text-[#ff8b12] dark:text-[#ff9d3b]">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 dark:bg-[#0a0f1c]/90 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 dark:text-rose-450 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Do you really want to log out?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                You will need to log back in to access your dashboard.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-350 dark:bg-white/5 dark:hover:bg-white/10 border border-transparent dark:border-white/10 transition-colors cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-650 dark:hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
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
