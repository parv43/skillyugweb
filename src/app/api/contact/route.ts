import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX_REQUESTS = 3;
const submissionLog = new Map<string, number[]>();

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getRateLimitKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown-ip";
  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  return `${forwardedFor.split(",")[0]?.trim() ?? "unknown-ip"}:${userAgent}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const recentAttempts =
    submissionLog.get(key)?.filter((timestamp) => now - timestamp < CONTACT_RATE_LIMIT_WINDOW_MS) ?? [];

  if (recentAttempts.length >= CONTACT_RATE_LIMIT_MAX_REQUESTS) {
    submissionLog.set(key, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  submissionLog.set(key, recentAttempts);
  return false;
}

function isValidPhoneNumber(phone: string) {
  return /^[0-9+\-\s()]{10,20}$/.test(phone);
}

export async function POST(request: Request) {
  try {
    const key = getRateLimitKey(request);
    if (isRateLimited(key)) {
      return NextResponse.json(
        { error: "Too many messages sent recently. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      company?: string;
      message?: string;
      name?: string;
      phone?: string;
      role?: string;
    };

    const company = typeof body.company === "string" ? body.company.trim() : "";
    if (company) {
      return NextResponse.json({ success: true });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const role = typeof body.role === "string" ? body.role.trim() : "Not Specified";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Enter a valid phone number before submitting." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { error } = await supabaseAdmin.from("contact_messages").insert([
      {
        message: message.slice(0, 2000),
        name: name.slice(0, 120),
        phone: phone.slice(0, 20),
        role: role && role !== "Select Option" ? role.slice(0, 120) : "Not Specified",
      },
    ]);

    if (error) {
      console.error("Contact form submission failed:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form route error:", error);
    return NextResponse.json(
      { error: "Server error while sending message. Please try again later." },
      { status: 500 }
    );
  }
}
