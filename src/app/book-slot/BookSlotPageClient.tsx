/* eslint-disable @next/next/no-img-element, @next/next/no-page-custom-font */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone } from "lucide-react";

import { markPaymentSupportNoticePending } from "@/lib/paymentSupportNotice";
import { 
  PARTIAL_BOOK_SLOT_AMOUNT_RUPEES, 
  FULL_BOOK_SLOT_AMOUNT_RUPEES,
  calculateBootcampPriceRupees
} from "@/lib/pricing";
import { supabase } from "@/lib/supabaseClient";

interface RazorpayOrderResponse {
  amount: number;
  currency: string;
  customerEmail: string;
  keyId: string;
  orderId: string;
}

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

interface RazorpayInstance {
  on: (event: "payment.failed", handler: (payload: RazorpayFailurePayload) => void) => void;
  open: () => void;
}

interface RazorpayOptions {
  amount: number;
  currency: string;
  description: string;
  handler: (payload: RazorpaySuccessPayload) => void | Promise<void>;
  key: string;
  modal?: {
    confirm_close?: boolean;
    ondismiss?: () => void;
  };
  name: string;
  notes?: Record<string, string>;
  order_id: string;
  prefill?: {
    contact?: string;
    email?: string;
    name?: string;
  };
  retry?: {
    enabled: boolean;
  };
  theme?: {
    color: string;
  };
}

