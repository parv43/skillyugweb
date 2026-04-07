export const PAYMENT_SUPPORT_NOTICE_KEY = "skillyug_payment_support_notice";
export const PAYMENT_SUPPORT_NOTICE_TTL_MS = 30 * 60 * 1000;

export function markPaymentSupportNoticePending() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PAYMENT_SUPPORT_NOTICE_KEY,
    JSON.stringify({
      createdAt: Date.now(),
    })
  );
}

export function clearPaymentSupportNotice() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PAYMENT_SUPPORT_NOTICE_KEY);
}

export function hasActivePaymentSupportNotice() {
  if (typeof window === "undefined") {
    return false;
  }

  const rawValue = window.localStorage.getItem(PAYMENT_SUPPORT_NOTICE_KEY);
  if (!rawValue) {
    return false;
  }

  try {
    const parsed = JSON.parse(rawValue) as { createdAt?: number };
    if (
      typeof parsed.createdAt !== "number" ||
      Date.now() - parsed.createdAt > PAYMENT_SUPPORT_NOTICE_TTL_MS
    ) {
      window.localStorage.removeItem(PAYMENT_SUPPORT_NOTICE_KEY);
      return false;
    }

    return true;
  } catch {
    window.localStorage.removeItem(PAYMENT_SUPPORT_NOTICE_KEY);
    return false;
  }
}
