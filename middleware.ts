import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isDev = process.env.NODE_ENV !== "production";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
  const supabaseWsOrigin = supabaseUrl ? `wss://${new URL(supabaseUrl).host}` : "";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com https://*.razorpay.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    [
      "img-src 'self' data: blob:",
      "https://images.unsplash.com",
      "https://api.dicebear.com",
      "https://lh3.googleusercontent.com",
      supabaseOrigin,
    ].filter(Boolean).join(" "),
    [
      "connect-src 'self'",
      isDev ? "ws: http:" : null,
      supabaseOrigin,
      supabaseWsOrigin,
      "https://checkout.razorpay.com",
      "https://api.razorpay.com",
      "https://*.razorpay.com",
    ].filter(Boolean).join(" "),
    "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self' blob: data:",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Implement the safe compromise for Cache-Control to fix bfcache failures.
  const path = request.nextUrl.pathname;
  const isPrivate = path.startsWith("/api") || path.startsWith("/my-batch") || path.startsWith("/profile") || path.startsWith("/checkout");

  if (isPrivate) {
    // Keep strict for logged-in user dashboards and APIs
    response.headers.set("Cache-Control", "no-store, max-age=0");
  } else {
    // Safe compromise for public landing pages to boost performance
    response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
