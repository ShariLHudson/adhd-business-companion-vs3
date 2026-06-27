"use client";

import { useEffect, useState } from "react";
import { todayStr } from "@/lib/companionStore";
import {
  COMPANION_JUDGMENT_UPDATED,
  readLiveJudgment,
} from "./liveJudgmentStore";
import { ensureLiveJudgment } from "./liveEcosystem";
import type { LiveJudgmentSnapshot } from "./types";

/**
 * Subscribe to live Companion Brain judgment — all workspaces share one truth.
 */
export function useLiveCompanionJudgment(): LiveJudgmentSnapshot {
  const dayKey = todayStr();
  const [snapshot, setSnapshot] = useState<LiveJudgmentSnapshot>(() => {
    const existing = readLiveJudgment();
    if (existing?.dayKey === dayKey) return existing;
    return ensureLiveJudgment().snapshot;
  });

  useEffect(() => {
    const existing = readLiveJudgment();
    if (!existing || existing.dayKey !== dayKey) {
      setSnapshot(ensureLiveJudgment().snapshot);
    }

    function onUpdate(event: Event) {
      const detail = (event as CustomEvent<LiveJudgmentSnapshot>).detail;
      if (detail?.dayKey === dayKey) {
        setSnapshot(detail);
      }
    }

    globalThis.window.addEventListener(COMPANION_JUDGMENT_UPDATED, onUpdate);
    return () =>
      globalThis.window.removeEventListener(COMPANION_JUDGMENT_UPDATED, onUpdate);
  }, [dayKey]);

  return snapshot;
}
