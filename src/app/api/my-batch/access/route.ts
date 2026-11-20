import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  getBatchSettings,
  isBatchCertificatesUnlocked,
  getBatchProgress,
  BatchProgressData,
  AdminProfile,
  BOOTCAMP_3_BATCH_ID,
} from "@/lib/adminAuth";
import {
  getBatchNotification,
  getCohortSchedule,
  getStudentConfig,
  calculateStudentFeeStatus,
  type BatchNotification,
  type CohortScheduleConfig,
} from "@/lib/bootcamp3Config";

export const runtime = "nodejs";

/**
 * Extract authenticated user via Bearer token or Supabase cookie session
 */
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

  // 2. Cookie session fallback
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

/**
 * Checks if the user has a verified booking in slot_bookings and resolves their assigned batch.
 * If user is an Admin, resolves their assigned batch scope (Bootcamp 2.0 for Parv, Bootcamp 3.0 for Arna).
 */
async function getAccessDetails(userId: string, email: string | null): Promise<{
  hasSlot: boolean;
  isAdmin: boolean;
  activeBatch?: Record<string, unknown> | null;
  enrolledBatches?: Record<string, unknown>[];
  adminProfile?: AdminProfile | null;
  certificatesUnlocked?: boolean;
  batchProgress?: BatchProgressData | null;
  recordings?: Array<{ id: string; title: string; date: string; videoId: string }>;
  liveSessionAccess?: {
    isLocked: boolean;
    meetLink?: string | null;
    remainingBalance?: number;
    totalFee?: number;
    amountPaid?: number;
    paymentDeadline?: string;
    isBlocked?: boolean;
    lockReason?: string;
  };
  notification?: BatchNotification | null;
  cohortSchedule?: CohortScheduleConfig | null;
}> {
  const admin = createSupabaseAdmin();

  // 1. Query admin profile, global active batch, and slot_bookings concurrently
  const [adminProfile, globalBatchRes, bookingsRes] = await Promise.all([
    getAdminProfile(userId, email),
    admin.from("batches").select("*").eq("is_active", true).maybeSingle(),
    admin
      .from("slot_bookings")
      .select("batch_id, payment_status, created_at, name, email, amount_paid, promo_code")
      .or(`user_id.eq.${userId}${email ? `,email.eq.${email}` : ""}`),
  ]);

  const globalActiveBatch = globalBatchRes.data || null;
  const bookings = bookingsRes.data || [];
  const hasSlot = bookings.length > 0;

  // ── Admin Flow ──
  if (adminProfile && adminProfile.isAdmin) {
    let targetBatch = globalActiveBatch;
    if (globalActiveBatch && globalActiveBatch.id === adminProfile.assignedBatchId) {
      targetBatch = globalActiveBatch;
    } else {
      const { data: adminBatch } = await admin
        .from("batches")
        .select("*")
        .eq("id", adminProfile.assignedBatchId)
        .maybeSingle();
      if (adminBatch) targetBatch = adminBatch;
    }

    const targetBatchId = targetBatch?.id || adminProfile.assignedBatchId;

    // Concurrently fetch batch settings, recordings, notification, and schedule
    const [batchSettings, recordingsRes, batchNotification, cohortSchedule] = await Promise.all([
      getBatchSettings(targetBatchId),
      admin
        .from("session_recordings")
        .select("id, title, custom_date, youtube_video_id, published_at")
        .eq("batch_id", targetBatchId)
        .order("published_at", { ascending: false }),
      getBatchNotification(targetBatchId),
      getCohortSchedule(targetBatchId),
    ]);

    const recordings = (recordingsRes.data || []).map((r) => ({
      id: r.id,
      title: r.title || "Class Recording",
      date: r.custom_date || (r.published_at ? new Date(r.published_at).toISOString().split("T")[0] : ""),
      videoId: r.youtube_video_id || "",
    }));

    return {
      hasSlot: true,
      isAdmin: true,
      activeBatch: targetBatch,
      adminProfile,
      certificatesUnlocked: batchSettings.certificatesUnlocked,
      batchProgress: batchSettings.batchProgress,
      recordings,
      liveSessionAccess: {
        isLocked: false,
        meetLink: (targetBatch?.meet_link as string) || null,
        remainingBalance: 0,
      },
      notification: batchNotification,
      cohortSchedule,
    };
  }

  // ── Unenrolled Student Flow ──
  if (!hasSlot) {
    const batchSettings = globalActiveBatch ? await getBatchSettings(globalActiveBatch.id) : null;
    const batchNotification = globalActiveBatch ? await getBatchNotification(globalActiveBatch.id) : null;
    const cohortSchedule = globalActiveBatch ? await getCohortSchedule(globalActiveBatch.id) : null;
    return {
      hasSlot: false,
      isAdmin: false,
      activeBatch: globalActiveBatch,
      certificatesUnlocked: false,
      batchProgress: batchSettings ? batchSettings.batchProgress : null,
      recordings: [],
      liveSessionAccess: {
        isLocked: true,
        meetLink: null,
        lockReason: "Please enroll in the bootcamp to access live classes.",
      },
      notification: batchNotification,
      cohortSchedule,
    };
  }

  // ── Enrolled Student Flow ──
  const batchIds = Array.from(
    new Set(bookings.map((b) => b.batch_id).filter((id): id is string => Boolean(id)))
  );

  let studentBatch: Record<string, unknown> | null = null;
  let enrolledBatches: Record<string, unknown>[] = [];

  if (batchIds.length > 0) {
    // If user's only enrolled batch is already globalActiveBatch, avoid extra DB query
    if (batchIds.length === 1 && globalActiveBatch && globalActiveBatch.id === batchIds[0]) {
      studentBatch = globalActiveBatch;
      enrolledBatches = [globalActiveBatch];
    } else {
      const { data: batchRows } = await admin
        .from("batches")
        .select("*")
        .in("id", batchIds);

      if (batchRows && batchRows.length > 0) {
        enrolledBatches = batchRows;
        studentBatch =
          batchRows.find((b) => b.is_active) ||
          batchRows.sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          )[0] ||
          batchRows[0];
      }
    }
  }

  const targetBatch = studentBatch || globalActiveBatch;
  const targetBatchId = targetBatch?.id;

  if (targetBatchId) {
    const isBootcamp3 =
      targetBatchId === BOOTCAMP_3_BATCH_ID ||
      (targetBatch?.name as string)?.includes("3.0") ||
      (targetBatch?.label as string)?.includes("3.0");

    const [batchSettings, recordingsRes, batchNotification, cohortSchedule, studentConfig] = await Promise.all([
      getBatchSettings(targetBatchId),
      admin
        .from("session_recordings")
        .select("id, title, custom_date, youtube_video_id, published_at")
        .eq("batch_id", targetBatchId)
        .order("published_at", { ascending: false }),
      getBatchNotification(targetBatchId),
      getCohortSchedule(targetBatchId),
      isBootcamp3 ? getStudentConfig(targetBatchId, email || "") : Promise.resolve(null),
    ]);

    const recordings = (recordingsRes.data || []).map((r) => ({
      id: r.id,
      title: r.title || "Class Recording",
      date: r.custom_date || (r.published_at ? new Date(r.published_at).toISOString().split("T")[0] : ""),
      videoId: r.youtube_video_id || "",
    }));

    let liveSessionAccess: {
      isLocked: boolean;
      meetLink?: string | null;
      remainingBalance?: number;
      totalFee?: number;
      amountPaid?: number;
      paymentDeadline?: string;
      isBlocked?: boolean;
      lockReason?: string;
    } = {
      isLocked: false,
      meetLink: (targetBatch?.meet_link as string) || null,
      remainingBalance: 0,
    };

    let sanitizedActiveBatch = targetBatch;

    if (isBootcamp3) {
      // Resolve user's booking row for fee status calculation
      const userBooking = bookings.find((b) => b.batch_id === targetBatchId) || bookings[0] || {};
      const feeStatus = calculateStudentFeeStatus(userBooking, studentConfig);

      if (feeStatus.isLocked) {
        // CRITICAL SECURITY ENFORCEMENT:
        // Meeting URL is completely stripped from activeBatch and liveSessionAccess
        sanitizedActiveBatch = {
          ...targetBatch,
          meet_link: null,
        };

        liveSessionAccess = {
          isLocked: true,
          meetLink: null,
          remainingBalance: feeStatus.remainingBalanceRupees,
          totalFee: feeStatus.totalFeeRupees,
          amountPaid: feeStatus.amountPaidRupees,
          paymentDeadline: feeStatus.paymentDeadline,
          isBlocked: feeStatus.isBlocked,
          lockReason: feeStatus.lockReason || "Please pay your remaining course fee to access the live class link.",
        };
      } else {
        liveSessionAccess = {
          isLocked: false,
          meetLink: (targetBatch?.meet_link as string) || null,
          remainingBalance: 0,
          totalFee: feeStatus.totalFeeRupees,
          amountPaid: feeStatus.amountPaidRupees,
        };
      }
    }

    return {
      hasSlot: true,
      isAdmin: false,
      activeBatch: sanitizedActiveBatch,
      enrolledBatches,
      certificatesUnlocked: batchSettings.certificatesUnlocked,
      batchProgress: batchSettings.batchProgress,
      recordings,
      liveSessionAccess,
      notification: batchNotification,
      cohortSchedule,
    };
  }

  return {
    hasSlot: true,
    isAdmin: false,
    activeBatch: null,
    enrolledBatches,
    certificatesUnlocked: false,
    batchProgress: null,
    recordings: [],
    liveSessionAccess: {
      isLocked: true,
      meetLink: null,
    },
    notification: null,
    cohortSchedule: null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // Not authenticated → no access
    if (!user) {
      return NextResponse.json({ hasAccess: false, hasSlot: false }, { status: 401 });
    }

    const details = await getAccessDetails(user.id, user.email ?? null);
    const hasAccess = details.hasSlot || details.isAdmin;

    const response = NextResponse.json({
      hasAccess,
      hasSlot: details.hasSlot,
      isAdmin: details.isAdmin,
      activeBatch: details.activeBatch,
      enrolledBatches: details.enrolledBatches,
      adminProfile: details.adminProfile,
      certificatesUnlocked: details.certificatesUnlocked,
      batchProgress: details.batchProgress,
      recordings: details.recordings || [],
      liveSessionAccess: details.liveSessionAccess,
      notification: details.notification,
      cohortSchedule: details.cohortSchedule,
    });

    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error verifying batch access.";
    console.error("[MyBatch Access Error]", err);
    return NextResponse.json({ hasAccess: false, error: message }, { status: 500 });
  }
}
