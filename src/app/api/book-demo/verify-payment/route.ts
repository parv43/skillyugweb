import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";

const DEMO_AMOUNT_PAISE = 4900;
const DEMO_CURRENCY = "INR";
const DEMO_ORDER_COOKIE = "demo_booking_order_id";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getRazorpayAuthHeader() {
  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

function signaturesMatch(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

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
    const studentName = typeof body.studentName === "string" ? body.studentName.trim() : "";
    const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
    const razorpayOrderId =
      typeof body.razorpay_order_id === "string" ? body.razorpay_order_id.trim() : "";
    const razorpayPaymentId =
      typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : "";
    const razorpaySignature =
      typeof body.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";

    if (
      !studentName ||
      !/^\d{10}$/.test(phoneNumber) ||
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

    const expectedSignature = crypto
      .createHmac("sha256", getRequiredEnv("RAZORPAY_KEY_SECRET"))
      .update(`${expectedOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (!signaturesMatch(expectedSignature, razorpaySignature)) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`,
      {
        headers: {
          Authorization: getRazorpayAuthHeader(),
        },
        cache: "no-store",
      }
    );

    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) {
      return NextResponse.json(
        { error: payment?.error?.description || "Unable to fetch payment details from Razorpay." },
        { status: 502 }
      );
    }

    if (
      payment.order_id !== expectedOrderId ||
      payment.amount !== DEMO_AMOUNT_PAISE ||
      payment.currency !== DEMO_CURRENCY
    ) {
      return NextResponse.json(
        { error: "Payment amount or order details do not match the booking request." },
        { status: 400 }
      );
    }

    if (!["authorized", "captured"].includes(payment.status)) {
      return NextResponse.json(
        { error: `Unexpected payment status: ${payment.status}` },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { error: insertError } = await supabaseAdmin.from("demo_bookings").upsert(
        {
          amount_paid: payment.amount,
          currency: payment.currency,
          email: user.email ?? null,
          name: studentName,
          payment_status: payment.status,
          phone: phoneNumber,
          razorpay_order_id: expectedOrderId,
          razorpay_payment_id: razorpayPaymentId,
          user_id: user.id,
      },
      {
        onConflict: "razorpay_payment_id",
      }
    );

    if (insertError) {
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
    console.error("Book demo payment verification failed:", error);
    return NextResponse.json(
      { error: "Server error while verifying payment. Please contact support if money was debited." },
      { status: 500 }
    );
  }
}
