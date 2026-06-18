/**
 * Live Create workspace — conversation beside an evolving draft.
 * Never restart the Create workflow once a draft session is active.
 */

import {
  categoryIdForType,
  EMPTY_CREATE_WORKFLOW,
  type CreateWorkflowState,
} from "./createWorkflow";

export const SHARI_APPLY_DRAFT_OFFER_RE =
  /\b(?:would you like me to apply|apply (?:this|that) to the draft|update the draft with|put (?:this|that) in(?:to)?(?: the)? draft|shall i (?:add|put) (?:this|that))\b/i;

export function shariOfferedToApplyDraft(lastAssistantText: string): boolean {
  return SHARI_APPLY_DRAFT_OFFER_RE.test(lastAssistantText.trim());
}

const APPLY_AFFIRM_RE =
  /^(?:yes|yeah|yep|sure|ok|okay|go ahead|please do|do it|sounds good|that works|use (?:that|those|this|it)|apply it)\.?$/i;

export function userAffirmedApplyToDraft(
  userText: string,
  lastAssistantText = "",
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (!APPLY_AFFIRM_RE.test(t) && !/\bapply\b/i.test(t)) return false;
  return shariOfferedToApplyDraft(lastAssistantText);
}

/** Workflow state for an active draft canvas — not the discovery wizard. */
export type LiveCreateWorkflowOpts = {
  /** Incremental collaborative drafting — fragments merge, draft stays building. */
  incremental?: boolean;
};

export function liveCreateWorkflowState(
  itemType: string,
  prev?: CreateWorkflowState | null,
  opts?: LiveCreateWorkflowOpts,
): CreateWorkflowState {
  const base = prev ?? EMPTY_CREATE_WORKFLOW;
  if (opts?.incremental) {
    return {
      ...base,
      step: "improve",
      buildApproved: false,
      readinessConfirmed: false,
      draftStatus: "building",
      selectedTypeLabel: base.selectedTypeLabel ?? itemType,
      categoryId: base.categoryId ?? categoryIdForType(itemType),
      questionMode: base.questionMode ?? null,
      sessionId: base.sessionId,
    };
  }
  if (base.step === "improve" && base.buildApproved) {
    return {
      ...base,
      selectedTypeLabel: base.selectedTypeLabel ?? itemType,
      categoryId: base.categoryId ?? categoryIdForType(itemType),
      draftStatus: base.draftStatus === "building" ? "building" : "ready",
    };
  }
  return {
    ...EMPTY_CREATE_WORKFLOW,
    step: "improve",
    buildApproved: true,
    readinessConfirmed: true,
    draftStatus: "ready",
    selectedTypeLabel: itemType,
    categoryId: categoryIdForType(itemType),
    questionMode: base.questionMode ?? null,
    sessionId: base.sessionId,
  };
}

/** Find a section heading in markdown/plain draft text. */
export function findSectionHeadingLine(
  draft: string,
  sectionHint: string,
): number {
  const hint = sectionHint.trim().toLowerCase();
  if (!hint) return -1;
  const lines = draft.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!.trim();
    const plain = raw.replace(/^#{1,3}\s+/, "").replace(/\*\*/g, "").trim();
    if (plain.toLowerCase() === hint) return i;
    if (plain.toLowerCase().includes(hint)) return i;
  }
  return -1;
}

export type MergeDraftResult = {
  draft: string;
  scrollTarget?: string;
  mode: "replace" | "append" | "section";
};

/**
 * Merge assistant/chat content into an open draft.
 * - Full artifact → replace when existing is empty or scaffold-only
 * - Partial fact → append under matching section or at end
 */
export function mergeChatContentIntoDraft(
  existingDraft: string,
  incoming: string,
  opts?: { instruction?: string },
): MergeDraftResult {
  const existing = existingDraft.trim();
  const next = incoming.trim();
  if (!next) return { draft: existingDraft, mode: "replace" };
  if (!existing) return { draft: next, mode: "replace" };

  const instruction = opts?.instruction?.trim().toLowerCase() ?? "";
  const incomingLines = next.split("\n").filter(Boolean).length;
  const looksLikeFullArtifact =
    incomingLines >= 5 ||
    /^#{1,3}\s/m.test(next) ||
    (next.length > existing.length * 0.85 && incomingLines >= 3);

  if (looksLikeFullArtifact) {
    return { draft: next, mode: "replace", scrollTarget: firstHeading(next) };
  }

  if (/\badd\b.*\bsection\b|\bexpectations\b|\bcommission\b|\btimeline\b/i.test(instruction)) {
    const sectionMatch = instruction.match(
      /\b(?:add|update|include)\s+(?:a\s+)?(.+?)(?:\s+section)?$/i,
    );
    const sectionHint = sectionMatch?.[1] ?? instruction;
    const lineIdx = findSectionHeadingLine(existing, sectionHint);
    if (lineIdx >= 0) {
      const lines = existing.split("\n");
      const insertAt = lineIdx + 1;
      const block = next.includes("\n") ? next : next;
      lines.splice(insertAt, 0, block, "");
      return {
        draft: lines.join("\n"),
        mode: "section",
        scrollTarget: lines[lineIdx]!.trim(),
      };
    }
  }

  return {
    draft: `${existing}\n\n${next}`,
    mode: "append",
    scrollTarget: firstHeading(next) ?? next.split("\n")[0]?.trim(),
  };
}

function firstHeading(text: string): string | undefined {
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    if (/^#{1,3}\s/.test(t)) return t.replace(/^#{1,3}\s+/, "").trim();
    if (t.length < 80 && !t.endsWith(".") && /^[A-Z]/.test(t)) return t;
  }
  return undefined;
}
