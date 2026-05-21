import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/razorpayServer";

export const runtime = "nodejs";

function createSupabaseAdmin() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

// Check if the calling user is an authorized admin
async function isCallerAdmin(request: NextRequest): Promise<boolean> {
  try {
    const admin = createSupabaseAdmin();
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return false;
    }
    
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    
    if (authError || !user) {
      return false;
    }

    // Query the public.admins table to see if the user is registered as an admin
    const { data: adminRow, error: adminError } = await admin
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminRow) {
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Sync API] Error checking admin status:", err);
    return false;
  }
}

// Convert ISO timestamp to a premium display format, e.g., "20th May, 2026"
function formatCustomDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Unknown Date";

    const day = date.getDate();
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";

    return `${day}${suffix} ${month}, ${year}`;
  } catch {
    return "Unknown Date";
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authorize - only admins can sync
    const isAdmin = await isCallerAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin permissions required." },
        { status: 403 }
      );
    }

    // 2. Load API credentials
    const apiKey = process.env.YOUTUBE_API_KEY;
    const playlistId = process.env.YOUTUBE_PLAYLIST_ID;

    if (!apiKey || !playlistId) {
      return NextResponse.json(
        { error: "YouTube API config not configured on server." },
        { status: 500 }
      );
    }

    // 3. Fetch from YouTube API
    const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(
      playlistId
    )}&maxResults=50&key=${apiKey}`;

    // Extract the host and protocol to construct a valid Referer.
    // This is required because server-side fetches don't automatically send a Referer,
    // which causes Google API Key restrictions to return 403 Forbidden (<empty> referer).
    const host = request.headers.get("host") || "skillyugedu.com";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const referer = `${protocol}://${host}/`;

    const ytRes = await fetch(ytUrl, {
      headers: {
        "Referer": referer,
      }
    });

    if (!ytRes.ok) {
      const errorText = await ytRes.text();
      console.error("[Sync API] YouTube API error:", errorText);
      return NextResponse.json(
        { error: `YouTube API returned status ${ytRes.status}` },
        { status: 502 }
      );
    }

    const ytData = await ytRes.json();
    const items = ytData.items || [];

    if (items.length === 0) {
      return NextResponse.json({ message: "No videos found in YouTube playlist.", count: 0 });
    }

    // 4. Map YouTube data to database structure
    const recordings = items.map((item: any) => {
      const snippet = item.snippet || {};
      const videoId = snippet.resourceId?.videoId || "";
      const title = snippet.title || "Untitled Video";
      const publishedAt = snippet.publishedAt || new Date().toISOString();

      return {
        youtube_video_id: videoId,
        title: title,
        published_at: publishedAt,
        custom_date: formatCustomDate(publishedAt)
      };
    }).filter((rec: any) => rec.youtube_video_id !== ""); // omit items without a videoId

    if (recordings.length === 0) {
      return NextResponse.json({ message: "No valid video IDs found in playlist items.", count: 0 });
    }

    // 5. Upsert to Supabase using Admin client to bypass read-only policies
    const admin = createSupabaseAdmin();
    const { error: upsertError } = await admin
      .from("session_recordings")
      .upsert(recordings, { onConflict: "youtube_video_id" });

    if (upsertError) {
      console.error("[Sync API] Supabase upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to write recordings to database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Sync completed successfully.",
      count: recordings.length,
      recordings
    });
  } catch (error: any) {
    console.error("[Sync API] Sync failed with unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during sync." },
      { status: 500 }
    );
  }
}
