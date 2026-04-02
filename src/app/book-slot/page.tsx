"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"; // For the back button
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Google Apps Script endpoint exactly as previously configured
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwg2SKb_ua_S3YWK-FNhLHqkdiO1BdqzAE4nASa1kGWBmgIn4wXAmNadmRMNhcTbrrm/exec";

export default function BookSlotPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefilledName, setPrefilledName] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirct to login if hitting this route without auth
        router.push("/login");
        return;
      }
      // Pickup user's name metadata
      const fullName = session.user?.user_metadata?.full_name || "";
      if (fullName) {
        setPrefilledName(fullName);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!SCRIPT_URL || SCRIPT_URL === "YOUR_WEB_APP_URL_HERE") {
      alert("Please configure the SCRIPT_URL in the code first.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const phoneNumber = formData.get("phoneNumber") as string;

    // Strict 10 digit validation
    if (phoneNumber.length !== 10) {
      alert("Please enter exactly 10 digits for the phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      
      if (result.result === "success") {
        alert("Your spot has been booked successfully!");
        form.reset();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Network error, please try again.");
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

      {/* External fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Manrope:wght@400;500;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div className="text-[#e6e0e9] font-body selection:bg-[#d1c4ff] selection:text-[#2b0064] min-h-screen flex flex-col relative overflow-hidden bg-[#0b0a0f]">
        
        {/* Subtle Background Layer (Classroom) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/classroom.jpeg" 
            alt="Background Classroom"
            className="w-full h-full object-cover object-[center_20%] opacity-80"
          />
          <div className="absolute inset-0 bg-[#0b0a0f]/60" />
        </div>

        {/* Background Decorative Glows */}
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#6750a4]/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#3f51b5]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* TopAppBar */}
        <header className="w-full top-0 sticky z-[100] bg-[#0b0a0f] flex justify-between items-center px-6 py-4">
          <div className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#d1c4ff] to-[#7c9aff] font-headline tracking-tight text-3xl">Skillyug</div>
        </header>

        <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-24 relative z-10">
          
          {/* Spotlight Card Form Container */}
          <div className="w-full max-w-xl spotlight-card glass-panel rounded-xl p-8 md:p-12 luminous-glow border border-white/5">
            <div className="mb-6">
              {/* Connected standard NextJS Back link */}
              <Link href="/" className="flex items-center gap-2 text-[#cac4cf] hover:text-[#d1c4ff] transition-colors font-headline font-bold text-sm group w-fit">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                Back
              </Link>
            </div>
            
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-[#e6e0e9] mb-2">
                Book Your Spot
              </h1>
              <p className="text-[#cac4cf] font-medium">Secure your placement for the upcoming session.</p>
            </div>

            {/* Form */}
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-6">
                
                {/* Field: Student Name */}
                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-[#938f99] mb-2 group-focus-within:text-[#d1c4ff] transition-colors">
                    Student Name
                  </label>
                  <div className="relative">
                    <input 
                      name="studentName"
                      required
                      className="w-full bg-[#2d2a37] border-none outline-none rounded-xl py-4 px-5 text-[#e6e0e9] placeholder:text-[#938f99]/60 focus:ring-2 focus:ring-[#d1c4ff] transition-all font-medium" 
                      placeholder="Enter full name" 
                      type="text"
                      defaultValue={prefilledName}
                    />
                  </div>
                </div>

                {/* Field: Phone Number */}
                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-[#938f99] mb-2 group-focus-within:text-[#d1c4ff] transition-colors">
                    Phone Number
                  </label>
                  <div className="relative">
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
                </div>

                {/* Field: Class/Grade */}
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

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button 
                  className="flex-1 bg-gradient-to-r from-[#6750a4] to-[#3f51b5] text-white font-bold py-4 rounded-full hover:shadow-[0_0_30px_-5px_rgba(103,80,164,0.6)] transition-all active:scale-95 flex items-center justify-center gap-2" 
                  type="button"
                >
                  Pay Now
                </button>
                <button 
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#7c4dff] to-[#448aff] text-white font-bold py-4 rounded-full hover:shadow-[0_0_30px_-5px_rgba(124,77,255,0.6)] disabled:opacity-75 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2" 
                  type="submit"
                >
                  {isSubmitting ? "Submitting..." : "Submit Details"}
                  {!isSubmitting && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </div>
            </form>

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <p className="text-[11px] font-label text-[#938f99]/60 uppercase tracking-widest">
                Secure payment processed via RAZORPAY
              </p>
            </div>
          </div>
        </main>

        {/* BottomNavBar (Mobile Only Logic) */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#0b0a0f]/80 backdrop-blur-xl rounded-t-2xl shadow-[0_-8px_40px_-12px_rgba(160,140,255,0.1)]">
          <div className="flex flex-col items-center justify-center text-[#938f99] hover:text-[#cfbcff] transition-colors cursor-pointer active:scale-90">
            <span className="material-symbols-outlined">explore</span>
            <span className="font-['Manrope'] text-[10px] uppercase tracking-[0.05rem] font-bold mt-1">Explore</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#d1c4ff] scale-110 transition-transform cursor-pointer active:scale-90">
            <span className="material-symbols-outlined">event_available</span>
            <span className="font-['Manrope'] text-[10px] uppercase tracking-[0.05rem] font-bold mt-1">Bookings</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#938f99] hover:text-[#cfbcff] transition-colors cursor-pointer active:scale-90">
            <span className="material-symbols-outlined">bookmark</span>
            <span className="font-['Manrope'] text-[10px] uppercase tracking-[0.05rem] font-bold mt-1">Saved</span>
          </div>
          <div className="flex flex-col items-center justify-center text-[#938f99] hover:text-[#cfbcff] transition-colors cursor-pointer active:scale-90">
            <span className="material-symbols-outlined">person</span>
            <span className="font-['Manrope'] text-[10px] uppercase tracking-[0.05rem] font-bold mt-1">Profile</span>
          </div>
        </nav>
      </div>
    </>
  );
}
