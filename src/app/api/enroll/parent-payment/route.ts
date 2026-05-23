import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRequiredEnv } from "@/lib/razorpayServer";

export const runtime = "nodejs";

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
    const { kidEmail, sponsorshipToken } = body;

    const admin = createSupabaseAdmin();

    // Verify parent is registered with the role 'parent'
    const { data: parentProfile } = await admin
      .from("users")
      .select("role")
      .eq("id", parentUser.id)
      .maybeSingle();

    if (!parentProfile || parentProfile.role !== "parent") {
      // Auto-set parent role if not set yet, for convenience
      await admin.from("users").upsert({
        id: parentUser.id,
        email: parentUser.email!,
        full_name: parentUser.user_metadata?.full_name || "Parent User",
        role: "parent"
      });
    }

    // ── CASE A: RESOLVE SPONSORSHIP TOKEN ───────────────────
    if (sponsorshipToken) {
      // Find the pending enrollment
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

      const studentId = pending.student_id;

      // Fetch student email
      const { data: studentUser, error: studentError } = await admin.auth.admin.getUserById(studentId);
      if (studentError || !studentUser || !studentUser.user) {
        return NextResponse.json({ error: "Linked student user not found" }, { status: 404 });
      }
      const studentEmail = studentUser.user.email;

      // Mark sponsorship token as resolved
      await admin
        .from("pending_enrollments")
        .update({ status: "resolved" })
        .eq("token", sponsorshipToken);

      // Create student-parent relation
      await admin
        .from("student_parent_relations")
        .upsert({ parent_id: parentUser.id, student_id: studentId });

      // Fetch student details from public.users to get their full_name
      const { data: studentProfile } = await admin
        .from("users")
        .select("full_name")
        .eq("id", studentId)
        .maybeSingle();

      const studentName = studentProfile?.full_name || studentUser.user.user_metadata?.full_name || "Skillyug Student";
      const parentPhone = parentUser.phone || studentUser.user.phone || "+910000000000";

      // Create slot booking for access (amount = 399 INR, payment_status = paid)
      const mockPaymentId = `pay_mock_${crypto.randomUUID().slice(0, 12)}`;
      const mockOrderId = `order_mock_${crypto.randomUUID().slice(0, 12)}`;

      const { error: bookingError } = await admin
        .from("slot_bookings")
        .insert({
          user_id: studentId,
          email: studentEmail,
          name: studentName,
          phone: parentPhone,
          amount_paid: 399,
          currency: "INR",
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          payment_status: "captured",
          grade_class: "6-12",
        });

      if (bookingError) {
        console.error("[Parent Payment] Failed to insert slot booking:", bookingError);
        return NextResponse.json({ error: bookingError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Sponsorship enrollment successful",
        studentId: studentId,
        enrolledEmail: studentEmail
      });
    }

    // ── CASE B: DIRECT ENROLLMENT & ACCOUNT CREATION ────────
    if (!kidEmail || !kidEmail.includes("@")) {
      return NextResponse.json({ error: "Valid child email is required for enrollment" }, { status: 400 });
    }

    const targetEmail = kidEmail.trim().toLowerCase();

    // Check if user exists in auth.users
    let studentId: string;
    let generatedPassword = "";
    let isNewUser = false;

    // Search auth users using listUsers or by filtering (admin getUserById is single only, so we list users or check database)
    const { data: existingProfiles, error: selectError } = await admin
      .from("users")
      .select("id")
      .eq("email", targetEmail)
      .maybeSingle();

    if (existingProfiles) {
      studentId = existingProfiles.id;
    } else {
      // Need to create auth account
      generatedPassword = generateRandomPassword();
      isNewUser = true;

      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: targetEmail,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { full_name: "Skillyug Student" }
      });

      if (createError || !newUser.user) {
        console.error("[Parent Payment] Auth creation error:", createError);
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
        console.error("[Parent Payment] Profile insertion error:", profileError);
      }
    }

    // Link parent and child
    const { error: relationError } = await admin
      .from("student_parent_relations")
      .upsert({ parent_id: parentUser.id, student_id: studentId });

    if (relationError) {
      console.error("[Parent Payment] Relation mapping error:", relationError);
      return NextResponse.json({ error: relationError.message }, { status: 500 });
    }

    // Fetch student details from public.users to get their full_name
    const { data: studentProfile } = await admin
      .from("users")
      .select("full_name")
      .eq("id", studentId)
      .maybeSingle();

    const studentName = studentProfile?.full_name || "Skillyug Student";
    const parentPhone = parentUser.phone || "+910000000000";

    // Create slot booking for access
    const mockPaymentId = `pay_mock_${crypto.randomUUID().slice(0, 12)}`;
    const mockOrderId = `order_mock_${crypto.randomUUID().slice(0, 12)}`;

    const { error: bookingError } = await admin
      .from("slot_bookings")
      .insert({
        user_id: studentId,
        email: targetEmail,
        name: studentName,
        phone: parentPhone,
        amount_paid: 399,
        currency: "INR",
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        payment_status: "captured",
        grade_class: "6-12",
      });

    if (bookingError) {
      console.error("[Parent Payment] Failed to insert slot booking:", bookingError);
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Kid enrolled successfully",
      studentId: studentId,
      enrolledEmail: targetEmail,
      isNewUser,
      credentials: isNewUser ? { email: targetEmail, password: generatedPassword } : null
    });

  } catch (error) {
    console.error("[Parent Payment API] Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
