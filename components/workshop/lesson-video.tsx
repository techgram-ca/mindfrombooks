"use client";
import { useState } from "react";
import { Loader2, Play } from "lucide-react";

/**
 * Click-to-load lesson video. The embed address is fetched from the server
 * only after the click, for an enrolled learner, so it is not in the page
 * HTML. The player runs in a sandbox without popups, so YouTube's "watch on
 * YouTube" links can't open, and an overlay covers the title bar.
 */
export function LessonVideo({
  enrollmentId,
  lesson,
  title,
}: {
  enrollmentId: string;
  lesson: number;
  title: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/video?enrollmentId=${enrollmentId}&lesson=${lesson}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as { src?: string; error?: string };
      if (!res.ok || !data.src)
        setError(data.error ?? "The video couldn't load. Please try again.");
      else setSrc(data.src);
    } catch {
      setError("The video couldn't load. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#172033]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {src ? (
        <>
          <iframe
            src={src}
            title={`Lesson ${lesson} video: ${title}`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
          {/* Covers the title bar (title, share, watch-later links). */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-14" />
        </>
      ) : (
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-3 text-white"
          aria-label={`Play the video for lesson ${lesson}: ${title}`}
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-[#172033] shadow-lg transition-transform group-hover:scale-105">
            {loading ? (
              <Loader2 className="size-7 animate-spin" aria-hidden />
            ) : (
              <Play className="ml-1 size-7" aria-hidden />
            )}
          </span>
          <span className="text-sm font-medium text-white/85">{error ?? "Watch the lesson"}</span>
        </button>
      )}
    </div>
  );
}
