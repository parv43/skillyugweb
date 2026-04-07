import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRequiredEnv, getRazorpayAuthHeader } from "@/lib/razorpayServer";

export const runtime = "nodejs";

const DEMO_AMOUNT_PAISE = 4900;
const DEMO_CURRENCY = "INR";
const DEMO_ORDER_COOKIE = "demo_booking_order_id";

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
            // No-op in route handlers.
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
      return NextResponse.json({ error: "You must be logged in to book a demo." }, { status: 401 });
    }

    const body = await request.json();
    const studentName = typeof body.studentName === "string" ? body.studentName.trim() : "";
    const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";

    if (!studentName || !/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Student name and a valid 10-digit phone number are required." },
        { status: 400 }
      );
    }

    const receipt = `demo_${Date.now()}`.slice(0, 40);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: getRazorpayAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: DEMO_AMOUNT_PAISE,
        currency: DEMO_CURRENCY,
        receipt,
        notes: {
          booking_type: "demo_booking",
          email: user.email ?? "",
          phone_number: phoneNumber,
          student_name: studentName,
          user_id: user.id,
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

    response.cookies.set(DEMO_ORDER_COOKIE, razorpayOrder.id, {
      httpOnly: true,
      maxAge: 60 * 15,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Book demo order creation failed:", error);
    return NextResponse.json(
      { error: "Server error while creating payment order. Please try again." },
      { status: 500 }
    );
  }
}
