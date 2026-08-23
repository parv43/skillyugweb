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

/**
 * Checks if the user has any row in slot_bookings (any row = verified payment).
 * Matches by user_id first, then falls back to email.
 */
async function getAccessDetails(userId: string, email: string | null): Promise<{ hasSlot: boolean, activeBatch?: Record<string, unknown> }> {
  const admin = createSupabaseAdmin();

  // Find the active batch first
  const { data: activeBatch, error: batchError } = await admin
    .from("batches")
    .select("*")
    .eq("is_active", true)
    .single();

  if (batchError || !activeBatch) {
    console.error("[Access] Failed to find active batch:", batchError);
    return { hasSlot: false };
  }

  // Single query using OR — avoids a second round trip
  // Scope it to the active batch ONLY.
  const query = admin
    .from("slot_bookings")
    .select("razorpay_payment_id", { count: "exact", head: true })
    .eq("batch_id", activeBatch.id)
    .or(`user_id.eq.${userId}${email ? `,email.eq.${email}` : ""}`)
    .limit(1);

  const { count, error } = await query;

  if (error) console.error("[Access] slot_bookings query error:", error);

  return { hasSlot: (count ?? 0) > 0, activeBatch };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // Not authenticated → no access
    if (!user) {
      console.error("[Access] No authenticated user found");
      return NextResponse.json({ hasAccess: false, hasSlot: false }, { status: 401 });
    }

    console.log("[Access] Checking access for user:", user.id, user.email);

    const { hasSlot, activeBatch } = await getAccessDetails(user.id, user.email ?? null);
    const hasAccess = hasSlot;

    console.log("[Access] Result — hasSlot:", hasSlot, "hasAccess:", hasAccess);

    const response = NextResponse.json({ hasAccess, hasSlot, activeBatch });
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
