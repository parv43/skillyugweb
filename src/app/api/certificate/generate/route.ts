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

    // 4. Layer Information - The Name (Using Snell Roundhand as requested)
    ctx.font = "120px 'Snell Roundhand', cursive"; 
    ctx.fillStyle = "#1e293b"; 
    ctx.textAlign = "center";
    
    // Format name: Fix missing spaces and casing
    let formattedName = name.trim();
    
    // If there's no space, try to find a split point or at least capitalize correctly
    if (!formattedName.includes(' ')) {
      // If it's all caps like TANUJPATHAK, we can't easily split, 
      // but we can at least make it Tanujpathak. 
      // However, usually users have a space in metadata.
      formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1).toLowerCase();
    } else {
      formattedName = formattedName
        .split(/\s+/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('  '); // Double space for cursive clarity
    }

    // Position name slightly above the orange line (Adjusted to ~52% of height)
    const nameY = height * 0.52; 
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

    // 6. Layer Certificate ID (Shifted left and up to follow QR code)
    ctx.font = "18px Courier";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";
    ctx.fillText(`Verify at skillyugedu.com/verify | ID: ${certId}`, width - 160, height - 140);

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
