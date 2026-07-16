/**
 * Local (non-LLM) support sequences — used for Settings previews and
 * deterministic tests. Live chat still receives the prompt block.
 */

import { prefersBrainDumpBeforePlanning } from "@/lib/patternAwareness";
import { catalogEntryForStyle, SUPPORT_STYLE_SAMPLE_STATEMENT } from "./types";
import type { SupportStyleId } from "./types";
import { getActiveSupportStyleId } from "./prefs";
import {
  detectSupportStyleTemporaryOverride,
  resolveEffectiveSupportStyleId,
} from "./temporaryOverride";

export function supportSequenceForStatement(
  styleId: SupportStyleId,
  statement: string = SUPPORT_STYLE_SAMPLE_STATEMENT,
): string {
  void statement;
  const base = catalogEntryForStyle(styleId).preview;

  // Pattern Awareness shapes strategy; Support Style shapes delivery.
  if (prefersBrainDumpBeforePlanning()) {
    if (styleId === "gentle-first") {
      return "You’ve found that getting everything out of your head helps when things feel like this. We can do that gently, without deciding what comes first yet.";
    }
    if (styleId === "practical-first") {
      return "You’ve saved that brain dumping helps you when overwhelmed. Let’s start there.";
    }
  }

  return base;
}

export function resolveSupportSequenceForUserText(userText: string): {
  styleId: SupportStyleId;
  temporary: boolean;
  response: string;
} {
  const saved = getActiveSupportStyleId();
  const override = detectSupportStyleTemporaryOverride(userText);
  const styleId = resolveEffectiveSupportStyleId(saved, override);
  return {
    styleId,
    temporary: Boolean(override),
    response: supportSequenceForStatement(styleId, userText),
  };
}

/** Whether two styles produce clearly different sequences for the sample. */
export function supportStylesDifferVisibly(
  a: SupportStyleId,
  b: SupportStyleId,
): boolean {
  return supportSequenceForStatement(a) !== supportSequenceForStatement(b);
}
