/**
 * Clear My Mind capture persist — save must succeed before completion UI.
 */

import {
  tryAddBrainDumps,
  type BrainDumpEntry,
} from "@/lib/companionStore";
import { isVisibleInMentalLandscape } from "@/lib/thoughtLifecycle";

export type PersistCapturedThoughtsResult =
  | {
      ok: true;
      created: BrainDumpEntry[];
      sessionEntries: BrainDumpEntry[];
      capturedCount: number;
    }
  | {
      ok: false;
      created: [];
      sessionEntries: BrainDumpEntry[];
      capturedCount: 0;
      error: "empty" | "save_failed";
    };

/**
 * Persist submitted thought parts for a capture session.
 * Returns ok only when every part is confirmed in storage.
 */
export function persistCapturedThoughts(input: {
  parts: string[];
  sessionId: string;
}): PersistCapturedThoughtsResult {
  const parts = input.parts.map((p) => p.trim()).filter(Boolean);
  if (!parts.length) {
    return {
      ok: false,
      created: [],
      sessionEntries: [],
      capturedCount: 0,
      error: "empty",
    };
  }

  const result = tryAddBrainDumps(parts, {
    captureSessionId: input.sessionId,
  });

  const sessionEntries = result.entries.filter(
    (e) =>
      e.captureSessionId === input.sessionId && isVisibleInMentalLandscape(e),
  );

  if (!result.ok || result.created.length !== parts.length) {
    return {
      ok: false,
      created: [],
      sessionEntries,
      capturedCount: 0,
      error: "save_failed",
    };
  }

  return {
    ok: true,
    created: result.created,
    sessionEntries,
    capturedCount: sessionEntries.length,
  };
}

/** Canonical singular/plural count line for the completion header. */
export function clearMyMindCapturedCountLabel(count: number): string {
  const n = Math.max(0, Math.floor(count));
  if (n === 1) {
    return "1 thought captured — still yours, exactly as you wrote it.";
  }
  return `${n} thoughts captured — still yours, exactly as you wrote them.`;
}
