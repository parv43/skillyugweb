import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  verifyAdminBatchScope,
} from "@/lib/adminAuth";
import { createAuditLogEntry } from "@/lib/bootcamp3Config";

export const runtime = "nodejs";

async function getAuthenticatedUser(request: NextRequest) {
  const admin = createSupabaseAdmin();

  // 1. Try Bearer token
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) return data.user;
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
    // Cookie error handling
  }

  return null;
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

    const rawMeetLink = typeof body.meetLink === "string" ? body.meetLink.trim() : "";

    // Validate URL if not empty
    if (rawMeetLink) {
      try {
        const parsed = new URL(rawMeetLink);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return NextResponse.json(
            { error: "Invalid meeting link. URL must start with http:// or https://" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid meeting link URL format." },
          { status: 400 }
        );
      }
    }

    const meetLink = rawMeetLink || null;
    const adminClient = createSupabaseAdmin();

    // Fetch previous link for audit logging
    const { data: previousBatch } = await adminClient
      .from("batches")
      .select("meet_link, name")
      .eq("id", batchId)
      .maybeSingle();

    const previousLink = previousBatch?.meet_link || "None";

    const { error: updateError } = await adminClient
      .from("batches")
      .update({ meet_link: meetLink })
      .eq("id", batchId);

    if (updateError) {
      console.error("[Meet Link API] Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update meeting link in database." },
        { status: 500 }
      );
    }

    // Record audit log
    await createAuditLogEntry(batchId, {
      adminEmail: adminProfile.email,
      adminName: adminProfile.adminName,
      actionType: "UPDATE_MEET_LINK",
      previousValue: previousLink,
      updatedValue: meetLink || "Cleared",
      notes: meetLink ? `Updated class meeting link for ${previousBatch?.name || batchId}` : `Cleared class meeting link for ${previousBatch?.name || batchId}`,
    });

    return NextResponse.json({
      success: true,
      meetLink,
      message: meetLink
        ? "Class meeting link published successfully."
        : "Class meeting link cleared.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating meeting link";
    console.error("[Meet Link API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
