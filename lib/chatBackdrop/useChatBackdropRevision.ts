"use client";

import { useEffect, useState } from "react";
import { subscribeChatBackdropChange } from "@/lib/chatBackdrop";

/**
 * Bumps when the member changes the photograph behind chat / Clear My Mind.
 * Use to re-resolve scene / homestead image without remounting chat chrome.
 */
export function useChatBackdropRevision(): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    return subscribeChatBackdropChange(() => {
      setRevision((n) => n + 1);
    });
  }, []);
  return revision;
}
