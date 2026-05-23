import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRequiredEnv } from "@/lib/razorpayServer";

export const runtime = "nodejs";

function createSupabaseAdmin() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

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

  // 2. Cookie fallback
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
            // Safe to ignore in Route Handlers
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdmin();

    // Verify user role is 'student'
    const { data: userRow, error: roleError } = await admin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (roleError || !userRow || userRow.role !== "student") {
      return NextResponse.json({ error: "Only students can generate sponsorship links" }, { status: 403 });
    }

    // Check if there is already an active pending token for this student
    const { data: existingToken, error: tokenError } = await admin
      .from("pending_enrollments")
      .select("token")
      .eq("student_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingToken) {
      return NextResponse.json({ token: existingToken.token });
    }

    // Create a new token
    const tokenUuid = crypto.randomUUID();
    const { data: newToken, error: insertError } = await admin
      .from("pending_enrollments")
      .insert({
        student_id: user.id,
        token: tokenUuid,
        status: "pending"
      })
      .select("token")
      .single();

    if (insertError) {
      console.error("[Sponsor API] Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ token: newToken.token });
  } catch (error) {
    console.error("[Sponsor API] Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
