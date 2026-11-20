import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  verifyAdminBatchScope,
} from "@/lib/adminAuth";
import {
  getStudentConfig,
  saveStudentConfig,
  calculateStudentFeeStatus,
  createAuditLogEntry,
  normalizeEmail,
  verifyAdminReauthentication,
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
    const batchId = body.batchId || adminProfile.assignedBatchId;

    if (!verifyAdminBatchScope(adminProfile, batchId)) {
      return NextResponse.json(
        {
          error: `Cross-batch access forbidden. You are assigned to manage ${adminProfile.assignedBatchName}.`,
        },
        { status: 403 }
      );
    }

    const studentEmail = normalizeEmail(body.email);
    if (!studentEmail) {
      return NextResponse.json(
        { error: "Student email is required." },
        { status: 400 }
      );
    }

    const actionType = body.actionType as
      | "UPDATE_FEE"
      | "BLOCK"
      | "UNBLOCK"
      | "UPDATE_PARENTS"
      | "UPDATE_ALL"
      | "RESET_PASSWORD";

    const adminClient = createSupabaseAdmin();

    // Fetch existing booking for this student
    const { data: booking } = await adminClient
      .from("slot_bookings")
      .select("*")
      .eq("batch_id", batchId)
      .eq("email", studentEmail)
      .maybeSingle();

    if (!booking) {
      return NextResponse.json(
        { error: "Student booking not found for this batch." },
        { status: 404 }
      );
    }

    const existingConfig = await getStudentConfig(batchId, studentEmail);
    const currentStatus = calculateStudentFeeStatus(booking, existingConfig);

    // ── Dedicated Subroutine: Reset Password ──
    if (actionType === "RESET_PASSWORD") {
      const reauth = await verifyAdminReauthentication({
        adminProfile,
        adminPassword: body.adminPassword,
      });

      if (!reauth.success) {
        return NextResponse.json(
          { error: reauth.error || "Admin re-authentication failed." },
          { status: 403 }
        );
      }

      const newPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: "New temporary password must be at least 6 characters." },
          { status: 400 }
        );
      }

      let authUserId = booking.user_id;
      if (!authUserId) {
        const { data: userList } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
        const matched = userList.users.find((u) => u.email?.toLowerCase() === studentEmail);
        if (matched) authUserId = matched.id;
      }

      if (!authUserId) {
        return NextResponse.json(
          { error: "Could not locate Supabase Auth user record for this student." },
          { status: 404 }
        );
      }

      const { error: resetErr } = await adminClient.auth.admin.updateUserById(authUserId, {
        password: newPassword,
        email_confirm: true,
      });

      if (resetErr) {
        return NextResponse.json(
          { error: `Failed to reset student password: ${resetErr.message}` },
          { status: 500 }
        );
      }

      await createAuditLogEntry(batchId, {
        adminEmail: adminProfile.email,
        adminName: adminProfile.adminName,
        actionType: "RESET_PASSWORD",
        studentEmail,
        studentName: booking.name || "",
        previousValue: "Encrypted Credential",
        updatedValue: "New Temporary Password Assigned",
        notes: `Administrator reset temporary password for ${booking.name || studentEmail}.`,
      });

      return NextResponse.json({
        success: true,
        message: `Password has been reset successfully for student "${booking.name || studentEmail}".`,
      });
    }

    // ── Sensitive Actions Re-Authentication Check ──
    const isSensitive =
      actionType === "BLOCK" ||
      actionType === "UNBLOCK" ||
      actionType === "UPDATE_FEE" ||
      (actionType === "UPDATE_ALL" &&
        (typeof body.totalFeeRupees === "number" ||
          typeof body.amountPaidRupees === "number" ||
          typeof body.isBlocked === "boolean"));

    if (isSensitive) {
      const reauth = await verifyAdminReauthentication({
        adminProfile,
        adminPassword: body.adminPassword,
      });

      if (!reauth.success) {
        return NextResponse.json(
          { error: reauth.error || "Admin re-authentication is required to authorize this sensitive action." },
          { status: 403 }
        );
      }
    }

    let auditAction:
      | "UPDATE_STUDENT_FEE"
      | "BLOCK_STUDENT"
      | "UNBLOCK_STUDENT"
      | "UPDATE_PARENT_NAMES"
      | "UPDATE_STUDENT_PROFILE" = "UPDATE_STUDENT_FEE";

    let prevVal = "";
    let newVal = "";
    let notes = "";

    const updates: Parameters<typeof saveStudentConfig>[2] = {
      studentName: booking.name || "",
    };

    // Update profile attributes in slot_bookings if provided
    const bookingUpdates: Record<string, unknown> = {};
    if (typeof body.studentName === "string" && body.studentName.trim()) {
      const trimmedName = body.studentName.trim();
      bookingUpdates.name = trimmedName;
      updates.studentName = trimmedName;
    }
    if (typeof body.phone === "string") {
      bookingUpdates.phone = body.phone.trim();
    }
    if (typeof body.gradeClass === "string") {
      bookingUpdates.grade_class = body.gradeClass.trim();
    }

    if (actionType === "BLOCK") {
      auditAction = "BLOCK_STUDENT";
      const blockReason = typeof body.blockReason === "string" ? body.blockReason.trim() : "Restricted by administrator";
      updates.isBlocked = true;
      updates.blockReason = blockReason;
      prevVal = currentStatus.isBlocked ? "Blocked" : "Active / Unblocked";
      newVal = `Blocked (Reason: ${blockReason})`;
      notes = `Student ${booking.name} was blocked from class-link access by ${adminProfile.adminName}.`;
    } else if (actionType === "UNBLOCK") {
      auditAction = "UNBLOCK_STUDENT";
      updates.isBlocked = false;
      updates.blockReason = undefined;
      prevVal = currentStatus.isBlocked ? `Blocked (${currentStatus.blockReason || "Restricted"})` : "Active";
      newVal = "Unblocked / Active";
      notes = `Student ${booking.name} was unblocked by ${adminProfile.adminName}.`;
    } else if (actionType === "UPDATE_PARENTS") {
      auditAction = "UPDATE_PARENT_NAMES";
      const fatherName = typeof body.fatherName === "string" ? body.fatherName.trim() : "";
      const motherName = typeof body.motherName === "string" ? body.motherName.trim() : "";
      updates.fatherName = fatherName;
      updates.motherName = motherName;
      prevVal = `Father: ${currentStatus.fatherName || "None"}, Mother: ${currentStatus.motherName || "None"}`;
      newVal = `Father: ${fatherName}, Mother: ${motherName}`;
      notes = `Updated parent names for student ${booking.name}.`;
    } else {
      // UPDATE_FEE or UPDATE_ALL
      auditAction = isSensitive ? "UPDATE_STUDENT_FEE" : "UPDATE_STUDENT_PROFILE";
      if (typeof body.totalFeeRupees === "number") {
        updates.totalFeeRupees = Math.max(0, Math.round(body.totalFeeRupees));
      }
      if (typeof body.amountPaidRupees === "number") {
        updates.amountPaidRupees = Math.max(0, Math.round(body.amountPaidRupees));
      }
      if (typeof body.daysAllowed === "number") {
        updates.daysAllowed = Math.max(1, Math.round(body.daysAllowed));
      }
      if (typeof body.paymentDeadline === "string" && body.paymentDeadline) {
        updates.paymentDeadline = body.paymentDeadline;
      }
      if (typeof body.fatherName === "string") {
        updates.fatherName = body.fatherName.trim();
      }
      if (typeof body.motherName === "string") {
        updates.motherName = body.motherName.trim();
      }
      if (typeof body.isBlocked === "boolean") {
        updates.isBlocked = body.isBlocked;
      }
      if (typeof body.blockReason === "string") {
        updates.blockReason = body.blockReason.trim();
      }

      const newTotal = updates.totalFeeRupees ?? currentStatus.totalFeeRupees;
      const newPaid = updates.amountPaidRupees ?? currentStatus.amountPaidRupees;
      const newBal = Math.max(0, newTotal - newPaid);
      updates.remainingBalanceRupees = newBal;

      prevVal = `Total: ₹${currentStatus.totalFeeRupees}, Paid: ₹${currentStatus.amountPaidRupees}, Balance: ₹${currentStatus.remainingBalanceRupees}, Deadline: ${currentStatus.paymentDeadline?.split("T")[0]}`;
      newVal = `Total: ₹${newTotal}, Paid: ₹${newPaid}, Balance: ₹${newBal}, Deadline: ${(updates.paymentDeadline || currentStatus.paymentDeadline)?.split("T")[0]}`;
      notes = `Admin ${adminProfile.adminName} updated profile/fee parameters for ${bookingUpdates.name || booking.name}.`;
    }

    // Save slot_bookings updates if any
    if (Object.keys(bookingUpdates).length > 0) {
      const { error: bookingUpdateErr } = await adminClient
        .from("slot_bookings")
        .update(bookingUpdates)
        .eq("batch_id", batchId)
        .eq("email", studentEmail);

      if (bookingUpdateErr) {
        console.error("[Student API] Error updating slot_bookings:", bookingUpdateErr);
      }

      // Sync Supabase Auth metadata if name changed
      if (booking.user_id && bookingUpdates.name) {
        try {
          await adminClient.auth.admin.updateUserById(booking.user_id, {
            user_metadata: {
              full_name: bookingUpdates.name,
              name: bookingUpdates.name,
            },
          });
        } catch (metaErr) {
          console.warn("[Student API] Could not sync user metadata:", metaErr);
        }
      }
    }

    const saved = await saveStudentConfig(
      batchId,
      studentEmail,
      updates,
      adminProfile.email,
      adminProfile.adminName
    );

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to save student configuration to database." },
        { status: 500 }
      );
    }

    // Record audit log entry
    await createAuditLogEntry(batchId, {
      adminEmail: adminProfile.email,
      adminName: adminProfile.adminName,
      actionType: auditAction,
      studentEmail,
      studentName: (bookingUpdates.name as string) || booking.name || "",
      previousValue: prevVal,
      updatedValue: newVal,
      notes,
    });

    // Re-fetch booking and config for response
    const { data: updatedBooking } = await adminClient
      .from("slot_bookings")
      .select("*")
      .eq("batch_id", batchId)
      .eq("email", studentEmail)
      .maybeSingle();

    const refreshedConfig = await getStudentConfig(batchId, studentEmail);
    const updatedStatus = calculateStudentFeeStatus(updatedBooking || booking, refreshedConfig);

    return NextResponse.json({
      success: true,
      student: {
        ...(updatedBooking || booking),
        feeStatus: updatedStatus,
      },
      studentStatus: updatedStatus,
      message: "Student configuration updated successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error managing student status";
    console.error("[Student Admin API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
