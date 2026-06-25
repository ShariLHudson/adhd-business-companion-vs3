"use client";

import { useCallback, useMemo, useState } from "react";
import type { BrainDumpEntry } from "@/lib/companionStore";
import { getThoughtCollections } from "./collections";
import {
  getArchivedThoughts,
  getSessionThoughts,
  getThinkingSpaceThoughts,
} from "./queries";

export function useThinkingSpace(sessionId?: string) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const thoughts = useMemo((): BrainDumpEntry[] => {
    void tick;
    return sessionId
      ? getSessionThoughts(sessionId)
      : getThinkingSpaceThoughts();
  }, [tick, sessionId]);

  const allThoughts = useMemo((): BrainDumpEntry[] => {
    void tick;
    return getThinkingSpaceThoughts();
  }, [tick]);

  const archived = useMemo((): BrainDumpEntry[] => {
    void tick;
    return getArchivedThoughts();
  }, [tick]);

  const collections = useMemo(() => {
    void tick;
    return getThoughtCollections();
  }, [tick]);

  return {
    thoughts,
    allThoughts,
    archived,
    collections,
    refresh,
  };
}
