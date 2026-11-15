"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AdminResult } from "@/app/admin/actions";

/** Shared save handling for admin forms: pending state, toast, inline error. */
export function useSave() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save(run: () => Promise<AdminResult>, onDone?: (result: AdminResult) => void) {
    setError(null);
    start(async () => {
      const result = await run();
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      if (result.message) toast.success(result.message);
      onDone?.(result);
      router.refresh();
    });
  }

  return { pending, error, save };
}
