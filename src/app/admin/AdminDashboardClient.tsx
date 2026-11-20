"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Users,
  Video,
  Award,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Clock,
  TrendingUp,
  Link2,
  Bell,
  AlertTriangle,
  ShieldAlert,
  History,
  Edit,
  DollarSign,
  X,
  Check,
  UserPlus,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  calculateWeekday,
  formatScheduleDisplayDate,
  type CohortScheduleConfig,
} from "@/lib/bootcamp3Config";

interface StudentFeeStatus {
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

interface StudentRecord {
  name: string;
  email: string;
  phone: string;
  grade_class: string;
  payment_status: string;
  amount_paid?: number;
  promo_code?: string;
  created_at: string;
  user_id?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  certificate?: {
    downloaded: boolean;
    cert_id?: string;
    issued_at?: string;
  };
  feeStatus?: StudentFeeStatus;
}

interface BatchNotificationData {
  headline: string;
  message: string;
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

interface AuditLogData {
  id: string;
  batchId: string;
  adminEmail: string;
  adminName: string;
  timestamp: string;
  actionType: string;
  studentEmail?: string;
  studentName?: string;
  previousValue?: string;
  updatedValue?: string;
  notes?: string;
}

function formatEnrollmentDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) || d.getFullYear() <= 1970) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface BatchProgressData {
  totalSessions: number;
  completedSessions: number;
  progressPercentage: number;
}

interface RecordingRecord {
  id: string;
  title: string;
  custom_date: string;
  youtube_video_id: string;
  published_at: string;
}

interface CertificateRecord {
  id: number;
  user_name: string;
  cert_id: string;
  created_at: string;
  user_id?: string;
}

interface AdminProfileData {
  name: string;
  email: string;
  role: string;
  assignedBatchId: string;
  assignedBatchName: string;
}

interface BatchData {
  id: string;
  name: string;
  label: string;
  start_date: string;
  end_date: string;
  meet_link?: string;
  youtube_playlist_id?: string;
  is_active: boolean;
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [admin, setAdmin] = useState<AdminProfileData | null>(null);
  const [batch, setBatch] = useState<BatchData | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [recordings, setRecordings] = useState<RecordingRecord[]>([]);
  const [issuedCerts, setIssuedCerts] = useState<CertificateRecord[]>([]);
  const [certsUnlocked, setCertsUnlocked] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"students" | "recordings" | "certificates" | "audit">("students");
  const [searchQuery, setSearchQuery] = useState("");

  // Meet Link State (Bootcamp 3.0)
  const [meetLinkInput, setMeetLinkInput] = useState("");
  const [isSavingMeetLink, setIsSavingMeetLink] = useState(false);
  const [meetLinkStatus, setMeetLinkStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Dynamic Cohort Launch & Schedule State (Bootcamp 3.0)
  const [cohortSchedule, setCohortSchedule] = useState<CohortScheduleConfig | null>(null);
  const [scheduleHeading, setScheduleHeading] = useState("Cohort Launch & Schedule");
  const [scheduleBatchLabel, setScheduleBatchLabel] = useState("SKILLYUG BOOTCAMP 3.0");
  const [scheduleStartDate, setScheduleStartDate] = useState("2026-12-02");
  const [scheduleWeekday, setScheduleWeekday] = useState("Wednesday");
  const [scheduleStatusBadge, setScheduleStatusBadge] = useState<"UPCOMING" | "LIVE" | "COMPLETED" | "PAUSED">("UPCOMING");
  const [scheduleHeadline, setScheduleHeadline] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [scheduleSubtitle, setScheduleSubtitle] = useState("Schedule Update & Timings");
  const [scheduleActive, setScheduleActive] = useState(true);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Notification State (Fallback)
  const [notificationHeadline, setNotificationHeadline] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationActive, setNotificationActive] = useState(true);
  const [isSavingNotification, setIsSavingNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);

  // Manual Add Student State (Bootcamp 3.0)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addShowPassword, setAddShowPassword] = useState(false);
  const [addPhone, setAddPhone] = useState("");
  const [addGradeClass, setAddGradeClass] = useState("");
  const [addFatherName, setAddFatherName] = useState("");
  const [addMotherName, setAddMotherName] = useState("");
  const [addTotalFee, setAddTotalFee] = useState<number>(8500);
  const [addAmountPaid, setAddAmountPaid] = useState<number>(8500);
  const [addDaysAllowed, setAddDaysAllowed] = useState<number>(14);
  const [addShowOptional, setAddShowOptional] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [addStudentError, setAddStudentError] = useState("");
  const [addStudentSuccess, setAddStudentSuccess] = useState("");

