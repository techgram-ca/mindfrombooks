"use client";
import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminResult } from "@/app/admin/actions";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Runs a bound server action, shows the result as a toast and refreshes the page. */
export function ActionButton({
  action,
  confirm,
  children,
  ...props
}: Omit<ButtonProps, "onClick"> & {
  action: () => Promise<AdminResult>;
  confirm?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      {...props}
      disabled={pending || props.disabled}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          const result = await action();
          if (result.error) toast.error(result.error);
          else {
            if (result.message) toast.success(result.message);
            router.refresh();
          }
        });
      }}
    >
      {pending && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}
