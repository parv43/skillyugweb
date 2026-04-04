/**
 * Email Validation Utility
 * Blocks disposable email domains and suggests corrections for common typos.
 */

export const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "grr.la",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mohmal.com",
  "sharklasers.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempail.com",
  "tempemail.cc",
  "tempinbox.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
]);

export const COMMON_TYPOS: Record<string, string> = {
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gnail.com": "gmail.com",
  "outlok.com": "outlook.com",
  "outluk.com": "outlook.com",
  "yaho.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "icloud.con": "icloud.com",
  "iclud.com": "icloud.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
};

export interface ValidationResult {
  error?: string;
  suggestion?: string;
}

/**
 * Validates an email address and suggests corrections.
 * @param email The email address to validate.
 * @returns {ValidationResult}
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const [, domain] = email.toLowerCase().split("@");

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { error: "Access denied: Temporary/fake email providers are not allowed for security reasons." };
  }

  if (COMMON_TYPOS[domain]) {
    return { suggestion: COMMON_TYPOS[domain] };
  }

  return {};
}
