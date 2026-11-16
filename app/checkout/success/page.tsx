import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SuccessPoller } from "@/components/dashboard/success-poller";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = { title: "You're in!", robots: { index: false } };

// Works logged out: people can pay first and create their account here.
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) redirect("/dashboard");
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="container-page py-5">
        <Logo />
      </header>
      <main className="container-narrow flex flex-1 flex-col items-center justify-center pb-24 text-center">
        <SuccessPoller sessionId={sessionId} />
      </main>
    </div>
  );
}
