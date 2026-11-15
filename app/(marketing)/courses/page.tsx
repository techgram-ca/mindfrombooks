import type { Metadata } from "next";
import { CourseFilter } from "@/components/marketing/course-filter";
import { getPublishedCourses } from "@/lib/queries/catalog";

export const metadata: Metadata = {
  title: "All courses",
  description:
    "Daily-action courses on money, discipline, AI, health, focus and communication. One small task a day, with a one-click refund guarantee.",
  alternates: { canonical: "/courses" },
};

export default async function CoursesPage() {
  const courses = await getPublishedCourses();
  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-semibold sm:text-5xl">Courses</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
        Each course is a set number of days, and each day is one small action. Pick the change you
        want most.
      </p>
      <CourseFilter courses={courses} />
    </div>
  );
}
