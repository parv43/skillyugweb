/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Plus, CreditCard, Mail, Key, Share2, CheckCircle, ArrowRight, Loader2, LogOut, Copy, ShieldAlert, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";
import Script from "next/script";

interface RazorpaySuccessPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailurePayload {
  error?: {
    description?: string;
    reason?: string;
  };
}

type ChildUser = {
  id: string;
  email: string;
  full_name: string | null;
  enrolledAt: string;
};

function ParentPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState("");
  const [children, setChildren] = useState<ChildUser[]>([]);

  // Modals & Flows
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"checkout" | "processing" | "success">("checkout");
  const [isSponsorship, setIsSponsorship] = useState(false);

  // Direct Enrollment Kid Input
  const [kidEmailInput, setKidEmailInput] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrollingKid, setEnrollingKid] = useState(false);
  
  // Generated Credentials Modal State
  const [showCredentialsCard, setShowCredentialsCard] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch children list
  const fetchChildren = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/parent/children", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setChildren(data.children || []);
      }
    } catch (err) {
      console.error("Failed to fetch children:", err);
    }
  };

  useEffect(() => {
    const initPortal = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/onboarding");
        return;
      }

      setParentName(session.user.user_metadata?.full_name || "Parent");

      // Verify user is parent
      const res = await fetch("/api/onboarding/role", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.role !== "parent") {
          router.replace("/my-batch");
          return;
        }
      }

      await fetchChildren();
      setLoading(false);

      const kidEmailParam = searchParams.get("kidEmail") || "";

      // If token is in query parameters, automatically open payment modal to resolve sponsorship
      if (token) {
        setIsSponsorship(true);
        setShowPaymentModal(true);
      } else if (kidEmailParam) {
        setKidEmailInput(kidEmailParam);
        setIsSponsorship(false);
        setPaymentStep("checkout");
        setShowPaymentModal(true);

        // Remove kidEmail from the URL search parameters cleanly
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("kidEmail");
          window.history.replaceState({}, "", url.pathname + url.search);
        } catch (e) {
          console.error(e);
        }
      }
    };

    initPortal();
  }, [router, token, searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    try {
      sessionStorage.clear();
    } catch {}
    router.replace("/onboarding");
  };

  // Trigger Real Razorpay Payment
  const triggerPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setEnrollError("");

    if (!isSponsorship) {
      if (!kidEmailInput || !kidEmailInput.includes("@")) {
        setEnrollError("Please enter a valid email address.");
        return;
      }
    }

    setEnrollingKid(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setEnrollError("You must be logged in to make a payment.");
        setEnrollingKid(false);
        return;
      }

      // 1. Create order
      const res = await fetch("/api/enroll/parent-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(
          isSponsorship && token
            ? { sponsorshipToken: token }
            : { kidEmail: kidEmailInput.trim().toLowerCase() }
        )
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initiate payment.");
      }

      if (!(window as any).Razorpay) {
        throw new Error("Payment gateway is currently loading. Please try again in a few seconds.");
      }

      setPaymentStep("processing");
      let paymentFinalized = false;

      // 2. Open Razorpay Modal
      const razorpay = new (window as any).Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Skillyug",
        description: isSponsorship ? "Sponsorship Activation Co-pay" : "Direct Student Enrollment",
        order_id: orderData.orderId,
        prefill: {
          name: session.user.user_metadata?.full_name || "",
          email: session.user.email || "",
        },
        notes: {
          booking_type: isSponsorship ? "parent_sponsorship" : "parent_direct",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (!paymentFinalized) {
              setEnrollError("Payment was cancelled before completion.");
              setPaymentStep("checkout");
              setEnrollingKid(false);
            }
          },
        },
        handler: async (paymentPayload: RazorpaySuccessPayload) => {
          paymentFinalized = true;
          setPaymentStep("processing");

          try {
            // 3. Verify Payment on Backend
            const verifyRes = await fetch("/api/enroll/parent-payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify(paymentPayload)
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment was captured but enrollment failed.");
            }

            // Success!
            await fetchChildren();

            // Reset query param if sponsorship
            if (isSponsorship) {
              const url = new URL(window.location.href);
              url.searchParams.delete("token");
              window.history.replaceState({}, "", url.pathname);
              setIsSponsorship(false);
            }

            if (verifyData.credentials) {
              setGeneratedCredentials(verifyData.credentials);
              setShowCredentialsCard(true);
              setShowPaymentModal(false);
              setPaymentStep("checkout");
              setKidEmailInput("");
            } else {
              setPaymentStep("success");
            }
          } catch (err: any) {
            console.error("Verification error:", err);
            setEnrollError(err.message || "Payment verification failed. Please contact support.");
            setPaymentStep("checkout");
          } finally {
            setEnrollingKid(false);
          }
        }
      });

      razorpay.on("payment.failed", (payload: any) => {
        paymentFinalized = true;
        setEnrollError(payload.error?.description || "Payment failed. Please try again.");
        setPaymentStep("checkout");
        setEnrollingKid(false);
      });

      razorpay.open();

    } catch (err: any) {
      console.error("Order creation error:", err);
      setEnrollError(err.message || "Failed to initialize payment process.");
      setPaymentStep("checkout");
      setEnrollingKid(false);
    }
  };

  // Copy Credentials
  const handleCopyCredentials = () => {
    if (!generatedCredentials) return;
    const credText = `Skillyug AI Bootcamp Credentials:\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}\nLogin at: ${window.location.origin}/login`;
    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 relative overflow-x-hidden select-none font-sans">
      {/* Background layer */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.04),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.04),_transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <Navbar />

      <section className="relative z-10 px-6 pt-28 md:pt-36 pb-16 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header Portal Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-600">Security Center</span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Parent Portal</h1>
              <p className="text-sm text-slate-500 font-medium">Welcome, {parentName}. Oversee your child&apos;s learning path.</p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsSponsorship(false);
                  setPaymentStep("checkout");
                  setShowPaymentModal(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all shadow-[0_4px_14px_rgba(59,130,246,0.15)] hover:scale-[1.03] active:scale-[0.97]"
              >
                <Plus className="w-4 h-4" />
                Enroll Kids in Bootcamp
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Children List Dashboard */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600" />
              Enrolled Children ({children.length})
            </h2>

            {children.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No children enrolled yet.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the &quot;Enroll Kids in Bootcamp&quot; button above to onboard children or resolve pending sponsorship tokens.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => router.push(`/my-batch?viewOnly=true&studentId=${child.id}`)}
                    className="group relative cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden hover:shadow-md"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-black text-purple-600 text-sm">
                          {child.full_name?.charAt(0).toUpperCase() || "S"}
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-800">{child.full_name || "Skillyug Student"}</h3>
                          <p className="text-xs text-slate-500 break-all">{child.email}</p>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>Enrolled On</span>
                        <span className="text-slate-600">{new Date(child.enrolledAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-purple-600 group-hover:text-purple-700 transition-colors pt-2">
                      <span>View Batch Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transform group-hover:translate-x-1.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Real Razorpay Payment Modal ─────────────────────────────────────── */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300"
        >
          <div className="relative w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-slate-900">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none" />

            <button
              onClick={() => {
                setShowPaymentModal(false);
                setIsSponsorship(false);
                setEnrollError("");
                setPaymentStep("checkout");
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full font-bold transition-all text-base"
            >
              ×
            </button>

            {paymentStep === "checkout" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Secure Checkout</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">100% Encrypted Payment</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Bootcamp Co-pay Amount</span>
                    <span className="font-semibold text-slate-700">₹399.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Platform Convenience Fee</span>
                    <span className="font-semibold text-green-600 font-mono tracking-wider text-[10px] uppercase">FREE</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Taxes (GST Included)</span>
                    <span className="font-semibold text-slate-700">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-slate-200 font-black text-base">
                    <span className="text-slate-900">Total Payable</span>
                    <span className="text-purple-650">₹399.00</span>
                  </div>
                </div>

                {isSponsorship ? (
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 font-semibold flex gap-2 items-center animate-pulse">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    Resolving Student Sponsorship Ticket.
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Enter Kid&apos;s Email Address <span className="text-blue-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={kidEmailInput}
                          onChange={(e) => setKidEmailInput(e.target.value.trim().toLowerCase())}
                          placeholder="kid@gmail.com"
                          autoComplete="email"
                          spellCheck="false"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {enrollError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold text-center leading-relaxed">
                    ⚠️ {enrollError}
                  </div>
                )}

                <button
                  onClick={(e) => triggerPayment(e)}
                  disabled={enrollingKid}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3.5 text-xs font-bold uppercase tracking-[0.24em] text-white transition-all hover:scale-[1.02] shadow-md disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                >
                  {enrollingKid ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Opening Secure Payment...
                    </>
                  ) : (
                    "Pay ₹399.00 Securely"
                  )}
                </button>

                <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    Secure Payments Secured by Razorpay
                  </div>
                  <div className="flex items-center gap-2.5 text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                    <span>SSL Encrypted</span>
                    <span className="text-slate-300">•</span>
                    <span>PCI-DSS Compliant</span>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Processing payment...</p>
                <p className="text-xs text-slate-400 font-mono">Verifying with Razorpay secure networks</p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Payment Successful</h3>
                    <p className="text-xs text-slate-500 mt-1">Order captured. Enrollment active.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-center text-slate-500 leading-relaxed">
                    {isSponsorship
                      ? "Sponsorship has been resolved. The student dashboard is now fully unlocked and active!"
                      : "The child has been enrolled successfully! They can log in using their existing email and credentials."}
                  </p>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setIsSponsorship(false);
                      setPaymentStep("checkout");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 transition-all font-bold"
                  >
                    Close Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      {/* ── Generated Credentials Card (Glassmorphism Overlay) ──────────────── */}
      {showCredentialsCard && generatedCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[2.5rem] border border-slate-100 bg-white p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Student Account Created</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">Secure credentials</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed">
              We generated a secure account for your child. Share these credentials with them so they can access their dashboard:
            </p>

            {/* Credentials Info Display Box */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-4 font-mono text-xs select-text relative">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Student Email</span>
                <span className="text-slate-800 text-sm break-all font-semibold block">{generatedCredentials.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Generated Password</span>
                <span className="text-purple-600 text-sm font-semibold block">{generatedCredentials.password}</span>
              </div>
              
              <div className="absolute top-4 right-4">
                <div title="Change password on profile page">
                  <ShieldAlert className="w-5 h-5 text-amber-500/70" />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCopyCredentials}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-purple-700 transition-all active:scale-[0.97]"
              >
                <Share2 className="w-4 h-4" />
                {copied ? "Copied!" : "Share / Copy"}
              </button>
              
              <button
                onClick={() => {
                  setShowCredentialsCard(false);
                  setGeneratedCredentials(null);
                }}
                className="flex-grow rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold py-3.5 text-xs uppercase tracking-[0.2em] transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ParentPortalClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <ParentPortalContent />
    </Suspense>
  );
}
