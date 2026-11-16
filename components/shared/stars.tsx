import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star display. The label carries the value for screen readers. */
export function Stars({ value, className }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn(
            "size-4",
            n <= rounded ? "fill-accent text-accent" : "text-border fill-transparent",
          )}
        />
      ))}
    </span>
  );
}
