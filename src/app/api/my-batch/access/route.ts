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

  const hasSlot = await (async () => {
    // Check by user_id
    const { data: byId, error: err1 } = await admin
      .from("slot_bookings")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (err1) console.error("[Access] slot_bookings user_id query error:", err1);
    if ((byId?.length ?? 0) > 0) return true;

    // Fallback: match by email
    if (!email) return false;
    const { data: byEmail, error: err2 } = await admin
      .from("slot_bookings")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (err2) console.error("[Access] slot_bookings email query error:", err2);
    return (byEmail?.length ?? 0) > 0;
  })();

  return { hasSlot };
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

    const { hasSlot } = await getAccessDetails(user.id, user.email ?? null);
    const hasAccess = hasSlot;

    console.log("[Access] Result — hasSlot:", hasSlot, "hasAccess:", hasAccess);

    const response = NextResponse.json({ hasAccess, hasSlot });
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
