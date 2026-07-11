"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useCompanionAuth } from "@/components/companion/CompanionAuthProvider";
import { canAccessFounderStudio } from "@/lib/founderStudio/founderAccess";

function FounderAccessLoading() {
  return (
    <main className="founder-access-loading">
      <p>Opening Founder Studio…</p>
    </main>
  );
}

function FounderAccessDenied() {
  return (
    <main className="founder-access-denied">
      <div className="founder-access-denied__card">
        <p className="founder-access-denied__eyebrow">Founder Studio</p>
        <h1>Founder access only</h1>
        <p>
          This private space is for Shari. Your member experience is unchanged
          — you can return to the Estate whenever you like.
        </p>
        <Link href="/companion" className="founder-access-denied__link">
          Back to Spark Estate
        </Link>
      </div>
    </main>
  );
}

/** Private guard — does not alter member routes or companion shell. */
export function FounderAccessGate({ children }: { children: ReactNode }) {
  const { loading, sessionChecked, user } = useCompanionAuth();
  const email = user?.email ?? null;

  if (!sessionChecked || loading) {
    return <FounderAccessLoading />;
  }

  if (!canAccessFounderStudio(email)) {
    return <FounderAccessDenied />;
  }

  return <>{children}</>;
}