  // Student Management Modal State (Bootcamp 3.0)
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGradeClass, setEditGradeClass] = useState("");
  const [editFatherName, setEditFatherName] = useState("");
  const [editMotherName, setEditMotherName] = useState("");
  const [editTotalFee, setEditTotalFee] = useState<number>(10000);
  const [editAmountPaid, setEditAmountPaid] = useState<number>(0);
  const [editDaysAllowed, setEditDaysAllowed] = useState<number>(14);
  const [editPaymentDeadline, setEditPaymentDeadline] = useState("");
  const [editIsBlocked, setEditIsBlocked] = useState(false);
  const [editBlockReason, setEditBlockReason] = useState("");
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  const [studentActionStatus, setStudentActionStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Password Management / Reset State
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newTemporaryPassword, setNewTemporaryPassword] = useState("");
  const [showNewTempPassword, setShowNewTempPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordStatus, setResetPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Confirmation Dialog State (with Admin Password Re-auth)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    requiresPassword?: boolean;
    onConfirm: (adminPassword?: string) => void;
  } | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Certificate Toggle State
  const [isTogglingCert, setIsTogglingCert] = useState(false);
  const [certActionStatus, setCertActionStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Batch Progress State
  const [batchProgress, setBatchProgress] = useState<BatchProgressData>({
    totalSessions: 24,
    completedSessions: 18,
    progressPercentage: 75,
  });
  const [editTotal, setEditTotal] = useState(24);
  const [editCompleted, setEditCompleted] = useState(18);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [progressStatus, setProgressStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Certificate Tracker Filters (for Certificates tab)
  const [certFilter, setCertFilter] = useState<"all" | "downloaded" | "pending">("all");
  const [certSearchQuery, setCertSearchQuery] = useState("");

  const loadBatchData = useCallback(async () => {
    try {
      // ── Instant hydration from sessionStorage cache if available ──
      try {
        const cached = sessionStorage.getItem("admin_batch_cache");
        if (cached) {
          const { data: cachedData, expiry } = JSON.parse(cached);
          if (cachedData && Date.now() < expiry) {
            setAdmin(cachedData.admin);
            setBatch(cachedData.batch);
            setStudents(cachedData.students || []);
            setRecordings(cachedData.recordings || []);
            setIssuedCerts(cachedData.issuedCertificates || []);
            setCertsUnlocked(Boolean(cachedData.certificatesUnlocked));
            if (cachedData.batchProgress) {
              setBatchProgress(cachedData.batchProgress);
              setEditTotal(cachedData.batchProgress.totalSessions);
              setEditCompleted(cachedData.batchProgress.completedSessions);
            }
            if (cachedData.batch?.meet_link !== undefined) {
              setMeetLinkInput(cachedData.batch.meet_link || "");
            }
            if (cachedData.notification) {
              setNotificationHeadline(cachedData.notification.headline || "");
              setNotificationMessage(cachedData.notification.message || "");
              setNotificationActive(cachedData.notification.isActive ?? true);
            }
            if (cachedData.cohortSchedule) {
              setCohortSchedule(cachedData.cohortSchedule);
              setScheduleHeading(cachedData.cohortSchedule.sectionHeading || "Cohort Launch & Schedule");
              setScheduleBatchLabel(cachedData.cohortSchedule.batchLabel || "SKILLYUG BOOTCAMP 3.0");
              setScheduleStartDate(cachedData.cohortSchedule.startDate || "2026-12-02");
              setScheduleWeekday(cachedData.cohortSchedule.weekday || calculateWeekday(cachedData.cohortSchedule.startDate));
              setScheduleStatusBadge(cachedData.cohortSchedule.statusBadge || "UPCOMING");
              setScheduleHeadline(cachedData.cohortSchedule.announcementHeadline || "");
              setScheduleMessage(cachedData.cohortSchedule.announcementMessage || "");
              setScheduleSubtitle(cachedData.cohortSchedule.scheduleSubtitle || "Schedule Update & Timings");
              setScheduleActive(cachedData.cohortSchedule.isActive ?? true);
            }
            if (Array.isArray(cachedData.auditLogs)) {
              setAuditLogs(cachedData.auditLogs);
            }
            setLoading(false);
          }
        }
      } catch {
        /* ignore cache read error */
      }

      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        router.replace("/login?redirect=/admin");
        return;
      }

      const res = await fetch("/api/admin/batch", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("Access Denied: You do not have administrator permissions.");
          setLoading(false);
          return;
        }
        throw new Error(`Failed to load admin data (${res.status})`);
      }

      const data = await res.json();
      setAdmin(data.admin);
      setBatch(data.batch);
      setStudents(data.students || []);
      setRecordings(data.recordings || []);
      setIssuedCerts(data.issuedCertificates || []);
      setCertsUnlocked(Boolean(data.certificatesUnlocked));
      if (data.batchProgress) {
        setBatchProgress(data.batchProgress);
        setEditTotal(data.batchProgress.totalSessions);
        setEditCompleted(data.batchProgress.completedSessions);
      }
      if (data.batch?.meet_link !== undefined) {
        setMeetLinkInput(data.batch.meet_link || "");
      }
      if (data.notification) {
        setNotificationHeadline(data.notification.headline || "");
        setNotificationMessage(data.notification.message || "");
        setNotificationActive(data.notification.isActive ?? true);
      }
      if (data.cohortSchedule) {
        setCohortSchedule(data.cohortSchedule);
        setScheduleHeading(data.cohortSchedule.sectionHeading || "Cohort Launch & Schedule");
        setScheduleBatchLabel(data.cohortSchedule.batchLabel || "SKILLYUG BOOTCAMP 3.0");
        setScheduleStartDate(data.cohortSchedule.startDate || "2026-12-02");
        setScheduleWeekday(data.cohortSchedule.weekday || calculateWeekday(data.cohortSchedule.startDate));
        setScheduleStatusBadge(data.cohortSchedule.statusBadge || "UPCOMING");
        setScheduleHeadline(data.cohortSchedule.announcementHeadline || "");
        setScheduleMessage(data.cohortSchedule.announcementMessage || "");
        setScheduleSubtitle(data.cohortSchedule.scheduleSubtitle || "Schedule Update & Timings");
        setScheduleActive(data.cohortSchedule.isActive ?? true);
      }
      if (Array.isArray(data.auditLogs)) {
        setAuditLogs(data.auditLogs);
      }

      try {
        sessionStorage.setItem(
          "admin_batch_cache",
          JSON.stringify({
            data,
            expiry: Date.now() + 5 * 60 * 1000,
          })
        );
      } catch {
        /* ignore storage write error */
      }
    } catch (err: any) {
      console.error("[AdminDashboard] Error loading batch data:", err);
      setError(err.message || "Failed to load admin batch data.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadBatchData();
  }, [loadBatchData]);

  // Handle Meet Link Save (Bootcamp 3.0)
  const handleSaveMeetLink = async (clearLink = false) => {
    if (!batch) return;
    setIsSavingMeetLink(true);
    setMeetLinkStatus(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const targetUrl = clearLink ? "" : meetLinkInput.trim();

      const res = await fetch("/api/admin/batch/meet-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: batch.id,
          meetLink: targetUrl,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save meeting link");

      setMeetLinkStatus({
        type: "success",
        message: targetUrl ? "Meeting link published successfully." : "Meeting link cleared.",
      });
      if (clearLink) setMeetLinkInput("");
      setBatch((prev) => (prev ? { ...prev, meet_link: targetUrl || undefined } : null));
      sessionStorage.removeItem("admin_batch_cache");
      loadBatchData();
    } catch (err: any) {
      setMeetLinkStatus({ type: "error", message: err.message || "Error saving meeting link." });
    } finally {
      setIsSavingMeetLink(false);
      setTimeout(() => setMeetLinkStatus(null), 5000);
    }
  };

  // Handle Notification Save (Bootcamp 3.0)
  const handleSaveNotification = async (deactivate = false) => {
    if (!batch) return;
    setIsSavingNotification(true);
    setNotificationStatus(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/batch/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: batch.id,
          headline: notificationHeadline.trim(),
          message: notificationMessage.trim(),
          isActive: deactivate ? false : notificationActive,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save notification");

      setNotificationStatus({
        type: "success",
        message: deactivate ? "Notification announcement deactivated." : "Notification announcement published successfully.",
      });
      if (deactivate) setNotificationActive(false);
      sessionStorage.removeItem("admin_batch_cache");
      loadBatchData();
    } catch (err: any) {
      setNotificationStatus({ type: "error", message: err.message || "Error saving notification." });
    } finally {
      setIsSavingNotification(false);
      setTimeout(() => setNotificationStatus(null), 5000);
    }
  };

  // Handle Dynamic Cohort Launch & Schedule Save (Bootcamp 3.0)
  const handleSaveSchedule = async () => {
    if (!batch) return;
    setIsSavingSchedule(true);
    setScheduleStatus(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/batch/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: batch.id,
          sectionHeading: scheduleHeading.trim(),
          batchLabel: scheduleBatchLabel.trim(),
          startDate: scheduleStartDate.trim(),
          weekday: scheduleWeekday,
          statusBadge: scheduleStatusBadge,
          announcementHeadline: scheduleHeadline.trim(),
          announcementMessage: scheduleMessage.trim(),
          scheduleSubtitle: scheduleSubtitle.trim(),
          isActive: scheduleActive,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save schedule.");

      setScheduleStatus({
        type: "success",
        message: "Cohort Launch & Schedule updated and published successfully.",
      });
      sessionStorage.removeItem("admin_batch_cache");
      loadBatchData();
    } catch (err: any) {
      setScheduleStatus({ type: "error", message: err.message || "Error saving schedule." });
    } finally {
      setIsSavingSchedule(false);
      setTimeout(() => setScheduleStatus(null), 5000);
    }
  };

  // Handle Manual Student Account Creation (Bootcamp 3.0)
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStudentError("");
    setAddStudentSuccess("");

    if (!addName.trim() || addName.trim().length < 2) {
      setAddStudentError("Student Full Name is required (minimum 2 characters).");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!addEmail.trim() || !emailRegex.test(addEmail.trim())) {
      setAddStudentError("Please enter a valid student email address.");
      return;
    }
    if (!addPassword || addPassword.length < 6) {
      setAddStudentError("Initial Password is required (minimum 6 characters).");
      return;
    }

    setIsAddingStudent(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/batch/student/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: batch?.id,
          name: addName.trim(),
          email: addEmail.trim().toLowerCase(),
          password: addPassword.trim(),
          phone: addPhone.trim() || undefined,
          gradeClass: addGradeClass.trim() || undefined,
          fatherName: addFatherName.trim() || undefined,
          motherName: addMotherName.trim() || undefined,
          totalFeeRupees: Number(addTotalFee),
          amountPaidRupees: Number(addAmountPaid),
          daysAllowed: Number(addDaysAllowed),
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to create student account.");

      setAddStudentSuccess(`Student "${addName}" created and enrolled in Bootcamp 3.0 successfully.`);
      if (resData.student) {
        setStudents((prev) => [resData.student, ...prev]);
      }
      sessionStorage.removeItem("admin_batch_cache");
      await loadBatchData();
      setTimeout(() => {
        setShowAddStudentModal(false);
        setAddName("");
        setAddEmail("");
        setAddPassword("");
        setAddPhone("");
        setAddGradeClass("");
        setAddFatherName("");
        setAddMotherName("");
        setAddStudentSuccess("");
        setAddStudentError("");
      }, 1500);
    } catch (err: any) {
      setAddStudentError(err.message || "Failed to add student.");
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Handle Open Student Edit Modal
  const handleOpenStudentModal = (student: StudentRecord) => {
    setSelectedStudent(student);
    const fs = student.feeStatus;
    setEditStudentName(student.name || "");
    setEditPhone(student.phone || "");
    setEditGradeClass(student.grade_class || "");
    setEditFatherName(fs?.fatherName || "");
    setEditMotherName(fs?.motherName || "");
    setEditTotalFee(fs?.totalFeeRupees ?? (student.amount_paid ? Math.round(student.amount_paid / 100) : 10000));
    setEditAmountPaid(fs?.amountPaidRupees ?? (student.amount_paid ? Math.round(student.amount_paid / 100) : 0));
    setEditDaysAllowed(fs?.daysAllowed ?? 14);
    setEditPaymentDeadline(fs?.paymentDeadline ? fs.paymentDeadline.split("T")[0] : "");
    setEditIsBlocked(Boolean(fs?.isBlocked));
    setEditBlockReason(fs?.blockReason || "");
    setStudentActionStatus(null);
    setShowResetPassword(false);
    setNewTemporaryPassword("");
    setResetPasswordStatus(null);
  };

  // Handle Temporary Password Reset
  const handleResetStudentPassword = () => {
    if (!selectedStudent) return;
    if (!newTemporaryPassword || newTemporaryPassword.length < 6) {
      setResetPasswordStatus({
        type: "error",
        message: "Temporary password must be at least 6 characters.",
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Confirm Temporary Password Reset",
      message: `Are you sure you want to assign a new temporary password for ${selectedStudent.name} (${selectedStudent.email})?`,
      requiresPassword: true,
      onConfirm: async (adminPassword) => {
        setIsResettingPassword(true);
        setResetPasswordStatus(null);
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;

          const res = await fetch("/api/admin/batch/student", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              batchId: batch?.id,
              email: selectedStudent.email,
              actionType: "RESET_PASSWORD",
              newPassword: newTemporaryPassword.trim(),
              adminPassword,
            }),
          });

          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || "Failed to reset password.");

          setResetPasswordStatus({
            type: "success",
            message: `New temporary password has been successfully assigned.`,
          });
          setNewTemporaryPassword("");
          sessionStorage.removeItem("admin_batch_cache");
          await loadBatchData();
        } catch (err: any) {
          setResetPasswordStatus({ type: "error", message: err.message || "Error resetting password." });
        } finally {
          setIsResettingPassword(false);
        }
      },
    });
  };

  // Execute Student Updates in DB
  const executeStudentUpdate = async (adminPassword?: string) => {
    if (!selectedStudent || !batch) return;
    setIsSavingStudent(true);
    setStudentActionStatus(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/batch/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: batch.id,
          email: selectedStudent.email,
          actionType: "UPDATE_ALL",
          studentName: editStudentName.trim(),
          phone: editPhone.trim(),
          gradeClass: editGradeClass.trim(),
          fatherName: editFatherName.trim(),
          motherName: editMotherName.trim(),
          totalFeeRupees: Number(editTotalFee),
          amountPaidRupees: Number(editAmountPaid),
          daysAllowed: Number(editDaysAllowed),
          paymentDeadline: editPaymentDeadline ? new Date(editPaymentDeadline + "T23:59:59").toISOString() : undefined,
          isBlocked: editIsBlocked,
          blockReason: editBlockReason.trim() || undefined,
          adminPassword,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update student");

      setStudentActionStatus({
        type: "success",
        message: "Student configuration and profile updated successfully.",
      });
      sessionStorage.removeItem("admin_batch_cache");
      await loadBatchData();
      setTimeout(() => {
        setSelectedStudent(null);
        setStudentActionStatus(null);
      }, 1200);
    } catch (err: any) {
      setStudentActionStatus({ type: "error", message: err.message || "Error updating student." });
    } finally {
      setIsSavingStudent(false);
    }
  };

  // Prompt Confirmation Modal for Sensitive Changes
  const handleConfirmStudentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const currentIsBlocked = Boolean(selectedStudent.feeStatus?.isBlocked);
    const isBlockingOrUnblocking = currentIsBlocked !== editIsBlocked;
    const currentFee = selectedStudent.feeStatus?.totalFeeRupees;
    const isFeeChanging = currentFee !== undefined && currentFee !== Number(editTotalFee);
    const currentPaid = selectedStudent.feeStatus?.amountPaidRupees;
    const isPaidChanging = currentPaid !== undefined && currentPaid !== Number(editAmountPaid);

    if (isBlockingOrUnblocking || isFeeChanging || isPaidChanging) {
      setConfirmDialog({
        isOpen: true,
        title: editIsBlocked && !currentIsBlocked ? "Confirm Block Student" : "Confirm Student Update",
        message: editIsBlocked && !currentIsBlocked
          ? `Are you sure you want to block ${selectedStudent.name}? They will immediately lose access to live sessions.`
          : `Are you sure you want to apply these fee or access modifications to ${selectedStudent.name}?`,
        requiresPassword: true,
        onConfirm: (adminPassword) => {
          setConfirmDialog(null);
          executeStudentUpdate(adminPassword);
        },
      });
    } else {
      executeStudentUpdate();
    }
  };

  // Handle Batch Progress Updates
  const handleSaveProgress = async () => {
    if (!admin) return;
    setIsSavingProgress(true);
    setProgressStatus(null);

    const total = Math.max(1, Number(editTotal) || 24);
    const completed = Math.max(0, Math.min(total, Number(editCompleted) || 0));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/batch/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: admin.assignedBatchId,
          totalSessions: total,
          completedSessions: completed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update progress.");
      }

      setBatchProgress(data.progress);
      setEditTotal(data.progress.totalSessions);
      setEditCompleted(data.progress.completedSessions);
      setProgressStatus({
        type: "success",
        message: data.message || `Progress updated to ${data.progress.progressPercentage}% (${data.progress.completedSessions} of ${data.progress.totalSessions} sessions completed).`,
      });

      // Clear cached admin and student session data and notify any open client tabs
      try {
        sessionStorage.removeItem("admin_batch_cache");
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("mybatch_access")) {
            sessionStorage.removeItem(key);
          }
        });
        window.dispatchEvent(
          new CustomEvent("skillyug:progress_updated", { detail: data.progress })
        );
      } catch (e) {
        /* ignore */
      }
    } catch (err: any) {
      console.error("[AdminDashboard] Save progress error:", err);
      setProgressStatus({
        type: "error",
        message: err.message || "Failed to save batch progress.",
      });
    } finally {
      setIsSavingProgress(false);
      setTimeout(() => setProgressStatus(null), 6000);
    }
  };

  // Handle Video Synchronization
  const handleSyncVideos = async () => {
    if (!admin) return;
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/videos/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ batch_id: admin.assignedBatchId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to synchronize recordings.");
      }

      setSyncStatus({
        type: "success",
        message: data.message || `Synced ${data.count} recordings successfully!`,
      });

      try {
        sessionStorage.removeItem("admin_batch_cache");
      } catch {}

      // Reload batch recordings
      loadBatchData();
    } catch (err: any) {
      console.error("[AdminDashboard] Sync error:", err);
      setSyncStatus({
        type: "error",
        message: err.message || "Failed to synchronize videos.",
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  // Handle Certificate Lock/Unlock Toggle
  const handleToggleCertificates = async () => {
    if (!admin) return;
    setIsTogglingCert(true);
    setCertActionStatus(null);

    const newTargetState = !certsUnlocked;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch("/api/admin/batch/certificates/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId: admin.assignedBatchId,
          unlocked: newTargetState,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update certificate status.");
      }

      setCertsUnlocked(newTargetState);
      setCertActionStatus({
        type: "success",
        message: data.message || `Certificates are now ${newTargetState ? "UNLOCKED" : "LOCKED"}.`,
      });

      try {
        sessionStorage.removeItem("admin_batch_cache");
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("mybatch_access")) {
            sessionStorage.removeItem(key);
          }
        });
      } catch {}
    } catch (err: any) {
      console.error("[AdminDashboard] Cert toggle error:", err);
      setCertActionStatus({
        type: "error",
        message: err.message || "Failed to toggle certificate state.",
      });
    } finally {
      setIsTogglingCert(false);
      setTimeout(() => setCertActionStatus(null), 6000);
    }
  };

  const isBootcamp3 =
    batch?.id === "e1c5673b-d2c9-4828-8e52-4322ccad2270" ||
    (batch?.name || "").includes("3.0") ||
    (batch?.label || "").includes("3.0");

  // Filter students by search query
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.grade_class || "").toLowerCase().includes(q) ||
      (s.certificate?.cert_id || "").toLowerCase().includes(q) ||
      (s.feeStatus?.fatherName || "").toLowerCase().includes(q) ||
      (s.feeStatus?.motherName || "").toLowerCase().includes(q)
    );
  });

  // Certificate Download Tracker Metrics & Filter
  const downloadedStudentsCount = students.filter((s) => s.certificate?.downloaded).length;
  const pendingStudentsCount = students.length - downloadedStudentsCount;

  const filteredCertStudents = students.filter((s) => {
    // 1. Tab filter
    if (certFilter === "downloaded" && !s.certificate?.downloaded) return false;
    if (certFilter === "pending" && s.certificate?.downloaded) return false;

    // 2. Search query filter
    const q = certSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.certificate?.cert_id || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-slate-600 dark:text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-[#0060aa] dark:text-[#ff9d3b] mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading Batch Admin Console...</p>
      </div>
    );
  }

  if (error || !admin || !batch) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-6 text-slate-800 dark:text-slate-200">
        <div className="max-w-md w-full bg-white dark:bg-[#0a0f1c] border border-rose-200 dark:border-rose-900/30 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Admin Access Restricted</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            {error || "You are not authorized to view this batch admin console."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/my-batch"
              onClick={() => {
                try {
                  Object.keys(sessionStorage).forEach((key) => {
                    if (key.startsWith("mybatch_access")) {
                      sessionStorage.removeItem(key);
                    }
                  });
                } catch {}
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] text-white font-bold text-xs uppercase tracking-widest shadow-md hover:scale-[1.02] transition-transform"
            >
              Return to My Batch
            </Link>
            <Link
              href="/"
              className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/my-batch"
              onClick={() => {
                try {
                  Object.keys(sessionStorage).forEach((key) => {
                    if (key.startsWith("mybatch_access")) {
                      sessionStorage.removeItem(key);
                    }
                  });
                } catch {}
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Student View
            </Link>
            <div className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0060aa] to-[#ff8b12] text-white shadow-sm font-black text-sm">
                SY
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight leading-none text-slate-900 dark:text-white">
                  Admin Console
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0060aa] dark:text-[#ff9d3b]">
                  {admin.assignedBatchName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{admin.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{admin.email}</p>
            </div>
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {admin.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Banner: Batch Scope Isolation Notice */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-[#0a0f1c]/70 backdrop-blur-md p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Isolated Administrative Scope
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Managing {batch.label || batch.name}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              You are authenticated as the designated administrator for this cohort. Operations performed here—including video synchronization, recording management, and certificate issuance—are strictly scoped to this batch.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadBatchData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <Link
              href="/admin/comments"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              Moderate Comments
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Global Notifications */}
        {syncStatus && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
              syncStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            {syncStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{syncStatus.message}</span>
          </div>
        )}

        {certActionStatus && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
              certActionStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            {certActionStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{certActionStatus.message}</span>
          </div>
        )}

        {progressStatus && (
          <div
            className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
              progressStatus.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300"
            }`}
          >
            {progressStatus.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{progressStatus.message}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Batch Status */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Cohort Details
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                batch.is_active
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
              }`}>
                {batch.is_active ? "Live Cohort" : "Archived / Legacy"}
              </span>
            </div>
            <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {batch.name}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Starts: {batch.start_date || "To be announced"}
            </p>
          </div>

          {/* Card 2: Enrolled Students */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Enrolled Students
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {students.length}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Verified cohort bookings
            </p>
          </div>

          {/* Card 3: Session Recordings */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Class Recordings
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#ff8b12] dark:text-[#ff9d3b] flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {recordings.length}
              </p>
              <button
                onClick={handleSyncVideos}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                Sync Now
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Synced with YouTube playlist
            </p>
          </div>

          {/* Card 4: Certificate Status */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Certificates
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {certsUnlocked ? (
                  <Unlock className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-500" />
                )}
                <span className={`text-base font-black uppercase tracking-wider ${
                  certsUnlocked ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                }`}>
                  {certsUnlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
              <button
                onClick={handleToggleCertificates}
                disabled={isTogglingCert}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  certsUnlocked
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isTogglingCert ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : certsUnlocked ? (
                  "Lock Certs"
                ) : (
                  "Unlock Certs"
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {issuedCerts.length} certificates generated
            </p>
          </div>
        </div>

        {/* Cohort Session & Progress Controller Panel */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#ff8b12] dark:text-[#ff9d3b]" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Bootcamp Session & Progress Controller
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Configure live curriculum progress for {batch.name}. Updates here instantly reflect on the student dashboard (&quot;My Batch&quot;) progress wheel and session counters.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {batchProgress.progressPercentage}%
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {batchProgress.completedSessions} of {batchProgress.totalSessions} Sessions ({Math.max(0, batchProgress.totalSessions - batchProgress.completedSessions)} left)
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
              <span>Cohort Progress ({batchProgress.completedSessions}/{batchProgress.totalSessions} completed)</span>
              <span className="text-[#ff8b12] font-black">{batchProgress.progressPercentage}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden p-0.5 border border-slate-200/60 dark:border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0060aa] via-[#ff8b12] to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, batchProgress.progressPercentage))}%` }}
              />
            </div>
          </div>

          {/* Form Controls */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Sessions
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={editTotal}
                onChange={(e) => setEditTotal(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32 px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completed Sessions
              </label>
              <input
                type="number"
                min="0"
                max={editTotal}
                value={editCompleted}
                onChange={(e) => setEditCompleted(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-32 px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Calculated Progress
              </label>
              <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-black text-[#ff8b12]">
                {Math.round((editCompleted / Math.max(1, editTotal)) * 100)}% ({Math.max(0, editTotal - editCompleted)} left)
              </div>
            </div>

            {/* Quick Adjustment Shortcuts */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditCompleted((prev) => Math.min(editTotal, prev + 1))}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Increment Completed Sessions"
              >
                +1 Session
              </button>
              <button
                type="button"
                onClick={() => setEditCompleted((prev) => Math.max(0, prev - 1))}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Decrement Completed Sessions"
              >
                -1 Session
              </button>
            </div>

            <button
              onClick={handleSaveProgress}
              disabled={isSavingProgress}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSavingProgress ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Progress
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bootcamp 3.0 Live Session Link & Notification Controllers */}
        {isBootcamp3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card A: Next Live Session Link Controller */}
            <div className="rounded-3xl border border-blue-500/20 dark:border-blue-500/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Next Live Session Meeting Link</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Class link published to eligible Bootcamp 3.0 students.</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  batch.meet_link
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10"
                }`}>
                  {batch.meet_link ? "Published" : "No Link Set"}
                </span>
              </div>

              {meetLinkStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  meetLinkStatus.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  {meetLinkStatus.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {meetLinkStatus.message}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Meeting URL (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  value={meetLinkInput}
                  onChange={(e) => setMeetLinkInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                {batch.meet_link ? (
                  <button
                    type="button"
                    onClick={() => handleSaveMeetLink(true)}
                    disabled={isSavingMeetLink}
                    className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Clear Link
                  </button>
                ) : <div />}
                <button
                  type="button"
                  onClick={() => handleSaveMeetLink(false)}
                  disabled={isSavingMeetLink || !meetLinkInput.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {isSavingMeetLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save & Publish Link
                </button>
              </div>
            </div>

            {/* Card B: Cohort Launch & Schedule Controller (Bootcamp 3.0) */}
            <div className="rounded-3xl border border-orange-500/20 dark:border-orange-500/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#ff8b12] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Cohort Launch & Schedule Controller</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Customizes the live schedule banner shown to Bootcamp 3.0 students.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    scheduleActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10"
                  }`}>
                    {scheduleActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {scheduleStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  scheduleStatus.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  {scheduleStatus.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {scheduleStatus.message}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Batch Label
                  </label>
                  <input
                    type="text"
                    value={scheduleBatchLabel}
                    onChange={(e) => setScheduleBatchLabel(e.target.value)}
                    placeholder="SKILLYUG BOOTCAMP 3.0"
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={scheduleHeading}
                    onChange={(e) => setScheduleHeading(e.target.value)}
                    placeholder="Cohort Launch & Schedule"
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Batch Starting Date
                  </label>
                  <input
                    type="date"
                    value={scheduleStartDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setScheduleStartDate(val);
                      setScheduleWeekday(calculateWeekday(val));
                    }}
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Weekday (Calculated)
                  </label>
                  <div className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-blue-600 dark:text-blue-400">
                    {scheduleWeekday}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status Badge
                  </label>
                  <select
                    value={scheduleStatusBadge}
                    onChange={(e) => setScheduleStatusBadge(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="LIVE">LIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PAUSED">PAUSED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    value={scheduleHeadline}
                    onChange={(e) => setScheduleHeadline(e.target.value)}
                    placeholder="e.g. Rescheduled to 2 December 2026 to accommodate students' examinations..."
                    className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Supporting Details / Note
                    </label>
                    <textarea
                      rows={2}
                      value={scheduleMessage}
                      onChange={(e) => setScheduleMessage(e.target.value)}
                      placeholder="e.g. Your class schedule will be shared soon. Thank you for your cooperation!"
                      className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Schedule Update Subtitle
                    </label>
                    <input
                      type="text"
                      value={scheduleSubtitle}
                      onChange={(e) => setScheduleSubtitle(e.target.value)}
                      placeholder="Schedule Update & Timings"
                      className="w-full px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Live Student View Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Student View Preview</p>
                <div className="p-3 rounded-xl border border-blue-500/20 bg-white dark:bg-[#0a0f1c] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#0060aa] dark:text-blue-400">{scheduleBatchLabel || "SKILLYUG BOOTCAMP 3.0"}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{scheduleStatusBadge}</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{scheduleHeading || "Cohort Launch & Schedule"}</p>
                  </div>
                  <div className="shrink-0">
                    <p className="font-black text-slate-900 dark:text-white text-sm">{formatScheduleDisplayDate(scheduleStartDate)}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{scheduleWeekday} • Batch Starting Date</p>
                  </div>
                  <div className="max-w-xs text-[11px]">
                    <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{scheduleHeadline || "Announcement Headline"}</p>
                    <p className="text-slate-500 line-clamp-1">{scheduleMessage || "Supporting details..."}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={scheduleActive}
                    onChange={(e) => setScheduleActive(e.target.checked)}
                    className="rounded text-[#0060aa] focus:ring-[#0060aa]"
                  />
                  <span>Publish to Students</span>
                </label>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  disabled={isSavingSchedule}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {isSavingSchedule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Save & Publish Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation Toolbar */}
        <div className="border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "students"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Users className="w-4 h-4" />
              Students ({students.length})
            </button>

            <button
              onClick={() => setActiveTab("recordings")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "recordings"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Video className="w-4 h-4" />
              Recordings ({recordings.length})
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "certificates"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Award className="w-4 h-4" />
              Certificates ({issuedCerts.length})
            </button>

            {isBootcamp3 && (
              <button
                onClick={() => setActiveTab("audit")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "audit"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <History className="w-4 h-4" />
                Audit Trail ({auditLogs.length})
              </button>
            )}
          </div>

          {activeTab === "students" && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/10 outline-none focus:ring-1 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                />
              </div>
              {isBootcamp3 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(true);
                    setAddStudentError("");
                    setAddStudentSuccess("");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add Student</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: Enrolled Students */}
        {activeTab === "students" && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {isBootcamp3 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-6">Parents</th>
                      <th className="py-4 px-6">Contact & Grade</th>
                      <th className="py-4 px-6">Fee Status</th>
                      <th className="py-4 px-6">Class Access</th>
                      <th className="py-4 px-6">Certificate</th>
                      <th className="py-4 px-6">Enrolled Date</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No students found for this cohort.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st, idx) => {
                        const fs = st.feeStatus;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-6">
                              <p className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{st.email}</p>
                            </td>
                            <td className="py-4 px-6">
                              {fs?.fatherName || fs?.motherName ? (
                                <div className="space-y-0.5 text-[11px]">
                                  <p className="text-slate-800 dark:text-slate-200">
                                    <span className="text-slate-400 font-medium">F:</span> {fs.fatherName || "—"}
                                  </p>
                                  <p className="text-slate-800 dark:text-slate-200">
                                    <span className="text-slate-400 font-medium">M:</span> {fs.motherName || "—"}
                                  </p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleOpenStudentModal(st)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff8b12] hover:underline"
                                >
                                  + Add Parents
                                </button>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{st.phone || "—"}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">Grade: {st.grade_class || "—"}</p>
                            </td>
                            <td className="py-4 px-6">
                              {fs ? (
                                <div className="space-y-1">
                                  <div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                      fs.remainingBalanceRupees === 0
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                    }`}>
                                      {fs.remainingBalanceRupees === 0 ? "Fully Paid" : `₹${fs.remainingBalanceRupees.toLocaleString("en-IN")} Due`}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                    ₹{fs.amountPaidRupees.toLocaleString("en-IN")} / ₹{fs.totalFeeRupees.toLocaleString("en-IN")}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {fs?.isBlocked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  <ShieldAlert className="w-3 h-3" />
                                  BLOCKED
                                </span>
                              ) : fs?.isLocked ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    <Lock className="w-3 h-3" />
                                    LOCKED
                                  </span>
                                  {fs.paymentDeadline && (
                                    <p className="text-[10px] text-slate-400">
                                      Due: {formatEnrollmentDate(fs.paymentDeadline)}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <Unlock className="w-3 h-3" />
                                  UNLOCKED
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              {st.certificate?.downloaded ? (
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Downloaded
                                  </span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                      {st.certificate.cert_id}
                                    </span>
                                    <Link
                                      href={`/verify/${st.certificate.cert_id}`}
                                      target="_blank"
                                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                                    >
                                      Verify <ExternalLink className="w-2.5 h-2.5" />
                                    </Link>
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                  <Clock className="w-3 h-3" />
                                  Not Downloaded
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                              {formatEnrollmentDate(st.created_at)}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenStudentModal(st)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-6">Contact</th>
                      <th className="py-4 px-6">Grade</th>
                      <th className="py-4 px-6">Payment</th>
                      <th className="py-4 px-6">Promo Code</th>
                      <th className="py-4 px-6">Certificate</th>
                      <th className="py-4 px-6">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No students found for this cohort.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{st.email}</p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{st.phone || "—"}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                            {st.grade_class || "—"}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {st.payment_status || "captured"}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {st.promo_code || "—"}
                          </td>
                          <td className="py-4 px-6">
                            {st.certificate?.downloaded ? (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Downloaded
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                    {st.certificate.cert_id}
                                  </span>
                                  <Link
                                    href={`/verify/${st.certificate.cert_id}`}
                                    target="_blank"
                                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                                  >
                                    Verify <ExternalLink className="w-2.5 h-2.5" />
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                <Clock className="w-3 h-3" />
                                Not Downloaded
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                            {formatEnrollmentDate(st.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Session Recordings */}
        {activeTab === "recordings" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  YouTube Synchronization
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  {batch.youtube_playlist_id ? (
                    <>Connected to playlist <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{batch.youtube_playlist_id}</span>. Clicking sync fetches latest videos, creates new database entries, and clears deleted videos.</>
                  ) : (
                    "No playlist is currently configured in batches table for this cohort."
                  )}
                </p>
              </div>

              <button
                onClick={handleSyncVideos}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shrink-0"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Sync Batch Recordings
                  </>
                )}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Video Title</th>
                      <th className="py-4 px-6">Custom Date</th>
                      <th className="py-4 px-6">YouTube Video ID</th>
                      <th className="py-4 px-6">Published At</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {recordings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No session recordings present for {batch.name}.
                        </td>
                      </tr>
                    ) : (
                      recordings.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm max-w-md truncate">
                            {rec.title}
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-350">
                            {rec.custom_date || "—"}
                          </td>
                          <td className="py-4 px-6 font-mono text-blue-600 dark:text-blue-400 font-bold">
                            {rec.youtube_video_id}
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                            {new Date(rec.published_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <a
                              href={`https://www.youtube.com/watch?v=${rec.youtube_video_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff8b12] hover:underline"
                            >
                              Watch
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Certificate Management */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Cohort Certificate Release
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  {certsUnlocked
                    ? "Certificates are currently UNLOCKED for this cohort. Eligible students can generate, view and download their verified PDF certificates."
                    : "Certificates are currently LOCKED. Direct API requests and downloads by students are blocked until you release them."}
                </p>
              </div>

              <button
                onClick={handleToggleCertificates}
                disabled={isTogglingCert}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shrink-0 ${
                  certsUnlocked
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isTogglingCert ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : certsUnlocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Lock Certificates
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock Certificates Now
                  </>
                )}
              </button>
            </div>

            {/* Student Certificate Download Tracker */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#0060aa] dark:text-[#ff9d3b]" />
                      Student Certificate Download Status
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Track which enrolled students have generated/downloaded their certificate and who is pending.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Total: {students.length}
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Downloaded: {downloadedStudentsCount} ({students.length > 0 ? Math.round((downloadedStudentsCount / students.length) * 100) : 0}%)
                    </span>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Pending: {pendingStudentsCount}
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                    <button
                      onClick={() => setCertFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        certFilter === "all"
                          ? "bg-white dark:bg-[#0a0f1c] text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      All ({students.length})
                    </button>
                    <button
                      onClick={() => setCertFilter("downloaded")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        certFilter === "downloaded"
                          ? "bg-white dark:bg-[#0a0f1c] text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Downloaded ({downloadedStudentsCount})
                    </button>
                    <button
                      onClick={() => setCertFilter("pending")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        certFilter === "pending"
                          ? "bg-white dark:bg-[#0a0f1c] text-amber-600 dark:text-amber-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Not Downloaded ({pendingStudentsCount})
                    </button>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search student or cert ID..."
                      value={certSearchQuery}
                      onChange={(e) => setCertSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/10 outline-none focus:ring-1 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-6">Contact</th>
                      <th className="py-4 px-6">Certificate Status</th>
                      <th className="py-4 px-6">Certificate ID</th>
                      <th className="py-4 px-6">Issued Date</th>
                      <th className="py-4 px-6 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredCertStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No students match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCertStudents.map((st, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{st.grade_class || "Student"}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{st.email}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{st.phone || "—"}</p>
                          </td>
                          <td className="py-4 px-6">
                            {st.certificate?.downloaded ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Downloaded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Clock className="w-3.5 h-3.5" />
                                Not Downloaded
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-slate-800 dark:text-slate-200">
                            {st.certificate?.cert_id || "—"}
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                            {st.certificate?.issued_at
                              ? new Date(st.certificate.issued_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {st.certificate?.downloaded && st.certificate.cert_id ? (
                              <Link
                                href={`/verify/${st.certificate.cert_id}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                View / Verify
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Awaiting download</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-white/5">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                  Issued Certificates for {batch.name}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Student Name</th>
                      <th className="py-4 px-6">Certificate ID</th>
                      <th className="py-4 px-6">Issued Date</th>
                      <th className="py-4 px-6 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {issuedCerts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          No certificates issued yet for {batch.name}.
                        </td>
                      </tr>
                    ) : (
                      issuedCerts.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm">
                            {c.user_name}
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-[#0060aa] dark:text-[#ff9d3b]">
                            {c.cert_id}
                          </td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                            {new Date(c.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/verify/${c.cert_id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Verify
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Trail (Bootcamp 3.0) */}
        {activeTab === "audit" && isBootcamp3 && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md overflow-hidden shadow-sm space-y-4">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">Admin Activity & Audit Trail</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Immutable record of administrative actions, fee updates, block states, and class link modifications.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Admin</th>
                    <th className="py-4 px-6">Action</th>
                    <th className="py-4 px-6">Affected Student</th>
                    <th className="py-4 px-6">Previous Value</th>
                    <th className="py-4 px-6">Updated Value</th>
                    <th className="py-4 px-6">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No administrative actions recorded yet for this batch.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN") : "—"}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 dark:text-white">{log.adminName || "Admin"}</p>
                          <p className="text-[10px] text-slate-400">{log.adminEmail}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {log.studentName || log.studentEmail ? (
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{log.studentName || "—"}</p>
                              <p className="text-[10px] text-slate-400">{log.studentEmail}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400 max-w-xs truncate font-mono text-[11px]">
                          {log.previousValue || "—"}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200 max-w-xs truncate font-mono text-[11px]">
                          {log.updatedValue || "—"}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400 max-w-xs truncate text-[11px]">
                          {log.notes || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Student Management Modal (Bootcamp 3.0) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0a0f1c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Manage Student: {selectedStudent.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedStudent.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStudentUpdate} className="p-6 overflow-y-auto space-y-6 flex-grow">
              {studentActionStatus && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  studentActionStatus.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
                }`}>
                  {studentActionStatus.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {studentActionStatus.message}
                </div>
              )}

              {/* Section 1: Student Profile & Registration Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0060aa]" /> Student Profile & Registration
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10">
                      Enrolled: {formatEnrollmentDate(selectedStudent.created_at)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Student Full Name</label>
                    <input
                      type="text"
                      value={editStudentName}
                      onChange={(e) => setEditStudentName(e.target.value)}
                      placeholder="Student full name"
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Class / Grade</label>
                    <input
                      type="text"
                      value={editGradeClass}
                      onChange={(e) => setEditGradeClass(e.target.value)}
                      placeholder="e.g. 5th, 6th, 10th"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium">Email: </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Payment ID: </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{selectedStudent.razorpay_payment_id || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Promo: </span>
                    <span className="font-bold text-[#ff8b12]">{selectedStudent.promo_code || "None"}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Password Management (Reset Password) */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-500" /> Password Management
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Existing passwords are encrypted and never retrievable. You can assign a new temporary password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((prev) => !prev)}
                    className="text-xs font-bold text-[#0060aa] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {showResetPassword ? "Hide Reset" : "Reset Password"}
                  </button>
                </div>

                {resetPasswordStatus && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    resetPasswordStatus.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
                  }`}>
                    {resetPasswordStatus.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {resetPasswordStatus.message}
                  </div>
                )}

                {showResetPassword && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 space-y-3 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        New Temporary Password (min 6 characters)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewTempPassword ? "text" : "password"}
                          value={newTemporaryPassword}
                          onChange={(e) => setNewTemporaryPassword(e.target.value)}
                          placeholder="Enter new temporary password"
                          className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl bg-white dark:bg-[#0a0f1c] border border-amber-200 dark:border-amber-900/40 outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewTempPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          {showNewTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleResetStudentPassword}
                        disabled={isResettingPassword || !newTemporaryPassword || newTemporaryPassword.length < 6}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isResettingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                        Assign New Temporary Password
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Parents Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#ff8b12]" /> Parent Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Father&apos;s Full Name</label>
                    <input
                      type="text"
                      value={editFatherName}
                      onChange={(e) => setEditFatherName(e.target.value)}
                      placeholder="Enter father's full name"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mother&apos;s Full Name</label>
                    <input
                      type="text"
                      value={editMotherName}
                      onChange={(e) => setEditMotherName(e.target.value)}
                      placeholder="Enter mother's full name"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Fee & Access Configuration */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> Course Fee & Payment Access
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Course Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editTotalFee}
                      onChange={(e) => setEditTotalFee(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount Paid (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={editAmountPaid}
                      onChange={(e) => setEditAmountPaid(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Remaining Balance</label>
                    <div className="px-3.5 py-2.5 text-xs font-black rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400">
                      ₹{Math.max(0, editTotalFee - editAmountPaid).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Days Allowed To Pay</label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={editDaysAllowed}
                      onChange={(e) => setEditDaysAllowed(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Deadline Date</label>
                    <input
                      type="date"
                      value={editPaymentDeadline}
                      onChange={(e) => setEditPaymentDeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Student Blocking Control */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" /> Restrict / Block Student Access
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Blocking immediately revokes live class access regardless of payment status.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsBlocked}
                      onChange={(e) => setEditIsBlocked(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {editIsBlocked && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-semibold text-rose-600 dark:text-rose-400">Block Reason (Recorded in Audit Trail)</label>
                    <input
                      type="text"
                      value={editBlockReason}
                      onChange={(e) => setEditBlockReason(e.target.value)}
                      placeholder="e.g. Disciplinary hold, fees overdue"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStudent}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Student Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Student Modal (Bootcamp 3.0) */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-[#0a0f1c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0060aa] dark:text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Add New Student (Bootcamp 3.0)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Only Name, Email, and Initial Password are mandatory.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 overflow-y-auto space-y-5 flex-grow">
              {addStudentError && (
                <div className="p-4 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {addStudentError}
                </div>
              )}
              {addStudentSuccess && (
                <div className="p-4 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {addStudentSuccess}
                </div>
              )}

              {/* 3 Mandatory Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Student Full Name <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Mandatory</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Email Address <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Mandatory (Login Email)</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Initial Password <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Min 6 chars</span>
                  </label>
                  <div className="relative">
                    <input
                      type={addShowPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="Create temporary login password"
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setAddShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      {addShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Fields Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setAddShowOptional((prev) => !prev)}
                  className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#0060aa] py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#ff8b12]" />
                    Additional Details (Optional & Can be added later)
                  </span>
                  {addShowOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {addShowOptional && (
                  <div className="space-y-4 pt-3 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Phone Number</label>
                        <input
                          type="text"
                          value={addPhone}
                          onChange={(e) => setAddPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Class / Grade</label>
                        <input
                          type="text"
                          value={addGradeClass}
                          onChange={(e) => setAddGradeClass(e.target.value)}
                          placeholder="e.g. 5th, 6th"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Father&apos;s Full Name</label>
                        <input
                          type="text"
                          value={addFatherName}
                          onChange={(e) => setAddFatherName(e.target.value)}
                          placeholder="Father's name"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Mother&apos;s Full Name</label>
                        <input
                          type="text"
                          value={addMotherName}
                          onChange={(e) => setAddMotherName(e.target.value)}
                          placeholder="Mother's name"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Total Fee (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={addTotalFee}
                          onChange={(e) => setAddTotalFee(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Amount Paid (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={addAmountPaid}
                          onChange={(e) => setAddAmountPaid(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Days Allowed</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={addDaysAllowed}
                          onChange={(e) => setAddDaysAllowed(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingStudent}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isAddingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create & Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sensitive Action Confirmation Dialog (with Admin Re-Authentication) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0f1c] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-6 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {confirmDialog.message}
            </p>

            {confirmDialog.requiresPassword && (
              <div className="mt-4 text-left space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#0060aa]" /> Administrator Authorization
                </label>
                <input
                  type="password"
                  placeholder="Enter administrator password (or CONFIRM if OAuth)"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-[#0060aa] text-slate-900 dark:text-white"
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Sensitive actions (passwords, fee adjustments, and access blocks) strictly require server-side administrator authorization.
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setConfirmDialog(null);
                  setAdminPasswordInput("");
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const pwd = adminPasswordInput;
                  setAdminPasswordInput("");
                  confirmDialog.onConfirm(pwd);
                }}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

