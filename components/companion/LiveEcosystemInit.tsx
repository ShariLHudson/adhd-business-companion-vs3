"use client";

import { useEffect } from "react";
import { registerLiveEcosystemListeners } from "@/lib/companionJudgmentClient";

/**
 * Boot Live Ecosystem listeners once per companion session.
 */
export function LiveEcosystemInit() {
  useEffect(() => {
    registerLiveEcosystemListeners();
  }, []);
  return null;
}
