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
 * Get authenticated user via Bearer token or cookies
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

/**
 * Check if the caller is an authorized admin
 */
async function isCallerAdmin(admin: ReturnType<typeof createSupabaseAdmin>, userId: string): Promise<boolean> {
  try {
    const { data: adminRow, error } = await admin
      .from("admins")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    return !error && !!adminRow;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to view class recordings." },
        { status: 401 }
      );
    }

    const admin = createSupabaseAdmin();
    const isAdmin = await isCallerAdmin(admin, user.id);

    const { searchParams } = new URL(request.url);
    const requestedBatchId = searchParams.get("batch_id")?.trim() || null;

    let targetBatchId: string | null = null;

    if (isAdmin) {
      // Admins can query any requested batch, or default to the active batch
      if (requestedBatchId) {
        targetBatchId = requestedBatchId;
      } else {
        const { data: activeBatch } = await admin
          .from("batches")
          .select("id")
          .eq("is_active", true)
          .maybeSingle();
        targetBatchId = activeBatch?.id || null;
      }
    } else {
      // ── STRICT STUDENT AUTHORIZATION ──
      // Verify that this student actually has a valid booking in slot_bookings
      const { data: bookings, error: bookingError } = await admin
        .from("slot_bookings")
        .select("batch_id")
        .or(`user_id.eq.${user.id}${user.email ? `,email.eq.${user.email}` : ""}`);

      if (bookingError) {
        console.error("[Videos API] Error checking student bookings:", bookingError);
        return NextResponse.json(
          { error: "Unable to verify batch authorization." },
          { status: 500 }
        );
      }

      if (!bookings || bookings.length === 0) {
        return NextResponse.json(
          { error: "Forbidden. You are not enrolled in any bootcamp batch." },
          { status: 403 }
        );
      }

      const enrolledBatchIds = Array.from(
        new Set(bookings.map((b) => b.batch_id).filter((id): id is string => Boolean(id)))
      );

      if (enrolledBatchIds.length === 0) {
        return NextResponse.json(
          { error: "Forbidden. No verified batch assignment found for your enrollment." },
          { status: 403 }
        );
      }

      // If client requests a specific batch_id, verify that the student is actually enrolled in it!
      if (requestedBatchId) {
        if (!enrolledBatchIds.includes(requestedBatchId)) {
          return NextResponse.json(
            { error: "Forbidden. You do not have permission to access recordings from this batch." },
            { status: 403 }
          );
        }
        targetBatchId = requestedBatchId;
      } else {
        // Default to student's enrolled batch (first enrolled batch)
        targetBatchId = enrolledBatchIds[0];
      }
    }

    if (!targetBatchId) {
      return NextResponse.json({ recordings: [], count: 0, batchId: null });
    }

    // Query session_recordings strictly for the target batch
    // Notice: We strictly filter by batch_id and exclude any null or unassigned recordings
    const { data: recordings, error: recError } = await admin
      .from("session_recordings")
      .select("id, title, custom_date, youtube_video_id, published_at, batch_id")
      .eq("batch_id", targetBatchId)
      .not("batch_id", "is", null)
      .order("published_at", { ascending: false });

    if (recError) {
      console.error("[Videos API] Error querying session_recordings:", recError);
      return NextResponse.json(
        { error: "Failed to load session recordings." },
        { status: 500 }
      );
    }

    // Clean and map recordings, discarding any private/deleted entries
    const mappedRecordings = (recordings || [])
      .filter((rec: any) => {
        const titleLower = (rec.title || "").toLowerCase();
        return (
          rec.youtube_video_id &&
          rec.batch_id === targetBatchId &&
          titleLower !== "deleted video" &&
          titleLower !== "private video"
        );
      })
      .map((rec: any, idx: number) => ({
        id: rec.id || `rec-${idx}`,
        title: rec.title,
        date: rec.custom_date || "Unknown Date",
        videoId: rec.youtube_video_id,
        batchId: rec.batch_id,
      }));

    const response = NextResponse.json({
      recordings: mappedRecordings,
      count: mappedRecordings.length,
      batchId: targetBatchId,
      isAdmin,
    });

    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error loading recordings.";
    console.error("[Videos API] Unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

