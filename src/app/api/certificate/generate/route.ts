import { NextResponse } from "next/server";
import { createCanvas, loadImage, registerFont } from "canvas";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";

// Initialize Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Increase Vercel function timeout to 60s — cold starts download fonts + generate PDFs
export const maxDuration = 60;

const BACKGROUND_URL =
  "https://ueexbcwngwqtgtlbnmtp.supabase.co/storage/v1/object/public/assets/Demo_Session_Certificate%20.png";
const VERIFICATION_BASE_URL = "https://www.skillyugedu.com/verify/";

// Alex Brush — elegant calligraphic font from Google Fonts.
const FONT_URL =
  "https://fonts.gstatic.com/s/alexbrush/v23/SZc83FzrJKuqFbwMKk6EtUI.ttf";

// Lato — Clean, professional font for the ID.
const ID_FONT_URL = 
  "https://fonts.gstatic.com/s/lato/v25/S6uyw4BMUTPHvxk.ttf";

let fontRegistered = false;

/**
 * Downloads MonteCarlo TTF from Google Fonts CDN and registers it with node-canvas.
 * Cached in /tmp so it is only downloaded once per cold start.
 * Without this, fillText() silently renders invisible glyphs on Linux (Vercel).
 */
async function ensureFontRegistered() {
  if (fontRegistered) return;

  const fontPath = path.join(os.tmpdir(), "alexbrush.ttf");
  const idFontPath = path.join(os.tmpdir(), "lato_regular_v25.ttf");

  if (!fs.existsSync(fontPath)) {
    const res = await fetch(FONT_URL);
    if (!res.ok) throw new Error(`Failed to download font: ${res.status}`);
    fs.writeFileSync(fontPath, Buffer.from(await res.arrayBuffer()));
  }
  
  if (!fs.existsSync(idFontPath)) {
    const res = await fetch(ID_FONT_URL);
    if (!res.ok) throw new Error(`Failed to download ID font: ${res.status}`);
    fs.writeFileSync(idFontPath, Buffer.from(await res.arrayBuffer()));
  }

  // Register fonts
  registerFont(fontPath, { family: "AlexBrush" });
  registerFont(idFontPath, { family: "Lato" });
  fontRegistered = true;
}

/**
 * Renders a single certificate PDF for a given name.
 * Returns the public Supabase URL of the uploaded PDF.
 */
async function generateCertificatePdf(
  name: string,
  userId: string | null,
  background: Awaited<ReturnType<typeof loadImage>>,
  suffix: string = ""  // e.g. "-S" for student, "-P" for parent — prevents filename collisions
): Promise<{ downloadUrl: string; certId: string }> {
  const width = background.width;   // 2000
  const height = background.height; // 1414

  // Unique cert ID — suffix (-S / -P) ensures student and parent never share a filename
  const certId = `SY-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${Date.now().toString().slice(-4)}${suffix}`;

  // Canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(background, 0, 0, width, height);

  // ── Name ──────────────────────────────────────────────────────────────────
  // Alex Brush — elegant calligraphic script. 110px reads beautifully on 2000px canvas.
  ctx.font = "110px 'AlexBrush'";
  ctx.fillStyle = "#1a3a6b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const formattedName = name
    .trim()
    .split(/\s+/)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // 49% of 1414px ≈ 692px — right above the orange underline
  ctx.fillText(formattedName, width / 2, height * 0.49);

  // ── QR Code ───────────────────────────────────────────────────────────────
  const verificationUrl = `${VERIFICATION_BASE_URL}${certId}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    width: 220,
    color: { dark: "#1e293b", light: "#ffffff" },
  });
  const qrImage = await loadImage(qrDataUrl);

  const qrSize = 220;
  const qrX = width - qrSize - 150;  // bottom-right white area
  const qrY = height - qrSize - 140;
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // ── Certificate ID ────────────────────────────────────────────────────────
  // Using registered Lato font — clean, professional, and consistent across servers.
  ctx.font = "22px 'Lato'";
  ctx.fillStyle = "#4b5563"; // slate-600
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`ID: ${certId}`, qrX + qrSize / 2, qrY + qrSize + 32);

  // ── PDF ───────────────────────────────────────────────────────────────────
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [width, height],
  });
  pdf.addImage(imgData, "JPEG", 0, 0, width, height);
  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  // ── Upload to Supabase ────────────────────────────────────────────────────
  const fileName = `${certId}.pdf`;
  const { error: storageError } = await supabase.storage
    .from("assets")
    .upload(fileName, pdfBuffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: true,
    });
  if (storageError) throw new Error(`Storage upload failed: ${storageError.message}`);

  const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(fileName);

  // ── Record in DB ──────────────────────────────────────────────────────────
  const { error: dbError } = await supabase.from("issued_certificates").insert([
    {
      user_name: name,
      cert_id: certId,
      user_id: userId || null,
    },
  ]);
  if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

  console.log(`[cert] Generated ${certId} for "${name}"`);
  return { downloadUrl: publicUrl, certId };
}

export async function POST(request: Request) {
  try {
    // Accept studentName + parentName; fall back to legacy `name` field
    const body = await request.json();
    const studentName: string = (body.studentName || body.name || "").trim();
    const parentName: string = (body.parentName || "").trim();
    const userId: string | null = body.userId || null;

    if (!studentName) {
      return NextResponse.json({ error: "Student name is required" }, { status: 400 });
    }

    await ensureFontRegistered();

    // Load background once — shared between both certificates
    const background = await loadImage(BACKGROUND_URL);

    // Always generate student certificate (suffix -S)
    const studentCert = await generateCertificatePdf(studentName, userId, background, "-S");

    // Generate parent certificate only if a parent name was provided.
    // We await student first so timestamps differ even without an explicit delay.
    let parentCert: { downloadUrl: string; certId: string } | null = null;
    if (parentName) {
      // 1ms delay guarantees Date.now() differs from the student cert timestamp
      await new Promise(r => setTimeout(r, 1));
      parentCert = await generateCertificatePdf(parentName, userId, background, "-P");
    }

    return NextResponse.json({
      success: true,
      student: studentCert,
      parent: parentCert,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate certificate";
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
