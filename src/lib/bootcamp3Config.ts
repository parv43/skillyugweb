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

export interface AuditLogEntry {
  id: string;
  batchId: string;
  adminEmail: string;
  adminName: string;
  timestamp: string;
  actionType:
    | "UPDATE_MEET_LINK"
    | "UPDATE_NOTIFICATION"
    | "UPDATE_STUDENT_FEE"
    | "BLOCK_STUDENT"
    | "UNBLOCK_STUDENT"
    | "UPDATE_PARENT_NAMES"
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
