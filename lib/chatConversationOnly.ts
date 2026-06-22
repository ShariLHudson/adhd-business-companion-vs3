/**
 * Chat Role Reset — chat is conversation only; workspaces execute via UI buttons.
 */

import type { TurnSurface } from "./companionGovernor";

/** When true, chat never opens workspaces, saves, or writes to panels. */
export const CHAT_CONVERSATION_ONLY_MODE = true;

export function isChatConversationOnlyMode(): boolean {
  return CHAT_CONVERSATION_ONLY_MODE;
}

export const CHAT_ROLE_RESET_HINT = `CHAT ROLE RESET (highest priority — overrides companion-first, auto-apply, and co-author rules):
Chat is CONVERSATION ONLY. You are the companion; the workspace is the tool; the user controls actions.
You MAY: answer questions, brainstorm, explain concepts, suggest next steps, help the user think, review text when they ask, provide research or examples.
You MUST NOT: write into any workspace, save anything, mark anything complete, create drafts, open tools, switch screens, change view modes, decide work is done, or route the user away from their current area.
All actions use explicit UI buttons — Build Draft, Save, Delete, Mark Done, Open Workspace, Add Item, Move Card, etc.
If the user asks you to perform an action in chat, say warmly: "I can help you decide what to do. Use the button in the workspace when you're ready." Then help them think — do not claim you did the action.
When a workspace is open: discuss what is on screen and what they might do next — never use [[fill:]] tags, never claim you saved, updated, applied, or marked complete.
WORKSPACE OWNERSHIP: Chat holds conversation and ideas only. Workspace holds user-managed content. Saved Work/Templates hold explicit saves. Never claim content was added, saved, inserted, updated, stored, or moved unless it actually happened. When transfer is manual, encourage copy/paste — never imply automatic transfer.`;

export const CHAT_ACTION_DECLINE_LINE =
  "I can help you decide what to do. Use the button in the workspace when you're ready.";

export function enforceConversationOnlyTurnSurface(
  surface: TurnSurface,
): TurnSurface {
  if (!isChatConversationOnlyMode()) return surface;

  const hasHint = surface.promptHints.some((h) =>
    h.includes("CHAT ROLE RESET"),
  );
  const promptHints = hasHint
    ? surface.promptHints
    : [...surface.promptHints, CHAT_ROLE_RESET_HINT];

  const arbitration = {
    ...surface.arbitration,
    blockAutoOpenDocument: true,
    blockAutoRouteAsset: true,
    blockIntentMake: true,
    blockIntentStabilize: true,
    blockIntentEditDraft: true,
  };

  const shared = {
    ...surface,
    suppressWorkspaceRouting: true,
    suppressArtifactHandoff: true,
    suppressRestore: true,
    targetSection: undefined,
    targetTool: undefined,
    pendingOfferSection: undefined,
    promptHints,
    arbitration,
  };

  if (surface.outcome === "active_workflow") {
    return { ...shared, outcome: "active_workflow" };
  }

  return { ...shared, outcome: "chat_only" };
}

export function conversationOnlyFirstWorkflowHint(): string {
  return `COMPANION FIRST (conversation-only): Brief answer in chat (1–2 sentences). Tell the user which workspace button or menu path to use when they are ready — do NOT offer to open it from chat or claim it is opening. Help them decide; UI buttons execute.`;
}
