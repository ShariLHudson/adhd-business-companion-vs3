"use client";

import { useEffect, useState } from "react";
import { getPrefs, type VisualMode } from "@/lib/companionStore";

/** Subscribes to `companion-prefs-updated` so appearance changes apply without refresh. */
export function useVisualMode(): VisualMode {
  const [mode, setMode] = useState<VisualMode>("off");

  useEffect(() => {
    setMode(getPrefs().visualMode);
    const sync = () => setMode(getPrefs().visualMode);
    window.addEventListener("companion-prefs-updated", sync);
    return () => window.removeEventListener("companion-prefs-updated", sync);
  }, []);

  return mode;
}
