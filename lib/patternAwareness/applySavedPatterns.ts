/**
 * Apply active saved patterns to guidance — never override current intent.
 */

import { canUseSavedPatterns } from "./prefs";
import { listSavedPatterns } from "./patternStore";
import type { PatternUseContext, SavedPattern } from "./types";

export function listActiveUsablePatterns(
  context?: PatternUseContext,
): SavedPattern[] {
  if (!canUseSavedPatterns()) return [];
  return listSavedPatterns().filter((pattern) => {
    if (pattern.status !== "active") return false;
    if (pattern.useContexts.includes("reference-only")) return false;
    if (!context) return true;
    if (pattern.useContexts.includes("everywhere")) return true;
    return pattern.useContexts.includes(context);
  });
}

/** Soft planning hint when member prefers fewer priorities. */
export function resolvePlanMyDayPriorityCap(): number | null {
  const patterns = listActiveUsablePatterns("plan-my-day");
  const lighter = patterns.find((p) =>
    /few(er)? priorit|one main priorit|too many priorit|overwhelm/i.test(
      p.statement,
    ),
  );
  if (!lighter) return null;
  return 3;
}

export function prefersBrainDumpBeforePlanning(): boolean {
  return listActiveUsablePatterns("overwhelm").some((p) =>
    /brain dump|unload|clear my mind|get everything out|thoughts first/i.test(
      p.statement,
    ),
  );
}

export function prefersSmallFirstSteps(): boolean {
  return listActiveUsablePatterns("starting").some((p) =>
    /small(er)?|short|tiny|very specific next step|break(en)? down|first steps? help/i.test(
      p.statement,
    ),
  );
}

/**
 * Compact prompt block for companion chat when Use My Saved Patterns is on.
 * Keep short — delivery style comes from conversation style separately.
 */
export function buildSavedPatternsPromptHint(): string | null {
  const patterns = listActiveUsablePatterns().slice(0, 6);
  if (patterns.length === 0) return null;
  const lines = patterns.map((p) => `- ${p.statement}`).join("\n");
  const extras: string[] = [];
  const cap = resolvePlanMyDayPriorityCap();
  if (cap != null) {
    extras.push(
      `When planning their day, prefer about one main priority and up to ${cap - 1} optional items unless they ask for more.`,
    );
  }
  if (prefersSmallFirstSteps()) {
    extras.push(
      "When helping them start, suggest a very small first step unless they ask otherwise.",
    );
  }
  if (prefersBrainDumpBeforePlanning()) {
    extras.push(
      "When they feel overwhelmed, offer unloading thoughts (Clear My Mind) before prioritizing — with permission.",
    );
  }
  return [
    "Member-approved Pattern Awareness (use only when relevant; never override their current intent):",
    lines,
    ...extras,
    "Occasionally explain a suggestion with “because you previously saved that…” — do not repeat every turn.",
    "Delivery tone follows their Conversation Style preference — do not change the pattern itself.",
  ].join("\n");
}

export function explainPatternConnection(pattern: SavedPattern): string {
  return `I'm suggesting this because you previously saved that ${pattern.statement.replace(/\.$/, "")}.`;
}
