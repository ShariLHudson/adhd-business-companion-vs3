/**
 * Cross Workspace Guidance — detect when a workflow needs another workspace
 * (e.g. Positioning → Client Avatar), guide the user there, then return with context.
 */

import type { BusinessStrategySession } from "./businessStrategyBuilder";
import { buildBusinessStrategyDraft } from "./businessStrategyBuilder";
import type { CreateBuilderSession } from "./createBuilderChat";
import { createBuilderLabel } from "./createBuilderChat";
import type { IdealClientAvatar } from "./companionStore";
import { getActiveAvatar } from "./companionStore";
import type { ConversationPrefill } from "./companionGuidanceSystem";
import type { WorkspaceFieldId } from "./workspaceAwareness";
import type { AppSection } from "./companionUi";
import {
  advanceAfterDiscoveryAnswer,
  discoveryQuestionsForState,
  discoveryReadyForDraft,
  getDiscoveryQuestions,
  type CreateWorkflowState,
} from "./createWorkflow";
import type { StrategyApplySession } from "./strategyApplyCoach";

const STORAGE_KEY = "companion-cross-workflow-handoff-v1";

export type CrossWorkflowHandoffKind =
  | "create_builder"
  | "business_strategy"
  | "strategy_apply";

export type CrossWorkflowHandoffSnapshot = {
  id: string;
  sourcePanel: AppSection;
  sourceTitle: string;
  sourceKind: CrossWorkflowHandoffKind;
  createBuilderSession?: CreateBuilderSession | null;
  createWorkflowState?: CreateWorkflowState | null;
  businessStrategySession?: BusinessStrategySession | null;
  strategyApplySession?: StrategyApplySession | null;
  pendingQuestionId?: string | null;
  pendingQuestionPrompt?: string | null;
  savedAt: string;
};

export const CLIENT_AVATAR_HANDOFF_OFFER =
  "We're gathering customer intelligence — the same kind of detail that belongs in a **Client Avatar**. " +
  "We have a **Client Avatar Builder** that can help us organize this while we talk. " +
  "Would you like me to open it beside us and walk through it together?";

export const CLIENT_AVATAR_HANDOFF_CONTEXT =
  "Build your ideal client here — chat stays visible. I'll prefill what we already know and only ask what's missing.";

const AVATAR_BENEFITING_TYPE_RE =
  /\b(?:positioning|business strategy|marketing(?:\s+plan|\s+strategy)?|content strategy|sales funnel|funnel|facebook ad|workshop|offer|email(?:\s+sequence|\s+campaign)?|newsletter|proposal|sales page|landing page)\b/i;

const AUDIENCE_QUESTION_ID_RE =
  /^(?:audience|client|customer|recipient|reader|target|who|icp)$/i;

const AUDIENCE_QUESTION_PROMPT_RE =
  /\b(?:who is (?:your |the )?(?:target )?(?:customer|audience|client)|who are you (?:trying to )?reach|who is this for|target audience|ideal client|specific need|struggle|key benefit|key difference|who do you help)\b/i;

export function workflowBenefitsFromClientAvatar(
  typeLabel: string | null | undefined,
): boolean {
  const t = typeLabel?.trim() ?? "";
  if (!t || t === "content") return false;
  return AVATAR_BENEFITING_TYPE_RE.test(t);
}

export function isAudienceRelatedQuestion(
  questionId: string,
  prompt: string,
): boolean {
  if (AUDIENCE_QUESTION_ID_RE.test(questionId.trim())) return true;
  return AUDIENCE_QUESTION_PROMPT_RE.test(prompt.trim());
}

export function isAudienceGatheringInAssistant(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const questionMarks = (t.match(/\?/g) ?? []).length;
  if (questionMarks === 0) return false;
  const audienceHits = (t.match(AUDIENCE_QUESTION_PROMPT_RE) ?? []).length;
  return audienceHits >= 1;
}

