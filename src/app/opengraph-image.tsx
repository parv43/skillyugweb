import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/seo"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "radial-gradient(circle at top left, rgba(59,130,246,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(168,85,247,0.28), transparent 35%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #111827 100%)",
          color: "white",
          padding: "56px",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "26px",
            borderRadius: "32px",
            border: "1px solid rgba(255,255,255,0.12)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 55%, #ec4899 100%)",
                boxShadow: "0 0 40px rgba(59,130,246,0.24)",
                fontWeight: 800,
                fontSize: "28px",
              }}
            >
              SY
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#93c5fd",
                }}
              >
                {siteConfig.name}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#cbd5e1",
                }}
              >
                AI Bootcamp for Students • Classes 6–12
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "860px",
            }}
          >
            <div
              style={{
                fontSize: "68px",
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: "-0.04em",
              }}
            >
              Learn AI Tools. Build Real Projects. Think Ahead.
            </div>
            <div
              style={{
                fontSize: "30px",
                lineHeight: 1.35,
                color: "#dbeafe",
                maxWidth: "920px",
              }}
            >
              Hands-on AI education for Indian school students with a 49 INR
              demo class and a 299 INR bootcamp spot booking.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
            }}
          >
            {["ChatGPT", "Canva AI", "Gamma", "Prompt Skills"].map((label) => (
              <div
                key={label}
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "12px 18px",
                  fontSize: "20px",
                  color: "#e2e8f0",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
