/**
 * commentSanitizer.ts
 * ───────────────────
 * Provides two utilities used by the comments API route:
 *   1. sanitizeComment()  – strips HTML tags, URLs & HTML entities.
 *   2. containsProfanity() – checks against a profanity list
 *                            (bad-words library + custom additions).
 *
 * This file runs ONLY on the server (API routes / Server Actions).
 */

// ── bad-words import ──────────────────────────────────────────────────────────
// The package uses CommonJS exports; the dynamic require below avoids ESM
import { Filter } from "bad-words";

// ── Additional words specific to Indian school context ────────────────────────
const EXTRA_BLOCKED_WORDS: string[] = [
  // Common Hindi profanity romanised (subset — extend as needed)
  "bc", "mc", "bkl", "chutiya", "madarchod", "behenchod", "randi",
  "kamina", "harami", "kutte", "kamine", "saala", "gandu", "bhosdike",
  // Leet-speak / intentional misspellings caught via normalisation
  "f4ck", "sh1t", "a55", "b1tch",
];

// Initialise filter with extras
const filter = new Filter();
filter.addWords(...EXTRA_BLOCKED_WORDS);

// ── URL pattern ───────────────────────────────────────────────────────────────
// Catches http(s)://, www., ftp://, and bare domain-like strings (e.g. evil.com/path)
const URL_PATTERN =
  /(?:https?:\/\/|ftp:\/\/|www\.)\S+|(?:[a-zA-Z0-9-]+\.(?:com|net|org|in|co|io|xyz|info|me|tv|online|club|shop|site|app|live|edu|gov|biz|mobi|pro)\b(?:\/\S*)?)/gi;

// ── HTML tag pattern ──────────────────────────────────────────────────────────
const HTML_TAG_PATTERN = /<[^>]*>/g;

// ── HTML entity decode map ────────────────────────────────────────────────────
const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#x2F;": "/",
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeHtmlEntities(text: string): string {
  return text.replace(
    /&(?:amp|lt|gt|quot|#x27|#x2F|#39|nbsp);/gi,
    (match) => HTML_ENTITIES[match] ?? match
  );
}

/**
 * Strips all HTML tags, URLs, and HTML entities from the raw comment text.
 * Returns clean plain-text ready to be stored.
 */
export function sanitizeComment(raw: string): string {
  let text = raw;

  // 1. Decode HTML entities first (reveals hidden tags / URLs)
  text = decodeHtmlEntities(text);

  // 2. Strip HTML tags
  text = text.replace(HTML_TAG_PATTERN, "");

  // 3. Strip URLs
  text = text.replace(URL_PATTERN, "");

  // 4. Re-strip any tags revealed after entity decode + URL removal
  text = text.replace(HTML_TAG_PATTERN, "");

  // 5. Collapse excessive whitespace and trim
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Returns true if the text contains any word on the profanity list.
 * Normalises leet-speak before checking:
 *   @ → a,  3 → e,  1 → i,  0 → o,  5 → s,  $ → s,  7 → t
 */
export function containsProfanity(text: string): boolean {
  // Check the raw text first
  if (filter.isProfane(text)) return true;

  // Normalise leet-speak and check again
  const normalised = text
    .toLowerCase()
    .replace(/@/g, "a")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/0/g, "o")
    .replace(/5/g, "s")
    .replace(/\$/g, "s")
    .replace(/7/g, "t");

  return filter.isProfane(normalised);
}
