"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";

/** Unauthenticated visitors go to sign-in when Supabase auth is configured. */
export function CompanionAuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { configured, loading, user } = useCompanionAuth();

  useEffect(() => {
    if (configured && !loading && !user) {
      router.replace("/companion/login");
    }
  }, [configured, loading, user, router]);

  if (configured && loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Loading your account…
      </main>
    );
  }

  if (configured && !user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Redirecting to sign in…
      </main>
    );
  }

  return <>{children}</>;
}
