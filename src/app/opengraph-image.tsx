import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#f7f6f3",
          color: "#0f2f55",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 38, fontWeight: 700, marginBottom: 44 }}>alutta</div>
        <div style={{ maxWidth: 900, fontSize: 76, lineHeight: 1.02, fontWeight: 700, letterSpacing: "-1px" }}>
          Your study abroad journey, simplified.
        </div>
        <div style={{ maxWidth: 760, marginTop: 30, fontSize: 30, lineHeight: 1.3, color: "#49627a" }}>
          Applications, payments, visas, housing, travel, and settlement support for international students.
        </div>
        <div style={{ marginTop: 54, display: "flex", gap: 16, fontSize: 24, color: "#13CA58", fontWeight: 700 }}>
          <span>Plan</span>
          <span>•</span>
          <span>Fund</span>
          <span>•</span>
          <span>Settle</span>
        </div>
      </div>
    ),
    size
  );
}
