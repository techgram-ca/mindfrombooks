import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="container-page py-5">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pt-4 pb-16 sm:items-center sm:pt-0">
        <div className="border-border bg-surface shadow-soft w-full max-w-md rounded-3xl border p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
