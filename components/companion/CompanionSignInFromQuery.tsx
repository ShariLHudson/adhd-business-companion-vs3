"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/** Opens the sign-in sheet when the URL has ?signin=1 (e.g. from a thank-you page). */
export function CompanionSignInFromQuery({ onOpen }: { onOpen: () => void }) {
  const params = useSearchParams();
  const openedRef = useRef(false);

  useEffect(() => {
    if (params.get("signin") !== "1" || openedRef.current) return;
    openedRef.current = true;
    onOpen();
  }, [params, onOpen]);

  return null;
}