export function isAvatarCompleteEnough(
  avatar: IdealClientAvatar | null | undefined,
): boolean {
  if (!avatar) return false;
  return Boolean(
    avatar.who?.trim() &&
      (avatar.painPoints?.trim() || avatar.goals?.trim() || avatar.solution?.trim()),
  );
}

export function shouldOfferClientAvatarHandoff(opts: {
  workspacePanel: AppSection | null;
  typeLabel?: string | null;
  currentQuestionId?: string | null;
  currentQuestionPrompt?: string | null;
  lastAssistantText?: string;
  handoffDeclined?: boolean;
  activeHandoff?: CrossWorkflowHandoffSnapshot | null;
  alreadyOffered?: boolean;
}): boolean {
  if (opts.handoffDeclined || opts.activeHandoff) return false;
  if (opts.alreadyOffered) return false;
  if (opts.workspacePanel === "client-avatars") return false;
  if (isAvatarCompleteEnough(getActiveAvatar())) return false;

  const typeLabel = opts.typeLabel?.trim();
  const byType = workflowBenefitsFromClientAvatar(typeLabel);
  const byQuestion =
    (opts.currentQuestionId &&
      opts.currentQuestionPrompt &&
      isAudienceRelatedQuestion(
        opts.currentQuestionId,
        opts.currentQuestionPrompt,
      )) ||
    (opts.lastAssistantText &&
      isAudienceGatheringInAssistant(opts.lastAssistantText));

  return Boolean(byType && byQuestion);
}

export function buildClientAvatarHandoffOffer(sourceTitle: string): {
  line: string;
  hint: string;
  contextMessage: string;
} {
  return {
    line: CLIENT_AVATAR_HANDOFF_OFFER,
    hint: CLIENT_AVATAR_HANDOFF_OFFER,
    contextMessage: `Organize ${sourceTitle} audience details in Client Avatar — your ${sourceTitle} stays saved in chat.`,
  };
}

export function crossWorkspaceGuidanceHintForChat(opts: {
  sourceTitle: string;
  typeLabel?: string | null;
  currentQuestionPrompt?: string | null;
  offeringHandoff?: boolean;
}): string | null {
  if (!workflowBenefitsFromClientAvatar(opts.typeLabel)) return null;
  if (opts.offeringHandoff) {
    return [
      "CROSS WORKSPACE GUIDANCE (mandatory):",
      `User is building **${opts.sourceTitle}** and hit audience/customer questions.`,
      `Say exactly: "${CLIENT_AVATAR_HANDOFF_OFFER}"`,
      "Wait for yes/no. Do NOT continue the generic Q&A until they decide.",
      "If yes: Client Avatar opens beside chat; prefill known info; ask only missing fields.",
      "When avatar is complete: return to the originating workflow automatically with fields populated.",
    ].join("\n");
  }
  if (
    opts.currentQuestionPrompt &&
    isAudienceRelatedQuestion("", opts.currentQuestionPrompt)
  ) {
    return [
      "CROSS WORKSPACE GUIDANCE:",
      `Audience question for **${opts.sourceTitle}** — prefer Client Avatar builder over a long generic Q&A.`,
      `Offer: "${CLIENT_AVATAR_HANDOFF_OFFER}"`,
    ].join("\n");
  }
  return null;
}

export function saveCrossWorkflowHandoff(
  snapshot: CrossWorkflowHandoffSnapshot,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* noop */
  }
}

export function loadCrossWorkflowHandoff(): CrossWorkflowHandoffSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CrossWorkflowHandoffSnapshot;
  } catch {
    return null;
  }
}

