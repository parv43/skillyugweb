"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Linkedin, Mail, Phone } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ContactUs() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    _bot_check: "",
    name: "",
    message: "",
    phone: "",
    role: "Select Option"
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setIsCheckingAuth(false);
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (!isMounted) {
        return;
      }

      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCheckingAuth) {
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setErrorMsg("Please log in or sign up before sending a message.");
      router.push("/login?redirect=/#contact");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccess(false);

    if (formData.name.trim() === "" || formData.phone.trim() === "" || formData.message.trim() === "") {
      setErrorMsg("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Failed to send message. Please try again later.");
      }

      setSuccess(true);
      setFormData({ _bot_check: "", name: "", message: "", phone: "", role: "Select Option" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setErrorMsg(
        error instanceof Error ? error.message : "Failed to send message. Please try again later."
      );
    }
    
    setIsSubmitting(false);
  };

  return (
    <section className="relative w-full pt-24 pb-8 bg-white dark:bg-[#020617] overflow-hidden flex justify-center border-t border-slate-100 dark:border-slate-900 z-10" id="contact">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <span className="inline-block px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/40 dark:text-blue-400 text-sm font-bold tracking-widest mb-6 uppercase shadow-sm">
            Reach Out
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 mb-6 drop-shadow-sm tracking-tight leading-[1.1]">
            Contact Skillyug
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Have questions about the bootcamp? Drop us a message and our team will get right back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start">
          
          {/* Contact Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 border border-slate-200/80 rounded-[2rem] p-8 pb-10 md:p-10 relative overflow-hidden shadow-sm group dark:bg-[#0a0f1c] dark:border-white/10">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full transition-opacity opacity-50 group-hover:opacity-100"></div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <label htmlFor="contact-bot-check" className="sr-only">
                  Ignore this field
                </label>
                <input
                  type="text"
                  id="contact-bot-check"
                  name="_bot_check"
                  value={formData._bot_check}
                  onChange={handleChange}
                  autoComplete="off"
                  tabIndex={-1}
                  className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                  aria-hidden="true"
                />
                {success && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-500/30 rounded-xl text-green-700 dark:text-green-350 text-sm font-bold text-center">
                    Message sent successfully! We will get back to you soon.
                  </div>
                )}
                {errorMsg && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-350 text-sm font-bold text-center">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold ml-1">Full Name</label>
                    <input 
                      id="contact-name"
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-300 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800 placeholder:text-slate-400 dark:bg-[#020617] dark:border-white/10 dark:text-white dark:placeholder:text-slate-500" 
                      placeholder="Full name" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-phone" className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold ml-1">Phone Number</label>
                    <input 
                      id="contact-phone"
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-300 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800 placeholder:text-slate-400 dark:bg-[#020617] dark:border-white/10 dark:text-white dark:placeholder:text-slate-500" 
                      placeholder="+91 0000-0000" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-role" className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold ml-1">Role / Grade</label>
                  <select 
                    id="contact-role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800 appearance-none dark:bg-[#020617] dark:border-white/10 dark:text-white"
                  >
                    <option value="Select Option">Select Option</option>
                    <option value="Grade 6-8">Grade 6-8</option>
                    <option value="Grade 9-10">Grade 9-10</option>
                    <option value="Grade 11-12">Grade 11-12</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Parent">Parent</option>
                    <option value="School Administrator">School Administrator</option>
                    <option value="others">others</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 font-bold ml-1">Message</label>
                  <textarea 
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-slate-800 placeholder:text-slate-400 resize-none dark:bg-[#020617] dark:border-white/10 dark:text-white dark:placeholder:text-slate-500" 
                    placeholder="How can we help you?" 
                    rows={4}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || isCheckingAuth}
                  className="w-full glow-button bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2 disabled:opacity-50"
                >
                  {isCheckingAuth ? "Checking..." : isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="lg:col-span-5 space-y-6 pt-4 lg:pt-0">
            {/* Email Card */}
            <div className="group p-8 rounded-[1.5rem] bg-slate-50 border border-slate-200 border-l-4 border-l-blue-500 hover:bg-slate-100/50 hover:shadow-sm hover:-translate-y-1 transition-all overflow-hidden relative dark:bg-[#0a0f1c] dark:border-white/5 dark:hover:bg-[#0f172a]/50">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-opacity opacity-0 group-hover:opacity-100"></div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="bg-white p-4 rounded-2xl text-blue-600 shadow-sm border border-slate-205 dark:bg-white/5 dark:border-white/10 dark:text-blue-450">
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-450 font-bold mb-1.5">Email Us</h3>
                  <p className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-wide break-all">contact@skillyugedu.com</p>
                  <p className="text-sm text-slate-600 dark:text-slate-350 mt-2 font-medium leading-relaxed">Send us a direct email. Our support team typically responds within 24 hours.</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="group p-8 rounded-[1.5rem] bg-slate-50 border border-slate-200 border-l-4 border-l-purple-500 hover:bg-slate-100/50 hover:shadow-sm hover:-translate-y-1 transition-all overflow-hidden relative dark:bg-[#0a0f1c] dark:border-white/5 dark:hover:bg-[#0f172a]/50">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-opacity opacity-0 group-hover:opacity-100"></div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="bg-white p-4 rounded-2xl text-purple-600 shadow-sm border border-slate-205 dark:bg-white/5 dark:border-white/10 dark:text-purple-450">
                  <Phone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-450 font-bold mb-1.5">Call Us</h3>
                  <p className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-wide break-all">7835049710</p>
                  <p className="text-sm text-slate-600 dark:text-slate-350 mt-2 font-medium leading-relaxed">Available Monday to Friday, from 9:00 AM to 6:00 PM IST.</p>
                </div>
              </div>
            </div>

            {/* LinkedIn Card */}
            <a
              href="https://www.linkedin.com/company/skillyug-official/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-8 rounded-[1.5rem] bg-slate-50 border border-slate-200 border-l-4 border-l-sky-500 hover:bg-slate-100/50 hover:shadow-sm hover:-translate-y-1 transition-all overflow-hidden relative dark:bg-[#0a0f1c] dark:border-white/5 dark:hover:bg-[#0f172a]/50"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-opacity opacity-0 group-hover:opacity-100"></div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="bg-white p-4 rounded-2xl text-sky-600 shadow-sm border border-slate-205 dark:bg-white/5 dark:border-white/10 dark:text-sky-450">
                  <Linkedin className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-450 font-bold mb-1.5">
                    LinkedIn
                  </h3>
                  <p className="text-base md:text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                    Follow Skillyug
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-350 mt-2 font-medium leading-relaxed">
                    Get company updates, announcements, and student highlights
                    on our official LinkedIn page.
                  </p>
                </div>
              </div>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
