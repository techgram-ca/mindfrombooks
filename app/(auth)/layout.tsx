import type { ReactNode } from "react";
import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="container-page py-5">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pt-4 pb-16 sm:items-center sm:pt-0">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
