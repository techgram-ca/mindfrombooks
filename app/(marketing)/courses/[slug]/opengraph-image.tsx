import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/lib/og";
import { getCourseBySlug } from "@/lib/queries/catalog";

export const alt = "mindfrombooks course";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getCourseBySlug(slug);
  const course = detail?.course;
  return new ImageResponse(
    <OgCard
      eyebrow={course ? `${course.days}-day course · one task a day` : "Daily-action course"}
      title={course?.name ?? "mindfrombooks"}
      footer="One-click refund guarantee"
      accent={course?.accent_color}
    />,
    size,
  );
}
