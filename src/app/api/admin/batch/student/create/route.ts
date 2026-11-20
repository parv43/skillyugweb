import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  verifyAdminBatchScope,
  BOOTCAMP_3_BATCH_ID,
} from "@/lib/adminAuth";
import {
  saveStudentConfig,
  getStudentConfig,
  calculateStudentFeeStatus,
  createAuditLogEntry,
  normalizeEmail,
} from "@/lib/bootcamp3Config";

export const runtime = "nodejs";

async function getAuthenticatedUser(request: NextRequest) {
  const admin = createSupabaseAdmin();

  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) return data.user;
  }

  try {
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );
    const { data, error } = await supabaseClient.auth.getUser();
    if (!error && data.user) return data.user;
  } catch {
    // Cookie error handling
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator login required." },
        { status: 401 }
      );
    }

    const adminProfile = await getAdminProfile(user.id, user.email);
    if (!adminProfile || !adminProfile.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const batchId = body.batchId || adminProfile.assignedBatchId || BOOTCAMP_3_BATCH_ID;

    // Strict batch isolation: manual creation is strictly scoped to Bootcamp 3.0
    if (batchId !== BOOTCAMP_3_BATCH_ID) {
      return NextResponse.json(
        { error: "Manual student creation is restricted exclusively to Bootcamp 3.0." },
        { status: 403 }
      );
    }

    if (!verifyAdminBatchScope(adminProfile, batchId)) {
      return NextResponse.json(
        { error: `Cross-batch access forbidden. You are assigned to manage ${adminProfile.assignedBatchName}.` },
        { status: 403 }
      );
    }

    // Mandatory fields validation: Name, Email, Password
    const studentName = typeof body.name === "string" ? body.name.trim() : "";
    const studentEmail = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (!studentName || studentName.length < 2) {
      return NextResponse.json(
        { error: "Student Full Name is required (minimum 2 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!studentEmail || !emailRegex.test(studentEmail)) {
      return NextResponse.json(
        { error: "A valid student email address is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Initial Password is required (minimum 6 characters)." },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdmin();

    // Prevent duplicate enrollment in Bootcamp 3.0
    const { data: existingBooking } = await adminClient
      .from("slot_bookings")
      .select("razorpay_payment_id, name, email")
      .eq("batch_id", batchId)
      .eq("email", studentEmail)
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json(
        { error: `A student with email ${studentEmail} is already enrolled in Bootcamp 3.0 (${existingBooking.name}).` },
        { status: 400 }
      );
    }

    // Create genuine Supabase Auth user
    let authUserId: string | null = null;
    const { data: authCreateData, error: authCreateError } =
      await adminClient.auth.admin.createUser({
        email: studentEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: studentName,
          name: studentName,
        },
      });

    if (authCreateError) {
      // Check if user already exists in Supabase Auth
      if (
        authCreateError.message.toLowerCase().includes("already registered") ||
        authCreateError.message.toLowerCase().includes("unique constraint") ||
        authCreateError.status === 422
      ) {
        // Find existing Auth user ID
        const { data: userList } = await adminClient.auth.admin.listUsers({
          perPage: 1000,
        });
        const matched = userList.users.find(
          (u) => u.email?.toLowerCase() === studentEmail
        );

        if (matched) {
          authUserId = matched.id;
          // Synchronize password and metadata for this student
          await adminClient.auth.admin.updateUserById(matched.id, {
            password,
            email_confirm: true,
            user_metadata: {
              full_name: studentName,
              name: studentName,
            },
          });
        } else {
          return NextResponse.json(
            { error: `Account conflict: ${authCreateError.message}` },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Failed to create student authentication account: ${authCreateError.message}` },
          { status: 400 }
        );
      }
    } else {
      authUserId = authCreateData.user.id;
    }

    // Optional fields handling
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const gradeClass = typeof body.gradeClass === "string" ? body.gradeClass.trim() : "";
    const fatherName = typeof body.fatherName === "string" ? body.fatherName.trim() : "";
    const motherName = typeof body.motherName === "string" ? body.motherName.trim() : "";

    const totalFeeRupees =
      typeof body.totalFeeRupees === "number" && !isNaN(body.totalFeeRupees)
        ? Math.max(0, Math.round(body.totalFeeRupees))
        : 8500;

    const amountPaidRupees =
      typeof body.amountPaidRupees === "number" && !isNaN(body.amountPaidRupees)
        ? Math.max(0, Math.round(body.amountPaidRupees))
        : totalFeeRupees;

    const daysAllowed =
      typeof body.daysAllowed === "number" && !isNaN(body.daysAllowed)
        ? Math.max(1, Math.round(body.daysAllowed))
        : 14;

    const enrollmentDate = new Date().toISOString();
    const paymentDeadline =
      body.paymentDeadline ||
      new Date(Date.now() + daysAllowed * 24 * 60 * 60 * 1000).toISOString();

    const isBlocked = Boolean(body.isBlocked);
    const blockReason = typeof body.blockReason === "string" ? body.blockReason.trim() : undefined;

    // Generate unique manual identifiers satisfying slot_bookings requirements
    const randSuffix = Math.random().toString(36).substring(2, 9);
    const manualPaymentId = `pay_manual_${Date.now()}_${randSuffix}`;
    const manualOrderId = `order_manual_${Date.now()}_${randSuffix}`;

    const bookingRow = {
      user_id: authUserId,
      name: studentName,
      email: studentEmail,
      phone,
      grade_class: gradeClass,
      amount_paid: amountPaidRupees * 100, // paise
      currency: "INR",
      razorpay_order_id: manualOrderId,
      razorpay_payment_id: manualPaymentId,
      payment_status: amountPaidRupees > 0 ? "captured" : "manual",
      promo_code: body.promoCode ? body.promoCode.trim().toUpperCase() : "MANUAL_ENROLL",
      batch_id: batchId,
      created_at: enrollmentDate,
    };

    const { error: insertBookingErr } = await adminClient
      .from("slot_bookings")
      .insert([bookingRow]);

    if (insertBookingErr) {
      console.error("[Create Student] DB Insert Error:", insertBookingErr);
      return NextResponse.json(
        { error: `Failed to register student booking in database: ${insertBookingErr.message}` },
        { status: 500 }
      );
    }

    // Persist student configuration and fee details
    await saveStudentConfig(
      batchId,
      studentEmail,
      {
        studentName,
        fatherName: fatherName || undefined,
        motherName: motherName || undefined,
        totalFeeRupees,
        amountPaidRupees,
        remainingBalanceRupees: Math.max(0, totalFeeRupees - amountPaidRupees),
        daysAllowed,
        paymentDeadline,
        isBlocked,
        blockReason,
      },
      adminProfile.email,
      adminProfile.adminName
    );

    // Record in audit log
    await createAuditLogEntry(batchId, {
      adminEmail: adminProfile.email,
      adminName: adminProfile.adminName,
      actionType: "CREATE_STUDENT",
      studentEmail,
      studentName,
      previousValue: "None (New Student)",
      updatedValue: `Enrolled: ${studentName} (${studentEmail}). Fee: ₹${totalFeeRupees}, Paid: ₹${amountPaidRupees}, Balance: ₹${Math.max(0, totalFeeRupees - amountPaidRupees)}`,
      notes: `Admin manually created student account and enrolled in Bootcamp 3.0.`,
    });

    const refreshedConfig = await getStudentConfig(batchId, studentEmail);
    const feeStatus = calculateStudentFeeStatus(bookingRow, refreshedConfig);

    return NextResponse.json({
      success: true,
      message: `Student "${studentName}" has been successfully added to Bootcamp 3.0.`,
      student: {
        ...bookingRow,
        certificate: { downloaded: false },
        feeStatus,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating student";
    console.error("[Create Student API Error]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