export function clearCrossWorkflowHandoff(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function buildHandoffSnapshot(
  source: Omit<CrossWorkflowHandoffSnapshot, "id" | "savedAt">,
): CrossWorkflowHandoffSnapshot {
  return {
    ...source,
    id: `handoff-${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
}

function discoveryAnswerFromAvatar(
  questionId: string,
  prompt: string,
  avatar: IdealClientAvatar,
): string | null {
  const key = `${questionId} ${prompt}`.toLowerCase();
  if (/\b(?:audience|client|customer|recipient|reader|who|target|icp)\b/.test(key)) {
    const who = [avatar.name?.trim(), avatar.who?.trim()].filter(Boolean).join(": ");
    return who || avatar.who?.trim() || null;
  }
  if (/\b(?:pain|struggle|problem|challenge|need)\b/.test(key)) {
    return avatar.painPoints?.trim() || null;
  }
  if (/\b(?:benefit|value|solution|different|unlike|promise)\b/.test(key)) {
    const parts = [avatar.solution?.trim(), avatar.tagline?.trim()].filter(Boolean);
    return parts.length ? parts.join(" — ") : null;
  }
  if (/\b(?:goal|outcome|want|achieve)\b/.test(key)) {
    return avatar.goals?.trim() || null;
  }
  return avatar.who?.trim() || null;
}

export function applyAvatarToDiscoveryAnswers(
  answers: Record<string, string>,
  avatar: IdealClientAvatar,
  typeLabel: string,
): Record<string, string> {
  const next = { ...answers };
  const questions = getDiscoveryQuestions(typeLabel, next);
  for (const q of questions) {
    if (!isAudienceRelatedQuestion(q.id, q.prompt)) continue;
    if (next[q.id]?.trim()) continue;
    const fill = discoveryAnswerFromAvatar(q.id, q.prompt, avatar);
    if (fill) next[q.id] = fill;
  }
  return next;
}

export function applyAvatarToBusinessStrategySession(
  session: BusinessStrategySession,
  avatar: IdealClientAvatar,
): BusinessStrategySession {
  const answers = { ...session.answers };
  if (!answers.audience?.trim()) {
    answers.audience =
      [avatar.name?.trim(), avatar.who?.trim()].filter(Boolean).join(": ") ||
      avatar.who?.trim() ||
      "";
  }
  if (!answers.impacts?.trim() && avatar.who?.trim()) {
    answers.impacts = avatar.who.trim();
  }
  if (!answers.outcome?.trim() && avatar.goals?.trim()) {
    answers.outcome = avatar.goals.trim();
  }
  if (!answers.obstacles?.trim() && avatar.painPoints?.trim()) {
    answers.obstacles = avatar.painPoints.trim();
  }
  if (!answers.offers?.trim() && avatar.solution?.trim()) {
    answers.offers = avatar.solution.trim();
  }
  const next = { ...session, answers };
  return { ...next, draft: buildBusinessStrategyDraft(next) };
}

export function avatarPrefillsFromDiscovery(
  answers: Record<string, string>,
  typeLabel: string,
): ConversationPrefill[] {
  const avatar = getActiveAvatar();
  const fills: ConversationPrefill[] = [];
  const seen = new Set<string>();

  const push = (
    field: WorkspaceFieldId,
    value: string | undefined,
    label: string,
  ) => {
    const v = value?.trim();
    if (!v || seen.has(field)) return;
    seen.add(field);
    fills.push({ field, value: v, label });
  };

  if (avatar?.who?.trim()) push("avatar-who", avatar.who, "Who they are");
  if (avatar?.painPoints?.trim()) {
    push("avatar-pain", avatar.painPoints, "Struggles");
  }
  if (avatar?.goals?.trim()) push("avatar-goals", avatar.goals, "Goals");
  if (avatar?.solution?.trim()) {
    push("avatar-solution", avatar.solution, "How you help");
  }

  const questions = getDiscoveryQuestions(typeLabel, answers);
  for (const q of questions) {
    if (!isAudienceRelatedQuestion(q.id, q.prompt)) continue;
    const ans = answers[q.id]?.trim();
    if (!ans) continue;
    const key = `${q.id} ${q.prompt}`.toLowerCase();
    if (/\b(?:pain|struggle|problem|challenge|need)\b/.test(key)) {
      push("avatar-pain", ans, q.prompt);
    } else if (/\b(?:benefit|value|solution|different)\b/.test(key)) {
      push("avatar-solution", ans, q.prompt);
    } else if (/\b(?:goal|outcome)\b/.test(key)) {
      push("avatar-goals", ans, q.prompt);
    } else {
      push("avatar-who", ans, q.prompt);
    }
  }

  return fills;
}

export function avatarPrefillsFromAvatar(
  avatar: IdealClientAvatar,
): ConversationPrefill[] {
  const fills: ConversationPrefill[] = [];
  if (avatar.who?.trim()) {
    fills.push({
      field: "avatar-who",
      value: avatar.who.trim(),
      label: "Who they are",
    });
  }
  if (avatar.painPoints?.trim()) {
    fills.push({
      field: "avatar-pain",
      value: avatar.painPoints.trim(),
      label: "Struggles",
    });
  }
  if (avatar.goals?.trim()) {
    fills.push({
      field: "avatar-goals",
      value: avatar.goals.trim(),
      label: "Goals",
    });
  }
  if (avatar.solution?.trim()) {
    fills.push({
      field: "avatar-solution",
      value: avatar.solution.trim(),
      label: "How you help",
    });
  }
  return fills;
}

export function advanceWorkflowPastFilledAudience(
  workflow: CreateWorkflowState,
  typeLabel: string,
): CreateWorkflowState {
  let next = workflow;
  for (let i = 0; i < 12; i++) {
    const q = discoveryQuestionsForState(typeLabel, next);
    if (!q) break;
    const ans = next.discoveryAnswers[q.id]?.trim();
    if (!ans) break;
    if (!isAudienceRelatedQuestion(q.id, q.prompt)) break;
    next = advanceAfterDiscoveryAnswer(next, typeLabel, q.id, ans);
  }
  return next;
}

export function resumeCreateBuilderAfterAvatar(
  session: CreateBuilderSession,
  avatar: IdealClientAvatar,
): { session: CreateBuilderSession; reply: string } {
  const typeLabel = session.typeLabel?.trim() || "draft";
  const mergedAnswers = applyAvatarToDiscoveryAnswers(
    session.workflow.discoveryAnswers,
    avatar,
    typeLabel,
  );
  let workflow = advanceWorkflowPastFilledAudience(
    { ...session.workflow, discoveryAnswers: mergedAnswers },
    typeLabel,
  );

  const label = createBuilderLabel(typeLabel);
  if (discoveryReadyForDraft(typeLabel, workflow)) {
    return {
      session: { ...session, workflow, phase: "readiness" },
      reply:
        `Great — I've pulled everything we need from your **Client Avatar**. ` +
        `Let's return to your **${label}**.\n\n` +
        `I think I have enough to build this. Would you like me to create the draft?`,
    };
  }

  const nextQ = discoveryQuestionsForState(typeLabel, workflow);
  return {
    session: { ...session, workflow, phase: "discovery" },
    reply: nextQ
      ? `Great — I've pulled everything we need from your **Client Avatar**. Let's return to your **${label}**.\n\n**${nextQ.prompt}**`
      : `Great — I've pulled everything from your avatar. Let's continue your **${label}**.`,
  };
}

export function buildReturnToSourceAck(
  sourceTitle: string,
  nextQuestion?: string | null,
): string {
  const base = `Great — I've pulled everything we need from your **Client Avatar**. Let's return to your **${sourceTitle}**.`;
  if (nextQuestion?.trim()) {
    return `${base}\n\n**${nextQuestion.trim()}**`;
  }
  return base;
}

export function userAcceptedClientAvatarHandoff(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(?:yes|yep|yeah|sure|ok|okay|please|open it|let'?s do it|sounds good|go ahead)\b/.test(
    t,
  );
}

export function userDeclinedClientAvatarHandoff(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(?:no|nope|not now|later|skip|keep going|continue here|stay here)\b/.test(
    t,
  );
}
