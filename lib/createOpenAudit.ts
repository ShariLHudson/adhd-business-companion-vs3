/**
 * Trust Sprint #1 — Phase C.1: Create entry point audit (report).
 */

import type { CreateOpenSource } from "./createOpenAuthority";

export type CreateEntryAuditRow = {
  source: string;
  currentPath: string;
  consentRequired: boolean | "varies";
  acknowledgement: string;
  /** After Phase C — routed through requestCreateOpen */
  authority: CreateOpenSource;
};

/** Phase C.1 audit — all Create opens consolidate through requestCreateOpen. */
export const CREATE_OPEN_ENTRY_AUDIT: readonly CreateEntryAuditRow[] = [
  {
    source: "Chat — ensureLiveCreateBesideChat",
    currentPath: "page.tsx → requestCreateOpen (was silent ensureLiveCreateBesideChat)",
    consentRequired: true,
    acknowledgement: "Consent offer before open",
    authority: "ensure_live_create",
  },
  {
    source: "Chat — handleSend governor",
    currentPath: "routingExecutor → openGovernorWorkspace → openCreateFromIntent → requestCreateOpen",
    consentRequired: true,
    acknowledgement: "Governor lane + explicit command bypass",
    authority: "governor",
  },
  {
    source: "Chat — artifact handoff",
    currentPath: "tryChatCreateHandoff → requestCreateOpen",
    consentRequired: true,
    acknowledgement: "Handoff receipt",
    authority: "handoff",
  },
  {
    source: "Chat — tryOpenCreateForCurrentArtifact",
    currentPath: "requestCreateOpen",
    consentRequired: true,
    acknowledgement: "Create open / draft switch offer",
    authority: "artifact",
  },
  {
    source: "Chat — openAssetRoute",
    currentPath: "requestCreateOpen",
    consentRequired: false,
    acknowledgement: "Assistant-routed asset receipt",
    authority: "artifact",
  },
  {
    source: "UI — Create nav / sidebar",
    currentPath: "openSectionBesideChatCore → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "Workspace purity opener",
    authority: "ui_nav",
  },
  {
    source: "UI — Create buttons / type pick",
    currentPath: "ContentGeneratorPanel → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "draft_created receipt",
    authority: "ui_button",
  },
  {
    source: "Templates library",
    currentPath: "TemplatesLibrary → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "template_applied receipt",
    authority: "template",
  },
  {
    source: "Snippets library",
    currentPath: "SnippetsLibrary → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "artifact_linked receipt",
    authority: "snippet",
  },
  {
    source: "Strategies — child artifact",
    currentPath: "syncCreatePanelDraft / requestCreateOpen",
    consentRequired: true,
    acknowledgement: "Strategy child follow-up",
    authority: "strategy",
  },
  {
    source: "Saved work library",
    currentPath: "openSavedWorkInCreate → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "saved_for_later / draft_created",
    authority: "saved_work",
  },
  {
    source: "Workspace transitions",
    currentPath: "openWorkspaceBesideChatCore → openCreationWorkspaceCore → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "Workspace open ack",
    authority: "workspace_transition",
  },
  {
    source: "Explicit resume",
    currentPath: "restoreCreateSession → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "Resume receipt",
    authority: "resume",
  },
  {
    source: "Founder action board",
    currentPath: "openFounderActionWorkspace → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "Founder action ack",
    authority: "founder",
  },
  {
    source: "Companion assist / feature nav",
    currentPath: "acceptAppFeatureNavOffer → requestCreateOpen",
    consentRequired: false,
    acknowledgement: "Feature nav receipt",
    authority: "companion_assist",
  },
  {
    source: "routingExecutor create.open",
    currentPath: "requestCreateOpen → routingExecutor create.open audit (no double dispatch)",
    consentRequired: "varies",
    acknowledgement: "Receipt on execute",
    authority: "artifact",
  },
] as const;
