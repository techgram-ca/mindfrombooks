import { ImageResponse } from "next/og";
import { getCertificate } from "@/lib/queries/certificates";

/**
 * Certificate image. Default is the 1200×630 link preview; `?format=story`
 * returns a 1080×1920 image sized for an Instagram story.
 */
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cert = await getCertificate(id);
  if (!cert) return new Response("Not found", { status: 404 });
  const story = new URL(request.url).searchParams.get("format") === "story";
  const size = story ? { width: 1080, height: 1920 } : { width: 1200, height: 630 };
  const scale = story ? 1.5 : 1;
  const all = cert.certificate.days_completed >= cert.totalDays;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FBF7F0",
        color: "#172033",
        padding: 60 * scale,
        borderTop: `${22 * scale}px solid ${cert.accentColor}`,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", fontSize: 30 * scale, fontWeight: 700 }}>mindfrombooks</div>
      <div
        style={{
          display: "flex",
          marginTop: 28 * scale,
          fontSize: 20 * scale,
          letterSpacing: 6,
          color: "#586175",
        }}
      >
        CERTIFICATE OF COMPLETION
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 26 * scale,
          fontSize: 72 * scale,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        {cert.certificate.name_on_certificate}
      </div>
      <div
        style={{ display: "flex", marginTop: 22 * scale, fontSize: 26 * scale, color: "#586175" }}
      >
        showed up and did the work in
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 14 * scale,
          fontSize: 50 * scale,
          fontWeight: 700,
          color: cert.accentColor,
        }}
      >
        {cert.courseName}
      </div>
      <div style={{ display: "flex", marginTop: 22 * scale, fontSize: 28 * scale }}>
        {all
          ? `All ${cert.totalDays} days completed`
          : `${cert.certificate.days_completed} of ${cert.totalDays} days completed`}
        {` · ${cert.issuedLabel}`}
      </div>
      {story && (
        <div style={{ display: "flex", marginTop: 120, fontSize: 34, color: "#586175" }}>
          Books teach. Daily action changes you.
        </div>
      )}
    </div>,
    { ...size, headers: { "cache-control": "public, max-age=3600, s-maxage=86400" } },
  );
}
