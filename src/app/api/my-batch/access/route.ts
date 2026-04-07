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
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // No-op in route handlers.
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

async function tableHasCapturedPayment(
  table: "demo_bookings" | "slot_bookings",
  userId: string,
  email: string | null
) {
  const supabaseAdmin = createSupabaseAdmin();

  const userIdMatch = await supabaseAdmin
    .from(table)
    .select("razorpay_payment_id")
    .eq("payment_status", "captured")
    .eq("user_id", userId)
    .limit(1);

  if (userIdMatch.error) {
    throw userIdMatch.error;
  }

  if ((userIdMatch.data?.length ?? 0) > 0) {
    return true;
  }

  if (!email) {
    return false;
  }

  const emailMatch = await supabaseAdmin
    .from(table)
    .select("razorpay_payment_id")
    .eq("payment_status", "captured")
    .eq("email", email)
    .limit(1);

  if (emailMatch.error) {
    throw emailMatch.error;
  }

  return (emailMatch.data?.length ?? 0) > 0;
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ hasAccess: false }, { status: 401 });
    }

    const [hasDemoAccess, hasSlotAccess] = await Promise.all([
      tableHasCapturedPayment("demo_bookings", user.id, user.email ?? null),
      tableHasCapturedPayment("slot_bookings", user.id, user.email ?? null),
    ]);

    return NextResponse.json({ hasAccess: hasDemoAccess || hasSlotAccess });
  } catch (error) {
    console.error("My Batch access check failed:", error);
    return NextResponse.json(
      { error: "Unable to verify My Batch access right now." },
      { status: 500 }
    );
  }
}
