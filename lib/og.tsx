/** Shared layout for Open Graph images (rendered with next/og). */
import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 };

export function OgCard({
  eyebrow,
  title,
  footer,
  accent = "#C8892B",
}: {
  eyebrow: string;
  title: string;
  footer: string;
  accent?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#FBF7F0",
        padding: 72,
        borderTop: `18px solid ${accent}`,
        color: "#172033",
      }}
    >
      <div style={{ display: "flex", fontSize: 30, color: accent, fontWeight: 600 }}>{eyebrow}</div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 40 ? 68 : 86,
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: -2,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30 }}>
        <div style={{ display: "flex", fontWeight: 700 }}>mindfrombooks</div>
        <div style={{ display: "flex", color: "#586175" }}>{footer}</div>
      </div>
    </div>
  );
}
