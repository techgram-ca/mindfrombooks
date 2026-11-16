"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatUsd } from "@/lib/pricing";
import { track } from "@/lib/track";

interface Props {
  product: { kind: "course" | "bundle"; id: string; slug: string; name: string };
  priceCents: number;
  /** Small line under the button, e.g. the start-date promise. */
  note?: string;
  showStickyBar?: boolean;
}

interface Applied {
  code: string;
  finalCents: number;
  discountCents: number;
}

/** Reads ?code= from the URL, so wrap it in <Suspense> on static pages. */
export function EnrollPanel({ product, priceCents, note, showStickyBar = true }: Props) {
  const router = useRouter();
  const initialCode = useSearchParams().get("code")?.slice(0, 40) ?? "";
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [showCode, setShowCode] = useState(Boolean(initialCode));
  const [applied, setApplied] = useState<Applied | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [owned, setOwned] = useState<string | null>(null);
  const autoApplied = useRef(false);

  const productKey =
    product.kind === "course" ? { courseId: product.id } : { bundleId: product.id };
  const returnPath =
    (product.kind === "course" ? `/courses/${product.slug}` : `/${product.slug}`) +
    (applied ? `?code=${encodeURIComponent(applied.code)}` : "");

  const applyCode = useCallback(
    async (raw: string) => {
      const value = raw.trim().toUpperCase();
      if (!value) return;
      setChecking(true);
      setCodeError(null);
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: value, ...productKey }),
        });
        const data = (await res.json()) as {
          valid?: boolean;
          finalCents?: number;
          discountCents?: number;
          message?: string;
          error?: string;
        };
        if (res.ok && data.valid && data.finalCents != null) {
          setApplied({
            code: value,
            finalCents: data.finalCents,
            discountCents: data.discountCents ?? 0,
          });
          track("coupon_applied", { code: value, product: product.slug });
        } else {
          setApplied(null);
          setCodeError(data.message ?? data.error ?? "That code didn't work.");
        }
      } catch {
        setCodeError("Couldn't check that code. Check your connection and try again.");
      } finally {
        setChecking(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- productKey is derived from product.id
    [product.id, product.kind, product.slug],
  );

  useEffect(() => {
    track("course_viewed", { product: product.slug });
    if (initialCode && !autoApplied.current) {
      autoApplied.current = true;
      void applyCode(initialCode);
    }
  }, [applyCode, initialCode, product.slug]);

  async function enroll() {
    setEnrolling(true);
    track("checkout_started", { product: product.slug, code: applied?.code ?? null });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...productKey,
          code: applied?.code,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (res.status === 401) {
        router.push(`/signup?next=${encodeURIComponent(returnPath)}`);
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string; owned?: boolean };
      if (res.status === 409 && data.owned && data.url) {
        setOwned(data.url);
        toast.info(data.error ?? "You already have this course.");
        setEnrolling(false);
        return;
      }
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Couldn't start checkout. Please try again.");
        setEnrolling(false);
        return;
      }
      // May be an external Stripe Checkout URL, so do a full navigation.
      window.location.assign(data.url);
    } catch {
      toast.error("Couldn't start checkout. Check your connection and try again.");
      setEnrolling(false);
    }
  }

  const finalCents = applied ? applied.finalCents : priceCents;
  const isFree = finalCents === 0;
  const cta = isFree ? "Enroll free" : `Enroll · ${formatUsd(finalCents)}`;

  const price = (
    <div className="flex items-baseline gap-2">
      <span className="font-serif text-3xl font-semibold">
        {isFree ? "Free" : formatUsd(finalCents)}
      </span>
      {applied && applied.discountCents > 0 && (
        <span className="text-muted-foreground text-base line-through">
          {formatUsd(priceCents)}
        </span>
      )}
      {!isFree && <span className="text-muted-foreground text-sm">one-time</span>}
    </div>
  );

  return (
    <>
      <div
        id="enroll"
        className="rounded-card border-border bg-surface shadow-soft scroll-mt-28 border p-5 sm:p-6"
      >
        {price}
        {applied && (
          <p className="bg-success-soft text-success mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium">
            <Tag className="size-3.5" aria-hidden />
            {applied.code} applied
            <button
              type="button"
              onClick={() => {
                setApplied(null);
                setCode("");
              }}
              aria-label="Remove code"
              className="hover:bg-success/15 rounded-full p-0.5"
            >
              <X className="size-3.5" />
            </button>
          </p>
        )}

        {owned ? (
          <Button asChild size="lg" className="mt-4 w-full">
            <Link href={owned}>Go to your course</Link>
          </Button>
        ) : (
          <Button size="lg" className="mt-4 w-full" onClick={enroll} disabled={enrolling}>
            {enrolling && <Loader2 className="animate-spin" aria-hidden />}
            {enrolling ? "One moment…" : cta}
          </Button>
        )}
        {note && <p className="text-muted-foreground mt-3 text-center text-sm">{note}</p>}

        {!applied &&
          (showCode ? (
            <form
              className="mt-4"
              onSubmit={(e) => {
                e.preventDefault();
                void applyCode(code);
              }}
            >
              <Label htmlFor="coupon">Discount code</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={40}
                  aria-invalid={Boolean(codeError)}
                  aria-describedby={codeError ? "coupon-error" : undefined}
                />
                <Button type="submit" variant="outline" disabled={checking || !code.trim()}>
                  {checking ? <Loader2 className="animate-spin" aria-hidden /> : "Apply"}
                </Button>
              </div>
              {codeError && (
                <p id="coupon-error" role="alert" className="text-danger mt-2 text-sm">
                  {codeError}
                </p>
              )}
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowCode(true)}
              className="text-accent-strong mt-3 w-full text-center text-sm font-medium underline-offset-4 hover:underline"
            >
              Have a code?
            </button>
          ))}
      </div>

      {showStickyBar && !owned && (
        <div className="border-border bg-surface/95 pb-safe fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-muted-foreground text-sm">
                {isFree ? "Free with your code" : `${formatUsd(finalCents)} · refund guarantee`}
              </p>
            </div>
            <Button onClick={enroll} disabled={enrolling}>
              {enrolling ? <Loader2 className="animate-spin" aria-hidden /> : "Enroll"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
