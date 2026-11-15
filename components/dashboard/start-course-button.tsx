"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startCourseAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

export function StartCourseButton({
  enrollmentId,
  size = "md",
}: {
  enrollmentId: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size={size}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await startCourseAction(enrollmentId);
          if (result.error) toast.error(result.error);
          else {
            toast.success(result.message ?? "Started.");
            router.refresh();
          }
        })
      }
    >
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      Start this course
    </Button>
  );
}
