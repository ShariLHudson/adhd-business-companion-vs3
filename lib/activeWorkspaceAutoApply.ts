/**
 * When a workspace is deliberately open beside chat, relevant content auto-applies
 * to the correct section — no "would you like me to save/apply/add?" prompts.
 */

import type { AppSection } from "./companionUi";
import { workspaceTitle } from "./workspaceMode";
import {
  classifyConversationalMode,
  isContentBrainstorming,
  shouldBlockArtifactPipeline,
} from "./messageClassification";
import { isDraftDirectionSelectionOnly } from "./draftPermissionGate";

/** Workspaces where open panel = implicit consent to store relevant chat content. */
export const AUTO_APPLY_WORKSPACE_SECTIONS: AppSection[] = [
  "client-avatars",
  "projects",
  "playbook",
  "content-generator",
];

export function isAutoApplyWorkspaceSection(
  section: AppSection | null | undefined,
): boolean {
  return Boolean(section && AUTO_APPLY_WORKSPACE_SECTIONS.includes(section));
}

/** Block auto-apply for brainstorming / direction-picking — same guardrails as draft permission. */
export function shouldBlockAutoApplyFromChat(
  userText: string,
  lastAssistantText = "",
): boolean {
  if (shouldBlockArtifactPipeline(userText)) return true;
  if (isDraftDirectionSelectionOnly(userText)) return true;
  if (classifyConversationalMode(userText) === "brainstorming") return true;
  if (isContentBrainstorming(userText)) return true;
  if (/^(?:yes|yeah|yep|sure|ok|okay|no|nope|thanks|thank you)\.?$/i.test(userText.trim())) {
    return true;
  }
  void lastAssistantText;
  return false;
}

export function isActiveWorkspaceAutoApplyMode(
  section: AppSection | null | undefined,
  userText: string,
  lastAssistantText = "",
): boolean {
  if (!isAutoApplyWorkspaceSection(section)) return false;
  return !shouldBlockAutoApplyFromChat(userText, lastAssistantText);
}

import {
  workspaceApprovalSyncHintForChat,
} from "./workspaceApprovalSync";
import { builderContentSyncHintForChat } from "./builderContentSync";

export function activeWorkspaceAutoApplyHint(section: AppSection): string {
  const title = workspaceTitle(section);
  const assetNote =
    section === "content-generator"
      ? "- Create covers SOPs, funnels, newsletters, offers, marketing plans, posts, and all catalog assets — auto-apply draft content silently."
      : "";
  return [
    `ACTIVE WORKSPACE AUTO-APPLY (${title} — panel open beside chat):`,
    "- The user opened this workspace on purpose. Relevant information belongs HERE.",
    '- On approval, apply generated content — offer "Would you like me to add these?" before applying lists.',
    "- Confirm what you added in one short line, then ask only for the next missing piece.",
    "- Continue the conversation naturally after updating the panel.",
    "- When adding content to a field, prefix once with [[fill:field-id:value]] (strip from visible reply).",
    "- Brainstorming lists of options stay in chat until they pick one — do not auto-apply numbered idea lists.",
    assetNote,
    section === "client-avatars"
      ? "- Client Avatar mode: audience research, demographics, pain points, and ICP detail ALL belong in the avatar automatically. Never save approval phrases as field content."
      : "",
    section === "client-avatars" || section === "content-generator" || section === "projects"
      ? builderContentSyncHintForChat()
      : "",
    section === "projects" || section === "client-avatars" || section === "playbook"
      ? workspaceApprovalSyncHintForChat(section)
      : "",
    section === "projects"
      ? "- Projects/Workshops: title, outcome, tasks, and next steps auto-fill from conversation."
      : "",
    section === "playbook"
      ? "- Strategies: plan sections update from conversation — never re-ask captured answers."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
