import { NextResponse } from "next/server";
import { createCanvas, loadImage, registerFont } from "canvas";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Initialize Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BACKGROUND_URL = "https://ueexbcwngwqtgtlbnmtp.supabase.co/storage/v1/object/public/assets/Skillyug_Blank_Demo_Certificate.png";
const VERIFICATION_BASE_URL = "https://www.skillyugedu.com/verify/";

export async function POST(request: Request) {
  try {
    const { name, userId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // 1. Generate Unique ID
    const certId = `SY-${crypto.randomBytes(3).toString("hex").toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // 2. Fetch Blank Canvas
    const background = await loadImage(BACKGROUND_URL);
    const width = background.width;
    const height = background.height;

    // 3. Set Up Digital Canvas
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Draw Background
    ctx.drawImage(background, 0, 0, width, height);

    // 4. Layer Information - The Student Name
    // NOTE: 'Snell Roundhand' is a macOS system font not available in node-canvas.
    // We use italic Georgia instead — a reliable serif font that is always available
    // in the canvas package and looks elegant on the certificate.
    ctx.font = "italic 96px 'Georgia', serif";
    ctx.fillStyle = "#1a3a6b"; // Match the dark blue used elsewhere in the certificate
    ctx.textAlign = "center";

    // Format name: proper title case with single space between words
    let formattedName = name.trim();
    formattedName = formattedName
      .split(/\s+/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Position name in the blank area between "This is presented to:" and the orange line.
    // At 2000x1414px the sweet spot is approximately 47% of height (~665px).
    const nameY = height * 0.47;
    ctx.fillText(formattedName, width / 2, nameY);

    // 5. Generate and Layer QR Code
    const verificationUrl = `${VERIFICATION_BASE_URL}${certId}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 250,
      color: {
        dark: "#1e293b",
        light: "#ffffff00" // Transparent background
      }
    });
    const qrImage = await loadImage(qrDataUrl);
    
    // Position QR Code (Shifted left and up as requested)
    const qrSize = 200;
    const qrX = width - qrSize - 160;
    const qrY = height - qrSize - 160;
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // 6. Layer Certificate ID below the QR code — font size must be large enough to
    // read on a 2000px canvas (18px was microscopic; 28px is the minimum readable size).
    ctx.font = "28px 'Courier New', Courier, monospace";
    ctx.fillStyle = "#475569";
    ctx.textAlign = "center";
    // Centre the ID under the QR code for a cleaner look
    const qrCenterX = qrX + qrSize / 2;
    ctx.fillText(`ID: ${certId}`, qrCenterX, height - 110);

    // 7. "Print" the Final PDF
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [width, height]
    });
    pdf.addImage(imgData, "JPEG", 0, 0, width, height);
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // 8. Store PDF in Supabase Storage
    const fileName = `${certId}.pdf`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from("assets")
      .upload(fileName, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true
      });

    if (storageError) throw storageError;

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("assets")
      .getPublicUrl(fileName);

    // 9. Log in Database
    const { error: dbError } = await supabase
      .from("issued_certificates")
      .insert([
        {
          user_name: name,
          cert_id: certId,
          user_id: userId || null
        }
      ]);

    if (dbError) throw dbError;

    // 10. Return Download Link
    return NextResponse.json({ 
      success: true, 
      downloadUrl: publicUrl,
      certId: certId
    });

  } catch (error: any) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate certificate" }, { status: 500 });
  }
}
