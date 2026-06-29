import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load the coloured horizontal logo PNG as base64 for embedding in the OG image
function getLogoBase64(): string {
  try {
    const logoPath = path.join(process.cwd(), "public/brand/logo-horizontal-white-text.png");
    const data = fs.readFileSync(logoPath);
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return "";
  }
}

export default function Image() {
  const logoSrc = getLogoBase64();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#003024",
          padding: "64px 72px",
          fontFamily: "Arial, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle background pattern dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(19,202,88,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Green accent glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(2,155,71,0.35) 0%, transparent 70%)",
          }}
        />

        {/* Top: Logo */}
        <div style={{ display: "flex", alignItems: "center", zIndex: 1 }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="Alutta" height={48} style={{ display: "block" }} />
          ) : (
            <span style={{ fontSize: 36, fontWeight: 700, color: "#ffffff" }}>
              Alutta
            </span>
          )}
        </div>

        {/* Middle: Headline */}
        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-1.5px",
              maxWidth: 900,
            }}
          >
            Your study abroad journey, simplified.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "rgba(255,255,235,0.75)",
              lineHeight: 1.4,
              maxWidth: 780,
            }}
          >
            Applications, payments, visas, housing, travel, and settlement support for international students.
          </div>
        </div>

        {/* Bottom: Tags */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
          {["Plan", "Fund", "Settle"].map((tag, i) => (
            <div key={tag} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  background: "rgba(19,202,88,0.15)",
                  border: "1px solid rgba(19,202,88,0.4)",
                  borderRadius: 100,
                  padding: "10px 24px",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#13CA58",
                }}
              >
                {tag}
              </div>
              {i < 2 && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.25)" }} />
              )}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 20, color: "rgba(255,255,235,0.5)" }}>
            alutta.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
