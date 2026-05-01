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

// Updated to new certificate template
const BACKGROUND_URL =
  "https://ueexbcwngwqtgtlbnmtp.supabase.co/storage/v1/object/public/assets/Demo_Session_Certificate%20.png";
const VERIFICATION_BASE_URL = "https://www.skillyugedu.com/verify/";

// Google Fonts CDN URL for Lato Bold (works on Vercel/Linux — no system fonts needed)
// Lato Bold is elegant, professional, and guaranteed to render on any server.
const FONT_URL =
  "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPHA.ttf";

let fontRegistered = false;

/**
 * Downloads the font TTF from Google Fonts and registers it with node-canvas.
 * This is necessary because Vercel/Linux servers do NOT have Georgia, Snell Roundhand,
 * or most system fonts that work on macOS. Without this, fillText() silently renders
 * nothing (0px glyphs), which is why the name was invisible on the certificate.
 */
async function ensureFontRegistered() {
  if (fontRegistered) return;

  const fontPath = path.join(os.tmpdir(), "cert_lato_bold.ttf");

  // Download font only if not already cached in /tmp
  if (!fs.existsSync(fontPath)) {
    const res = await fetch(FONT_URL);
    if (!res.ok) throw new Error(`Failed to download font: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(fontPath, Buffer.from(arrayBuffer));
  }

  // Register font with node-canvas under the family name "CertFont"
  registerFont(fontPath, { family: "CertFont", weight: "bold" });
  fontRegistered = true;
}

export async function POST(request: Request) {
  try {
    const { name, userId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Ensure the custom font is downloaded and registered before drawing
    await ensureFontRegistered();

    // 1. Generate Unique Certificate ID
    const certId = `SY-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 2. Load the certificate background template (2000 x 1414 px)
    const background = await loadImage(BACKGROUND_URL);
    const width = background.width;   // 2000
    const height = background.height; // 1414

    // 3. Set up canvas and draw background
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(background, 0, 0, width, height);

    // 4. Draw the student name
    // Using the registered "CertFont" (Lato Bold italic) — guaranteed to work on all servers.
    // At 2000x1414px, 80px is clearly readable. Name sits at 46% height which is the
    // blank area between "This is presented to:" and the orange underline.
    ctx.font = "italic bold 80px 'CertFont', sans-serif";
    ctx.fillStyle = "#1a3a6b"; // Matches the dark blue color theme of the certificate
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Title-case the name
    const formattedName = name
      .trim()
      .split(/\s+/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // 46% of 1414 = ~650px — right in the blank name area, just above the orange underline
    const nameY = height * 0.46;
    ctx.fillText(formattedName, width / 2, nameY);

    // 5. Generate QR Code
    const verificationUrl = `${VERIFICATION_BASE_URL}${certId}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 220,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    });
    const qrImage = await loadImage(qrDataUrl);

    // QR positioned in the bottom-right white area of the certificate.
    // The new template has a safe white zone approximately at x:1600-1880, y:980-1340.
    const qrSize = 180;
    const qrX = width - qrSize - 110;   // ~1710px from left
    const qrY = height - qrSize - 100;  // ~1134px from top

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // 6. Draw Certificate ID just below the QR code
    // 26px on a 2000px canvas = clearly legible. Centered under the QR.
    ctx.font = "26px 'CertFont', monospace";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const qrCenterX = qrX + qrSize / 2;
    ctx.fillText(`ID: ${certId}`, qrCenterX, qrY + qrSize + 32);

    // 7. Convert canvas to PDF (landscape, exact certificate dimensions)
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [width, height],
    });
    pdf.addImage(imgData, "JPEG", 0, 0, width, height);
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // 8. Upload PDF to Supabase Storage (only service role can write — see RLS policy)
    const fileName = `${certId}.pdf`;
    const { error: storageError } = await supabase.storage
      .from("assets")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true,
      });

    if (storageError) throw storageError;

    // Get the public download URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("assets").getPublicUrl(fileName);

    // 9. Record the certificate in the database
    const { error: dbError } = await supabase
      .from("issued_certificates")
      .insert([
        {
          user_name: name,
          cert_id: certId,
          user_id: userId || null,
        },
      ]);

    if (dbError) throw dbError;

    // 10. Return the download URL and cert ID to the client
    return NextResponse.json({
      success: true,
      downloadUrl: publicUrl,
      certId: certId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate certificate";
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
