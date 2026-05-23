import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Authenticated access only
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serverTime = Date.now();

    // Query the next upcoming active cohort session
    const { data: session, error } = await supabase
      .from("cohort_sessions")
      .select("id, title, scheduled_at, join_url")
      .eq("is_active", true)
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("[LiveSession API] Database query warning (likely table not created yet):", error.message);
      
      // Fallback state: matches user's targeted default cohort launch time
      return NextResponse.json({
        serverTime,
        session: {
          id: "default-id",
          title: "Class 1: Introduction to AI Creators",
          scheduled_at: "2026-05-28T13:00:00+05:30",
          join_url: "https://zoom.us/j/your-meeting-id-here"
        }
      });
    }

    return NextResponse.json({
      serverTime,
      session: session || null
    });
  } catch (error: any) {
    console.error("[LiveSession API] Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
