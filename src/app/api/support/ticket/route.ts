import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const runtime = "nodejs";

function getRequiredEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing environment variable: ${name}`);
  return val;
}

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

  // 1. Try Bearer token from Authorization header
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
            // No-op in route handlers
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

    const body = await request.json();
    const { subject, message } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const admin = createSupabaseAdmin();
    const email = user.email || "Unknown Email";
    const name = user.user_metadata?.full_name || "Skillyug Student";

    // Rate Limit Check: max 3 tickets per day per email
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count, error: countError } = await admin
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("role", "Support Ticket")
      .eq("phone", email)
      .gte("created_at", today.toISOString());

    if (countError) {
      console.error("[Ticket] Count error:", countError);
      return NextResponse.json({ error: "Failed to verify ticket limits." }, { status: 500 });
    }

    if (count !== null && count >= 3) {
      return NextResponse.json({ error: "You can only submit 3 support tickets per day." }, { status: 429 });
    }

    const formattedMessage = `Subject: ${subject || "No Subject"}\n\n${message}`;

    // Insert the ticket
    const { error: insertError } = await admin
      .from("contact_messages")
      .insert({
        name: name,
        phone: email, // use phone column to store email for querying limits
        role: "Support Ticket", // use role column to identify support tickets
        message: formattedMessage,
      });

    if (insertError) {
      console.error("[Ticket] Insert error:", insertError);
      return NextResponse.json({ error: "Failed to submit ticket." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Ticket] Server error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
