import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin, BOOTCAMP_3_BATCH_ID } from "./adminAuth";
import { calculateBootcampPriceRupees } from "./pricing";

export interface StudentConfig {
  email: string;
  studentName?: string;
  fatherName?: string;
  motherName?: string;
  totalFeeRupees: number;
  amountPaidRupees: number;
  remainingBalanceRupees: number;
  daysAllowed: number;
  paymentDeadline: string; // ISO date string
  isBlocked: boolean;
  blockReason?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface StudentFeeStatus {
  email: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  totalFeeRupees: number;
  amountPaidRupees: number;
  remainingBalanceRupees: number;
  daysAllowed: number;
  paymentDeadline: string;
  isDeadlineExpired: boolean;
  isBlocked: boolean;
  blockReason?: string;
  isLocked: boolean;
  lockReason?: string;
  enrollmentDate: string;
}

export interface BatchNotification {
  headline: string;
  message: string;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface CohortScheduleConfig {
  batchLabel: string;
  sectionHeading: string;
  startDate: string; // YYYY-MM-DD
  weekday: string;
  statusBadge: "UPCOMING" | "LIVE" | "COMPLETED" | "PAUSED";
  announcementHeadline: string;
  announcementMessage: string;
  scheduleSubtitle: string;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export const DEFAULT_BOOTCAMP3_SCHEDULE: CohortScheduleConfig = {
  batchLabel: "SKILLYUG BOOTCAMP 3.0",
  sectionHeading: "Cohort Launch & Schedule",
  startDate: "2026-12-02",
  weekday: "Wednesday",
  statusBadge: "UPCOMING",
  announcementHeadline: "Rescheduled to 2 December 2026 to accommodate students' examinations from 20 November to 28 November.",
  announcementMessage: "Your class schedule will be shared soon. Thank you for your cooperation!",
  scheduleSubtitle: "Schedule Update & Timings",
  isActive: true,
  updatedAt: "2026-11-20T00:00:00.000Z",
  updatedBy: "system",
};

export interface AuditLogEntry {
  id: string;
  batchId: string;
  adminEmail: string;
  adminName: string;
  timestamp: string;
  actionType:
    | "UPDATE_MEET_LINK"
    | "UPDATE_NOTIFICATION"
    | "UPDATE_SCHEDULE"
    | "UPDATE_STUDENT_FEE"
    | "BLOCK_STUDENT"
    | "UNBLOCK_STUDENT"
    | "UPDATE_PARENT_NAMES"
    | "CREATE_STUDENT"
    | "RESET_PASSWORD"
    | "UPDATE_STUDENT_PROFILE"
    | "OTHER";
  studentEmail?: string;
  studentName?: string;
  previousValue?: string;
  updatedValue?: string;
  notes?: string;
}

const DEFAULT_DAYS_ALLOWED = 14;

/**
 * Normalizes email for case-insensitive lookup
 */
export function normalizeEmail(email?: string | null): string {
  return (email || "").trim().toLowerCase();
}

/**
 * Calculates student fee status combining DB slot booking and stored student config.
 */
export function calculateStudentFeeStatus(
  booking: {
    email?: string | null;
    name?: string | null;
    amount_paid?: number | null;
    promo_code?: string | null;
    created_at?: string | null;
  },
  config?: StudentConfig | null
): StudentFeeStatus {
  const email = normalizeEmail(booking.email);
  const studentName = (booking.name || "").trim();
  const enrollmentDate = booking.created_at || new Date().toISOString();

  // Paid amount from booking (paise to rupees)
  const paidFromBookingRupees =
    typeof booking.amount_paid === "number"
      ? Math.round(booking.amount_paid / 100)
      : 0;

  // Amount paid: config override if set, else booking amount
  const amountPaidRupees =
    config && typeof config.amountPaidRupees === "number"
      ? config.amountPaidRupees
      : paidFromBookingRupees;

  // Calculate default total fee
  let defaultTotalRupees: number;
  if (booking.promo_code) {
    defaultTotalRupees = calculateBootcampPriceRupees(booking.promo_code);
  } else if (paidFromBookingRupees >= 6800) {
    defaultTotalRupees = paidFromBookingRupees;
  } else {
    defaultTotalRupees = 10000;
  }

  const totalFeeRupees =
    config && typeof config.totalFeeRupees === "number"
      ? config.totalFeeRupees
      : defaultTotalRupees;

  const remainingBalanceRupees = Math.max(0, totalFeeRupees - amountPaidRupees);

  // Deadline calculation
  const daysAllowed =
    config && typeof config.daysAllowed === "number"
      ? config.daysAllowed
      : DEFAULT_DAYS_ALLOWED;

  let paymentDeadline = config?.paymentDeadline;
  if (!paymentDeadline) {
    const enrollTime = new Date(enrollmentDate).getTime();
    const baseTime = isNaN(enrollTime) || enrollTime < 100000 ? Date.now() : enrollTime;
    paymentDeadline = new Date(baseTime + daysAllowed * 24 * 60 * 60 * 1000).toISOString();
  }

  const now = Date.now();
  const deadlineTime = new Date(paymentDeadline).getTime();
  const isDeadlineExpired = !isNaN(deadlineTime) && now > deadlineTime;

  const isBlocked = Boolean(config?.isBlocked);
  const blockReason = config?.blockReason;

  // Lock logic:
  // If blocked -> locked
  // If outstanding fees (> 0) -> locked with exact prompt message
  // If deadline expired -> locked
  let isLocked = false;
  let lockReason: string | undefined = undefined;

  if (isBlocked) {
    isLocked = true;
    lockReason = blockReason || "Access has been restricted by an administrator. Please contact support.";
  } else if (remainingBalanceRupees > 0 || isDeadlineExpired) {
    isLocked = true;
    lockReason = "Please pay your remaining course fee to access the live class link.";
  }

  return {
    email,
    studentName,
    fatherName: config?.fatherName || "",
    motherName: config?.motherName || "",
    totalFeeRupees,
    amountPaidRupees,
    remainingBalanceRupees,
    daysAllowed,
    paymentDeadline,
    isDeadlineExpired,
    isBlocked,
    blockReason,
    isLocked,
    lockReason,
    enrollmentDate,
  };
}

/**
 * Get student config row from cohort_sessions
 */
export async function getStudentConfig(
  batchId: string,
  email: string
): Promise<StudentConfig | null> {
  const normEmail = normalizeEmail(email);
  if (!normEmail) return null;

  try {
    const adminClient = createSupabaseAdmin();
    const title = `STUDENT_CONFIG:${batchId}:${normEmail}`;

    const { data, error } = await adminClient
      .from("cohort_sessions")
      .select("join_url")
      .eq("title", title)
      .maybeSingle();

    if (error || !data?.join_url) return null;

    return JSON.parse(data.join_url) as StudentConfig;
  } catch (err) {
    console.error("[bootcamp3Config] Error getting student config:", err);
    return null;
  }
}

/**
 * Get all student configs for a batch
 */
export async function getAllStudentConfigsForBatch(
  batchId: string
): Promise<Map<string, StudentConfig>> {
  const configMap = new Map<string, StudentConfig>();

  try {
    const adminClient = createSupabaseAdmin();
    const prefix = `STUDENT_CONFIG:${batchId}:`;

    const { data, error } = await adminClient
      .from("cohort_sessions")
      .select("title, join_url")
      .like("title", `${prefix}%`);

    if (error || !data) return configMap;

    for (const row of data) {
      if (!row.join_url) continue;
      try {
        const config = JSON.parse(row.join_url) as StudentConfig;
        const email = normalizeEmail(config.email || row.title.replace(prefix, ""));
        if (email) {
          configMap.set(email, config);
        }
      } catch (e) {
        console.error("[bootcamp3Config] JSON parse error in student config:", e);
      }
    }
  } catch (err) {
    console.error("[bootcamp3Config] Error loading all student configs:", err);
  }

  return configMap;
}

/**
 * Save or update student config in cohort_sessions
 */
export async function saveStudentConfig(
  batchId: string,
  email: string,
  updates: Partial<StudentConfig>,
  adminEmail: string,
  adminName: string
): Promise<boolean> {
  const normEmail = normalizeEmail(email);
  if (!normEmail) return false;

  try {
    const adminClient = createSupabaseAdmin();
    const title = `STUDENT_CONFIG:${batchId}:${normEmail}`;

    const existingConfig = await getStudentConfig(batchId, normEmail);

    const mergedConfig: StudentConfig = {
      email: normEmail,
      studentName: updates.studentName || existingConfig?.studentName || "",
      fatherName: updates.fatherName !== undefined ? updates.fatherName : (existingConfig?.fatherName || ""),
      motherName: updates.motherName !== undefined ? updates.motherName : (existingConfig?.motherName || ""),
      totalFeeRupees: typeof updates.totalFeeRupees === "number" ? updates.totalFeeRupees : (existingConfig?.totalFeeRupees ?? 10000),
      amountPaidRupees: typeof updates.amountPaidRupees === "number" ? updates.amountPaidRupees : (existingConfig?.amountPaidRupees ?? 0),
      remainingBalanceRupees:
        typeof updates.remainingBalanceRupees === "number"
          ? updates.remainingBalanceRupees
          : Math.max(
              0,
              (typeof updates.totalFeeRupees === "number" ? updates.totalFeeRupees : (existingConfig?.totalFeeRupees ?? 10000)) -
                (typeof updates.amountPaidRupees === "number" ? updates.amountPaidRupees : (existingConfig?.amountPaidRupees ?? 0))
            ),
      daysAllowed: typeof updates.daysAllowed === "number" ? updates.daysAllowed : (existingConfig?.daysAllowed ?? DEFAULT_DAYS_ALLOWED),
      paymentDeadline: updates.paymentDeadline || existingConfig?.paymentDeadline || new Date(Date.now() + DEFAULT_DAYS_ALLOWED * 24 * 60 * 60 * 1000).toISOString(),
      isBlocked: updates.isBlocked !== undefined ? Boolean(updates.isBlocked) : Boolean(existingConfig?.isBlocked),
      blockReason: updates.blockReason !== undefined ? updates.blockReason : existingConfig?.blockReason,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };

    const jsonPayload = JSON.stringify(mergedConfig);

    const { data: existingRow } = await adminClient
      .from("cohort_sessions")
      .select("id")
      .eq("title", title)
      .maybeSingle();

    if (existingRow) {
      const { error } = await adminClient
        .from("cohort_sessions")
        .update({
          join_url: jsonPayload,
          is_active: !mergedConfig.isBlocked,
          scheduled_at: mergedConfig.paymentDeadline,
        })
        .eq("id", existingRow.id);

      return !error;
    } else {
      const { error } = await adminClient
        .from("cohort_sessions")
        .insert([{
          title,
          join_url: jsonPayload,
          is_active: !mergedConfig.isBlocked,
          scheduled_at: mergedConfig.paymentDeadline,
        }]);

      return !error;
    }
  } catch (err) {
    console.error("[bootcamp3Config] Error saving student config:", err);
    return false;
  }
}

/**
 * Get active batch notification for Bootcamp 3.0
 */
export async function getBatchNotification(
  batchId: string
): Promise<BatchNotification | null> {
  try {
    const adminClient = createSupabaseAdmin();
    const title = `NOTIFICATION:${batchId}`;

    const { data, error } = await adminClient
      .from("cohort_sessions")
      .select("join_url, is_active")
      .eq("title", title)
      .maybeSingle();

    if (error || !data?.join_url) return null;

    const parsed = JSON.parse(data.join_url);
    return {
      headline: parsed.headline || "",
      message: parsed.message || "",
      isActive: Boolean(data.is_active),
      updatedAt: parsed.updatedAt || "",
      updatedBy: parsed.updatedBy || "",
    };
  } catch (err) {
    console.error("[bootcamp3Config] Error getting batch notification:", err);
    return null;
  }
}

/**
 * Save or update batch notification in cohort_sessions
 */
export async function saveBatchNotification(
  batchId: string,
  notification: {
    headline: string;
    message: string;
    isActive: boolean;
  },
  adminEmail: string,
  adminName: string
): Promise<boolean> {
  try {
    const adminClient = createSupabaseAdmin();
    const title = `NOTIFICATION:${batchId}`;

    const payload: BatchNotification = {
      headline: notification.headline.trim(),
      message: notification.message.trim(),
      isActive: notification.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };

    const jsonPayload = JSON.stringify(payload);

    const { data: existingRow } = await adminClient
      .from("cohort_sessions")
      .select("id")
      .eq("title", title)
      .maybeSingle();

    if (existingRow) {
      const { error } = await adminClient
        .from("cohort_sessions")
        .update({
          join_url: jsonPayload,
          is_active: notification.isActive,
          scheduled_at: new Date().toISOString(),
        })
        .eq("id", existingRow.id);

      return !error;
    } else {
      const { error } = await adminClient
        .from("cohort_sessions")
        .insert([{
          title,
          join_url: jsonPayload,
          is_active: notification.isActive,
          scheduled_at: new Date().toISOString(),
        }]);

      return !error;
    }
  } catch (err) {
    console.error("[bootcamp3Config] Error saving batch notification:", err);
    return false;
  }
}

/**
 * Record an audit log entry in cohort_sessions
 */
export async function createAuditLogEntry(
  batchId: string,
  entry: Omit<AuditLogEntry, "id" | "timestamp" | "batchId">
): Promise<boolean> {
  try {
    const adminClient = createSupabaseAdmin();
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const title = `AUDIT_LOG:${batchId}:${timestamp}_${id}`;

    const fullEntry: AuditLogEntry = {
      id,
      batchId,
      timestamp,
      ...entry,
    };

    const { error } = await adminClient.from("cohort_sessions").insert([{
      title,
      join_url: JSON.stringify(fullEntry),
      is_active: true,
      scheduled_at: timestamp,
    }]);

    return !error;
  } catch (err) {
    console.error("[bootcamp3Config] Error creating audit log entry:", err);
    return false;
  }
}

/**
 * Fetch recent audit logs for a batch
 */
export async function getAuditLogsForBatch(
  batchId: string,
  limit = 50
): Promise<AuditLogEntry[]> {
  try {
    const adminClient = createSupabaseAdmin();
    const prefix = `AUDIT_LOG:${batchId}:`;

    const { data, error } = await adminClient
      .from("cohort_sessions")
      .select("title, join_url, created_at")
      .like("title", `${prefix}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    const logs: AuditLogEntry[] = [];
    for (const row of data) {
      if (!row.join_url) continue;
      try {
        logs.push(JSON.parse(row.join_url) as AuditLogEntry);
      } catch {
        // ignore parse error
      }
    }

    return logs;
  } catch (err) {
    console.error("[bootcamp3Config] Error fetching audit logs:", err);
    return [];
  }
}

/**
 * Calculates weekday name from ISO or YYYY-MM-DD date string
 */
export function calculateWeekday(dateStr: string): string {
  if (!dateStr) return "Wednesday";
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  return isNaN(d.getTime()) ? "Wednesday" : days[d.getDay()];
}

/**
 * Formats YYYY-MM-DD into human readable date: e.g. "2 December 2026"
 */
export function formatScheduleDisplayDate(dateStr: string): string {
  if (!dateStr) return "2 December 2026";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m < 12) {
      return `${d} ${months[m]} ${y}`;
    }
  }
  const dateObj = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  if (!isNaN(dateObj.getTime())) {
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  }
  return dateStr;
}

/**
 * Get dynamic Cohort Launch & Schedule configuration
 */
export async function getCohortSchedule(
  batchId: string
): Promise<CohortScheduleConfig> {
  const isBootcamp3 = batchId === BOOTCAMP_3_BATCH_ID;
  const baseDefaults: CohortScheduleConfig = isBootcamp3
    ? DEFAULT_BOOTCAMP3_SCHEDULE
    : {
        batchLabel: "Live Cohort",
        sectionHeading: "Live Cohort Schedule",
        startDate: "2026-10-05",
        weekday: "Monday",
        statusBadge: "LIVE",
        announcementHeadline: "Mon, Wed, Fri",
        announcementMessage: "Class Days (Sat & Sun Off)",
        scheduleSubtitle: "Schedule Update & Timings",
        isActive: true,
        updatedAt: new Date().toISOString(),
        updatedBy: "system",
      };

  try {
    const adminClient = createSupabaseAdmin();
    const title = `COHORT_SCHEDULE:${batchId}`;

    const { data } = await adminClient
      .from("cohort_sessions")
      .select("join_url, is_active")
      .eq("title", title)
      .maybeSingle();

    if (data?.join_url) {
      const parsed = JSON.parse(data.join_url);
      const startDate = parsed.startDate || baseDefaults.startDate;
      const weekday = parsed.weekday || calculateWeekday(startDate);

      return {
        batchLabel: parsed.batchLabel || baseDefaults.batchLabel,
        sectionHeading: parsed.sectionHeading || baseDefaults.sectionHeading,
        startDate,
        weekday,
        statusBadge: parsed.statusBadge || baseDefaults.statusBadge,
        announcementHeadline: parsed.announcementHeadline || baseDefaults.announcementHeadline,
        announcementMessage: parsed.announcementMessage || baseDefaults.announcementMessage,
        scheduleSubtitle: parsed.scheduleSubtitle || baseDefaults.scheduleSubtitle,
        isActive: data.is_active !== undefined ? Boolean(data.is_active) : baseDefaults.isActive,
        updatedAt: parsed.updatedAt || baseDefaults.updatedAt,
        updatedBy: parsed.updatedBy || baseDefaults.updatedBy,
      };
    }

    // Fallback: If legacy NOTIFICATION exists, incorporate headline/message
    const legacyNotification = await getBatchNotification(batchId);
    if (legacyNotification && legacyNotification.headline) {
      return {
        ...baseDefaults,
        announcementHeadline: legacyNotification.headline,
        announcementMessage: legacyNotification.message || baseDefaults.announcementMessage,
        isActive: legacyNotification.isActive,
      };
    }
  } catch (err) {
    console.error("[bootcamp3Config] Error loading cohort schedule config:", err);
  }

  return baseDefaults;
}

/**
 * Save dynamic Cohort Launch & Schedule configuration
 */
export async function saveCohortSchedule(
  batchId: string,
  schedule: Partial<CohortScheduleConfig>,
  adminEmail: string,
  adminName: string
): Promise<boolean> {
  try {
    const adminClient = createSupabaseAdmin();
    const title = `COHORT_SCHEDULE:${batchId}`;

    const currentSchedule = await getCohortSchedule(batchId);
    const startDate = schedule.startDate || currentSchedule.startDate || "2026-12-02";
    const weekday = calculateWeekday(startDate);

    const mergedPayload: CohortScheduleConfig = {
      batchLabel: schedule.batchLabel ? schedule.batchLabel.trim() : currentSchedule.batchLabel,
      sectionHeading: schedule.sectionHeading ? schedule.sectionHeading.trim() : currentSchedule.sectionHeading,
      startDate,
      weekday,
      statusBadge: schedule.statusBadge || currentSchedule.statusBadge,
      announcementHeadline:
        schedule.announcementHeadline !== undefined
          ? schedule.announcementHeadline.trim()
          : currentSchedule.announcementHeadline,
      announcementMessage:
        schedule.announcementMessage !== undefined
          ? schedule.announcementMessage.trim()
          : currentSchedule.announcementMessage,
      scheduleSubtitle:
        schedule.scheduleSubtitle !== undefined
          ? schedule.scheduleSubtitle.trim()
          : currentSchedule.scheduleSubtitle,
      isActive: schedule.isActive !== undefined ? Boolean(schedule.isActive) : currentSchedule.isActive,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };

    const jsonPayload = JSON.stringify(mergedPayload);

    const { data: existingRow } = await adminClient
      .from("cohort_sessions")
      .select("id")
      .eq("title", title)
      .maybeSingle();

    let saveErr = null;
    if (existingRow) {
      const { error } = await adminClient
        .from("cohort_sessions")
        .update({
          join_url: jsonPayload,
          is_active: mergedPayload.isActive,
          scheduled_at: `${startDate}T00:00:00.000Z`,
        })
        .eq("id", existingRow.id);
      saveErr = error;
    } else {
      const { error } = await adminClient.from("cohort_sessions").insert([{
        title,
        join_url: jsonPayload,
        is_active: mergedPayload.isActive,
        scheduled_at: `${startDate}T00:00:00.000Z`,
      }]);
      saveErr = error;
    }

    if (saveErr) {
      console.error("[bootcamp3Config] Error persisting cohort schedule:", saveErr);
      return false;
    }

    // Also update batches table start_date so the source of truth is always synchronized
    try {
      await adminClient
        .from("batches")
        .update({ start_date: startDate })
        .eq("id", batchId);
    } catch (batchSyncErr) {
      console.warn("[bootcamp3Config] Could not sync batch start_date:", batchSyncErr);
    }

    return true;
  } catch (err) {
    console.error("[bootcamp3Config] Error in saveCohortSchedule:", err);
    return false;
  }
}

/**
 * Validates admin re-authentication for sensitive actions
 */
export async function verifyAdminReauthentication({
  adminProfile,
  adminPassword,
}: {
  adminProfile: { email: string; userId: string; adminName: string };
  adminPassword?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!adminPassword || typeof adminPassword !== "string" || !adminPassword.trim()) {
    return {
      success: false,
      error: "Admin re-authentication is required. Please enter your administrator password or confirmation.",
    };
  }

  const trimmed = adminPassword.trim();

  // Allow explicit confirmation code for Google-OAuth/OTP authenticated admins
  if (
    trimmed.toUpperCase() === "CONFIRM" ||
    trimmed.toUpperCase() === "CONFIRM_ADMIN" ||
    trimmed.toUpperCase() === "AUTHORIZE"
  ) {
    return { success: true };
  }

  // Attempt Supabase Auth password verification
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await anonClient.auth.signInWithPassword({
        email: adminProfile.email,
        password: trimmed,
      });
      if (!error && data?.user && data.user.id === adminProfile.userId) {
        return { success: true };
      }
    }
  } catch (authErr) {
    console.error("[verifyAdminReauthentication] Password check error:", authErr);
  }

  return {
    success: false,
    error: "Admin re-authentication failed: Invalid administrator password. Please check your credentials.",
  };
}
