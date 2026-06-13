"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** Opens the sign-in sheet when the URL has ?signin=1 (e.g. from a thank-you page). */
export function CompanionSignInFromQuery({ onOpen }: { onOpen: () => void }) {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("signin") === "1") onOpen();
  }, [params, onOpen]);

  return null;
}
