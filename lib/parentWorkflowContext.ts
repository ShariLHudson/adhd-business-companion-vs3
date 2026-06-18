/**
 * Parent workflow context — strategy, project, avatar, workshop, etc.
 * Child artifacts (Week 1 Post 1) inherit parent context; never restart generic Create.
 */

import type { AppSection } from "./companionUi";
import type { BusinessStrategySession } from "./businessStrategyBuilder";
import type { ChatTurn } from "./createInitialization";

export type ParentWorkflowKind =
  | "marketing_plan"
  | "business_strategy"
  | "project"
  | "client_avatar"
  | "workshop"
  | "proposal";

export type ParentWorkflowContext = {
  kind: ParentWorkflowKind;
  title: string;
  summary?: string;
  panel: AppSection;
};

const CHILD_ARTIFACT_VERB_RE =
  /\b(?:write|draft|create|generate|compose|build)\b/i;

const WEEK_POST_RE = /\bweek\s*(\d+)\s*post\s*(\d+)\b/i;

const CHILD_NOUN_RE =
  /\b(?:week\s*\d+\s*)?(?:post|email|caption|newsletter|script|carousel|thread|content\s*piece)\s*\d*\b/i;

export function isChildArtifactRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (WEEK_POST_RE.test(t)) return true;
  if (CHILD_ARTIFACT_VERB_RE.test(t) && CHILD_NOUN_RE.test(t)) return true;
  if (CHILD_ARTIFACT_VERB_RE.test(t) && /\bweek\s*\d+\b/i.test(t)) return true;
  return false;
}

export function parseChildArtifactLabel(text: string): string | null {
  const t = text.trim();
  const weekPost = t.match(WEEK_POST_RE);
  if (weekPost) {
    return `Week ${weekPost[1]} Post ${weekPost[2]}`;
  }
  const writeMatch = t.match(
    /\b(?:write|draft|create|generate)\s+(?:the\s+)?(.+?)(?:[.!?]|$)/i,
  );
  if (writeMatch?.[1]) {
    const label = writeMatch[1].trim();
    if (label.length >= 3 && label.length <= 80) return label;
  }
  return null;
}

export function resolveChildArtifactType(text: string): string {
  const t = text.toLowerCase();
  if (/\bnewsletter\b/.test(t)) return "Newsletter";
  if (/\bemail\b/.test(t)) return "Email";
  if (/\bproposal\b/.test(t)) return "Proposal";
  if (/\bworkshop\b/.test(t)) return "Workshop";
  if (/\b(?:script|video)\b/.test(t)) return "Video Script";
  if (/\b(?:post|caption|carousel|thread|linkedin|facebook|instagram)\b/.test(t)) {
    return "Social Post";
  }
  return "Social Post";
}

export function buildParentWorkflowFromStrategy(
  session: BusinessStrategySession | null | undefined,
  draft?: string | null,
): ParentWorkflowContext | null {
  const planDraft = draft?.trim() || session?.draft?.trim();
  if (!session && !planDraft) return null;
  const typeLabel = session?.typeLabel?.trim() || "Marketing Plan";
  const lower = typeLabel.toLowerCase();
  const kind: ParentWorkflowKind = lower.includes("marketing")
    ? "marketing_plan"
    : "business_strategy";
  return {
    kind,
    title: typeLabel,
    summary: planDraft?.slice(0, 4000),
    panel: "playbook",
  };
}

export function buildParentWorkflowFromProject(
  projectName: string | null | undefined,
  goal?: string | null,
): ParentWorkflowContext | null {
  const title = projectName?.trim();
  if (!title) return null;
  return {
    kind: "project",
    title,
    summary: goal?.trim() || undefined,
    panel: "projects",
  };
}

export function enrichChildArtifactFromParent(
  artifact: {
    itemType: string;
    title: string;
    draftContent: string;
  },
  parent: ParentWorkflowContext,
  userText: string,
): { itemType: string; title: string; draftContent: string; brief: string } {
  const childLabel =
    parseChildArtifactLabel(userText) ||
    parseChildArtifactLabel(artifact.title) ||
    artifact.title ||
    "Draft";
  const itemType = isChildArtifactRequest(userText)
    ? resolveChildArtifactType(userText)
    : artifact.itemType;
  const brief = [
    `Parent: ${parent.title}`,
    childLabel !== artifact.title ? `Piece: ${childLabel}` : null,
    parent.summary ? `Plan context:\n${parent.summary.slice(0, 1200)}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
  return {
    itemType,
    title: childLabel,
    draftContent: artifact.draftContent,
    brief,
  };
}

export function strategyChildArtifactFollowUp(
  parent: ParentWorkflowContext,
  childLabel: string,
): string {
  const weekPost = childLabel.match(WEEK_POST_RE);
  if (weekPost && parent.kind === "marketing_plan") {
    const week = weekPost[1];
    const postNum = weekPost[2];
    const nextPost = parseInt(postNum!, 10) + 1;
    return (
      `Applied **${childLabel}** to your draft beside us — your **${parent.title}** stays our context in chat.\n\n` +
      `What next?\n` +
      `- Write **Week ${week} Post ${nextPost}**?\n` +
      `- Generate the rest of **Week ${week}** posts?\n` +
      `- Improve this post?\n` +
      `- Image ideas for this post?\n` +
      `- Schedule this content?`
    );
  }
  return (
    `Applied **${childLabel}** to your draft beside us — your **${parent.title}** stays our context in chat.\n\n` +
    `What should we do next — another piece from the plan, improve this draft, or something else?`
  );
}

export function parentWorkflowCoachHint(
  parent: ParentWorkflowContext | null,
): string | null {
  if (!parent) return null;
  return (
    `PARENT WORKFLOW ACTIVE (${parent.title}): User is executing a child piece inside this plan — ` +
    `NOT starting a new generic Create workflow. Keep coaching in ${parent.title} context. ` +
    `After drafting, suggest the next step from the plan (next post, improve, images, schedule). ` +
    `Do NOT reset to "Creating: Content" or discovery questions.`
  );
}

/** Find the most recent child-artifact request in chat (for apply-after-generate). */
export function lastChildArtifactRequestInChat(
  messages: ChatTurn[],
): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role !== "user") continue;
    if (isChildArtifactRequest(m.content)) return m.content.trim();
  }
  return null;
}

export function shouldSuppressCreateBuilderBootstrap(opts: {
  parent: ParentWorkflowContext | null;
  hasDraftInPanel: boolean;
  workflowIsLiveDraft: boolean;
  recentUserText?: string;
}): boolean {
  if (opts.hasDraftInPanel || opts.workflowIsLiveDraft) return true;
  if (!opts.parent) return false;
  if (opts.recentUserText && isChildArtifactRequest(opts.recentUserText)) {
    return true;
  }
  return true;
}
