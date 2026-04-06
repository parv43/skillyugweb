import crypto from "node:crypto";

export type BookingType = "demo_booking" | "slot_booking";

export interface RazorpayPayment {
  amount: number;
  contact?: string | null;
  currency: string;
  email?: string | null;
  id: string;
  notes?: Record<string, unknown> | null;
  order_id: string | null;
  status: string;
}

export interface RazorpayOrder {
  amount: number;
  currency: string;
  id: string;
  notes?: Record<string, unknown> | null;
}

export interface BookingOrderNotes {
  bookingType?: BookingType;
  email?: string | null;
  gradeClass?: string | null;
  phoneNumber?: string | null;
  promoCode?: string | null;
  studentName?: string | null;
  userId?: string | null;
}

interface RazorpayErrorPayload {
  error?: {
    description?: string;
  };
}

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function signaturesMatch(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

export function getRazorpayAuthHeader() {
  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const expectedSignature = crypto
    .createHmac("sha256", getRequiredEnv("RAZORPAY_KEY_SECRET"))
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return signaturesMatch(expectedSignature, signature);
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string) {
  const secret = getRequiredEnv("RAZORPAY_WEBHOOK_SECRET");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return signaturesMatch(expectedSignature, signature);
}

async function parseRazorpayResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | RazorpayErrorPayload;

  if (!response.ok) {
    const description =
      (data as RazorpayErrorPayload)?.error?.description ||
      "Razorpay request failed. Please try again.";
    throw new Error(description);
  }

  return data as T;
}

export async function fetchRazorpayOrder(orderId: string) {
  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: getRazorpayAuthHeader(),
    },
    cache: "no-store",
  });

  return parseRazorpayResponse<RazorpayOrder>(response);
}

export async function fetchRazorpayPayment(paymentId: string) {
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: getRazorpayAuthHeader(),
      },
      cache: "no-store",
    }
  );

  return parseRazorpayResponse<RazorpayPayment>(response);
}

export async function captureRazorpayPayment(paymentId: string, amount: number, currency: string) {
  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: getRazorpayAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
      }),
      cache: "no-store",
    }
  );

  return parseRazorpayResponse<RazorpayPayment>(response);
}

export async function ensureCapturedRazorpayPayment(payment: RazorpayPayment) {
  if (payment.status === "captured") {
    return payment;
  }

  if (payment.status !== "authorized") {
    throw new Error(`Unexpected payment status: ${payment.status}`);
  }

  try {
    return await captureRazorpayPayment(payment.id, payment.amount, payment.currency);
  } catch (error) {
    const latestPayment = await fetchRazorpayPayment(payment.id);
    if (latestPayment.status === "captured") {
      return latestPayment;
    }

    throw error;
  }
}

export function parseBookingOrderNotes(notes: unknown): BookingOrderNotes {
  if (!notes || typeof notes !== "object") {
    return {};
  }

  const record = notes as Record<string, unknown>;
  const bookingType =
    record.booking_type === "demo_booking" || record.booking_type === "slot_booking"
      ? record.booking_type
      : undefined;

  const readString = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;

  return {
    bookingType,
    email: readString(record.email),
    gradeClass: readString(record.grade_class),
    phoneNumber: readString(record.phone_number),
    promoCode: readString(record.promo_code),
    studentName: readString(record.student_name),
    userId: readString(record.user_id),
  };
}
