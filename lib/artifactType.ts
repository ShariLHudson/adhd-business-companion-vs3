// Locked artifact types — prevent proposal ↔ email drift during Create sessions.

import type { AssistedAction } from "./assistedActionBridge";
import type { CreationWorkspaceContext } from "./workspaceCreation";

export type ArtifactExportAction =
  | "save"
  | "google-doc"
  | "print"
  | "copy"
  | "add-to-project"
  | "show-location";

export type ArtifactExportOffer = {
  artifactType: string;
  title: string;
  line: string;
  actions: ArtifactExportAction[];
};

const EXPLICIT_TYPE_CHANGE_RE =
  /\b(?:make it (?:an? )?|change (?:it )?to|switch to|actually (?:an? )?|instead (?:of|make))\s*(?:an? )?(?:email|proposal|post|plan)\b/i;

export function normalizeArtifactType(type: string | undefined | null): string {
  const raw = (type ?? "").trim();
  if (!raw) return "content";
  const t = raw.toLowerCase();
  if (/\bproposal\b|\bscope of work\b|\bsow\b|statement of work/.test(t)) {
    return "Proposal";
  }
  if (
    /^emails?$/.test(t) ||
    t === "e-mail" ||
    /\bnewsletter\b/.test(t) ||
    /\bcold email\b/.test(t)
  ) {
    return "Email";
  }
  if (raw === raw.toUpperCase() && raw.length <= 6) return raw;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function isProposalArtifact(type: string | undefined | null): boolean {
  return normalizeArtifactType(type) === "Proposal";
}

export function isEmailArtifact(type: string | undefined | null): boolean {
  return normalizeArtifactType(type) === "Email";
}

export function shouldLockArtifactType(itemType: string): boolean {
  const normalized = normalizeArtifactType(itemType);
  return normalized !== "content" && normalized.length > 0;
}

export function userExplicitlyChangesArtifactType(text: string): boolean {
  return EXPLICIT_TYPE_CHANGE_RE.test(text.trim());
}

export function conflictsWithLockedArtifact(
  lockedType: string,
  suggestedType: string,
): boolean {
  const locked = normalizeArtifactType(lockedType);
  const suggested = normalizeArtifactType(suggestedType);
  if (locked === suggested) return false;
  if (locked === "Proposal" && suggested === "Email") return true;
  if (locked === "Email" && suggested === "Proposal") return true;
  return false;
}

export function filterAssistedActionForArtifact(
  action: AssistedAction | null,
  lockedType: string | undefined | null,
): AssistedAction | null {
  if (!action || !lockedType) return action;
  if (
    action.itemType &&
    conflictsWithLockedArtifact(lockedType, action.itemType)
  ) {
    return null;
  }
  if (isProposalArtifact(lockedType) && action.id === "email") return null;
  return action;
}

export function lockedArtifactFromContext(
  ctx: CreationWorkspaceContext | null | undefined,
): string | null {
  if (!ctx?.artifactTypeLocked) return null;
  return normalizeArtifactType(ctx.itemType);
}

const SAVE_READY_RE =
  /\b(?:yes|yep|yeah|ok(?:ay)?|sure|save it|save (?:the|my)|let'?s save|go ahead|please do|do it)\b/i;

const EXPORT_INTENT_RE =
  /\b(?:google doc|google docs|print|save (?:the|my)? ?proposal|export|create (?:the|a)? ?doc)\b/i;

export function detectArtifactExportOffer(
  userText: string,
  ctx: CreationWorkspaceContext | null | undefined,
): ArtifactExportOffer | null {
  if (!ctx?.artifactTypeLocked) return null;
  const artifactType = normalizeArtifactType(ctx.itemType);
  const hasDraft = Boolean(ctx.draftContent?.trim());
  if (!hasDraft) return null;

  const t = userText.trim();
  if (!t) return null;
  const wantsExport =
    SAVE_READY_RE.test(t) ||
    EXPORT_INTENT_RE.test(t) ||
    /\b(?:create (?:the|a)? google doc|print it)\b/i.test(t);
  if (!wantsExport) return null;

  const title = ctx.title?.trim() || artifactType;
  const actions: ArtifactExportAction[] = ["save", "google-doc", "print", "copy"];

  return {
    artifactType,
    title,
    line: `Your **${artifactType}** draft is ready beside you — pick how to save or export it.`,
    actions,
  };
}

export function artifactLockHintForChat(
  ctx: CreationWorkspaceContext | null | undefined,
): string | undefined {
  if (!ctx?.artifactTypeLocked) return undefined;
  const type = normalizeArtifactType(ctx.itemType);
  const hasDraft = Boolean(ctx.draftContent?.trim());
  const lines = [
    `LOCKED ARTIFACT TYPE: **${type}** — do NOT suggest email, email mode, or an email workspace unless the user explicitly asks to switch types.`,
    `Use ${type.toLowerCase()}-specific language: continue the ${type.toLowerCase()}, save/export/print the ${type.toLowerCase()}, edit sections, add missing sections.`,
    "Create stays open beside chat — never tell them Create closed or to look for export options manually.",
    "Export buttons (Google Doc, Print, Copy, Save) live in the Create panel — point to those when they want to save or export.",
  ];
  if (isProposalArtifact(type) && hasDraft) {
    lines.push(
      "For Google Docs: if connected, say you can create the Google Doc for them via the **Create Google Doc** button. If not connected, say you can prepare the proposal here but Google Docs is not connected yet — do NOT say 'look for the export option'.",
    );
  }
  return lines.join("\n");
}

export function proposalRecoveryMessage(
  ctx: CreationWorkspaceContext | null | undefined,
): string {
  const title = ctx?.title?.trim();
  const hasDraft = Boolean(ctx?.draftContent?.trim());
  if (hasDraft) {
    return title
      ? `Here's your **Proposal** — **${title}** is open in **Create** beside you with your draft visible.`
      : "Here's your **Proposal** — **Create** is open beside you with your draft visible.";
  }
  return "Here's your **Create** workspace — your **Proposal** is open beside you. Pick up where you left off.";
}
