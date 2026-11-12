import { createClient } from "@supabase/supabase-js";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const BOOTCAMP_2_BATCH_ID = "6c19c464-2224-40f5-8528-c3d7c4a999fa";
export const BOOTCAMP_3_BATCH_ID = "e1c5673b-d2c9-4828-8e52-4322ccad2270";

// Support both exact prompt spellings and existing database spellings
export const BOOTCAMP_2_ADMIN_EMAILS = [
  "parvsrivastav125@gmail.com",
  "parvsrivastava125@gmail.com",
];

export const BOOTCAMP_3_ADMIN_EMAILS = [
  "arnasrivastav125@gmail.com",
  "arnasrivastava125@gmail.com",
];

export const SUPER_ADMIN_EMAILS = [
  "eternallytanuj@gmail.com",
];

export interface AdminProfile {
  isAdmin: boolean;
  userId: string;
  email: string;
  adminName: string;
  assignedBatchId: string;
  assignedBatchName: string;
  role: string;
  isSuperAdmin: boolean;
}

export function createSupabaseAdmin() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

/**
 * Validates that a user is registered in the public.admins table,
 * and determines their batch-specific administrative scope.
 */
export async function getAdminProfile(
  userId: string,
  userEmail?: string | null
): Promise<AdminProfile | null> {
  if (!userId) return null;

  const adminClient = createSupabaseAdmin();

  // 1. Verify existence in public.admins
  const { data: adminRow, error: adminErr } = await adminClient
    .from("admins")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminErr || !adminRow) {
    return null;
  }

  // 2. Fetch authenticated email if not provided
  let email = (userEmail || "").trim().toLowerCase();
  if (!email) {
    const { data: userData } = await adminClient.auth.admin.getUserById(userId);
    email = (userData?.user?.email || "").trim().toLowerCase();
  }

  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
  const isParv = BOOTCAMP_2_ADMIN_EMAILS.includes(email) || userId === "9627ec86-c86d-4fce-8e13-6e8f3f157a83";
  const isArna = BOOTCAMP_3_ADMIN_EMAILS.includes(email) || userId === "80ab193b-a61f-43a6-935e-59a40f203cac";

  if (isParv) {
    return {
      isAdmin: true,
      userId,
      email,
      adminName: "Parv Srivastava",
      assignedBatchId: BOOTCAMP_2_BATCH_ID,
      assignedBatchName: "Bootcamp 2.0",
      role: "Bootcamp 2.0 Admin",
      isSuperAdmin: false,
    };
  }

  if (isArna) {
    return {
      isAdmin: true,
      userId,
      email,
      adminName: "Arna Srivastava",
      assignedBatchId: BOOTCAMP_3_BATCH_ID,
      assignedBatchName: "Bootcamp 3.0",
      role: "Bootcamp 3.0 Admin",
      isSuperAdmin: false,
    };
  }

  if (isSuperAdmin) {
    return {
      isAdmin: true,
      userId,
      email,
      adminName: "Tanuj Pathak",
      assignedBatchId: BOOTCAMP_3_BATCH_ID,
      assignedBatchName: "Master Admin (All Batches)",
      role: "Super Admin",
      isSuperAdmin: true,
    };
  }

  // Default fallback for any other registered admin in DB
  return {
    isAdmin: true,
    userId,
    email,
    adminName: "Staff Admin",
    assignedBatchId: BOOTCAMP_3_BATCH_ID,
    assignedBatchName: "Bootcamp 3.0",
    role: "Admin",
    isSuperAdmin: false,
  };
}

/**
 * Checks whether an admin is authorized to perform actions on targetBatchId.
 */
export function verifyAdminBatchScope(profile: AdminProfile, targetBatchId: string): boolean {
  if (profile.isSuperAdmin) return true;
  return profile.assignedBatchId === targetBatchId;
}

/**
 * Retrieves whether certificates are unlocked for a given batch.
 */
export async function isBatchCertificatesUnlocked(batchId: string): Promise<boolean> {
  try {
    const adminClient = createSupabaseAdmin();
    const { data } = await adminClient
      .from("cohort_sessions")
      .select("is_active")
      .eq("title", `CERT_UNLOCK:${batchId}`)
      .maybeSingle();

    return Boolean(data?.is_active);
  } catch (err) {
    console.error("[adminAuth] Error checking certificate unlock status:", err);
    return false;
  }
}

/**
 * Toggles the certificate unlock status for a batch.
 */
export async function setBatchCertificatesUnlocked(batchId: string, unlocked: boolean): Promise<boolean> {
  try {
    const adminClient = createSupabaseAdmin();
    const title = `CERT_UNLOCK:${batchId}`;

    const { data: existing } = await adminClient
      .from("cohort_sessions")
      .select("id")
      .eq("title", title)
      .maybeSingle();

    if (existing) {
      const { error } = await adminClient
        .from("cohort_sessions")
        .update({ is_active: unlocked })
        .eq("title", title);
      return !error;
    } else {
      const { error } = await adminClient
        .from("cohort_sessions")
        .insert([{
          title,
          join_url: "https://skillyugedu.com/certificates",
          is_active: unlocked,
          scheduled_at: new Date().toISOString(),
        }]);
      return !error;
    }
  } catch (err) {
    console.error("[adminAuth] Error setting certificate unlock status:", err);
    return false;
  }
}
