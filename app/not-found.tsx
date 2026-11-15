import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-narrow flex min-h-dvh flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-4xl" aria-hidden>
        🔖
      </div>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">This page isn&apos;t in the book. Let&apos;s get you back.</p>
      <Button asChild className="mt-6">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
