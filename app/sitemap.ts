import type { MetadataRoute } from "next";
import { getPublishedCourses } from "@/lib/queries/catalog";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/courses",
    "/all-access",
    "/guarantee",
    "/how-it-works",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/refund-policy",
  ];
  let courses: Awaited<ReturnType<typeof getPublishedCourses>> = [];
  try {
    courses = await getPublishedCourses();
  } catch {
    courses = [];
  }
  return [
    ...staticPaths.map((p) => ({
      url: siteUrl(p),
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...courses.map((c) => ({
      url: siteUrl(`/courses/${c.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
