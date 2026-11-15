import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/lib/og";

export const alt = "mindfrombooks — Books teach. Daily action changes you.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Daily-action courses"
      title="Books teach. Daily action changes you."
      footer="One task a day · one-click refund guarantee"
    />,
    size,
  );
}