type RazorpayScriptStatus = "loading" | "ready" | "failed";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function BookSlotPage({ nonce = "" }: { nonce?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const paymentTier = (!fromParam || fromParam === "bootcamp" || fromParam === "courses") ? "full" : "partial";
  const [promoCode, setPromoCode] = useState("");
  const displayAmount = paymentTier === "full" ? calculateBootcampPriceRupees(promoCode) : PARTIAL_BOOK_SLOT_AMOUNT_RUPEES;
  const [errorMsg, setErrorMsg] = useState("");
  const [gatewayNotice, setGatewayNotice] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayScriptStatus, setRazorpayScriptStatus] =
    useState<RazorpayScriptStatus>("loading");
  const [razorpayAutoRetryCount, setRazorpayAutoRetryCount] = useState(0);
  const [razorpayScriptKey, setRazorpayScriptKey] = useState(0);
  const [prefilledName, setPrefilledName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [studentName, setStudentName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [grade, setGrade] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const showPaymentHelpCta = Boolean(successMsg || errorMsg);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const currentPath = fromParam ? `/book-slot?from=${fromParam}` : "/book-slot";
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        setIsCheckingAuth(false);
        return;
      }

      const fullName = session.user?.user_metadata?.full_name || "";
      if (fullName) {
        setPrefilledName(fullName);
        setStudentName(fullName);
      }

      setUserEmail(session.user?.email ?? "");
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (razorpayScriptStatus !== "loading") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      if (window.Razorpay) {
        setRazorpayScriptStatus("ready");
        return;
      }

      if (razorpayAutoRetryCount < 1) {
        setGatewayNotice(
          "Payment gateway took too long to load. Reloading it now. Your entered details will stay filled in."
        );
        setRazorpayAutoRetryCount((current) => current + 1);
        setRazorpayScriptKey((current) => current + 1);
        return;
      }

      setRazorpayScriptStatus("failed");
      setErrorMsg(
        "Razorpay failed to load after retry. Check your network or browser shields, then try again."
      );
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [razorpayAutoRetryCount, razorpayScriptKey, razorpayScriptStatus]);

  const handleRetryRazorpayScript = () => {
    setErrorMsg("");
    setGatewayNotice("");
    setRazorpayScriptStatus("loading");
    setRazorpayScriptKey((current) => current + 1);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (isProcessingPayment) return;

    if (!studentName.trim() || !phoneNumber.trim() || !grade.trim()) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    if (phoneNumber.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMsg("Your session expired. Please reload and log in again.");
        setIsProcessingPayment(false);
        return;
      }

      const orderRequest = await fetch("/api/book-slot/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          paymentTier,
          studentName,
          phoneNumber,
          grade,
          promoCode: promoCode.trim() || undefined,
        }),
      });

      const responseBody = await orderRequest.text();
      let orderResult: RazorpayOrderResponse & { error?: string };
      try {
        orderResult = JSON.parse(responseBody);
      } catch (err) {
        console.error("Non-JSON API error response:", responseBody);
        throw new Error("We received a bad response from the payment setup server. Please try again.");
      }

      if (!orderRequest.ok) {
        throw new Error(
          orderResult.error || "Failed to initialize booking session. Please try again later."
        );
      }

      const razorpayOptions: RazorpayOptions = {
        key: orderResult.keyId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: "Skillyug",
        description:
          paymentTier === "full"
            ? "AI Bootcamp Complete Enrollment Fee"
            : "AI Bootcamp Partial Spot Reservation Fee",
        order_id: orderResult.orderId,
        prefill: {
          name: prefilledName || studentName,
          email: orderResult.customerEmail,
          contact: phoneNumber,
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setIsProcessingPayment(false);
          },
        },
        handler: async (paymentPayload: RazorpaySuccessPayload) => {
          setIsProcessingPayment(true);
          try {
            // Keep notice active until verified
            markPaymentSupportNoticePending();

            const verifyRequest = await fetch("/api/book-slot/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: paymentPayload.razorpay_order_id,
                razorpay_payment_id: paymentPayload.razorpay_payment_id,
                razorpay_signature: paymentPayload.razorpay_signature,
                studentName,
                phoneNumber,
                grade,
                promoCode: promoCode.trim() || undefined,
              }),
            });

            const verifyResult = (await verifyRequest.json()) as { error?: string };

            if (!verifyRequest.ok) {
              throw new Error(verifyResult.error || "Payment verification failed.");
            }

            setSuccessMsg("Payment successful! Redirecting you to your batch dashboard...");
            setTimeout(() => {
              router.push("/my-batch");
            }, 1500);
          } catch (verifyError) {
            console.error("Payment verification failure:", verifyError);
            setErrorMsg(
              verifyError instanceof Error
                ? verifyError.message
                : "Payment succeeded but verification failed. Reach out to our support team."
            );
            setIsProcessingPayment(false);
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not fully loaded. Check your connection and try again.");
      }

      const instance = new window.Razorpay(razorpayOptions);
      instance.on("payment.failed", (failedPayload: RazorpayFailurePayload) => {
        console.error("Razorpay payment failure event:", failedPayload);
        setErrorMsg(
          failedPayload.error?.description || "Payment process cancelled or failed. Please try again."
        );
        setIsProcessingPayment(false);
      });

      instance.open();
    } catch (orderError) {
      console.error("Razorpay Setup Failure:", orderError);
      setErrorMsg(
        orderError instanceof Error
          ? orderError.message
          : "Could not start checkout session. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      <Script
        key={razorpayScriptKey}
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        nonce={nonce}
        onLoad={() => setRazorpayScriptStatus("ready")}
        onError={() => setRazorpayScriptStatus("failed")}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .font-headline { font-family: 'Plus Jakarta Sans', sans-serif; }
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
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(24px);
        }
        .dark .glass-panel {
          background: rgba(10, 15, 28, 0.85);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .luminous-glow {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
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
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }
      `,
        }}
      />

      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Manrope:wght@400;500;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div className="text-slate-800 dark:text-slate-200 font-body min-h-screen flex flex-col relative overflow-hidden bg-transparent transition-colors duration-300">
        {isCheckingAuth && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617]">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-orange-200 border-t-[#0060aa]" />
              <p className="text-sm font-medium text-slate-650 dark:text-slate-400">Loading your booking...</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/classroom.webp"
            alt="Background Classroom"
            className="w-full h-full object-cover object-[center_20%] opacity-5"
          />
          <div className="absolute inset-0 bg-transparent" />
        </div>

        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#0060aa]/5 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#ff8b12]/5 rounded-full blur-[120px] pointer-events-none z-0" />

        <header className="w-full top-0 sticky z-[100] bg-white/70 dark:bg-[#020617]/70 border-b border-slate-200/40 dark:border-white/5 backdrop-blur-md flex justify-between items-center px-6 py-4">
          <img
            src="/skillyug-optimized.svg"
            alt="Skillyug Logo"
            className="h-20 md:h-24 w-auto object-contain scale-[1.8] md:scale-[2.0]"
          />
        </header>

        <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-24 relative z-10">
          <div 
            className="w-full max-w-xl spotlight-card glass-panel rounded-xl p-8 md:p-12 luminous-glow border border-slate-200/60 dark:border-white/5 shadow-lg animate-slide-down"
          >
            <div className="mb-6">
              <Link
                href={fromParam === "courses" ? "/courses" : fromParam === "bootcamp" ? "/bootcamp" : "/"}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-white transition-colors font-headline font-bold text-sm group w-fit"
              >
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">
                  arrow_back
                </span>
                Back
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                {paymentTier === "full" ? "Enroll in Bootcamp" : "Book Your Spot"}
              </h1>
              <p className="text-slate-600 dark:text-slate-350 font-medium">
                {paymentTier === "full"
                  ? `Complete the full payment to enroll in the upcoming bootcamp.`
                  : `Complete this payment to reserve your spot. The total bootcamp price is ₹10.`}
              </p>
            </div>

            {userEmail && (
              <div className="mb-6 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-[#0f172a]/70 px-4 py-3 text-sm text-slate-655 dark:text-slate-300">
                Logged in as <span className="font-semibold text-slate-900 dark:text-white">{userEmail}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 rounded-xl border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-950/40 px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-400">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-405">
                {errorMsg}
              </div>
            )}

            {gatewayNotice && (
              <div className="mb-6 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-400">
                {gatewayNotice}
              </div>
            )}

            {razorpayScriptStatus === "loading" && (
              <div className="mb-6 rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-sm font-semibold text-blue-700 dark:text-blue-400">
                Loading payment gateway...
              </div>
            )}

            {razorpayScriptStatus === "failed" && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleRetryRazorpayScript}
                  className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white/80 dark:bg-[#0a0f1c]/80 px-5 py-4 text-center text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors hover:bg-slate-50 dark:hover:bg-[#0f172a]/95"
                >
                  Retry payment gateway
                </button>
              </div>
            )}

            {showPaymentHelpCta && (
              <div className="mb-6">
                <Link
                  href="/#contact"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-orange-200/50 bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] px-5 py-4 text-center text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  If you faced any problem during payment, contact us so we can help.
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            )}

            <form className="space-y-8" onSubmit={handlePayment}>
              <div className="space-y-6">
                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-slate-500 dark:text-slate-450 mb-2 group-focus-within:text-[#0060aa] dark:group-focus-within:text-[#ff9d3b] transition-colors">
                    Student Name
                  </label>
                  <div className="relative">
                    <input
                      name="studentName"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.currentTarget.value)}
                      className="w-full bg-white/70 border border-slate-200 dark:bg-slate-900/60 dark:border-white/5 outline-none rounded-xl py-4 px-5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-505 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all font-medium"
                      placeholder="Enter full name"
                      type="text"
                     />
                  </div>
                </div>

                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-slate-500 dark:text-slate-450 mb-2 group-focus-within:text-[#0060aa] dark:group-focus-within:text-[#ff9d3b] transition-colors">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      name="phoneNumber"
                      required
                      value={phoneNumber}
                      pattern="\d{10}"
                      maxLength={10}
                      title="Please enter exactly 10 digits"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                      onChange={(e) =>
                        setPhoneNumber(e.currentTarget.value.replace(/[^0-9]/g, "").slice(0, 10))
                      }
                      className="w-full bg-white/70 border border-slate-200 dark:bg-slate-900/60 dark:border-white/5 outline-none rounded-xl py-4 px-5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-505 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all font-medium"
                      placeholder="9876543210"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-slate-500 dark:text-slate-450 mb-2 group-focus-within:text-[#0060aa] dark:group-focus-within:text-[#ff9d3b] transition-colors">
                    Class/Grade
                  </label>
                  <div className="relative">
                    <select
                      name="grade"
                      required
                      value={grade}
                      onChange={(e) => setGrade(e.currentTarget.value)}
                      className="w-full bg-white/70 border border-slate-200 dark:bg-slate-900/60 dark:border-white/5 outline-none rounded-xl py-4 px-5 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all font-medium appearance-none"
                    >
                      <option disabled value="">
                        Select class or grade
                      </option>
                      <option value="6th">6th</option>
                      <option value="7th">7th</option>
                      <option value="8th">8th</option>
                      <option value="9th">9th</option>
                      <option value="10th">10th</option>
                      <option value="11th">11th</option>
                      <option value="12th">12th</option>
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-500">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-slate-500 dark:text-slate-450 mb-2 group-focus-within:text-[#0060aa] dark:group-focus-within:text-[#ff9d3b] transition-colors">
                    Promo Code (Optional)
                  </label>
                  <div className="relative">
                    <input
                      name="promoCode"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.currentTarget.value.toUpperCase())}
                      className="w-full bg-white/70 border border-slate-200 dark:bg-slate-900/60 dark:border-white/5 outline-none rounded-xl py-4 px-5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-505 focus:ring-1 focus:ring-[#ff8b12]/20 focus:border-[#ff8b12] dark:focus:ring-[#ff9d3b]/20 dark:focus:border-[#ff9d3b] transition-all font-medium uppercase"
                      placeholder="Enter promo code"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={
                    isProcessingPayment ||
                     isCheckingAuth ||
                     razorpayScriptStatus !== "ready"
                  }
                  className="w-full bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white font-bold py-5 rounded-full shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
                  type="submit"
                >
                  <span className="material-symbols-outlined">payments</span>
                  {isProcessingPayment
                    ? "Opening Payment..."
                    : razorpayScriptStatus === "loading"
                      ? "Loading Payment Gateway..."
                      : razorpayScriptStatus === "failed"
                        ? "Payment Gateway Unavailable"
                        : `Pay Now - ₹${displayAmount}`}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[11px] font-label text-slate-500/80 dark:text-slate-500 uppercase tracking-widest">
                Secure payment processed via Razorpay
              </p>
            </div>
          </div>
        </main>

        {/* Sticky Floating Call Advisor CTA Button */}
        <a
          href="tel:7835049710"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 border border-orange-400/20"
          title="Call our advisor"
        >
          <Phone size={18} className="animate-pulse" />
          <span className="text-sm md:text-base font-bold tracking-wide">Call our advisor</span>
        </a>
      </div>
    </>
  );
}
