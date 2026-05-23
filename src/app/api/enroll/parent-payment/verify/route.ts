import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  ensureCapturedRazorpayPayment,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  getRequiredEnv,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpayServer";

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

// Generate random secure password for direct kid enrollment
function generateRandomPassword(length = 12) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const parentUser = await getAuthenticatedUser(request);
    if (!parentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const razorpayOrderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id.trim() : "";
    const razorpayPaymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id.trim() : "";
    const razorpaySignature = typeof body.razorpay_signature === "string" ? body.razorpay_signature.trim() : "";

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Payment verification payload is incomplete." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const expectedOrderId = cookieStore.get(PARENT_ORDER_COOKIE)?.value;
    if (!expectedOrderId) {
      return NextResponse.json(
        { error: "Payment session expired. Please start the payment again." },
        { status: 400 }
      );
    }

    if (razorpayOrderId !== expectedOrderId) {
      return NextResponse.json(
        { error: "Order mismatch detected. Please restart the payment." },
        { status: 400 }
      );
    }

    // 1. Verify Payment Signature
    if (!verifyRazorpayPaymentSignature(expectedOrderId, razorpayPaymentId, razorpaySignature)) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    // 2. Fetch and verify payment capturing
    const payment = await fetchRazorpayPayment(razorpayPaymentId);
    const capturedPayment = await ensureCapturedRazorpayPayment(payment);
    const order = await fetchRazorpayOrder(expectedOrderId);

    // Validate amounts (₹399.00 = 39900 paise)
    const expectedAmount = 39900;
    if (
      capturedPayment.order_id !== expectedOrderId ||
      capturedPayment.amount !== order.amount ||
      capturedPayment.currency !== order.currency ||
      order.amount !== expectedAmount ||
      capturedPayment.amount !== expectedAmount
    ) {
      return NextResponse.json(
        { error: "Payment amount or order details do not match the expected co-pay." },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdmin();

    // 3. Replay Protection: Check if booking is already recorded
    const { data: existingBooking } = await admin
      .from("slot_bookings")
      .select("id")
      .eq("razorpay_payment_id", razorpayPaymentId)
      .maybeSingle();

    if (existingBooking) {
      const response = NextResponse.json({
        success: true,
        message: "Payment already verified and processed"
      });
      // Clear cookie
      response.cookies.set(PARENT_ORDER_COOKIE, "", {
        expires: new Date(0),
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    // 4. Extract and check Order Notes
    const notes = order.notes as Record<string, string> || {};
    const bookingType = notes.booking_type;

    if (bookingType !== "parent_sponsorship" && bookingType !== "parent_direct") {
      return NextResponse.json({ error: "Invalid booking type found in order." }, { status: 400 });
    }

    let studentId: string;
    let targetEmail: string;
    let generatedPassword = "";
    let isNewUser = false;

    // ── CASE A: SPONSORSHIP RESOLUTION ───────────────────────
    if (bookingType === "parent_sponsorship") {
      const sponsorshipToken = notes.sponsorship_token;
      if (!sponsorshipToken) {
        return NextResponse.json({ error: "Sponsorship token missing from payment metadata." }, { status: 400 });
      }

      // Fetch pending enrollment
      const { data: pending, error: pendingError } = await admin
        .from("pending_enrollments")
        .select("student_id, status")
        .eq("token", sponsorshipToken)
        .maybeSingle();

      if (pendingError || !pending) {
        return NextResponse.json({ error: "Sponsorship token not found or invalid" }, { status: 404 });
      }

      if (pending.status !== "pending") {
        return NextResponse.json({ error: "Sponsorship token has already been resolved" }, { status: 400 });
      }

      studentId = pending.student_id;

      // Fetch student email
      const { data: studentUser, error: studentError } = await admin.auth.admin.getUserById(studentId);
      if (studentError || !studentUser || !studentUser.user) {
        return NextResponse.json({ error: "Linked student user not found" }, { status: 404 });
      }
      targetEmail = studentUser.user.email!;

      // Mark sponsorship token as resolved
      await admin
        .from("pending_enrollments")
        .update({ status: "resolved" })
        .eq("token", sponsorshipToken);
    } 
    // ── CASE B: DIRECT ENROLLMENT & ACCOUNT CREATION ────────
    else {
      const kidEmail = notes.kid_email;
      if (!kidEmail || !kidEmail.includes("@")) {
        return NextResponse.json({ error: "Child email missing or invalid in payment metadata." }, { status: 400 });
      }

      targetEmail = kidEmail.trim().toLowerCase();

      // Check if user exists in public.users
      const { data: existingProfiles } = await admin
        .from("users")
        .select("id")
        .eq("email", targetEmail)
        .maybeSingle();

      if (existingProfiles) {
        studentId = existingProfiles.id;
      } else {
        // Create new auth account
        generatedPassword = generateRandomPassword();
        isNewUser = true;

        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email: targetEmail,
          password: generatedPassword,
          email_confirm: true,
          user_metadata: { 
            full_name: "Skillyug Student",
            temp_password: generatedPassword
          }
        });

        if (createError || !newUser.user) {
          console.error("[Parent Payment Verify] Auth creation error:", createError);
          return NextResponse.json({ error: createError?.message || "Failed to create student account" }, { status: 500 });
        }

        studentId = newUser.user.id;

        // Insert role into public.users
        const { error: profileError } = await admin
          .from("users")
          .insert({
            id: studentId,
            email: targetEmail,
            full_name: "Skillyug Student",
            role: "student"
          });

        if (profileError) {
          console.error("[Parent Payment Verify] Profile insertion error:", profileError);
        }
      }
    }

    // Link parent and child
    const { error: relationError } = await admin
      .from("student_parent_relations")
      .upsert({ parent_id: parentUser.id, student_id: studentId });

    if (relationError) {
      console.error("[Parent Payment Verify] Relation mapping error:", relationError);
      return NextResponse.json({ error: "Failed to map student-parent relation" }, { status: 500 });
    }

    // Fetch student details from public.users to get their full_name
    const { data: studentProfile } = await admin
      .from("users")
      .select("full_name")
      .eq("id", studentId)
      .maybeSingle();

    const studentName = studentProfile?.full_name || "Skillyug Student";
    const parentPhone = parentUser.phone || "+910000000000";

    // Insert slot booking (using actual payment details)
    const { error: bookingError } = await admin
      .from("slot_bookings")
      .insert({
        user_id: studentId,
        email: targetEmail,
        name: studentName,
        phone: parentPhone,
        amount_paid: capturedPayment.amount / 100, // 399
        currency: capturedPayment.currency,
        razorpay_order_id: expectedOrderId,
        razorpay_payment_id: razorpayPaymentId,
        payment_status: capturedPayment.status,
        grade_class: "6-12",
      });

    if (bookingError) {
      console.error("[Parent Payment Verify] Failed to insert slot booking:", bookingError);
      return NextResponse.json({ error: "Payment verified but slot booking creation failed. Please contact support." }, { status: 500 });
    }

    const response = NextResponse.json({
      success: true,
      message: bookingType === "parent_sponsorship" ? "Sponsorship resolved successfully" : "Kid enrolled successfully",
      studentId: studentId,
      enrolledEmail: targetEmail,
      isNewUser,
      credentials: isNewUser ? { email: targetEmail, password: generatedPassword } : null
    });

    // Clear the payment session order ID cookie on successful fulfillment
    response.cookies.set(PARENT_ORDER_COOKIE, "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;

  } catch (error) {
    console.error("[Parent Payment Verify API] Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
