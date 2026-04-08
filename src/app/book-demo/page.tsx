/* eslint-disable @next/next/no-img-element, @next/next/no-page-custom-font */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { markPaymentSupportNoticePending } from "@/lib/paymentSupportNotice";
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

export default function BookDemoPage() {
  const router = useRouter();
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
  const [userEmail, setUserEmail] = useState("");
  const showPaymentHelpCta = Boolean(successMsg || errorMsg);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/book-demo");
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
  }, [razorpayAutoRetryCount, razorpayScriptStatus, razorpayScriptKey]);

  const handleRetryRazorpayScript = () => {
    setErrorMsg("");
    setGatewayNotice("");
    setRazorpayScriptStatus("loading");
    setRazorpayAutoRetryCount(0);
    setRazorpayScriptKey((current) => current + 1);
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setGatewayNotice("");

    if (razorpayScriptStatus === "failed") {
      setErrorMsg("Razorpay failed to load. Check your network or browser shields and try again.");
      return;
    }

    if (razorpayScriptStatus !== "ready" || !window.Razorpay) {
      setErrorMsg("Payment gateway is still loading. Please wait until it is ready.");
      return;
    }

    const normalizedStudentName = studentName.trim();
    const normalizedPhoneNumber = phoneNumber.trim();

    if (!normalizedStudentName || !/^\d{10}$/.test(normalizedPhoneNumber)) {
      setErrorMsg("Enter a valid name and 10-digit phone number before paying.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderResponse = await fetch("/api/book-demo/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: normalizedPhoneNumber,
          studentName: normalizedStudentName,
        }),
      });

      const orderData = (await orderResponse.json()) as RazorpayOrderResponse & { error?: string };

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to start payment.");
      }

      let paymentFinalized = false;

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Skillyug",
        description: "Book Your Demo",
        order_id: orderData.orderId,
        prefill: {
          name: normalizedStudentName,
          email: orderData.customerEmail || userEmail,
          contact: normalizedPhoneNumber,
        },
        notes: {
          booking_type: "demo_booking",
        },
        retry: {
          enabled: true,
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (!paymentFinalized) {
              setErrorMsg("Payment was cancelled before completion.");
              setIsProcessingPayment(false);
            }
          },
        },
        theme: {
          color: "#7c4dff",
        },
        handler: async (paymentPayload) => {
          paymentFinalized = true;

          try {
            const verifyResponse = await fetch("/api/book-demo/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...paymentPayload,
                phoneNumber: normalizedPhoneNumber,
                studentName: normalizedStudentName,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || "Payment was captured but demo confirmation failed."
              );
            }

            setSuccessMsg("Payment successful. Your demo has been booked.");
            markPaymentSupportNoticePending();
            setPhoneNumber("");
            setStudentName(prefilledName || "");
            router.replace("/my-batch");
          } catch (error) {
            console.error("Payment verification error:", error);
            setErrorMsg(
              error instanceof Error
                ? error.message
                : "Payment verification failed. Contact support with your payment details."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
      });

      razorpay.on("payment.failed", (payload) => {
        paymentFinalized = true;
        const failureReason =
          payload.error?.description || payload.error?.reason || "Payment failed. Please try again.";
        setErrorMsg(failureReason);
        setIsProcessingPayment(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      setErrorMsg(
        error instanceof Error ? error.message : "Unable to start payment. Please try again."
      );
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      <Script
        key={razorpayScriptKey}
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          setRazorpayScriptStatus("ready");
          setRazorpayAutoRetryCount(0);
          setGatewayNotice((current) =>
            current
              ? "Payment gateway reloaded. Your details are still filled in. Please review them and tap Pay Now again."
              : ""
          );
          setErrorMsg((current) =>
            current === "Razorpay failed to load. Check your network or browser shields and try again."
              || current ===
                "Razorpay failed to load after retry. Check your network or browser shields, then try again."
              ? ""
              : current
          );
        }}
        onError={() => {
          setRazorpayScriptStatus("failed");
          setErrorMsg("Razorpay failed to load. Check your network or browser shields and try again.");
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
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

      <div className="text-[#e6e0e9] font-body selection:bg-[#d1c4ff] selection:text-[#2b0064] min-h-screen flex flex-col relative overflow-hidden bg-[#0b0a0f]">
        {isCheckingAuth && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b0a0f]">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#a4a6ff]/30 border-t-[#a4a6ff]" />
              <p className="text-sm font-medium text-[#cac4cf]">Loading demo booking...</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/classroom.webp"
            alt="Background Classroom"
            className="w-full h-full object-cover object-[center_20%] opacity-80"
          />
          <div className="absolute inset-0 bg-[#0b0a0f]/60" />
        </div>

        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#6750a4]/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#3f51b5]/10 rounded-full blur-[120px] pointer-events-none z-0" />

        <header className="w-full top-0 sticky z-[100] bg-[#0b0a0f] flex justify-between items-center px-6 py-4">
          <img
            src="/skillyug-optimized.svg"
            alt="Skillyug Logo"
            className="h-20 md:h-24 w-auto object-contain scale-[1.8] md:scale-[2.0]"
          />
        </header>

        <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-24 relative z-10">
          <div className="w-full max-w-xl spotlight-card glass-panel rounded-xl p-8 md:p-12 luminous-glow border border-white/5">
            <div className="mb-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-[#cac4cf] hover:text-[#d1c4ff] transition-colors font-headline font-bold text-sm group w-fit"
              >
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">
                  arrow_back
                </span>
                Back
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-[#e6e0e9] mb-2">
                Book Your Demo
              </h1>
              <p className="text-[#cac4cf] font-medium">
                Complete the payment to confirm your live demo booking.
              </p>
            </div>

            {userEmail && (
              <div className="mb-6 rounded-xl border border-[#48474a]/35 bg-[#1b1923]/60 px-4 py-3 text-sm text-[#cac4cf]">
                Logged in as <span className="font-semibold text-white">{userEmail}</span>
              </div>
            )}

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

            {gatewayNotice && (
              <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-200">
                {gatewayNotice}
              </div>
            )}

            {razorpayScriptStatus === "loading" && (
              <div className="mb-6 rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200">
                Loading payment gateway...
              </div>
            )}

            {razorpayScriptStatus === "failed" && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleRetryRazorpayScript}
                  className="flex w-full items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/10 px-5 py-4 text-center text-sm font-semibold text-blue-200 transition-colors hover:bg-blue-500/15 hover:text-white"
                >
                  Retry payment gateway
                </button>
              </div>
            )}

            {showPaymentHelpCta && (
              <div className="mb-6">
                <Link
                  href="/#contact"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-blue-400/30 bg-gradient-to-r from-blue-600/80 to-violet-600/80 px-5 py-4 text-center text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgba(59,130,246,0.7)] transition-all hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 hover:shadow-[0_16px_36px_-12px_rgba(124,77,255,0.8)]"
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
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-[#938f99] mb-2 group-focus-within:text-[#d1c4ff] transition-colors">
                    Student Name
                  </label>
                  <input
                    name="studentName"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.currentTarget.value)}
                    className="w-full bg-[#2d2a37] border-none outline-none rounded-xl py-4 px-5 text-[#e6e0e9] placeholder:text-[#938f99]/60 focus:ring-2 focus:ring-[#d1c4ff] transition-all font-medium"
                    placeholder="Enter full name"
                    type="text"
                  />
                </div>

                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-[#938f99] mb-2 group-focus-within:text-[#d1c4ff] transition-colors">
                    Phone Number
                  </label>
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
                    className="w-full bg-[#2d2a37] border-none outline-none rounded-xl py-4 px-5 text-[#e6e0e9] placeholder:text-[#938f99]/60 focus:ring-2 focus:ring-[#d1c4ff] transition-all font-medium"
                    placeholder="9876543210"
                    type="tel"
                  />
                </div>

              </div>

              <div className="pt-4">
                <button
                  disabled={
                    isProcessingPayment ||
                    isCheckingAuth ||
                    razorpayScriptStatus !== "ready"
                  }
                  className="w-full bg-gradient-to-r from-[#7c4dff] to-[#448aff] text-white font-bold py-5 rounded-full hover:shadow-[0_0_30px_-5px_rgba(124,77,255,0.6)] disabled:opacity-75 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                  type="submit"
                >
                  <span className="material-symbols-outlined">payments</span>
                  {isProcessingPayment
                    ? "Opening Payment..."
                    : razorpayScriptStatus === "loading"
                      ? "Loading Payment Gateway..."
                      : razorpayScriptStatus === "failed"
                        ? "Payment Gateway Unavailable"
                        : "Pay Now - ₹49"}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[11px] font-label text-[#938f99]/60 uppercase tracking-widest">
                Secure payment processed via Razorpay
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
