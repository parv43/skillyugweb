"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwg2SKb_ua_S3YWK-FNhLHqkdiO1BdqzAE4nASa1kGWBmgIn4wXAmNadmRMNhcTbrrm/exec";

export default function BookDemoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefilledName, setPrefilledName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?redirect=/book-demo");
        return;
      }
      setUserId(session.user.id);
      setUserEmail(session.user.email ?? null);
      const fullName = session.user?.user_metadata?.full_name || "";
      if (fullName) setPrefilledName(fullName);
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const studentName = formData.get("studentName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const gradeValue = formData.get("grade") as string;

    if (phoneNumber.length !== 10) {
      setErrorMsg("Please enter exactly 10 digits for the phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Supabase demo_bookings table
      const { error: supabaseError } = await supabase
        .from("demo_bookings")
        .insert({
          user_id: userId,
          name: studentName,
          email: userEmail,
          phone: phoneNumber,
          preferred_time: gradeValue,
        });

      if (supabaseError) {
        console.error("Supabase error:", supabaseError.message);
        setErrorMsg("Something went wrong saving your booking. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Also send to Google Sheets for record keeping
      try {
        await fetch(SCRIPT_URL, { method: "POST", body: formData });
      } catch {
        // Non-critical — Supabase insert already succeeded
        console.warn("Google Sheets sync failed, but booking was saved.");
      }

      setSuccessMsg("🎉 Your free demo has been booked! We'll contact you shortly.");
      form.reset();
    } catch (error) {
      console.error("Error submitting form", error);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .font-headline { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Manrope', sans-serif; }
        .font-label { font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
          background: rgba(27, 25, 35, 0.4);
          backdrop-filter: blur(24px);
        }
        .luminous-glow {
          box-shadow: 0 0 100px -20px rgba(160, 140, 255, 0.12);
        }
        .spotlight-card {
          position: relative;
          overflow: hidden;
        }
        .spotlight-card::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle at center, rgba(160, 140, 255, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
      `}} />

      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div className="text-[#e6e0e9] font-body selection:bg-[#d1c4ff] selection:text-[#2b0064] min-h-screen flex flex-col relative overflow-hidden bg-[#0b0a0f]">

        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/classroom.jpeg"
            alt="Background Classroom"
            className="w-full h-full object-cover object-[center_20%] opacity-80"
          />
          <div className="absolute inset-0 bg-[#0b0a0f]/60" />
        </div>

        {/* Decorative Glows */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#6750a4]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#3f51b5]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Header */}
        <header className="w-full top-0 sticky z-[100] bg-[#0b0a0f] flex justify-between items-center px-6 py-4">
          <div className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#d1c4ff] to-[#7c9aff] font-headline tracking-tight text-3xl">Skillyug</div>
        </header>

        <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-24 relative z-10">
          <div className="w-full max-w-xl spotlight-card glass-panel rounded-xl p-8 md:p-12 luminous-glow border border-white/5">

            <div className="mb-6">
              <Link href="/" className="flex items-center gap-2 text-[#cac4cf] hover:text-[#d1c4ff] transition-colors font-headline font-bold text-sm group w-fit">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                Back
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-[#e6e0e9] mb-2">
                Book Free Demo
              </h1>
              <p className="text-[#cac4cf] font-medium">Experience a live AI class — completely free, no commitment.</p>
            </div>

            {/* Success / Error Messages */}
            {successMsg && (
              <div className="mb-6 p-4 bg-green-500/20 text-green-300 rounded-xl text-sm font-semibold border border-green-500/30">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/20 text-red-300 rounded-xl text-sm font-semibold border border-red-500/30">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-6">

                {/* Student Name */}
                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-[#938f99] mb-2 group-focus-within:text-[#d1c4ff] transition-colors">
                    Student Name
                  </label>
                  <input
                    name="studentName"
                    required
                    className="w-full bg-[#2d2a37] border-none outline-none rounded-xl py-4 px-5 text-[#e6e0e9] placeholder:text-[#938f99]/60 focus:ring-2 focus:ring-[#d1c4ff] transition-all font-medium"
                    placeholder="Enter full name"
                    type="text"
                    defaultValue={prefilledName}
                  />
                </div>

                {/* Phone Number */}
                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-[#938f99] mb-2 group-focus-within:text-[#d1c4ff] transition-colors">
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    required
                    pattern="\d{10}"
                    maxLength={10}
                    title="Please enter exactly 10 digits"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                    }}
                    className="w-full bg-[#2d2a37] border-none outline-none rounded-xl py-4 px-5 text-[#e6e0e9] placeholder:text-[#938f99]/60 focus:ring-2 focus:ring-[#d1c4ff] transition-all font-medium"
                    placeholder="9876543210"
                    type="tel"
                  />
                </div>

                {/* Class/Grade */}
                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-[#938f99] mb-2 group-focus-within:text-[#d1c4ff] transition-colors">
                    Class/Grade
                  </label>
                  <div className="relative">
                    <select
                      name="grade"
                      required
                      defaultValue=""
                      className="w-full bg-[#2d2a37] border-none outline-none rounded-xl py-4 px-5 text-[#e6e0e9] placeholder:text-[#938f99]/60 focus:ring-2 focus:ring-[#d1c4ff] transition-all font-medium appearance-none"
                    >
                      <option disabled value="">Select class or grade</option>
                      <option value="6th">6th</option>
                      <option value="7th">7th</option>
                      <option value="8th">8th</option>
                      <option value="9th">9th</option>
                      <option value="10th">10th</option>
                      <option value="11th">11th</option>
                      <option value="12th">12th</option>
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-[#938f99]">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#7c4dff] to-[#448aff] text-white font-bold py-4 rounded-full hover:shadow-[0_0_30px_-5px_rgba(124,77,255,0.6)] disabled:opacity-75 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                  type="submit"
                >
                  {isSubmitting ? "Booking..." : "Book My Free Demo"}
                  {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </div>
            </form>

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <p className="text-[11px] font-label text-[#938f99]/60 uppercase tracking-widest">
                100% Free · No Credit Card Required
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
