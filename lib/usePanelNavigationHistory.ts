"use client";

import { useCallback, useState } from "react";
import { formatAppBackLabel } from "./navigationBack";
import {
  popPanelNavigationFrame,
  pushPanelNavigationFrame,
  type PanelNavigationFrame,
} from "./panelNavigationStack";

export type { PanelNavigationFrame };

/**
 * Stack-based panel navigation — preserves scroll/search/filter context on back.
 */
export function usePanelNavigationHistory<T>(initial: T) {
  const [snapshot, setSnapshot] = useState<T>(initial);
  const [frames, setFrames] = useState<PanelNavigationFrame<T>[]>([]);

  const push = useCallback(
    (next: T, backDestination: string) => {
      setFrames((prev) =>
        pushPanelNavigationFrame(prev, snapshot, next, backDestination).frames,
      );
      setSnapshot(next);
    },
    [snapshot],
  );

  const pop = useCallback((): boolean => {
    let restored = false;
    setFrames((prev) => {
      const result = popPanelNavigationFrame(prev);
      if (result.snapshot !== null) {
        setSnapshot(result.snapshot);
        restored = true;
      }
      return result.frames;
    });
    return restored;
  }, []);

  const reset = useCallback((next: T) => {
    setFrames([]);
    setSnapshot(next);
  }, []);

  const activeBackDestination = frames.at(-1)?.backDestination ?? null;
  const activeBackLabel = activeBackDestination
    ? formatAppBackLabel(activeBackDestination)
    : null;

  return {
    snapshot,
    setSnapshot,
    push,
    pop,
    reset,
    canGoBack: frames.length > 0,
    activeBackDestination,
    activeBackLabel,
    depth: frames.length,
  };
}
