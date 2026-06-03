import React from "react";
import { createClient } from "@supabase/supabase-js";
import { BadgeCheck, Calendar, ShieldCheck, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

// Initialize Supabase (Public access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function VerifyCertificatePage({ params }: { params: { certId: string } }) {
  const { certId } = await params;

  // Query database for the certificate
  const { data: cert, error } = await supabase
    .from("issued_certificates")
    .select("*")
    .eq("cert_id", certId)
    .single();

  const isValid = !!cert && !error;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200">
      <Navbar />
      
      <div className="relative pt-32 pb-20 px-6 max-w-4xl mx-auto">
        {/* Background Glows */}
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 ${
            isValid ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}>
            {isValid ? <ShieldCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            <span className="text-sm font-bold uppercase tracking-widest">
              {isValid ? "Authenticity Verified" : "Verification Failed"}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Certificate Verification
          </h1>

          {isValid ? (
            <div className="mt-12 glass-panel p-8 md:p-12 rounded-[2.5rem] bg-white/[0.03] border border-white/10 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Issued To</span>
                    </div>
                    <p className="text-2xl font-black text-white">{cert.user_name}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Date of Issue</span>
                    </div>
                    <p className="text-xl font-bold text-slate-200">
                      {new Date(cert.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <BadgeCheck className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Credential ID</span>
                    </div>
                    <p className="text-xl font-mono text-blue-300">{cert.cert_id}</p>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-sm text-slate-400 leading-relaxed">
                      This digital credential is cryptographically logged in the Skillyug Education database. The authenticity of this specific PDF has been verified against our records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12 glass-panel p-12 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 text-center">
              <p className="text-xl text-slate-300 font-medium">
                The certificate ID <span className="text-red-400 font-mono">{certId}</span> was not found in our registry.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Please ensure you have scanned the correct QR code or entered the ID manually.
              </p>
            </div>
          )}

          <div className="mt-12">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm font-bold uppercase tracking-widest underline underline-offset-8">
              Return to Skillyug
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
