"use client";
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "bg-border data-[state=checked]:bg-success inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5.5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-6" />
    </SwitchPrimitive.Root>
  );
}
