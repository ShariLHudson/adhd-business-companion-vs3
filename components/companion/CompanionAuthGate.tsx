"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";

/** Unauthenticated visitors always go to sign-in before using the app. */
export function CompanionAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { loading, user } = useCompanionAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/companion/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Loading your account…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Redirecting to sign in…
      </main>
    );
  }

  return <>{children}</>;
}
