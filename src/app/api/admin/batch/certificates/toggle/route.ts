import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  verifyAdminBatchScope,
  setBatchCertificatesUnlocked,
} from "@/lib/adminAuth";

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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const adminProfile = await getAdminProfile(user.id, user.email);
    if (!adminProfile || !adminProfile.isAdmin) {
      return NextResponse.json({ error: "Forbidden. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const targetBatchId = (body.batchId as string) || adminProfile.assignedBatchId;

    if (!verifyAdminBatchScope(adminProfile, targetBatchId)) {
      return NextResponse.json(
        {
          error: `Forbidden. You are assigned to manage ${adminProfile.assignedBatchName} and cannot toggle certificates for another batch.`,
        },
        { status: 403 }
      );
    }

    const shouldUnlock = Boolean(body.unlocked);
    const success = await setBatchCertificatesUnlocked(targetBatchId, shouldUnlock);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update certificate unlock status in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      unlocked: shouldUnlock,
      batchId: targetBatchId,
      message: `Certificates for ${adminProfile.assignedBatchName} are now ${
        shouldUnlock ? "UNLOCKED" : "LOCKED"
      }.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating certificate status.";
    console.error("[Certificates Toggle API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

