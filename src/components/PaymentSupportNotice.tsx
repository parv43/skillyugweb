"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";
import { clearPaymentSupportNotice, hasActivePaymentSupportNotice } from "@/lib/paymentSupportNotice";
import { supabase } from "@/lib/supabaseClient";

export default function PaymentSupportNotice() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkNotice = async () => {
      if (!hasActivePaymentSupportNotice()) {
        if (!cancelled) {
          setIsVisible(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        clearPaymentSupportNotice();
        if (!cancelled) {
          setIsVisible(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/my-batch/access", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) {
            setIsVisible(true);
          }
          return;
        }

        const data = (await response.json()) as { hasAccess?: boolean };
        if (data.hasAccess) {
          clearPaymentSupportNotice();
          if (!cancelled) {
            setIsVisible(false);
          }
          return;
        }

        if (!cancelled) {
          setIsVisible(true);
        }
      } catch {
        if (!cancelled) {
          setIsVisible(true);
        }
      }
    };

    checkNotice();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <section className="relative z-20 px-6 pt-28 md:px-12">
      <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-amber-400/25 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-blue-500/10 px-6 py-5 shadow-[0_18px_50px_-24px_rgba(251,191,36,0.55)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
              Payment Support
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-100 md:text-base">
              If My Batch is still not visible after your payment, contact us and we will help you
              resolve access quickly.
            </p>
          </div>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/15 px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-amber-400/25"
          >
            <LifeBuoy className="h-4 w-4" />
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
