/**
 * Workspace ownership & state transparency.
 * Chat = conversation/ideas. Workspace = user-managed content.
 * Truthfulness about where content lives is mandatory.
 */

import type { AppSection } from "./companionUi";
import { isChatConversationOnlyMode } from "./chatConversationOnly";
import type { CreationWorkspaceContext } from "./workspaceCreation";
import type { SavedArtifactRecord } from "./savedArtifact";
import {
  isAnyWorkspaceOpen,
  scrubFalseWorkspaceClaims,
  type WorkspaceOpenSnapshot,
} from "./workspaceExecution";
import { workspaceTitle } from "./workspaceMode";

export type ContentLocation =
  | "chat"
  | "workspace"
  | "saved_storage"
  | "unsaved_draft";

export type ContentLocationStatus = {
  location: ContentLocation;
  active: boolean;
  label: string;
  detail?: string;
};

export type WorkspaceOwnershipState = {
  chatOnly: boolean;
  workspaceVisible: boolean;
  workspaceSection: AppSection | null;
  /** True only when [[fill:]] or verified UI sync will apply content this turn */
  autoTransferEnabled: boolean;
  locations: ContentLocationStatus[];
};

export const WORKSPACE_OWNERSHIP_RULES = `WORKSPACE OWNERSHIP & STATE TRANSPARENCY (mandatory — overrides conversational convenience):
Content exists in exactly one primary place at a time:
- CHAT — conversation and ideas only; not saved to workspace or storage by talking.
- WORKSPACE — user-managed panel content (Create draft, project fields, avatar, etc.).
- SAVED STORAGE — Saved Work, Templates, or explicit saves after the user taps Save.
- UNSAVED DRAFT — visible in the workspace panel but not yet saved to storage.
NEVER claim content was added, saved, inserted, updated, stored, or moved unless that action actually occurred.
When chat and workspace are separate: chat holds ideas; the workspace holds what the user puts there.
If manual transfer is required, encourage copy/paste: "Copy from chat and paste into the workspace" or "Use the button in the workspace when you're ready."
NEVER imply automatic transfer from chat to workspace when none occurred.
Truthfulness about workspace state takes precedence over sounding helpful.`;

