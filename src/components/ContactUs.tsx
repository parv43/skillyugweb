"use client";

import React from "react";
import { Mail, Phone } from "lucide-react";

export default function ContactUs() {
  return (
    <section className="relative w-full py-24 bg-[#020617] overflow-hidden flex justify-center border-t border-slate-900 z-10" id="contact">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <span className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-bold tracking-widest mb-6 uppercase shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Reach Out
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 mb-6 drop-shadow-sm tracking-tight leading-[1.1]">
            Contact Skillyug
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Have questions about the bootcamp or bringing AI to your school? Drop us a message and our team will get right back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-start">
          
          {/* Contact Form Section */}
          <div className="lg:col-span-7">
            <div className="glass-panel bg-[#0f172a]/60 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-white/5 relative overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.1)] group">
              {/* Internal subtle glow */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full transition-opacity opacity-50 group-hover:opacity-100"></div>

              <form className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Student Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#020617]/50 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-slate-200 placeholder:text-slate-600" 
                      placeholder="John Doe" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full bg-[#020617]/50 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-slate-200 placeholder:text-slate-600" 
                      placeholder="+91 000-0000" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Role / Grade</label>
                  <select className="w-full bg-[#020617]/50 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-slate-200 appearance-none">
                    <option className="bg-[#0f172a]">Select Option</option>
                    <option className="bg-[#0f172a]">Grade 6-8</option>
                    <option className="bg-[#0f172a]">Grade 9-10</option>
                    <option className="bg-[#0f172a]">Grade 11-12</option>
                    <option className="bg-[#0f172a]">Undergraduate</option>
                    <option className="bg-[#0f172a]">Parent</option>
                    <option className="bg-[#0f172a]">School Administrator</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Message</label>
                  <textarea 
                    className="w-full bg-[#020617]/50 border border-slate-800 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-slate-200 placeholder:text-slate-600 resize-none" 
                    placeholder="How can we help you?" 
                    rows={4}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full glow-button bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-full font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="lg:col-span-5 space-y-6 pt-4 lg:pt-0">
            {/* Email Card */}
            <div className="glass-panel group p-8 rounded-[1.5rem] bg-[#0f172a]/40 border border-white/5 border-l-4 border-l-blue-500 hover:bg-[#0f172a]/70 hover:-translate-y-1 transition-all overflow-hidden relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-opacity opacity-0 group-hover:opacity-100"></div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="bg-[#020617]/80 p-4 rounded-2xl text-blue-400 shadow-inner shadow-white/5 border border-white/5">
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1.5">Email Us</h3>
                  <p className="text-lg md:text-xl font-bold text-white tracking-wide">Contact@skillyugedu.com</p>
                  <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">Send us a direct email. Our support team typically responds within 24 hours.</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="glass-panel group p-8 rounded-[1.5rem] bg-[#0f172a]/40 border border-white/5 border-l-4 border-l-purple-500 hover:bg-[#0f172a]/70 hover:-translate-y-1 transition-all overflow-hidden relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 transition-opacity opacity-0 group-hover:opacity-100"></div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="bg-[#020617]/80 p-4 rounded-2xl text-purple-400 shadow-inner shadow-white/5 border border-white/5">
                  <Phone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1.5">Call Us</h3>
                  <p className="text-lg md:text-xl font-bold text-white tracking-wide">07941057514</p>
                  <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">Available Monday through Friday, from 9:00 AM to 6:00 PM IST.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}