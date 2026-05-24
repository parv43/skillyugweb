import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/book-slot";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/book-slot";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && authData?.user) {
      let role = authData.user.user_metadata?.role;
      
      try {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch user profile and check for parent relations in parallel using service role
        const [profileRes, relationRes] = await Promise.all([
          admin
            .from("users")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle(),
          admin
            .from("student_parent_relations")
            .select("id")
            .eq("parent_id", authData.user.id)
            .limit(1)
            .maybeSingle()
        ]);

        if (profileRes.data?.role) {
          role = profileRes.data.role;
        }

        // Self-healing: if they have parent-child relations, they are a parent
        if (relationRes.data) {
          role = "parent";
          if (profileRes.data && profileRes.data.role !== "parent") {
            console.log("[Auth Callback] Self-healing parent role in database for user:", authData.user.id);
            await admin
              .from("users")
              .update({ role: "parent" })
              .eq("id", authData.user.id);
          }
        }
      } catch (err) {
        console.error("DB check failed in callback:", err);
      }

      let targetNext = next;
      if (role === "parent") {
        targetNext = "/parent-portal";
      } else if (role === "student") {
        targetNext = "/my-batch";
      }

      return NextResponse.redirect(`${origin}${targetNext}`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