const FALSE_CONTENT_CLAIM_RE =
  /\b(?:I(?:'ve| have| just|'d)?|We(?:'ve| have)?)\s+(?:added|saved|inserted|updated|stored|moved|put|placed|written|captured|recorded|applied)\b[^.!?\n]*[.!?]?\s*/gi;

const FALSE_DONE_CLAIM_RE =
  /\b(?:Done|Great|Perfect)\s*[—–-]\s*(?:I\s+)?(?:added|saved|inserted|updated|stored|moved)\b[^.!?\n]*[.!?]?\s*/gi;

const FALSE_NOW_SAVED_RE =
  /\b(?:it(?:'s| is)|that(?:'s| is)|they(?:'re| are))\s+now\s+(?:saved|stored|in your (?:workspace|draft|project|avatar)|added to)\b[^.!?\n]*[.!?]?\s*/gi;

const HONEST_TRANSFER_LINE =
  "That stays in our chat for now — copy what you want into the workspace, or use the button there when you're ready.";

export function resolveWorkspaceOwnershipState(input: {
  snap: WorkspaceOpenSnapshot;
  workspacePanel?: AppSection | null;
  creationContext?: CreationWorkspaceContext | null;
  savedArtifact?: SavedArtifactRecord | null;
  createDraftVisible?: boolean;
  allowAutoTransferThisTurn?: boolean;
}): WorkspaceOwnershipState {
  const chatOnly = isChatConversationOnlyMode();
  const workspaceVisible = isAnyWorkspaceOpen(input.snap);
  const workspaceSection = workspaceVisible ? input.snap.panel : null;

  const hasWorkspaceDraft =
    input.createDraftVisible !== false &&
    Boolean(input.creationContext?.draftContent?.trim());
  const savedToLibrary =
    Boolean(input.savedArtifact?.savedWorkId) ||
    input.savedArtifact?.savedStatus === "saved" ||
    input.savedArtifact?.savedStatus === "exported";

  const locations: ContentLocationStatus[] = [
    {
      location: "chat",
      active: true,
      label: "Chat",
      detail: "Conversation and ideas — not persisted by talking alone.",
    },
  ];

  if (workspaceVisible && workspaceSection) {
    locations.push({
      location: "workspace",
      active: true,
      label: workspaceTitle(workspaceSection),
      detail: hasWorkspaceDraft
        ? "Draft/content visible in the panel — user-managed."
        : "Panel open — user enters and saves content here.",
    });
  }

  if (hasWorkspaceDraft && !savedToLibrary) {
    locations.push({
      location: "unsaved_draft",
      active: true,
      label: "Unsaved draft",
      detail: `In ${workspaceSection ? workspaceTitle(workspaceSection) : "workspace"} — not in Saved Work until user saves.`,
    });
  }

  if (savedToLibrary && input.savedArtifact) {
    locations.push({
      location: "saved_storage",
      active: true,
      label: input.savedArtifact.savedLocation || "Saved Work",
      detail:
        input.savedArtifact.savedLocationDetail ||
        input.savedArtifact.artifactTitle,
    });
  }

  const autoTransferEnabled =
    !chatOnly &&
    Boolean(input.allowAutoTransferThisTurn) &&
    workspaceVisible;

  return {
    chatOnly,
    workspaceVisible,
    workspaceSection,
    autoTransferEnabled,
    locations,
  };
}

export function workspaceOwnershipHintForChat(
  state: WorkspaceOwnershipState,
): string {
  const active = state.locations.filter((l) => l.active);
  const locationLines = active
    .map((l) => `- ${l.label}${l.detail ? `: ${l.detail}` : ""}`)
    .join("\n");

  const transferRule = state.chatOnly
    ? "- Chat is conversation only — NEVER claim you added, saved, updated, or moved content. Encourage copy/paste or workspace buttons for transfer."
    : state.autoTransferEnabled
      ? "- Verified auto-apply may run this turn only when [[fill:]] or UI sync confirms it."
      : "- No automatic chat→workspace transfer this turn. Encourage copy/paste or workspace buttons.";

  return [
    WORKSPACE_OWNERSHIP_RULES,
    "",
    "CURRENT CONTENT LOCATIONS:",
    locationLines,
    transferRule,
  ].join("\n");
}

/** Rewrite assistant lines that falsely claim content actions in chat-only mode. */
export function scrubFalseContentClaims(
  text: string,
  state: WorkspaceOwnershipState,
  opts?: { allowClaimsThisTurn?: boolean },
): string {
  if (!text.trim()) return text;
  if (opts?.allowClaimsThisTurn || state.autoTransferEnabled) return text;
  if (!state.chatOnly && state.workspaceVisible) {
    return text;
  }

  let result = text;
  let changed = false;

  for (const re of [
    FALSE_CONTENT_CLAIM_RE,
    FALSE_DONE_CLAIM_RE,
    FALSE_NOW_SAVED_RE,
  ]) {
    const next = result.replace(re, () => {
      changed = true;
      return HONEST_TRANSFER_LINE;
    });
    result = next;
  }

  if (!changed) return text;

  result = result
    .replace(
      new RegExp(`(${escapeRegExp(HONEST_TRANSFER_LINE)}\\s*){2,}`, "g"),
      `${HONEST_TRANSFER_LINE}\n\n`,
    )
    .replace(/\.\.+/g, ".")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return result || HONEST_TRANSFER_LINE;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function scrubAssistantWorkspaceMessages(
  text: string,
  snap: WorkspaceOpenSnapshot,
  ownership: WorkspaceOwnershipState,
  opts?: { allowContentClaimsThisTurn?: boolean },
): string {
  const afterVisibility = scrubFalseWorkspaceClaims(text, snap);
  return scrubFalseContentClaims(afterVisibility, ownership, {
    allowClaimsThisTurn: opts?.allowContentClaimsThisTurn,
  });
}
