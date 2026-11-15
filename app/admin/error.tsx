"use client";
import { ErrorView } from "@/components/shared/error-view";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorView reset={reset} title="This admin page didn't load" />;
}
