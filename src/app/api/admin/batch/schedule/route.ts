import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  verifyAdminBatchScope,
  BOOTCAMP_3_BATCH_ID,
} from "@/lib/adminAuth";
import {
  getCohortSchedule,
  saveCohortSchedule,
  createAuditLogEntry,
  calculateWeekday,
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
    const batchId = searchParams.get("batchId") || BOOTCAMP_3_BATCH_ID;

    const schedule = await getCohortSchedule(batchId);
    return NextResponse.json({ schedule });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching cohort schedule";
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
    const batchId = body.batchId || adminProfile.assignedBatchId || BOOTCAMP_3_BATCH_ID;

    // Strict isolation: only Bootcamp 3.0 schedule can be modified through this endpoint
    if (batchId !== BOOTCAMP_3_BATCH_ID) {
      return NextResponse.json(
        { error: "Cohort schedule customization is restricted exclusively to Bootcamp 3.0." },
        { status: 403 }
      );
    }

    if (!verifyAdminBatchScope(adminProfile, batchId)) {
      return NextResponse.json(
        { error: `Cross-batch access forbidden. You are assigned to manage ${adminProfile.assignedBatchName}.` },
        { status: 403 }
      );
    }

    const currentSchedule = await getCohortSchedule(batchId);

    const startDate = body.startDate ? String(body.startDate).trim() : currentSchedule.startDate;
    const weekday = calculateWeekday(startDate);

    const updates = {
      batchLabel: body.batchLabel !== undefined ? String(body.batchLabel).trim() : currentSchedule.batchLabel,
      sectionHeading: body.sectionHeading !== undefined ? String(body.sectionHeading).trim() : currentSchedule.sectionHeading,
      startDate,
      weekday,
      statusBadge: (body.statusBadge as "UPCOMING" | "LIVE" | "COMPLETED" | "PAUSED") || currentSchedule.statusBadge,
      announcementHeadline:
        body.announcementHeadline !== undefined
          ? String(body.announcementHeadline).trim()
          : currentSchedule.announcementHeadline,
      announcementMessage:
        body.announcementMessage !== undefined
          ? String(body.announcementMessage).trim()
          : currentSchedule.announcementMessage,
      scheduleSubtitle:
        body.scheduleSubtitle !== undefined
          ? String(body.scheduleSubtitle).trim()
          : currentSchedule.scheduleSubtitle,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : currentSchedule.isActive,
    };

    const saved = await saveCohortSchedule(
      batchId,
      updates,
      adminProfile.email,
      adminProfile.adminName
    );

    if (!saved) {
      return NextResponse.json(
        { error: "Failed to save cohort schedule configuration to database." },
        { status: 500 }
      );
    }

    // Record audit log
    await createAuditLogEntry(batchId, {
      adminEmail: adminProfile.email,
      adminName: adminProfile.adminName,
      actionType: "UPDATE_SCHEDULE",
      previousValue: `${currentSchedule.startDate} (${currentSchedule.weekday}) [${currentSchedule.statusBadge}]: ${currentSchedule.announcementHeadline}`,
      updatedValue: `${updates.startDate} (${updates.weekday}) [${updates.statusBadge}]: ${updates.announcementHeadline}`,
      notes: `Admin updated Cohort Launch & Schedule settings.`,
    });

    const refreshedSchedule = await getCohortSchedule(batchId);

    return NextResponse.json({
      success: true,
      schedule: refreshedSchedule,
      message: "Cohort Launch & Schedule updated successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating cohort schedule";
    console.error("[Schedule Admin API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
