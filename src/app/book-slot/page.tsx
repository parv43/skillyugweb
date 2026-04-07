/* eslint-disable @next/next/no-img-element, @next/next/no-page-custom-font */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
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

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function BookSlotPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [prefilledName, setPrefilledName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/book-slot");
        setIsCheckingAuth(false);
        return;
      }

      const fullName = session.user?.user_metadata?.full_name || "";
      if (fullName) {
        setPrefilledName(fullName);
      }

      setUserEmail(session.user?.email ?? "");
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!window.Razorpay || !isRazorpayReady) {
      setErrorMsg("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const studentName = (formData.get("studentName") as string)?.trim();
    const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
    const grade = formData.get("grade") as string;
    const promoCode = ((formData.get("promoCode") as string) || "").trim().toUpperCase();

    if (!studentName || !grade || !/^\d{10}$/.test(phoneNumber)) {
      setErrorMsg("Enter a valid name, class, and 10-digit phone number before paying.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const orderResponse = await fetch("/api/book-slot/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          phoneNumber,
          promoCode,
          studentName,
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
        description: "Book Your Spot",
        order_id: orderData.orderId,
        prefill: {
          name: studentName,
          email: orderData.customerEmail || userEmail,
          contact: phoneNumber,
        },
        notes: {
          booking_type: "slot_booking",
          grade,
          promo_code: promoCode || "NONE",
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
          color: "#6750a4",
        },
        handler: async (paymentPayload) => {
          paymentFinalized = true;

          try {
            const verifyResponse = await fetch("/api/book-slot/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...paymentPayload,
                grade,
                phoneNumber,
                promoCode,
                studentName,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || "Payment was captured but booking confirmation failed."
              );
            }

            setSuccessMsg("Payment successful. Your slot has been booked.");
            form.reset();

            const studentNameInput = form.elements.namedItem("studentName") as HTMLInputElement | null;
            if (studentNameInput && prefilledName) {
              studentNameInput.value = prefilledName;
            }
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
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setIsRazorpayReady(true)}
        onError={() => setErrorMsg("Razorpay checkout failed to load. Refresh and try again.")}
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
              <p className="text-sm font-medium text-[#cac4cf]">Loading your booking...</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/classroom.jpeg"
            alt="Background Classroom"
            className="w-full h-full object-cover object-[center_20%] opacity-80"
          />
          <div className="absolute inset-0 bg-[#0b0a0f]/60" />
        </div>

        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#6750a4]/10 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#3f51b5]/10 rounded-full blur-[120px] pointer-events-none z-0" />

        <header className="w-full top-0 sticky z-[100] bg-[#0b0a0f] flex justify-between items-center px-6 py-4">
          <img
            src="/skillyug.png"
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
                Book Your Spot
              </h1>
              <p className="text-[#cac4cf] font-medium">
                Complete the payment to confirm your placement for the upcoming session.
              </p>
            </div>

            {userEmail && (
              <div className="mb-6 rounded-xl border border-[#48474a]/35 bg-[#1b1923]/60 px-4 py-3 text-sm text-[#cac4cf]">
                Logged in as <span className="font-semibold text-white">{userEmail}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/15 px-4 py-3 text-sm font-semibold text-green-300">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-300">
                {errorMsg}
              </div>
            )}

            <form className="space-y-8" onSubmit={handlePayment}>
              <div className="space-y-6">
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
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                      className="w-full bg-[#2d2a37] border-none outline-none rounded-xl py-4 px-5 text-[#e6e0e9] placeholder:text-[#938f99]/60 focus:ring-2 focus:ring-[#d1c4ff] transition-all font-medium"
                      placeholder="9876543210"
                      type="tel"
                    />
                  </div>
                </div>

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
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-[#938f99]">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block font-label text-[10px] uppercase tracking-[0.05rem] font-bold text-[#938f99] mb-2 group-focus-within:text-[#d1c4ff] transition-colors">
                    Promo Code (Optional)
                  </label>
                  <div className="relative">
                    <input
                      name="promoCode"
                      className="w-full bg-[#2d2a37] border-none outline-none rounded-xl py-4 px-5 text-[#e6e0e9] placeholder:text-[#938f99]/60 focus:ring-2 focus:ring-[#d1c4ff] transition-all font-medium uppercase"
                      placeholder="Enter promo code"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isProcessingPayment || isCheckingAuth}
                  className="w-full bg-gradient-to-r from-[#7c4dff] to-[#448aff] text-white font-bold py-5 rounded-full hover:shadow-[0_0_30px_-5px_rgba(124,77,255,0.6)] disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
                  type="submit"
                >
                  <span className="material-symbols-outlined">payments</span>
                  {isProcessingPayment ? "Opening Payment..." : "Pay Now - ₹299"}
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
