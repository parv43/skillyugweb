import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  verifyAdminBatchScope,
} from "@/lib/adminAuth";
import {
  getBatchNotification,
  saveBatchNotification,
  createAuditLogEntry,
} from "@/lib/bootcamp3Config";

export const runtime = "nodejs";

async function getAuthenticatedUser(request: NextRequest) {
  const admin = createSupabaseAdmin();

  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) return data.user;
  }

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
    // Cookie error handling
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");
    if (!batchId) {
      return NextResponse.json({ error: "Missing batchId parameter" }, { status: 400 });
    }

    const notification = await getBatchNotification(batchId);
    return NextResponse.json({ success: true, notification });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error getting notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Administrator login required." },
        { status: 401 }
      );
    }

    const adminProfile = await getAdminProfile(user.id, user.email);
    if (!adminProfile || !adminProfile.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const batchId = body.batchId || adminProfile.assignedBatchId;

    if (!verifyAdminBatchScope(adminProfile, batchId)) {
      return NextResponse.json(
        {
          error: `Cross-batch access forbidden. You are assigned to manage ${adminProfile.assignedBatchName}.`,
        },
        { status: 403 }
      );
    }

    const headline = typeof body.headline === "string" ? body.headline.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const isActive = Boolean(body.isActive);

    const prevNotification = await getBatchNotification(batchId);

    const success = await saveBatchNotification(
      batchId,
      { headline, message, isActive },
      adminProfile.email,
      adminProfile.adminName
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save notification." },
        { status: 500 }
      );
    }

    await createAuditLogEntry(batchId, {
      adminEmail: adminProfile.email,
      adminName: adminProfile.adminName,
      actionType: "UPDATE_NOTIFICATION",
      previousValue: prevNotification ? `[${prevNotification.isActive ? "ACTIVE" : "INACTIVE"}] ${prevNotification.headline}` : "None",
      updatedValue: `[${isActive ? "ACTIVE" : "INACTIVE"}] ${headline}`,
      notes: isActive ? "Published notification announcement" : "Deactivated notification announcement",
    });

    const updated = await getBatchNotification(batchId);
    return NextResponse.json({
      success: true,
      notification: updated,
      message: isActive ? "Notification published successfully." : "Notification deactivated.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving notification";
    console.error("[Notification API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
