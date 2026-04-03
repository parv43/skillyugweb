"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { LogOut, ArrowLeft, Camera, User, Mail, CheckCircle2, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push("/login")
        return
      }

      setUser(session.user)
      if (session.user.user_metadata?.avatar_url) {
        setAvatarUrl(session.user.user_metadata.avatar_url)
      }
      setLoading(false)
    }
    
    loadData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setErrorMsg("")
      setSuccessMsg("")

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update the user's metadata with the new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(publicUrl)
      setSuccessMsg("Profile picture updated successfully!")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000)

    } catch (error: any) {
      setErrorMsg(error.message || "Error uploading image")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#a4a6ff] animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[#0e0e10] text-[#f9f5f8] min-h-screen selection:bg-[#a4a6ff]/30 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#0e0e10]/80 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(85,22,190,0.15)_0%,_transparent_50%)] z-20"></div>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md">
          
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-[#adaaad] hover:text-[#f9f5f8] bg-[#f9f5f8]/5 hover:bg-[#f9f5f8]/10 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm mb-6 w-fit">
            <ArrowLeft size={16} />
            <span className="font-bold tracking-widest text-xs uppercase pt-0.5">Back Home</span>
          </Link>

          {/* Card Container */}
          <div className="bg-[#262528]/40 backdrop-blur-3xl border border-[#48474a]/25 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Header section */}
            <div className="flex justify-between items-start mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#f9f5f8]">My Profile</h1>
              <button 
                onClick={handleSignOut}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 relative">
              <div className="relative group rounded-full">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-[#a4a6ff]/30 shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#1b1a1f] border-2 border-[#a4a6ff]/30 flex items-center justify-center shadow-lg">
                    <User size={48} className="text-[#adaaad]" />
                  </div>
                )}
                
                {/* Upload Button overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2.5 bg-[#a4a6ff] hover:bg-[#ac8aff] text-[#0e0e10] rounded-full shadow-md transition-colors disabled:opacity-50"
                  aria-label="Upload profile picture"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={uploadAvatar}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>

              {/* Status Messages */}
              {successMsg && (
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="mt-4 text-red-400 text-sm bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-center">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="space-y-4">
              <div className="bg-[#1b1a1f]/60 border border-[#48474a]/20 rounded-xl p-4 flex items-center gap-4">
                <div className="p-2 bg-[#a4a6ff]/10 rounded-lg text-[#a4a6ff]">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#adaaad] mb-0.5">Name</p>
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name || "Student User"}</p>
                </div>
              </div>

              <div className="bg-[#1b1a1f]/60 border border-[#48474a]/20 rounded-xl p-4 flex items-center gap-4">
                <div className="p-2 bg-[#a4a6ff]/10 rounded-lg text-[#a4a6ff]">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#adaaad] mb-0.5">Email</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
