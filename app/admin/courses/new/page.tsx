import type { Metadata } from "next";
import { CourseForm } from "@/components/admin/course-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New course" };

export default async function NewCoursePage() {
  await requireAdmin();
  return (
    <>
      <AdminHeader
        title="New course"
        description="Starts as a draft. A placeholder task is created for every day."
      />
      <CourseForm />
    </>
  );
}
