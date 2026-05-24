import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { checkUserPayment } from "@/lib/paymentCheck";

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
      const { hasPaid, resolvedRole } = await checkUserPayment(
        authData.user.id,
        authData.user.email ?? null,
        authData.user.user_metadata?.full_name || authData.user.user_metadata?.name
      );

      let targetNext = "/parent-portal";
      
      // If user has paid and is student/admin, direct them to my-batch
      if (hasPaid && (resolvedRole === "student" || resolvedRole === "admin")) {
        targetNext = "/my-batch";
      }

      // Preserve query params for parent redirection if present in the next URL (like kidEmail or token)
      if (resolvedRole === "parent") {
        try {
          const nextUrl = new URL(next, origin);
          const parentUrl = new URL("/parent-portal", origin);
          nextUrl.searchParams.forEach((val, key) => {
            parentUrl.searchParams.set(key, val);
          });
          targetNext = parentUrl.pathname + parentUrl.search;
        } catch {
          // Fallback to default /parent-portal
        }
      }

      return NextResponse.redirect(`${origin}${targetNext}`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
