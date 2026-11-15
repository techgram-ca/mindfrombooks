"use client";
import { Button } from "@/components/ui/button";

export function ErrorView({ reset, title }: { reset: () => void; title?: string }) {
  return (
    <div className="container-narrow flex min-h-[50dvh] flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-4xl" aria-hidden>
        📖
      </div>
      <h1 className="text-2xl font-semibold">{title ?? "This page lost its place"}</h1>
      <p className="text-muted-foreground mt-2">
        Something went wrong on our side. Your progress is safe — please try again.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
