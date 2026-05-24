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
async function getAccessDetails(userId: string, email: string | null): Promise<{ hasSlot: boolean }> {
  const admin = createSupabaseAdmin();

  // Single query using OR — avoids a second round trip
  const query = admin
    .from("slot_bookings")
    .select("razorpay_payment_id", { count: "exact", head: true })
    .or(`user_id.eq.${userId}${email ? `,email.eq.${email}` : ""}`)
    .limit(1);

  const { count, error } = await query;

  if (error) console.error("[Access] slot_bookings query error:", error);

  return { hasSlot: (count ?? 0) > 0 };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // Not authenticated → no access
    if (!user) {
      console.error("[Access] No authenticated user found");
      return NextResponse.json({ hasAccess: false, hasSlot: false, role: null }, { status: 401 });
    }

    console.log("[Access] Checking access for user:", user.id, user.email);

    const admin = createSupabaseAdmin();
    
    // Fetch user profile and access details in parallel to reduce API response latency
    const [profileRes, accessRes] = await Promise.all([
      admin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle(),
      getAccessDetails(user.id, user.email ?? null)
    ]);

    const role = profileRes.data?.role || user.user_metadata?.role || "student"; // Default to student
    const hasSlot = accessRes.hasSlot;
    
    // Students can access dashboard even if not paid (in locked mode)
    // Admins have full access. Parents can access their child's batch via query params.
    const hasAccess = hasSlot || role === "student" || role === "admin";

    console.log("[Access] Result — role:", role, "hasSlot:", hasSlot, "hasAccess:", hasAccess);

    const response = NextResponse.json({ hasAccess, hasSlot, role });
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
