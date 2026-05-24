/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Plus, CreditCard, Mail, Key, Share2, CheckCircle, ArrowRight, Loader2, LogOut, Copy, ShieldAlert, ShieldCheck, Eye, EyeOff, Sparkles, GraduationCap } from "lucide-react";
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
  temp_password?: string | null;
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
  const [kidNameInput, setKidNameInput] = useState("");
  const [kidGradeInput, setKidGradeInput] = useState("6");
  const [kidPasswordInput, setKidPasswordInput] = useState("");
  const [showKidPassword, setShowKidPassword] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [enrollingKid, setEnrollingKid] = useState(false);
  
  // Generated Credentials Modal State
  const [showCredentialsCard, setShowCredentialsCard] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedChildId, setCopiedChildId] = useState<string | null>(null);

  const handleShareChildDetails = async (child: ChildUser) => {
    const credText = child.temp_password
      ? `Skillyug AI Bootcamp Credentials:\nStudent: ${child.full_name || "Student"}\nEmail: ${child.email}\nPassword: ${child.temp_password}\nLogin at: ${window.location.origin}/login`
      : `Skillyug AI Bootcamp Enrollment:\nStudent: ${child.full_name || "Student"}\nEmail: ${child.email}\nLogin at: ${window.location.origin}/login`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Skillyug AI Bootcamp Access",
          text: credText,
          url: `${window.location.origin}/login`
        });
        return;
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }
    
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(credText);
      setCopiedChildId(child.id);
      setTimeout(() => setCopiedChildId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
    let active = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initPortalWithSession = async (session: any) => {
      if (!session) {
        if (active) router.replace("/onboarding");
        return;
      }

      if (!active) return;
      setParentName(session.user.user_metadata?.full_name || "Parent");

      // Verify user is parent
      try {
        const res = await fetch("/api/onboarding/role", {
          headers: {
            "Authorization": `Bearer ${session.access_token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.role !== "parent") {
            if (active) router.replace("/my-batch");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to verify user role:", err);
      }

      await fetchChildren();
      if (active) setLoading(false);

      const kidEmailParam = searchParams.get("kidEmail") || "";

      // If token is in query parameters, automatically open payment modal to resolve sponsorship
      if (token) {
        if (active) {
          setIsSponsorship(true);
          setShowPaymentModal(true);
        }
      } else if (kidEmailParam) {
        if (active) {
          setKidEmailInput(kidEmailParam);
          setIsSponsorship(false);
          setPaymentStep("checkout");
          setShowPaymentModal(true);
        }

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

    // First check session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) {
        initPortalWithSession(session);
      } else {
        // If not immediately available, subscribe to auth state changes to catch INITIAL_SESSION or SIGNED_IN
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (!active) return;
          // When INITIAL_SESSION or SIGNED_IN fires with a session
          if (currentSession) {
            initPortalWithSession(currentSession);
            subscription.unsubscribe();
          } else {
            // If INITIAL_SESSION fires and session is still null, then user is definitely logged out
            if (event === "INITIAL_SESSION") {
              router.replace("/onboarding");
              subscription.unsubscribe();
            }
          }
        });
        authSubscription = subscription;
      }
    });

    return () => {
      active = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [router, token, searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    try {
      sessionStorage.clear();
      localStorage.removeItem("user_role");
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
      if (!kidNameInput.trim()) {
        setEnrollError("Please enter the student's full name.");
        return;
      }
      if (!kidGradeInput) {
        setEnrollError("Please select the student's grade.");
        return;
      }
      if (!kidPasswordInput) {
        setEnrollError("Please set a password for the student.");
        return;
      }
      if (kidPasswordInput.length < 6) {
        setEnrollError("Student password must be at least 6 characters long.");
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
            : { 
                kidEmail: kidEmailInput.trim().toLowerCase(),
                kidName: kidNameInput.trim(),
                kidGrade: kidGradeInput,
                kidPassword: kidPasswordInput.trim()
              }
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
              setKidNameInput("");
              setKidGradeInput("6");
              setKidPasswordInput("");
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
  const handleCopyCredentials = async () => {
    if (!generatedCredentials) return;
    const credText = `Skillyug AI Bootcamp Credentials:\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}\nLogin at: ${window.location.origin}/login`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Skillyug AI Bootcamp Credentials",
          text: credText,
          url: `${window.location.origin}/login`
        });
        return;
      } catch (err) {
        console.log("Error sharing:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(credText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center text-slate-500 dark:text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 relative overflow-x-hidden select-none font-sans">
      {/* Background layer */}
      <div className="fixed inset-0 pointer-events-none opacity-50 z-0 bg-slate-50 dark:bg-[#020617]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.04),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.04),_transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <Navbar />

      <section className="relative z-10 px-4 sm:px-6 pt-28 md:pt-36 pb-16 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
          
          {/* Header Portal Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Security Center</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Parent Portal</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Welcome, {parentName}. Oversee your child&apos;s learning path.</p>
            </div>
            
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setIsSponsorship(false);
                  setPaymentStep("checkout");
                  setShowPaymentModal(true);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all shadow-[0_4px_14px_rgba(59,130,246,0.15)] hover:scale-[1.03] active:scale-[0.97]"
              >
                <Plus className="w-4 h-4" />
                Enroll Kids in Bootcamp
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-3 rounded-full bg-slate-100 dark:bg-[#090d1f] hover:bg-slate-200 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors flex-shrink-0"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Children List Dashboard */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Enrolled Children ({children.length})
            </h2>

            {children.length === 0 ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 rounded-xl flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-amber-650 dark:text-amber-450 animate-pulse" />
                    </div>
                    <div className="space-y-1 text-left">
                      <h4 className="text-sm font-black tracking-wide uppercase">Payment Required</h4>
                      <p className="text-xs text-slate-650 dark:text-slate-400 font-medium">
                        You must complete the payment process first before you can add kids to the system.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsSponsorship(false);
                      setPaymentStep("checkout");
                      setShowPaymentModal(true);
                    }}
                    className="w-full md:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Pay ₹399.00 & Register Kid
                  </button>
                </div>

                <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#090d1f] p-8 sm:p-10 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 dark:border-white/5">
                    <Users className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">No children enrolled yet.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                    Click the &quot;Enroll Kids in Bootcamp&quot; button above to onboard children or resolve pending sponsorship tokens.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => router.push(`/my-batch?viewOnly=true&studentId=${child.id}`)}
                    className="group relative cursor-pointer rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#090d1f] p-6 shadow-sm hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden hover:shadow-md dark:shadow-none"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30 flex-shrink-0 flex items-center justify-center font-black text-purple-600 dark:text-purple-400 text-sm">
                            {child.full_name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-black text-slate-800 dark:text-white truncate">{child.full_name || "Skillyug Student"}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 break-all">{child.email}</p>
                            {child.temp_password && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-md w-fit border border-purple-100 dark:border-purple-900/30 font-mono">
                                <Key className="w-3 h-3 text-purple-400 dark:text-purple-500" />
                                <span>Pass: {child.temp_password}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareChildDetails(child);
                          }}
                          className={`p-2.5 rounded-xl border transition-all flex-shrink-0 flex items-center justify-center ${
                            copiedChildId === child.id
                              ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400 animate-in zoom-in"
                              : "bg-slate-50 dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/30 border-slate-200 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-900/30 text-slate-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400"
                          }`}
                          title={copiedChildId === child.id ? "Copied details!" : "Share child details"}
                        >
                          {copiedChildId === child.id ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        <span>Enrolled On</span>
                        <span className="text-slate-600 dark:text-slate-400">{new Date(child.enrolledAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors pt-2">
                      <span>View Batch Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-purple-600 dark:group-hover:text-purple-400 transform group-hover:translate-x-1.5 transition-all" />
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
          <div className="relative w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#090d1f] p-5 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none" />

            <button
              onClick={() => {
                setShowPaymentModal(false);
                setIsSponsorship(false);
                setEnrollError("");
                setPaymentStep("checkout");
                setKidEmailInput("");
                setKidNameInput("");
                setKidGradeInput("6");
                setKidPasswordInput("");
              }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-750 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-lg z-30"
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
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Secure Checkout</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-mono">100% Encrypted Payment</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 p-4 space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Bootcamp Co-pay Amount</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹399.00</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Platform Convenience Fee</span>
                    <span className="font-semibold text-green-600 dark:text-green-400 font-mono tracking-wider text-[10px] uppercase">FREE</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Taxes (GST Included)</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-slate-200 dark:border-white/5 font-black text-base">
                    <span className="text-slate-900 dark:text-white">Total Payable</span>
                    <span className="text-purple-650 dark:text-purple-400">₹399.00</span>
                  </div>
                </div>

                {isSponsorship ? (
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 font-semibold flex gap-2 items-center animate-pulse">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    Resolving Student Sponsorship Ticket.
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {/* Kid's Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Student&apos;s Full Name <span className="text-blue-500">*</span>
                      </label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={kidNameInput}
                          onChange={(e) => setKidNameInput(e.target.value)}
                          placeholder="e.g. Tanuj Pathak"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Kid's Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Student&apos;s Email Address <span className="text-blue-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={kidEmailInput}
                          onChange={(e) => setKidEmailInput(e.target.value.trim().toLowerCase())}
                          placeholder="student@gmail.com"
                          autoComplete="email"
                          spellCheck="false"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Kid's Grade Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Student&apos;s Grade / Class <span className="text-blue-500">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          value={kidGradeInput}
                          onChange={(e) => setKidGradeInput(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
                        >
                          {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
                            <option key={grade} value={grade} className="dark:bg-slate-950">
                              Grade {grade}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-450 text-xs">▼</div>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Password for student <span className="text-blue-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            // Generate strong 12 character password following best practices
                            const lowercase = "abcdefghijkmnopqrstuvwxyz";
                            const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
                            const numbers = "23456789";
                            const symbols = "!@#$%&*?";
                            const allChars = lowercase + uppercase + numbers + symbols;
                            
                            // Guarantee at least one of each class
                            let pwd = "";
                            pwd += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
                            pwd += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
                            pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
                            pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));
                            
                            // Fill the rest up to 12 characters
                            for (let i = 4; i < 12; i++) {
                              pwd += allChars.charAt(Math.floor(Math.random() * allChars.length));
                            }
                            
                            // Shuffle the password characters to avoid predictable patterns
                            pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');
                            setKidPasswordInput(pwd);
                          }}
                          className="text-[10px] font-bold text-purple-655 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 flex items-center gap-1 uppercase tracking-wider transition-colors active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 animate-pulse" />
                          Auto-Generate
                        </button>
                      </div>
                      
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showKidPassword ? "text" : "password"}
                          required
                          value={kidPasswordInput}
                          onChange={(e) => setKidPasswordInput(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-11 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKidPassword(!showKidPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650"
                        >
                          {showKidPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        Create a secure password for your child to log in. Minimum length is 6 characters.
                      </p>
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
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Processing payment...</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">Verifying with Razorpay secure networks</p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Payment Successful</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Order captured. Enrollment active.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <p className="text-sm text-center text-slate-500 dark:text-slate-400 leading-relaxed">
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
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300 transition-all font-bold"
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
          <div className="w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#090d1f] p-5 sm:p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-950/30 p-3">
                <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Student Account Created</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-mono">Secure credentials</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We generated a secure account for your child. Share these credentials with them so they can access their dashboard:
            </p>

            {/* Credentials Info Display Box */}
            <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900 p-5 space-y-4 font-mono text-xs select-text relative">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Student Email</span>
                <span className="text-slate-800 dark:text-white text-sm break-all font-semibold block">{generatedCredentials.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Generated Password</span>
                <span className="text-purple-600 dark:text-purple-400 text-sm font-semibold block">{generatedCredentials.password}</span>
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
                className="flex-grow rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold py-3.5 text-xs uppercase tracking-[0.2em] transition-all"
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center text-slate-500 dark:text-slate-400 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <ParentPortalContent />
    </Suspense>
  );
}
