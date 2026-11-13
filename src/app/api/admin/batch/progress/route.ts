import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  verifyAdminBatchScope,
  getBatchProgress,
  setBatchProgress,
} from "@/lib/adminAuth";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json({ error: "Missing batchId parameter" }, { status: 400 });
    }

    const progress = await getBatchProgress(batchId);
    return NextResponse.json({ success: true, progress });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load progress";
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

    const totalSessions = Number(body.totalSessions);
    const completedSessions = Number(body.completedSessions);
    const progressPercentage =
      body.progressPercentage !== undefined ? Number(body.progressPercentage) : undefined;

    if (isNaN(totalSessions) || totalSessions < 1) {
      return NextResponse.json(
        { error: "Total sessions must be at least 1." },
        { status: 400 }
      );
    }

    if (isNaN(completedSessions) || completedSessions < 0 || completedSessions > totalSessions) {
      return NextResponse.json(
        { error: `Completed sessions must be between 0 and total sessions (${totalSessions}).` },
        { status: 400 }
      );
    }

    const updated = await setBatchProgress(batchId, {
      totalSessions,
      completedSessions,
      progressPercentage,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to persist batch progress updates." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Progress updated to ${updated.progressPercentage}% (${updated.completedSessions} of ${updated.totalSessions} sessions completed).`,
      progress: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error updating progress.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
