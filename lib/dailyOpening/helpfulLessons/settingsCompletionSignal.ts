/**
 * Settings / personalization completion — isolated adapter.
 *
 * Settings completion is still being built. Until a reliable saved-state signal
 * exists, this returns "unknown". The selector must never treat "unknown" as
 * incomplete (so we never tell the user to "finish" Settings without proof).
 * When a real completion source lands, connect it here only — nothing else in
 * the discovery system needs to change.
 */

import type { CompletionSignal } from "./discoverySignals";

export function resolveSettingsCompletion(): CompletionSignal {
  // TODO: connect the real Settings/personalization completion signal here.
  // Return "started"/"complete"/"empty" with a `remaining` count once available.
  return { status: "unknown", remaining: null };
}
