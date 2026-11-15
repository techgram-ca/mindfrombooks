import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/types";

export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="divide-border rounded-card border-border bg-surface divide-y border">
      {items.map((item) => (
        <details key={item.q} className="group px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              className="text-muted-foreground size-4 shrink-0 transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="text-muted-foreground pb-5 text-[15px] leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
