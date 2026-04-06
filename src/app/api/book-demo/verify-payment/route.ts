import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { persistDemoBooking } from "@/lib/bookingPersistence";
import {
  ensureCapturedRazorpayPayment,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  getRequiredEnv,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpayServer";

export const runtime = "nodejs";

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
      return NextResponse.json({ error: "You must be logged in to confirm payment." }, { status: 401 });
    }

    const cookieStore = await cookies();
    const expectedOrderId = cookieStore.get(DEMO_ORDER_COOKIE)?.value;
    if (!expectedOrderId) {
      return NextResponse.json(
        { error: "Payment session expired. Please start the payment again." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const studentName = typeof body.studentName === "string" ? body.studentName.trim() : null;
    const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : null;
    const razorpayOrderId =
      typeof body.razorpay_order_id === "string" ? body.razorpay_order_id.trim() : "";
    const razorpayPaymentId =
      typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : "";
    const razorpaySignature =
      typeof body.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json({ error: "Payment verification payload is incomplete." }, { status: 400 });
    }

    if (razorpayOrderId !== expectedOrderId) {
      return NextResponse.json(
        { error: "Order mismatch detected. Please restart the payment." },
        { status: 400 }
      );
    }

    if (!verifyRazorpayPaymentSignature(expectedOrderId, razorpayPaymentId, razorpaySignature)) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const payment = await fetchRazorpayPayment(razorpayPaymentId);
    const capturedPayment = await ensureCapturedRazorpayPayment(payment);
    const order = await fetchRazorpayOrder(expectedOrderId);

    if (capturedPayment.order_id !== expectedOrderId || capturedPayment.amount !== order.amount || capturedPayment.currency !== order.currency) {
      return NextResponse.json(
        { error: "Payment amount or order details do not match the booking request." },
        { status: 400 }
      );
    }

    try {
      await persistDemoBooking({
        expectedBookingType: "demo_booking",
        fallbackDetails: {
          email: user.email ?? null,
          phoneNumber,
          studentName,
          userId: user.id,
        },
        order,
        payment: capturedPayment,
      });
    } catch (insertError) {
      console.error("Failed to save demo booking after payment:", insertError);
      return NextResponse.json(
        {
          error:
            "Payment succeeded, but the demo booking could not be saved. Contact support with your payment ID.",
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(DEMO_ORDER_COOKIE, "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Missing required environment variable")
    ) {
      console.error("Book demo payment verification configuration error:", error);
      return NextResponse.json(
        { error: "Payment verification is temporarily unavailable. Please contact support." },
        { status: 500 }
      );
    }

    console.error("Book demo payment verification failed:", error);
    return NextResponse.json(
      { error: "Server error while verifying payment. Please contact support if money was debited." },
      { status: 500 }
    );
  }
}
