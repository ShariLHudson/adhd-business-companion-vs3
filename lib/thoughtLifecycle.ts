/**
 * Clear My Mind — thought lifecycle contract (derived from BrainDumpEntry fields).
 *
 * No persisted lifecycle field. States are inferred from `done`, `sorted`, and
 * `routedAction` only.
 *
 * ## Done vs Keep in Library (do not conflate)
 *
 * The sort route key `"done"` in `brainDumpRouting.ts` is labeled **Keep in Library**
 * in the UI. It sets `sorted: true` and `routedAction: "library"` — it does **not**
 * set `done: true`. That path is lifecycle **kept**, not **completed**.
 *
 * True completion is `done: true` (e.g. BrainDumpPanel markDone, Spin the Wheel,
 * or routing to project/task with a linked project). That is lifecycle **completed**.
 */

import type { BrainDumpEntry } from "./companionStore";

export type ThoughtLifecycle =
  | "completed"
  | "routed"
  | "kept"
  | "held"
  | "sorted-idle";

export function isCompletedThought(entry: BrainDumpEntry): boolean {
  return entry.done === true;
}

export function isKeptThought(entry: BrainDumpEntry): boolean {
  return entry.routedAction === "library" && entry.done !== true;
}

export function isRoutedThought(entry: BrainDumpEntry): boolean {
  return (
    Boolean(entry.routedAction) &&
    entry.routedAction !== "library" &&
    entry.done !== true
  );
}

export function isSortedIdleThought(entry: BrainDumpEntry): boolean {
  return (
    entry.sorted === true &&
    !entry.routedAction &&
    entry.done !== true
  );
}

export function isHeldThought(entry: BrainDumpEntry): boolean {
  return (
    entry.done !== true &&
    entry.sorted !== true &&
    !entry.routedAction
  );
}

/**
 * Single source of truth for lifecycle state. Mutually exclusive buckets.
 */
export function deriveThoughtLifecycle(entry: BrainDumpEntry): ThoughtLifecycle {
  if (isCompletedThought(entry)) return "completed";
  if (isKeptThought(entry)) return "kept";
  if (isRoutedThought(entry)) return "routed";
  if (isSortedIdleThought(entry)) return "sorted-idle";
  return "held";
}

/**
 * Whether a thought appears in Mental Landscape / active library lists today.
 * Equivalent to `!entry.done`. Extend here for Quiet Thoughts (PR 4D+).
 */
export function isVisibleInMentalLandscape(entry: BrainDumpEntry): boolean {
  return !isCompletedThought(entry);
}
