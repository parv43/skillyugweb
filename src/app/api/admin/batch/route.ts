import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/lib/razorpayServer";
import {
  createSupabaseAdmin,
  getAdminProfile,
  isBatchCertificatesUnlocked,
  getBatchProgress,
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
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in as an administrator." },
        { status: 401 }
      );
    }

    const adminProfile = await getAdminProfile(user.id, user.email);
    if (!adminProfile || !adminProfile.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required." },
        { status: 403 }
      );
    }

    const adminClient = createSupabaseAdmin();
    const targetBatchId = adminProfile.assignedBatchId;

    // 1. Batch Details
    const { data: batchData, error: batchErr } = await adminClient
      .from("batches")
      .select("*")
      .eq("id", targetBatchId)
      .maybeSingle();

    if (batchErr || !batchData) {
      return NextResponse.json(
        { error: `Could not load batch data for ${adminProfile.assignedBatchName}` },
        { status: 404 }
      );
    }

    // 2. Enrolled Students strictly for this batch
    const { data: students, error: studentErr } = await adminClient
      .from("slot_bookings")
      .select("name, email, phone, grade_class, payment_status, amount_paid, promo_code, created_at, user_id")
      .eq("batch_id", targetBatchId)
      .order("created_at", { ascending: false });

    if (studentErr) {
      console.error("[Admin API] Error loading students:", studentErr);
    }

    // 3. Session Recordings strictly for this batch
    const { data: recordings, error: recErr } = await adminClient
      .from("session_recordings")
      .select("id, title, custom_date, youtube_video_id, published_at")
      .eq("batch_id", targetBatchId)
      .order("published_at", { ascending: false });

    if (recErr) {
      console.error("[Admin API] Error loading recordings:", recErr);
    }

    // 4. Issued Certificates strictly for this batch
    const { data: issuedCerts, error: certErr } = await adminClient
      .from("issued_certificates")
      .select("id, user_name, cert_id, created_at, user_id")
      .eq("batch_id", targetBatchId)
      .order("created_at", { ascending: false });

    if (certErr) {
      console.error("[Admin API] Error loading certificates:", certErr);
    }

    // 5. Certificate Unlock State
    const certificatesUnlocked = await isBatchCertificatesUnlocked(targetBatchId);

    // 6. Batch Progress State
    const batchProgress = await getBatchProgress(targetBatchId);

    // 7. Enrich Students with Certificate Download Status
    const certsByUserId = new Map<string, { cert_id: string; created_at: string }>();
    const certsByName = new Map<string, { cert_id: string; created_at: string }>();

    (issuedCerts || []).forEach((c) => {
      if (c.user_id && !certsByUserId.has(c.user_id)) {
        certsByUserId.set(c.user_id, { cert_id: c.cert_id, created_at: c.created_at });
      }
      const normName = (c.user_name || "").toLowerCase().trim();
      if (normName && !certsByName.has(normName)) {
        certsByName.set(normName, { cert_id: c.cert_id, created_at: c.created_at });
      }
    });

    const enrichedStudents = (students || []).map((s) => {
      const matchedCert =
        (s.user_id && certsByUserId.get(s.user_id)) ||
        certsByName.get((s.name || "").toLowerCase().trim()) ||
        null;

      return {
        ...s,
        certificate: matchedCert
          ? {
              downloaded: true,
              cert_id: matchedCert.cert_id,
              issued_at: matchedCert.created_at,
            }
          : {
              downloaded: false,
            },
      };
    });

    const response = NextResponse.json({
      admin: {
        name: adminProfile.adminName,
        email: adminProfile.email,
        role: adminProfile.role,
        assignedBatchId: adminProfile.assignedBatchId,
        assignedBatchName: adminProfile.assignedBatchName,
      },
      batch: batchData,
      students: enrichedStudents,
      recordings: recordings || [],
      issuedCertificates: issuedCerts || [],
      certificatesUnlocked,
      batchProgress,
    });

    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error loading batch data.";
    console.error("[Admin Batch API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

