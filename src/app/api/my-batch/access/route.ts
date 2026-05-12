import { NextResponse } from "next/server";
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

async function getAuthenticatedUser() {
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
 * Returns whether the user has captured payments for slot bookings.
 * Matches by user_id first, then falls back to email.
 */
async function getAccessDetails(userId: string, email: string | null): Promise<{ hasSlot: boolean }> {
  const admin = createSupabaseAdmin();

  const hasSlot = await (async () => {
    // Check by user_id — any payment that isn't failed and has amount > 0
    const { data: byId } = await admin
      .from("slot_bookings")
      .select("id")
      .neq("payment_status", "failed")
      .gt("amount_paid", 0)
      .eq("user_id", userId)
      .limit(1);
    if ((byId?.length ?? 0) > 0) return true;

    // Fallback: check by email (covers bookings made before login)
    if (!email) return false;
    const { data: byEmail } = await admin
      .from("slot_bookings")
      .select("id")
      .neq("payment_status", "failed")
      .gt("amount_paid", 0)
      .eq("email", email)
      .limit(1);
    return (byEmail?.length ?? 0) > 0;
  })();

  return { hasSlot };
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    // Not logged in → no access
    if (!user) {
      return NextResponse.json({ hasAccess: false, hasSlot: false }, { status: 401 });
    }

    // Logged in but hasn't paid → no access
    const { hasSlot } = await getAccessDetails(user.id, user.email ?? null);
    const hasAccess = hasSlot;

    const response = NextResponse.json({ hasAccess, hasSlot });
    // Cache privately for 2 min, revalidate in background (avoids hitting DB on every page nav)
    response.headers.set("Cache-Control", "private, max-age=120, stale-while-revalidate=60");
    return response;
  } catch (error) {
    console.error("My Batch access check failed:", error);
    return NextResponse.json(
      { error: "Unable to verify My Batch access right now." },
      { status: 500 }
    );
  }
}
