"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ZigzagPattern } from "@/components/ZigzagPattern";
import { markOnboarded } from "@/lib/onboarding";

export default function WelcomePage() {
  const router = useRouter();

  function handleGetStarted() {
    markOnboarded();
    router.replace("/");
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background md:items-center md:justify-center md:py-10">
      <div className="flex w-full flex-1 flex-col overflow-hidden bg-white md:min-h-[720px] md:max-w-sm md:flex-none md:rounded-[32px] md:shadow-xl md:ring-1 md:ring-slate-100">
        <div className="relative flex h-[52dvh] min-h-75 shrink-0 items-end overflow-hidden bg-brand-600 md:h-95">
          <span
            className="absolute -top-16 -right-14 h-56 w-56 rounded-full border-[28px] border-white/15"
            aria-hidden
          />
          <ZigzagPattern className="absolute top-10 left-6 h-24 w-40 text-white" />
          <ZigzagPattern className="absolute -right-2 bottom-8 h-24 w-40 rotate-180 text-white" />
        </div>

        <div className="flex flex-1 flex-col px-6 pt-8 pb-safe">
          <h1 className="text-[28px] leading-tight font-bold text-slate-900">Manage What To Do</h1>
          <p className="mt-3 text-[15px] text-slate-500">
            The best way to manage what you have to do, don&apos;t forget your plans
          </p>
          <div className="flex-1" />
          <Button size="lg" className="mb-8 w-full" onClick={handleGetStarted}>
            Get Started
          </Button>
        </div>
      </div>
    </main>
  );
}
