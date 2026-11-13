import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  isBatchCertificatesUnlocked,
  getBatchProgress,
  BatchProgressData,
  AdminProfile,
} from "@/lib/adminAuth";

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
}> {
  const admin = createSupabaseAdmin();

  // 1. Check if user is an authorized admin
  const adminProfile = await getAdminProfile(userId, email);

  // 2. Fetch global active batch as baseline fallback
  const { data: globalActiveBatch } = await admin
    .from("batches")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  // 3. Query slot_bookings for this user
  const { data: bookings, error: bookingError } = await admin
    .from("slot_bookings")
    .select("batch_id, payment_status, created_at")
    .or(`user_id.eq.${userId}${email ? `,email.eq.${email}` : ""}`);

  if (bookingError) {
    console.error("[Access] slot_bookings query error:", bookingError);
  }

  const hasSlot = Boolean(bookings && bookings.length > 0);

  // If user is Admin, resolve their batch-specific admin scope
  if (adminProfile && adminProfile.isAdmin) {
    const { data: adminBatch } = await admin
      .from("batches")
      .select("*")
      .eq("id", adminProfile.assignedBatchId)
      .maybeSingle();

    const targetBatch = adminBatch || globalActiveBatch;
    const certUnlocked = targetBatch ? await isBatchCertificatesUnlocked(targetBatch.id) : false;
    const progress = targetBatch ? await getBatchProgress(targetBatch.id) : null;

    return {
      hasSlot: true,
      isAdmin: true,
      activeBatch: targetBatch,
      adminProfile,
      certificatesUnlocked: certUnlocked,
      batchProgress: progress,
    };
  }

  if (!hasSlot || !bookings) {
    const progress = globalActiveBatch ? await getBatchProgress(globalActiveBatch.id) : null;
    return {
      hasSlot: false,
      isAdmin: false,
      activeBatch: globalActiveBatch,
      certificatesUnlocked: false,
      batchProgress: progress,
    };
  }

  // 4. Resolve the student's assigned batch from their actual booking record
  const batchIds = Array.from(
    new Set(bookings.map((b) => b.batch_id).filter((id): id is string => Boolean(id)))
  );

  let studentBatch: Record<string, unknown> | null = null;
  let enrolledBatches: Record<string, unknown>[] = [];

  if (batchIds.length > 0) {
    const { data: batchRows } = await admin
      .from("batches")
      .select("*")
      .in("id", batchIds);

    if (batchRows && batchRows.length > 0) {
      enrolledBatches = batchRows;
      // Prefer active batch if enrolled in multiple, otherwise latest enrolled batch
      studentBatch =
        batchRows.find((b) => b.is_active) ||
        batchRows.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0] ||
        batchRows[0];
    }
  }

  const targetBatch = studentBatch || globalActiveBatch;
  const certUnlocked = targetBatch ? await isBatchCertificatesUnlocked(targetBatch.id) : false;
  const progress = targetBatch ? await getBatchProgress(targetBatch.id) : null;

  return {
    hasSlot: true,
    isAdmin: false,
    activeBatch: targetBatch,
    enrolledBatches,
    certificatesUnlocked: certUnlocked,
    batchProgress: progress,
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
    });

    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error verifying batch access.";
    console.error("[MyBatch Access Error]", err);
    return NextResponse.json({ hasAccess: false, error: message }, { status: 500 });
  }
}
