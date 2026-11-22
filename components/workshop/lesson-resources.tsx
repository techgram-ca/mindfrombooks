"use client";
import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Info } from "lucide-react";
import { toast } from "sonner";
import type { LessonResource } from "@/lib/types";
import { cn } from "@/lib/utils";

type Os = "windows" | "mac" | "linux";
const OS_LABEL: Record<Os, string> = { windows: "Windows", mac: "Mac", linux: "Linux" };

function detectOs(): Os {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "mac";
  if (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) return "linux";
  return "windows";
}

function CopyBlock({ r }: { r: LessonResource }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(r.content);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select the text and copy it manually.");
    }
  }
  const isPrompt = r.kind === "prompt";
  return (
    <div className="border-border overflow-hidden rounded-2xl border">
      <div
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-2.5",
          isPrompt ? "bg-accent-soft" : "bg-surface-muted",
        )}
      >
        <p className="text-sm font-semibold">
          <span className="text-muted-foreground mr-2 text-xs font-semibold tracking-wider uppercase">
            {isPrompt ? "Prompt" : "Command"}
          </span>
          {r.label}
        </p>
        <button
          type="button"
          onClick={copy}
          className="border-border bg-surface hover:bg-surface-muted inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium"
        >
          {copied ? (
            <Check className="text-success size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className={cn(
          "max-h-96 overflow-auto px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]",
          isPrompt ? "bg-surface font-sans" : "bg-[#172033] font-mono text-[#e8eaf0]",
        )}
      >
        {r.content}
      </pre>
    </div>
  );
}

/** Copy-able prompts, per-OS commands, links and notes for a lesson. */
export function LessonResources({ resources }: { resources: LessonResource[] }) {
  const [os, setOs] = useState<Os>("windows");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only value, read once after mount
    setOs(detectOs());
  }, []);

  const osSpecific = resources.filter((r) => r.kind === "command" && r.os && r.os !== "all");
  const available = (Object.keys(OS_LABEL) as Os[]).filter((o) =>
    osSpecific.some((r) => r.os === o),
  );
  const visible = resources.filter(
    (r) => !(r.kind === "command" && r.os && r.os !== "all" && r.os !== os),
  );

  if (resources.length === 0) return null;
  return (
    <div className="space-y-4">
      {available.length > 1 && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted-foreground text-sm">Your computer:</span>
          <div
            className="bg-surface-muted inline-flex rounded-full p-1"
            role="group"
            aria-label="Choose your operating system"
          >
            {available.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOs(o)}
                aria-pressed={os === o}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium",
                  os === o ? "bg-surface shadow-soft text-foreground" : "text-muted-foreground",
                )}
              >
                {OS_LABEL[o]}
              </button>
            ))}
          </div>
        </div>
      )}
      {available.length === 1 && !available.includes(os) && (
        <p className="text-muted-foreground text-sm">
          This command is for {OS_LABEL[available[0]]} only — on other computers, skip it.
        </p>
      )}
      {(available.length === 1 && !available.includes(os) ? resources : visible).map((r, i) => {
        if (r.kind === "link") {
          return (
            <a
              key={i}
              href={r.content}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-surface hover:bg-surface-muted flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 font-medium"
            >
              {r.label}
              <ExternalLink className="text-muted-foreground size-4 shrink-0" aria-hidden />
            </a>
          );
        }
        if (r.kind === "note") {
          return (
            <div
              key={i}
              className="bg-info-soft text-foreground flex items-start gap-3 rounded-2xl px-4 py-3 text-[15px]"
            >
              <Info className="text-info mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                <span className="font-semibold">{r.label}: </span>
                {r.content}
              </p>
            </div>
          );
        }
        return <CopyBlock key={i} r={r} />;
      })}
    </div>
  );
}
