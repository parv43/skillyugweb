import { createClient } from "@supabase/supabase-js";
import {
  getRequiredEnv,
  parseBookingOrderNotes,
  type BookingType,
  type RazorpayOrder,
  type RazorpayPayment,
} from "@/lib/razorpayServer";

interface DemoFallbackDetails {
  email?: string | null;
  phoneNumber?: string | null;
  studentName?: string | null;
  userId?: string | null;
}

interface SlotFallbackDetails extends DemoFallbackDetails {
  gradeClass?: string | null;
  promoCode?: string | null;
}

interface PersistBookingOptions<TFallback> {
  expectedBookingType: BookingType;
  fallbackDetails?: TFallback;
  order: RazorpayOrder;
  payment: RazorpayPayment;
}

function cleanString(value?: string | null) {
  return value?.trim() ? value.trim() : null;
}

function normalizePromoCode(value?: string | null) {
  const cleaned = cleanString(value);
  if (!cleaned || cleaned === "NONE") {
    return null;
  }
  return cleaned.toUpperCase();
}

function normalizeUserId(value?: string | null) {
  const cleaned = cleanString(value);
  if (!cleaned) {
    return null;
  }

  return /^[0-9a-fA-F-]{36}$/.test(cleaned) ? cleaned : null;
}

function createSupabaseAdmin() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

export async function persistDemoBooking({
  expectedBookingType,
  fallbackDetails,
  order,
  payment,
}: PersistBookingOptions<DemoFallbackDetails>) {
  const notes = parseBookingOrderNotes(order.notes);
  const bookingType = notes.bookingType ?? expectedBookingType;
  if (bookingType !== expectedBookingType) {
    throw new Error("Booking type mismatch detected during payment persistence.");
  }

  const studentName = cleanString(notes.studentName) ?? cleanString(fallbackDetails?.studentName);
  const phoneNumber = cleanString(notes.phoneNumber) ?? cleanString(fallbackDetails?.phoneNumber);
  const email = cleanString(notes.email) ?? cleanString(fallbackDetails?.email);
  const userId = normalizeUserId(notes.userId) ?? normalizeUserId(fallbackDetails?.userId);

  if (!studentName || !phoneNumber) {
    throw new Error("Booking details are incomplete. Contact support with your payment ID.");
  }

  const supabaseAdmin = createSupabaseAdmin();
  const { error } = await supabaseAdmin.from("demo_bookings").upsert(
    {
      amount_paid: payment.amount,
      currency: payment.currency,
      email,
      name: studentName,
      payment_status: payment.status,
      phone: phoneNumber,
      razorpay_order_id: order.id,
      razorpay_payment_id: payment.id,
      user_id: userId,
    },
    {
      onConflict: "razorpay_payment_id",
    }
  );

  if (error) {
    throw error;
  }
}

export async function persistSlotBooking({
  expectedBookingType,
  fallbackDetails,
  order,
  payment,
}: PersistBookingOptions<SlotFallbackDetails>) {
  const notes = parseBookingOrderNotes(order.notes);
  const bookingType = notes.bookingType ?? expectedBookingType;
  if (bookingType !== expectedBookingType) {
    throw new Error("Booking type mismatch detected during payment persistence.");
  }

  const studentName = cleanString(notes.studentName) ?? cleanString(fallbackDetails?.studentName);
  const phoneNumber = cleanString(notes.phoneNumber) ?? cleanString(fallbackDetails?.phoneNumber);
  const email = cleanString(notes.email) ?? cleanString(fallbackDetails?.email);
  const gradeClass = cleanString(notes.gradeClass) ?? cleanString(fallbackDetails?.gradeClass);
  const promoCode =
    normalizePromoCode(notes.promoCode) ?? normalizePromoCode(fallbackDetails?.promoCode);
  const userId = normalizeUserId(notes.userId) ?? normalizeUserId(fallbackDetails?.userId);

  if (!studentName || !phoneNumber || !gradeClass) {
    throw new Error("Booking details are incomplete. Contact support with your payment ID.");
  }

  const supabaseAdmin = createSupabaseAdmin();
  const { error } = await supabaseAdmin.from("slot_bookings").upsert(
    {
      amount_paid: payment.amount,
      currency: payment.currency,
      email,
      grade_class: gradeClass,
      name: studentName,
      payment_status: payment.status,
      phone: phoneNumber,
      promo_code: promoCode,
      razorpay_order_id: order.id,
      razorpay_payment_id: payment.id,
      user_id: userId,
    },
    {
      onConflict: "razorpay_payment_id",
    }
  );

  if (error) {
    throw error;
  }
}
