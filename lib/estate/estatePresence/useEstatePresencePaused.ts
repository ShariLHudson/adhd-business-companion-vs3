"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/welcomeRoom/arrival";

/** Pause presence when tab hidden or member prefers reduced motion. */
export function useEstatePresencePaused(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return hidden || prefersReducedMotion();
}
