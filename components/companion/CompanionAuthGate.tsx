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

  // Never replace the app shell with a blocking screen while auth resolves —
  // that made production feel frozen when bootstrap was slow. Redirect only
  // after loading finishes and there is no session.
  if (configured && !loading && !user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Redirecting to sign in…
      </main>
    );
  }

  return (
    <>
      {children}
      {configured && loading ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-3 z-[200] flex justify-center px-4"
          aria-live="polite"
        >
          <p className="rounded-full bg-[#1e4f4f]/90 px-4 py-2 text-sm font-medium text-white shadow-lg">
            Loading your account…
          </p>
        </div>
      ) : null}
    </>
  );
}
