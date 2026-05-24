import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRequiredEnv, getRazorpayAuthHeader } from "@/lib/razorpayServer";

export const runtime = "nodejs";

const PARENT_ORDER_COOKIE = "parent_payment_order_id";

function createSupabaseAdmin() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

async function getAuthenticatedUser(request: NextRequest) {
  const admin = createSupabaseAdmin();

  // 1. Try Bearer token
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) {
      return data.user;
    }
  }

  // 2. Cookie fallback
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore in Route Handlers
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function POST(request: NextRequest) {
  try {
    const parentUser = await getAuthenticatedUser(request);
    if (!parentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { kidEmail, kidName, kidGrade, kidPassword, sponsorshipToken } = body;

    const admin = createSupabaseAdmin();

    // Verify or auto-set parent is registered with the role 'parent'
    const { data: parentProfile } = await admin
      .from("users")
      .select("role")
      .eq("id", parentUser.id)
      .maybeSingle();

    if (!parentProfile || parentProfile.role !== "parent") {
      await admin.from("users").upsert({
        id: parentUser.id,
        email: parentUser.email!,
        full_name: parentUser.user_metadata?.full_name || "Parent User",
        role: "parent"
      });
    }

    const notes: Record<string, string> = {
      parent_id: parentUser.id,
      parent_email: parentUser.email ?? "",
    };

    // ── CASE A: VALIDATE SPONSORSHIP TOKEN ───────────────────
    if (sponsorshipToken) {
      const { data: pending, error: pendingError } = await admin
        .from("pending_enrollments")
        .select("student_id, status")
        .eq("token", sponsorshipToken)
        .maybeSingle();

      if (pendingError || !pending) {
        return NextResponse.json({ error: "Sponsorship token not found or invalid" }, { status: 404 });
      }

      if (pending.status !== "pending") {
        return NextResponse.json({ error: "Sponsorship token has already been resolved or expired" }, { status: 400 });
      }

      notes.booking_type = "parent_sponsorship";
      notes.sponsorship_token = sponsorshipToken;
    } 
    // ── CASE B: VALIDATE DIRECT ENROLLMENT ───────────────────
    else {
      if (!kidEmail || !kidEmail.includes("@")) {
        return NextResponse.json({ error: "Valid child email is required for enrollment" }, { status: 400 });
      }
      notes.booking_type = "parent_direct";
      notes.kid_email = kidEmail.trim().toLowerCase();
      notes.kid_name = kidName ? kidName.trim() : "Skillyug Student";
      notes.kid_grade = kidGrade ? kidGrade.trim() : "6";
      notes.kid_password = kidPassword ? kidPassword.trim() : "";
    }

    // Create Razorpay order (₹399.00 = 39900 paise)
    const amount = 39900; 
    const currency = "INR";
    const receipt = `parent_${Date.now()}`.slice(0, 40);

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: getRazorpayAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes,
      }),
      cache: "no-store",
    });

    const razorpayOrder = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      console.error("[Parent Payment Order Creation] Razorpay error:", razorpayOrder);
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
      customerEmail: parentUser.email ?? "",
      keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
      orderId: razorpayOrder.id,
    });

    // Set secure cookie to prevent session/order hijacking
    response.cookies.set(PARENT_ORDER_COOKIE, razorpayOrder.id, {
      httpOnly: true,
      maxAge: 60 * 15,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;

  } catch (error) {
    console.error("[Parent Payment API] Failed to create Razorpay order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
