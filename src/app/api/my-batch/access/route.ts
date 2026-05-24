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

  // 1. Try matching by user_id first (fastest, indexed)
  const { data: userIdMatch, error: userIdError } = await admin
    .from("slot_bookings")
    .select("razorpay_payment_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (userIdError) {
    console.error("[Access] slot_bookings user_id query error:", userIdError);
  }

  if (userIdMatch) {
    return { hasSlot: true };
  }

  // 2. Fallback to case-insensitive email check
  if (email) {
    const { data: emailMatch, error: emailError } = await admin
      .from("slot_bookings")
      .select("razorpay_payment_id")
      .ilike("email", email.trim())
      .limit(1)
      .maybeSingle();

    if (emailError) {
      console.error("[Access] slot_bookings email query error:", emailError);
    }

    if (emailMatch) {
      // Self-healing: associate the user_id with this slot booking for future fast checks
      console.log("[Access] Healing slot_bookings: linking user_id to email", email);
      await admin
        .from("slot_bookings")
        .update({ user_id: userId })
        .ilike("email", email.trim());

      return { hasSlot: true };
    }
  }

  return { hasSlot: false };
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
    
    // Fetch user profile, parent relations, and access details in parallel to reduce API response latency
    const [profileRes, relationRes, accessRes] = await Promise.all([
      admin
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle(),
      admin
        .from("student_parent_relations")
        .select("id")
        .eq("parent_id", user.id)
        .limit(1)
        .maybeSingle(),
      getAccessDetails(user.id, user.email ?? null)
    ]);

    let role = profileRes.data?.role || user.user_metadata?.role || "student"; // Default to student
    const hasSlot = accessRes.hasSlot;

    // Self-healing: if the user exists as a parent in student_parent_relations, their role is "parent"
    if (relationRes.data) {
      role = "parent";
    }
    
    // Allow access ONLY if the user has slot (payment verified) OR is admin OR the tester email.
    const hasAccess = hasSlot || role === "admin" || user.email === "eternallytanuj@gmail.com";

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
