/**
 * P0.20.5 — Visual source content validation
 * Before reusing prior chat content for flowchart/diagram/hierarchy/funnel conversion,
 * verify it is related, current, and structurally usable.
 */

import {
  detectVisualTypeInText,
  extractFlowStepsFromContent,
  type VisualTypeId,
} from "./visualTypeAvailability";

export type VisualSourceValidationInput = {
  userText: string;
  sourceContent: string;
  currentTurn?: number;
  offeredAtTurn?: number;
};

export type VisualSourceValidationResult =
  | { ok: true }
  | { ok: false; reason: string; askInstead: string };

const PROMPT_OR_OFFER_RE =
  /\b(?:would you like|which (?:one|would)|pick one|choose one|what (?:are|is|should)|how can i help|let me know|tell me what|can i help|aren't fully built|recommended:)\b/i;

const STALE_PENDING_TURN_GAP = 3;

const TYPE_TOPIC_HINTS: Record<VisualTypeId, string[]> = {
  flowchart: ["step", "process", "flow", "stage", "sequence", "onboarding"],
  diagram: ["diagram", "structure", "model", "layout", "system"],
  hierarchy_tree: ["chapter", "section", "topic", "level", "parent", "outline"],
  funnel_map: ["funnel", "stage", "lead", "conversion", "customer", "awareness"],
  mind_map: ["idea", "topic", "brainstorm", "theme", "concept"],
  decision_tree: ["option", "choice", "decision", "path", "if", "branch"],
};

export function isPromptOrOfferContent(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (PROMPT_OR_OFFER_RE.test(t)) return true;
  if (t.endsWith("?") && t.length < 240) return true;
  return false;
}

export function hasConvertibleStructure(content: string): boolean {
  const t = content.trim();
  if (t.length < 24) return false;
  if (extractFlowStepsFromContent(t).length >= 2) return true;
  if (/^(?:[-*•]|\d+[\.\)])\s/m.test(t)) return true;
  if ((t.match(/[.!?]+/g)?.length ?? 0) >= 2) return true;
  if (
    t
      .split(/[,;]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 2).length >= 3
  ) {
    return true;
  }
  return false;
}

export function isTopicallyRelatedVisualSource(
  userText: string,
  source: string,
): boolean {
  const u = userText.trim().toLowerCase();
  const s = source.trim().toLowerCase();
  if (!u || !s) return false;

  if (/\b(?:this|it|that)\b/.test(u)) {
    return !isPromptOrOfferContent(source);
  }

  const typeId = detectVisualTypeInText(userText);
  if (typeId) {
    const hints = TYPE_TOPIC_HINTS[typeId];
    if (hints.some((hint) => s.includes(hint))) return true;
  }

  const userWords = u.split(/\W+/).filter((word) => word.length > 4);
  return userWords.some((word) => s.includes(word));
}

export function isStaleVisualSourcePending(
  currentTurn: number | undefined,
  offeredAtTurn: number | undefined,
): boolean {
  if (currentTurn == null || offeredAtTurn == null) return false;
  if (offeredAtTurn <= 0) return true;
  return currentTurn - offeredAtTurn > STALE_PENDING_TURN_GAP;
}

export function askInsteadForVisualType(userText: string): string {
  const typeId = detectVisualTypeInText(userText);
  switch (typeId) {
    case "flowchart":
      return "What are the steps you want included?";
    case "diagram":
      return "What are you trying to show?";
    case "hierarchy_tree":
      return "What is the top-level topic?";
    case "funnel_map":
      return "What is the funnel for?";
    default:
      return "What content should I use for the visual?";
  }
}

export function validateVisualSourceContent(
  input: VisualSourceValidationInput,
): VisualSourceValidationResult {
  const source = input.sourceContent.trim();
  const askInstead = askInsteadForVisualType(input.userText);

  if (!source) {
    return { ok: false, reason: "empty", askInstead };
  }
  if (isStaleVisualSourcePending(input.currentTurn, input.offeredAtTurn)) {
    return { ok: false, reason: "stale_pending", askInstead };
  }
  if (isPromptOrOfferContent(source)) {
    return { ok: false, reason: "prompt_or_offer", askInstead };
  }
  if (!isTopicallyRelatedVisualSource(input.userText, source)) {
    return { ok: false, reason: "unrelated", askInstead };
  }
  if (!hasConvertibleStructure(source)) {
    return { ok: false, reason: "no_structure", askInstead };
  }
  return { ok: true };
}

export function buildVisualSourceAskReply(
  userText: string,
  validation: Extract<VisualSourceValidationResult, { ok: false }>,
): string {
  const typeId = detectVisualTypeInText(userText);
  if (typeId === "flowchart") {
    return [
      "I can draft the flow here once I have the right steps.",
      "",
      validation.askInstead,
    ].join("\n");
  }
  if (typeId === "diagram") {
    return [
      "I can sketch the structure here once I know what to show.",
      "",
      validation.askInstead,
    ].join("\n");
  }
  return validation.askInstead;
}
