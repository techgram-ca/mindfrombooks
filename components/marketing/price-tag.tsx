import { cn } from "@/lib/utils";
import { formatUsd, percentOff } from "@/lib/pricing";

/**
 * Selling price, with the actual price struck through and "N% off" when the
 * course is discounted.
 */
export function PriceTag({
  priceCents,
  listPriceCents,
  className,
  priceClassName,
  badgeClassName,
}: {
  priceCents: number;
  listPriceCents?: number | null;
  className?: string;
  priceClassName?: string;
  badgeClassName?: string;
}) {
  const off = percentOff(listPriceCents, priceCents);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={priceClassName}>{priceCents === 0 ? "Free" : formatUsd(priceCents)}</span>
      {off > 0 && listPriceCents && (
        <>
          <span className="text-[0.8em] font-normal line-through opacity-60">
            <span className="sr-only">was </span>
            {formatUsd(listPriceCents)}
          </span>
          <span
            className={cn(
              "bg-success-soft text-success self-center rounded-full px-2 py-0.5 font-sans text-xs font-semibold",
              badgeClassName,
            )}
          >
            {off}% off
          </span>
        </>
      )}
    </span>
  );
}
