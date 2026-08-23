import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRequiredEnv, getRazorpayAuthHeader } from "@/lib/razorpayServer";
import { PARTIAL_BOOK_SLOT_AMOUNT_PAISE, FULL_BOOK_SLOT_AMOUNT_PAISE, calculateBootcampPricePaise } from "@/lib/pricing";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const SLOT_CURRENCY = "INR";
const SLOT_ORDER_COOKIE = "slot_booking_order_id";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // No-op in route handlers when cookie writes are managed on the response.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to book a slot." }, { status: 401 });
    }

    const body = await request.json();
    const studentName = typeof body.studentName === "string" ? body.studentName.trim() : "";
    const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
    const grade = typeof body.grade === "string" ? body.grade.trim() : "";
    const promoCode = typeof body.promoCode === "string" ? body.promoCode.trim().toUpperCase() : "";
    const paymentTier = body.paymentTier === "full" ? "full" : "partial";
    const amount = paymentTier === "full" ? calculateBootcampPricePaise(promoCode) : PARTIAL_BOOK_SLOT_AMOUNT_PAISE;

    if (!studentName || !grade || !/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Student name, class/grade, and a valid 10-digit phone number are required." },
        { status: 400 }
      );
    }

    const { data: activeBatch, error: batchError } = await supabaseAdmin
      .from("batches")
      .select("id")
      .eq("is_active", true)
      .single();
      
    if (batchError || !activeBatch) {
      console.error("Failed to find an active batch:", batchError);
      return NextResponse.json(
        { error: "No active bootcamp is currently accepting enrollments." },
        { status: 400 }
      );
    }

    const receipt = `slot_${Date.now()}`.slice(0, 40);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: getRazorpayAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: SLOT_CURRENCY,
        receipt,
        notes: {
          booking_type: "slot_booking",
          payment_tier: paymentTier,
          email: user.email ?? "",
          grade,
          grade_class: grade,
          phone_number: phoneNumber,
          promo_code: promoCode || "NONE",
          student_name: studentName,
          user_id: user.id,
          batch_id: activeBatch.id,
        },
      }),
      cache: "no-store",
    });

    const razorpayOrder = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      return NextResponse.json(
        {
          error:
            razorpayOrder?.error?.description || "Unable to create Razorpay order. Please try again.",
        },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      customerEmail: user.email ?? "",
      keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
      orderId: razorpayOrder.id,
    });

    response.cookies.set(SLOT_ORDER_COOKIE, razorpayOrder.id, {
      httpOnly: true,
      maxAge: 60 * 15,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Book slot order creation failed:", error);
    return NextResponse.json(
      { error: "Server error while creating payment order. Please try again." },
      { status: 500 }
    );
  }
}
