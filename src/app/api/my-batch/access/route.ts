import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getRequiredEnv } from "@/lib/razorpayServer";

export const runtime = "nodejs";

function createSupabaseAdmin() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

/**
 * Get the authenticated user — checks Authorization: Bearer header first,
 * then falls back to cookie-based auth.
 */
async function getAuthenticatedUser(request: NextRequest) {
  const admin = createSupabaseAdmin();

  // 1. Try Bearer token from Authorization header (most reliable, no cookie issues)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) {
      return data.user;
    }
  }

  // 2. Fall back to cookie-based session
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
            // No-op in route handlers.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

async function isCallerAdmin(admin: ReturnType<typeof createSupabaseAdmin>, userId: string): Promise<boolean> {
  try {
    const { data: adminRow } = await admin
      .from("admins")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    return !!adminRow;
  } catch {
    return false;
  }
}

/**
 * Checks if the user has a verified booking in slot_bookings and resolves their assigned batch.
 * Matches by user_id first, then falls back to email.
 */
async function getAccessDetails(userId: string, email: string | null): Promise<{
  hasSlot: boolean;
  isAdmin: boolean;
  activeBatch?: Record<string, unknown> | null;
  enrolledBatches?: Record<string, unknown>[];
}> {
  const admin = createSupabaseAdmin();
  const isAdmin = await isCallerAdmin(admin, userId);

  // 1. Fetch active batch as baseline (e.g. Bootcamp 3.0)
  const { data: globalActiveBatch } = await admin
    .from("batches")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  // 2. Query slot_bookings for this user
  const { data: bookings, error: bookingError } = await admin
    .from("slot_bookings")
    .select("batch_id, payment_status, created_at")
    .or(`user_id.eq.${userId}${email ? `,email.eq.${email}` : ""}`);

  if (bookingError) {
    console.error("[Access] slot_bookings query error:", bookingError);
  }

  const hasSlot = Boolean(bookings && bookings.length > 0);

  // If user is Admin, grant access immediately and provide active batch
  if (isAdmin) {
    return {
      hasSlot: true,
      isAdmin: true,
      activeBatch: globalActiveBatch,
    };
  }

  if (!hasSlot || !bookings) {
    return {
      hasSlot: false,
      isAdmin: false,
      activeBatch: globalActiveBatch,
    };
  }

  // 3. Resolve the student's assigned batch from their actual booking record
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
        batchRows.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0] ||
        batchRows[0];
    }
  }

  if (!studentBatch) {
    studentBatch = globalActiveBatch;
  }

  return {
    hasSlot: true,
    isAdmin: false,
    activeBatch: studentBatch,
    enrolledBatches,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // Not authenticated → no access
    if (!user) {
      return NextResponse.json({ hasAccess: false, hasSlot: false }, { status: 401 });
    }

    const { hasSlot, isAdmin, activeBatch, enrolledBatches } = await getAccessDetails(user.id, user.email ?? null);
    const hasAccess = hasSlot || isAdmin;

    const response = NextResponse.json({
      hasAccess,
      hasSlot,
      isAdmin,
      activeBatch,
      enrolledBatches,
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    console.error("[Access] My Batch access check failed:", error);
    return NextResponse.json(
      { error: "Unable to verify My Batch access right now." },
      { status: 500 }
    );
  }
}
