import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { HttpError } from "@/lib/auth";
import type { Product } from "@/lib/coupons";
import type { Bundle, Course } from "@/lib/types";

export interface ResolvedProduct {
  kind: "course" | "bundle";
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  /** The course itself, or every course in the bundle (by sort order). */
  courses: Course[];
  path: string;
}

export function toCouponProduct(p: ResolvedProduct): Product {
  return { kind: p.kind, id: p.id };
}

/**
 * Load what is being bought, with its current price, straight from the DB.
 * `requirePublished` is on for new checkouts and off when fulfilling a payment
 * that has already been taken.
 */
export async function resolveProduct(
  ref: { courseId?: string | null; bundleId?: string | null },
  requirePublished = true,
): Promise<ResolvedProduct> {
  const db = createAdminClient();
  if (ref.courseId) {
    const { data } = await db.from("courses").select("*").eq("id", ref.courseId).maybeSingle();
    const course = data as Course | null;
    if (!course || (requirePublished && course.status !== "published")) {
      throw new HttpError(404, "That course isn't available.");
    }
    return {
      kind: "course",
      id: course.id,
      slug: course.slug,
      name: course.name,
      priceCents: course.price_cents,
      courses: [course],
      path: `/courses/${course.slug}`,
    };
  }
  if (ref.bundleId) {
    const { data } = await db.from("bundles").select("*").eq("id", ref.bundleId).maybeSingle();
    const bundle = data as Bundle | null;
    if (!bundle || (requirePublished && bundle.status !== "published")) {
      throw new HttpError(404, "That bundle isn't available.");
    }
    const { data: links } = await db
      .from("bundle_courses")
      .select("course_id")
      .eq("bundle_id", bundle.id);
    const ids = (links ?? []).map((l) => l.course_id as string);
    let query = db.from("courses").select("*").in("id", ids).order("sort_order");
    if (requirePublished) query = query.eq("status", "published");
    const { data: courses } = await query;
    if (!courses || courses.length === 0) throw new HttpError(404, "That bundle isn't available.");
    return {
      kind: "bundle",
      id: bundle.id,
      slug: bundle.slug,
      name: bundle.name,
      priceCents: bundle.price_cents,
      courses: courses as Course[],
      path: `/${bundle.slug}`,
    };
  }
  throw new HttpError(400, "Choose a course or the bundle.");
}
