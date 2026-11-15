import type { Metadata } from "next";
import { Logo } from "@/components/shared/logo";
import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

// The page only shows a button. Nothing changes until it is pressed, so email
// scanners that pre-open links can't unsubscribe anyone by accident.
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; t?: string }>;
}) {
  const { u = "", t = "" } = await searchParams;
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="container-page py-5">
        <Logo />
      </header>
      <main className="container-narrow flex flex-1 flex-col justify-center pb-24">
        <UnsubscribeForm u={u} t={t} />
      </main>
    </div>
  );
}
