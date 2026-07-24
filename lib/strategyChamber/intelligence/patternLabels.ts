/**
 * Member-facing labels for option patterns.
 * Technical OptionPatternId values are never shown to the member.
 */

import type { OptionPatternId } from "./types";

const LABELS: Record<OptionPatternId, string> = {
  continue: "Keep the current direction",
  maintain_current_direction: "Maintain the current direction",
  improve: "Improve what already exists",
  narrow: "Narrow the focus",
  simplify: "Simplify first",
  reduce_scope: "Reduce the scope",
  expand: "Expand selectively",
  reposition: "Reposition the offer or story",
  increase_price: "Raise the price",
  restructure_price: "Restructure pricing",
  add_value: "Add or clarify value first",
  partner: "Partner or collaborate",
  delegate: "Delegate a defined piece",
  automate: "Automate before adding people",
  delay: "Delay until a condition is clearer",
  pause: "Pause new investment",
  stop: "Stop or sunset this path",
  stabilize: "Stabilize and protect capacity",
  test: "Run a small test",
  staged_transition: "Move in stages",
  protect_current_base: "Protect what is already working",
  serve_different_audience: "Serve a different audience",
  // Legacy aliases — same member language as canonical forms
  raise_price: "Raise the price",
  raise_value: "Add or clarify value first",
  protect_base: "Protect what is already working",
  different_market: "Serve a different audience",
};

/** Canonical pattern after collapsing legacy aliases. */
export function normalizeOptionPattern(
  pattern: OptionPatternId,
): OptionPatternId {
  switch (pattern) {
    case "raise_price":
      return "increase_price";
    case "raise_value":
      return "add_value";
    case "protect_base":
      return "protect_current_base";
    case "different_market":
      return "serve_different_audience";
    default:
      return pattern;
  }
}

export function optionPatternMemberLabel(pattern: OptionPatternId): string {
  return LABELS[pattern] || LABELS[normalizeOptionPattern(pattern)] || "A possible direction";
}

/** Strategic range category for diversity — not member-facing. */
export function strategicRangeCategory(
  pattern: OptionPatternId,
): string {
  const p = normalizeOptionPattern(pattern);
  switch (p) {
    case "continue":
    case "maintain_current_direction":
      return "continue";
    case "improve":
    case "add_value":
      return "improve";
    case "narrow":
    case "reduce_scope":
      return "narrow";
    case "simplify":
      return "simplify";
    case "test":
      return "test";
    case "delay":
      return "delay";
    case "pause":
      return "pause";
    case "stop":
      return "stop";
    case "expand":
    case "increase_price":
      return "expand";
    case "reposition":
    case "serve_different_audience":
    case "restructure_price":
      return "reposition";
    case "protect_current_base":
    case "stabilize":
      return "protect";
    case "staged_transition":
      return "stage";
    case "partner":
    case "delegate":
    case "automate":
      return "share_load";
    default:
      return p;
  }
}
