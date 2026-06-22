"use client";

import { useEffect, useState } from "react";
import { TrustInspectorView } from "@/components/trust/TrustInspectorView";
import { isTrustInspectorEnabled } from "@/lib/intelligence-layer/featureFlags";

/** Hidden trust validation view — not linked in user navigation. */
export default function TrustInspectorPage() {
  const [access, setAccess] = useState<"pending" | "allowed" | "blocked">(
    "pending",
  );

  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    const flagOn = isTrustInspectorEnabled();
    setAccess(isDev || flagOn ? "allowed" : "blocked");
  }, []);

  if (access === "pending") {
    return (
      <main className="mx-auto max-w-lg p-8 text-center text-sm text-[#6b635a]">
        Loading…
      </main>
    );
  }

  if (access === "blocked") {
    return (
      <main className="mx-auto max-w-lg p-8 text-center text-sm text-[#6b635a]">
        Trust Inspector is not available.
      </main>
    );
  }

  return <TrustInspectorView />;
}
