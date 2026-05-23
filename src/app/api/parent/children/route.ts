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

export async function GET(request: NextRequest) {
  try {
    const parentUser = await getAuthenticatedUser(request);
    if (!parentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdmin();

    // Verify parent role
    const { data: parentProfile } = await admin
      .from("users")
      .select("role")
      .eq("id", parentUser.id)
      .maybeSingle();

    if (!parentProfile || parentProfile.role !== "parent") {
      return NextResponse.json({ error: "Unauthorized access — parents only" }, { status: 403 });
    }

    // Get linked student IDs
    const { data: relations, error: relError } = await admin
      .from("student_parent_relations")
      .select("student_id, created_at")
      .eq("parent_id", parentUser.id);

    if (relError) {
      console.error("[Parent Children API] Relations fetch error:", relError);
      return NextResponse.json({ error: relError.message }, { status: 500 });
    }

    if (!relations || relations.length === 0) {
      return NextResponse.json({ children: [] });
    }

    const studentIds = relations.map(r => r.student_id);

    // Fetch kids' profiles
    const { data: children, error: profilesError } = await admin
      .from("users")
      .select("id, email, full_name, created_at")
      .in("id", studentIds);

    if (profilesError) {
      console.error("[Parent Children API] Profiles fetch error:", profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Combine relation enrollment date with user details and fetch temp_password from auth metadata
    const mappedChildren = await Promise.all(
      children.map(async (child) => {
        const rel = relations.find(r => r.student_id === child.id);
        let tempPassword = null;
        try {
          const { data: authUser } = await admin.auth.admin.getUserById(child.id);
          if (authUser?.user) {
            tempPassword = authUser.user.user_metadata?.temp_password || null;
          }
        } catch (err) {
          console.error("[Parent Children API] Auth fetch error for student:", child.id, err);
        }
        return {
          ...child,
          temp_password: tempPassword,
          enrolledAt: rel ? rel.created_at : child.created_at
        };
      })
    );

    return NextResponse.json({ children: mappedChildren });
  } catch (error) {
    console.error("[Parent Children API] Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
