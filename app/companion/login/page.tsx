"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { CompanionSignInForm } from "@/components/companion/CompanionSignInForm";
import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";

export default function CompanionLoginPage() {
  const router = useRouter();
  const { configured, loading, user } = useCompanionAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/companion");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] text-[#6b635a]">
        Loading…
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f5f0e8] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#d4cdc3] bg-white p-6 shadow-sm">
        <p className="text-center text-sm font-medium text-[#6b635a]">
          Spark Studio Companion
        </p>
        <h1 className="mt-3 text-center text-2xl font-semibold text-[#1f1c19]">
          Welcome
        </h1>
        <p className="mt-2 text-center text-sm text-[#6b635a]">
          Sign in or create your account to open your Companion.
        </p>
        <div className="mt-6">
          <CompanionSignInForm
            initialMode="signup"
            onSuccess={() => router.replace("/companion")}
          />
        </div>
        {!configured ? (
          <p className="mt-6 text-center text-sm text-[#6b635a]">
            <Link
              href="/companion"
              className="font-medium text-[#1e4f4f] hover:underline"
            >
              Continue without signing in
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
