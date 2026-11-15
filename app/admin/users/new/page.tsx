import type { Metadata } from "next";
import Link from "next/link";
import { CreateUserForm } from "@/components/admin/misc-forms";
import { AdminHeader } from "@/components/admin/ui";
import { Card, CardBody } from "@/components/ui/card";
import { getAllCourses } from "@/lib/queries/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Create user" };

export default async function NewUserPage() {
  await requireAdmin();
  const courses = (await getAllCourses()).filter((c) => c.status !== "archived");
  return (
    <>
      <Link href="/admin/users" className="text-muted-foreground hover:text-foreground text-sm">
        ← Users
      </Link>
      <div className="mt-2">
        <AdminHeader
          title="Create user & grant access"
          description="For testers, friends and giveaways. They get an email with a link to set a password. Free access is never refundable."
        />
      </div>
      <Card className="max-w-xl">
        <CardBody>
          <CreateUserForm
            courses={courses.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))}
          />
        </CardBody>
      </Card>
      <p className="text-muted-foreground mt-4 max-w-xl text-sm">
        If the email already has an account, the courses are simply added to it. For someone new,
        each course waits for them to tap Start, so Day 1 lands in their own timezone.
      </p>
    </>
  );
}
