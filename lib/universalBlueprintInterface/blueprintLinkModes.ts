/**
 * 106 — Shared link semantics for Calendar and Visual Thinking.
 * Always ask before writing. Explain Linked / Copied / Snapshot.
 */

export type BlueprintExternalLinkMode = "linked" | "copied" | "snapshot";

export const BLUEPRINT_LINK_MODE_EXPLANATIONS: Readonly<
  Record<BlueprintExternalLinkMode, string>
> = {
  linked:
    "Linked — stays connected. Changes in either place can stay related.",
  copied:
    "Copied — a separate copy. Edits later will not rewrite the original.",
  snapshot:
    "Snapshot — a frozen picture of how things looked at this moment.",
};

export type PendingExternalLinkProposal = {
  kind: "calendar" | "visual_thinking";
  mode: BlueprintExternalLinkMode;
  targetId: string;
  title: string;
  /** Member must approve before write. */
  awaitingApproval: true;
  explanation: string;
};

export function proposeExternalLink(input: {
  kind: "calendar" | "visual_thinking";
  mode: BlueprintExternalLinkMode;
  targetId: string;
  title: string;
}): PendingExternalLinkProposal {
  return {
    kind: input.kind,
    mode: input.mode,
    targetId: input.targetId.trim(),
    title: input.title.trim() || "Untitled",
    awaitingApproval: true,
    explanation: BLUEPRINT_LINK_MODE_EXPLANATIONS[input.mode],
  };
}
