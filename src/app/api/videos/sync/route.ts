import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  verifyAdminBatchScope,
  BOOTCAMP_2_BATCH_ID,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

interface YouTubePlaylistItem {
  snippet?: {
    title?: string;
    publishedAt?: string;
    resourceId?: {
      videoId?: string;
    };
  };
}

interface Recording {
  youtube_video_id: string;
  title: string;
  published_at: string;
  custom_date: string;
  batch_id: string;
}

// Convert ISO timestamp to a premium display format, e.g., "20th May, 2026"
function formatCustomDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Unknown Date";

    const day = date.getDate();
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

  // 2. Cookie session fallback
  try {
    const cookieStore = await cookies();
    const supabaseClient = createServerClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );
    const { data, error } = await supabaseClient.auth.getUser();
    if (!error && data.user) return data.user;
  } catch {
    // Ignore cookie error in route handler
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate caller
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in as an administrator." },
        { status: 401 }
      );
    }

    // 2. Resolve admin profile & permitted batch
    const adminProfile = await getAdminProfile(user.id, user.email);
    if (!adminProfile || !adminProfile.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Admin permissions required." },
        { status: 403 }
      );
    }

    // 3. Optional batch_id from query/body - verify admin scope
    const { searchParams } = new URL(request.url);
    let requestedBatchId = searchParams.get("batch_id")?.trim() || null;
    if (!requestedBatchId) {
      try {
        const body = await request.clone().json();
        if (body?.batch_id) requestedBatchId = String(body.batch_id).trim();
      } catch {
        // Body is optional
      }
    }

    const targetBatchId = requestedBatchId || adminProfile.assignedBatchId;

    if (!verifyAdminBatchScope(adminProfile, targetBatchId)) {
      return NextResponse.json(
        {
          error: `Forbidden. You are assigned to manage ${adminProfile.assignedBatchName} and cannot modify another batch.`,
        },
        { status: 403 }
      );
    }

    // 4. Retrieve target batch details
    const admin = createSupabaseAdmin();
    const { data: targetBatch, error: batchError } = await admin
      .from("batches")
      .select("id, name, label, youtube_playlist_id")
      .eq("id", targetBatchId)
      .maybeSingle();

    if (batchError || !targetBatch) {
      return NextResponse.json(
        { error: `Target batch not found for id: ${targetBatchId}` },
        { status: 404 }
      );
    }

    // For Bootcamp 2.0, fallback to process.env.YOUTUBE_PLAYLIST_ID if playlist_id is not set
    let playlistId = targetBatch.youtube_playlist_id;
    if (!playlistId && targetBatchId === BOOTCAMP_2_BATCH_ID) {
      playlistId = process.env.YOUTUBE_PLAYLIST_ID || "PLRT09IaUP4Zw";
    }

    if (!playlistId) {
      return NextResponse.json({
        message: `${targetBatch.name} does not have a YouTube playlist configured yet.`,
        count: 0,
        batchName: targetBatch.name,
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API Key not configured on server." },
        { status: 500 }
      );
    }

    // 5. Fetch from YouTube API
    const ytUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(
      playlistId
    )}&maxResults=50&key=${apiKey}`;

    const host = request.headers.get("host") || "skillyugedu.com";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const referer = `${protocol}://${host}/`;

    const ytRes = await fetch(ytUrl, {
      headers: {
        Referer: referer,
      },
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
      return NextResponse.json({
        message: "No videos found in YouTube playlist.",
        count: 0,
        batchName: targetBatch.name,
      });
    }

    // 6. Map YouTube data to database structure strictly for targetBatchId
    const recordings: Recording[] = (items as YouTubePlaylistItem[])
      .map((item) => {
        const snippet = item.snippet || {};
        const videoId = snippet.resourceId?.videoId || "";
        const title = snippet.title || "Untitled Video";
        const publishedAt = snippet.publishedAt || new Date().toISOString();

        return {
          youtube_video_id: videoId,
          title: title,
          published_at: publishedAt,
          custom_date: formatCustomDate(publishedAt),
          batch_id: targetBatchId,
        };
      })
      .filter((rec) => {
        const titleLower = rec.title.toLowerCase();
        return (
          rec.youtube_video_id !== "" &&
          titleLower !== "deleted video" &&
          titleLower !== "private video"
        );
      });

    // 7. Upsert active recordings and clean up deleted records strictly scoped to targetBatchId
    if (recordings.length > 0) {
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

      // Delete any database recordings that are no longer in the active playlist
      // IMPORTANT: Scope delete ONLY to the target batch!
      const activeIds = recordings.map((r) => r.youtube_video_id);
      const { error: deleteError } = await admin
        .from("session_recordings")
        .delete()
        .eq("batch_id", targetBatchId)
        .not("youtube_video_id", "in", `(${activeIds.join(",")})`);

      if (deleteError) {
        console.error("[Sync API] Supabase delete inactive error:", deleteError);
      }
    } else {
      // Clear target batch only
      const { error: deleteError } = await admin
        .from("session_recordings")
        .delete()
        .eq("batch_id", targetBatchId);

      if (deleteError) {
        console.error("[Sync API] Supabase clear table error:", deleteError);
      }
    }

    return NextResponse.json({
      message: `Sync completed successfully for ${targetBatch.name}.`,
      count: recordings.length,
      batchId: targetBatchId,
      batchName: targetBatch.name,
      admin: adminProfile.adminName,
      recordings,
    });
  } catch (error) {
    console.error("[Sync API] Sync failed with unexpected error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred during sync.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
