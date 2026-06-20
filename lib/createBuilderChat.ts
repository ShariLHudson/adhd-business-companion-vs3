/**
 * Create + Chat integration — when split beside Create, chat becomes a typed
 * builder (SOP Builder, Workshop Builder, etc.). One question per turn; generate
 * only after explicit user approval.
 */

import { matchCatalogFromText } from "./createCatalog";
import {
  catalogTypeFromUserPhrase,
  userFacingCreateTypeLabel,
} from "./createTypePickers";
import {
  CREATE_STEP1_CHAT,
  CREATE_KICKOFF_HEADER,
  CREATE_STEP1_QUESTION,
  isStaleCreateOpener,
} from "./builderKickoff";
import {
  advanceAfterItemPick,
  advanceAfterDiscoveryAnswer,
  advanceToDiscovery,
  buildBriefFromWorkflow,
  categoryIdForType,
  discoveryComplete,
  discoveryReadyForDraft,
  discoveryQuestionsForState,
  getDiscoveryQuestions,
  initialQuestionsComplete,
  mergeCreateWorkflow,
  requiredFieldsComplete,
  resolvedTypeLabel,
  type CreateWorkflowState,
  type PendingFieldApproval,
  EMPTY_CREATE_WORKFLOW,
  answeredDiscoveryCount,
} from "./createWorkflow";
import { buildFullCreateBrief, resolveTemplateSections } from "./createTemplates";
import {
  formatIncompleteSectionsPrompt,
  formatSectionCollectionPrompt,
  incompleteTemplateSections,
  isDiscoveryHelpRequest,
  isDraftWithWhatWeHaveRequest,
  draftWithWhatWeHaveConfirmation,
  isExplicitBuildApproval,
  WORKSPACE_SECTION_NUDGE,
  isInSectionDiscoveryPhase,
  isSectionPickIntent,
  isUnsaveableSectionText,
  matchSectionFromText,
  materializeDiscoverySections,
  setSectionContent,
  tryResolveSectionOptionApproval,
  verifySectionWrite,
} from "./createSectionDiscovery";
import {
  extractPendingBuilderContent,
  isBuilderAddCommand,
} from "./builderContentSync";
import { logCreateBuild } from "./createBuild";
import { logSharedCreateSession } from "./createSharedSession";
import { guidedProgressForWorkflow } from "./createGuidedSession";
import {
  catalogLabelToCreateType,
  getTemplateFields,
  hasGuidedTemplateFields,
} from "./createTemplateFields";
import { isCreateExplorationRequest } from "./createExplorationMode";
import {
  isCreateBuilderKeepTalkingPhrase,
  isCreateBuilderRevisePhrase,
  shouldCaptureFieldAnswer,
  shouldRevisePendingValue,
} from "./createBuilderModes";
import { isInvalidBuilderFieldValue } from "./builderContentSync";
import { CREATE_THINKING_PARTNER_PRINCIPLES } from "./createVision";
import { createDepthHintForChat, isThankYouEmailIntent } from "./createDepth";
import type { CreateTemplateSection } from "./createTemplates";

export type CreateBuilderPhase =
  | "pick-type"
  | "workspace"
  | "discovery"
  | "readiness"
  | "generating"
  | "revise-offer"
  | "done";

export type CreateBuilderAction =
  | { id: "create-draft"; label: string }
  | { id: "keep-working"; label: string }
  | { id: "review-template"; label: string }
  | { id: "use-this"; label: string }
  | { id: "revise-it"; label: string }
  | { id: "keep-talking"; label: string }
  | { id: "add-more-info"; label: string }
  | { id: "revise"; label: string; instruction: string };

export type CreateBuilderSession = {
  typeLabel: string | null;
  workflow: CreateWorkflowState;
  phase: CreateBuilderPhase;
  /** Collecting optional extra context before readiness. */
  collectingExtra?: boolean;
};

export function pendingApprovalForSession(
  session: CreateBuilderSession | null | undefined,
): PendingFieldApproval | null | undefined {
  return session?.workflow.pendingFieldApproval;
}

export function emptyCreateBuilderSession(): CreateBuilderSession {
  return {
    typeLabel: null,
    workflow: { ...EMPTY_CREATE_WORKFLOW, questionMode: "split_screen" },
    phase: "pick-type",
  };
}

const BUILDER_NAMES: Record<string, string> = {
  SOP: "SOP Builder",
  Workshop: "Workshop Builder",
  Proposal: "Proposal Builder",
  Strategy: "Strategy Builder",
  "Business Strategy": "Strategy Builder",
  "Personal Companion Strategy": "Strategy Builder",
  "Marketing Strategy": "Marketing Strategy Builder",
  "Content Strategy": "Content Strategy Builder",
  Email: "Email Builder",
  Blog: "Blog Builder",
  Presentation: "Presentation Builder",
  Newsletter: "Newsletter Builder",
  Offer: "Offer Builder",
  "Sales Page": "Sales Page Builder",
  "Marketing Plan": "Marketing Plan Builder",
  "Business Plan": "Business Plan Builder",
};

export function createBuilderLabel(typeLabel: string): string {
  const display = userFacingCreateTypeLabel(typeLabel);
  if (!display) return "Create with Shari";
  return BUILDER_NAMES[typeLabel] ?? BUILDER_NAMES[display] ?? `${display}`;
}

const PLACEHOLDER_CREATE_TITLES =
  /^(?:draft|new piece|untitled|content)$/i;

/** Title/brief that is only the artifact type label is not a real topic yet. */
export function resolvedCreateTopic(
  itemType: string | null | undefined,
  title?: string | null,
  brief?: string | null,
): string {
  const type = itemType?.trim() ?? "";
  const candidates = [title?.trim(), brief?.trim()].filter(Boolean) as string[];
  for (const c of candidates) {
    if (type && c.toLowerCase() === type.toLowerCase()) continue;
    if (PLACEHOLDER_CREATE_TITLES.test(c)) continue;
    return c;
  }
  return "";
}

/** Split-screen Create builder owns chat — block parallel coach/cards. */
export function shouldSuppressParallelCoaching(
  session: CreateBuilderSession | null,
  splitCreateChat: boolean,
): boolean {
  if (!splitCreateChat) return false;
  if (!session) return true;
  return session.phase !== "done";
}

export function resolveBuilderType(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  const fromPhrase = catalogTypeFromUserPhrase(t);
  if (fromPhrase) return fromPhrase;
  const match = matchCatalogFromText(t);
  if (match?.type && !match.route) return match.type;
  if (/\bstrateg(y|ies)\b/i.test(t)) return "Business Strategy";
  if (/\bsop\b|standard operating procedure/i.test(t)) return "SOP";
  if (/\bworkshop\b|webinar\b/i.test(t)) return "Workshop";
  if (/\bproposal\b|\bsow\b/i.test(t)) return "Proposal";
  if (/\bemail\b/i.test(t)) return "Email";
  if (isThankYouEmailIntent(t)) return "Thank-You Email";
  if (/\bnewsletter\b/i.test(t)) return "Newsletter";
  if (/\bpresentation\b|\bslides\b/i.test(t)) return "Presentation";
  if (/\bsocial media post\b/i.test(t)) return "Social Post";
  if (/\blead magnet\b/i.test(t)) return "Lead Magnet";
  if (/\blanding page\b/i.test(t)) return "Landing Page";
  if (/\bfunnel\b/i.test(t)) return "Sales Funnel";
  if (/\bemail sequence\b/i.test(t)) return "Email Sequence";
  if (/\bcourse outline\b/i.test(t)) return "Course Outline";
  if (/\bclient onboarding\b/i.test(t)) return "Client Onboarding";
  if (/\bmarketing plan\b/i.test(t)) return "Marketing Plan";
  if (/\btraining\b/i.test(t)) return "Training Guide";
  if (/\bsocial media\b/i.test(t)) return "Social Post";
  return null;
}

export function isPendingApprovalAcceptance(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[.!]+$/g, "");
  if (!t) return false;
  const exact = new Set([
    "yes",
    "yep",
    "yeah",
    "y",
    "ok",
    "okay",
    "use this",
    "use that",
    "yes use that",
    "yes use this",
    "sounds good",
    "looks good",
    "look good",
    "correct",
    "that's right",
    "that is right",
    "that works",
    "approved",
    "perfect",
    "great",
    "do it",
  ]);
  if (exact.has(t)) return true;
  return /^(yes|yep|yeah|ok|okay)\b/.test(t) && t.length <= 24;
}

function isReviseApproval(text: string): boolean {
  return isCreateBuilderRevisePhrase(text);
}

function isKeepTalkingApproval(text: string): boolean {
  return isCreateBuilderKeepTalkingPhrase(text);
}

function approvalSummaryForQuestion(questionId: string, answer: string): string {
  return answer.trim();
}

function fieldLabelForPending(
  typeLabel: string,
  pending: PendingFieldApproval,
): string {
  if (pending.fieldLabel?.trim()) return pending.fieldLabel.trim();
  if (pending.sectionLabel?.trim()) return pending.sectionLabel.trim();
  const id = pending.questionId ?? "";
  const labels: Record<string, string> = {
    audience: "Audience",
    reader: "Audience",
    topic: "Topic",
    theme: "Topic",
    goal: "Goal",
    outcome: "Outcome",
    problem: "Problem",
    offer: "Offer",
    client: "Client",
    process: "Process",
  };
  if (labels[id]) return labels[id];
  const guidedType = catalogLabelToCreateType(typeLabel);
  if (guidedType) {
    const guidedField = getTemplateFields(guidedType).find((f) => f.id === id);
    if (guidedField) return guidedField.label;
  }
  const q = getDiscoveryQuestions(typeLabel, {}).find((item) => item.id === id);
  if (!q) return "Section";
  const short = q.prompt.replace(/\?$/, "").trim();
  if (short.length <= 32) return short;
  return short.split(/\s+/).slice(0, 4).join(" ");
}

function withPendingApproval(
  session: CreateBuilderSession,
  pending: PendingFieldApproval | null,
): CreateBuilderSession {
  return {
    ...session,
    workflow: {
      ...session.workflow,
      pendingFieldApproval: pending,
    },
  };
}

function formatApprovalPrompt(
  questionId: string,
  summary: string,
  sectionLabel?: string,
): string {
  const text = summary.trim();
  if (sectionLabel) {
    return (
      `For **${sectionLabel}**, it sounds like:\n\n${text}\n\n` +
      `Would you like me to use that?`
    );
  }
  if (questionId === "audience" || questionId === "reader") {
    return (
      `It sounds like your audience is **${text}**.\n\n` +
      `Would you like me to use that?`
    );
  }
  if (questionId === "problem") {
    return (
      `It sounds like the problem is:\n\n**${text}**\n\n` +
      `Would you like me to use that?`
    );
  }
  return `It sounds like **${text}**.\n\nWould you like me to use that?`;
}

function offerFieldApproval(
  session: CreateBuilderSession,
  pending: PendingFieldApproval,
): CreateBuilderTurnResult {
  const withPending = withPendingApproval(session, pending);
  return {
    session: withPending,
    reply: formatApprovalPrompt(
      pending.questionId ?? "",
      pending.summary,
      pending.sectionLabel,
    ),
    actions: APPROVAL_ACTIONS,
  };
}

function commitPendingApproval(
  session: CreateBuilderSession,
  typeLabel: string,
): CreateBuilderTurnResult {
  const pending = session.workflow.pendingFieldApproval;
  if (!pending) {
    return { session, reply: "" };
  }
  const cleared = withPendingApproval(session, null);
  const savedValue = pending.summary.trim() || pending.rawAnswer.trim();
  if (isInvalidBuilderFieldValue(savedValue)) {
    return {
      session: cleared,
      reply:
        "That doesn't look like field content — tell me what you'd like to save, or ask for ideas.",
    };
  }
  const fieldLabel = fieldLabelForPending(typeLabel, pending);

  if (pending.kind === "discovery" && pending.questionId) {
    const nextWorkflow = advanceAfterDiscoveryAnswer(
      cleared.workflow,
      typeLabel,
      pending.questionId,
      savedValue,
    );
    logCreateBuild("Chat answer saved", {
      itemType: typeLabel,
      questionId: pending.questionId,
      answersCount: answeredDiscoveryCount(nextWorkflow),
    });
    if (initialQuestionsComplete(typeLabel, nextWorkflow)) {
      if (discoveryReadyForDraft(typeLabel, nextWorkflow)) {
        return enterReadiness(
          { ...cleared, workflow: nextWorkflow },
          typeLabel,
        );
      }
      return transitionToSectionDiscovery(
        { ...cleared, workflow: nextWorkflow },
        typeLabel,
        nextWorkflow,
      );
    }
    const nextQ = discoveryQuestionsForState(typeLabel, nextWorkflow);
    const savedLine =
      pending.questionId === "audience" || pending.questionId === "reader"
        ? `Done — I added **${savedValue}** as your audience.`
        : `Done — I added **${savedValue}** to **${fieldLabel}**.`;
    const progress = guidedProgressForWorkflow(typeLabel, nextWorkflow);
    const progressLine = progress
      ? `\n\n${progress.completed} of ${progress.total} required sections complete.`
      : "";
    return {
      session: {
        ...cleared,
        workflow: nextWorkflow,
        phase: "discovery",
      },
      reply: nextQ
        ? `${savedLine}${progressLine}\n\n**${nextQ.prompt}**`
        : savedLine,
    };
  }

  if (pending.kind === "section" && pending.sectionId) {
    const workflow = setSectionContent(
      cleared.workflow,
      pending.sectionId,
      savedValue,
    );
    const sections = resolveTemplateSections(workflow) ?? [];
    const section = sections.find((s) => s.id === pending.sectionId);
    const stillIncomplete = incompleteTemplateSections(workflow);
    const label = section?.label ?? fieldLabel;
    const savedLine = `Done — I added **${savedValue}** to **${label}**.`;
    if (stillIncomplete.length === 0) {
      return enterReadiness({ ...cleared, workflow }, typeLabel);
    }
    return {
      session: { ...cleared, workflow, phase: "discovery" },
      reply:
        `${savedLine}\n\n` +
        incompleteSectionsReply(workflow, stillIncomplete),
    };
  }

  return { session: cleared, reply: `Done — saved **${savedValue}**.` };
}

function handlePendingApprovalTurn(
  session: CreateBuilderSession,
  typeLabel: string,
  trimmed: string,
): CreateBuilderTurnResult | null {
  const pending = session.workflow.pendingFieldApproval;
  if (!pending) return null;

  if (isPendingApprovalAcceptance(trimmed)) {
    return commitPendingApproval(session, typeLabel);
  }
  if (isKeepTalkingApproval(trimmed)) {
    return {
      session: withPendingApproval(session, null),
      reply: "Sure — tell me more. Questions welcome anytime.",
    };
  }
  if (isReviseApproval(trimmed)) {
    return {
      session: withPendingApproval(session, null),
      reply: "No problem — how would you like to put that?",
    };
  }
  if (isCreateExplorationRequest(trimmed)) {
    return { session, reply: "" };
  }
  if (!shouldRevisePendingValue(trimmed)) {
    return { session, reply: "" };
  }

  return offerFieldApproval(session, {
    ...pending,
    summary: approvalSummaryForQuestion(pending.questionId ?? "", trimmed),
    rawAnswer: trimmed,
  });
}

export function isAffirmative(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(yes|yep|yeah|sure|ok|okay|please|go ahead|do it|generate|create it|create draft|build draft|build it|ready|sounds good|let's go|lets go|y)\b/.test(
    t,
  ) || /^(generate it|draft it|create it|build it)$/i.test(t.trim());
}

export function isAddMoreInformation(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(no|nope|not yet|wait|hold|stop|add more|more info|more information)\b/.test(
    t,
  );
}

export const READINESS_ACTIONS: CreateBuilderAction[] = [
  { id: "create-draft", label: "Create Draft" },
  { id: "keep-working", label: "Keep Working" },
  { id: "review-template", label: "Review Template" },
];

function workspacePanelVisible(workflow: CreateWorkflowState): boolean {
  return workflow.questionMode === "split_screen";
}

function incompleteSectionsReply(
  workflow: CreateWorkflowState,
  incomplete: CreateTemplateSection[],
  prefix?: string,
): string {
  const body = formatIncompleteSectionsPrompt(incomplete, {
    workspacePanelVisible: workspacePanelVisible(workflow),
  });
  if (!body) return prefix ?? "";
  return prefix ? `${prefix}\n\n${body}` : body;
}

function offerDraftWithWhatWeHave(
  session: CreateBuilderSession,
  workflow: CreateWorkflowState,
): CreateBuilderTurnResult {
  return {
    session: {
      ...session,
      workflow,
      phase: "readiness",
      collectingExtra: false,
    },
    reply: draftWithWhatWeHaveConfirmation(),
    actions: READINESS_ACTIONS,
  };
}

export const APPROVAL_ACTIONS: CreateBuilderAction[] = [
  { id: "use-this", label: "Use This" },
  { id: "revise-it", label: "Revise It" },
  { id: "keep-talking", label: "Keep Talking" },
];

const READINESS_PROMPT =
  "I think we have enough to create the first draft. Ready?";

function freshDiscoveryWorkflow(typeLabel: string): CreateWorkflowState {
  const picked = advanceAfterItemPick(typeLabel);
  return {
    ...advanceToDiscovery(
      {
        ...picked,
        categoryId: picked.categoryId ?? categoryIdForType(typeLabel),
        selectedTypeLabel: typeLabel,
        step: "discovery",
      },
      { preserveAnswers: false },
    ),
    questionMode: "split_screen",
  };
}

export function panelWorkflowHasProgress(
  panelWorkflow: CreateWorkflowState | null | undefined,
): boolean {
  if (!panelWorkflow) return false;
  if (panelWorkflow.step === "readiness") return true;
  return answeredDiscoveryCount(panelWorkflow) > 0;
}

/** Resume chat builder from answers already collected in the Create panel. */
export function isGenericCreateBuilderChatMessage(content: string): boolean {
  const c = content.trim();
  if (!c) return false;
  return (
    c.includes(CREATE_STEP1_QUESTION) ||
    c.includes(CREATE_KICKOFF_HEADER) ||
    /what would you like to create/i.test(c) ||
    /pick a type in the panel/i.test(c) ||
    /I see you(?:'re| are) creating/i.test(c) ||
    isStaleCreateOpener(c)
  );
}

type ChatLine = { role: "user" | "assistant"; content: string };

/** Strip system messages before builder opener sync. */
export function filterChatLines(
  messages: { role: string; content: string }[],
): ChatLine[] {
  return messages.filter(
    (m): m is ChatLine => m.role === "user" || m.role === "assistant",
  );
}

/** Replace generic Create picker chat with a typed builder opener. */
export function applyCreateBuilderChatOpener(
  messages: ChatLine[],
  opener: string,
  opts?: { replaceAll?: boolean },
): ChatLine[] {
  const hasUserTurns = messages.some((m) => m.role === "user");
  if (opts?.replaceAll || !hasUserTurns) {
    return [{ role: "assistant", content: opener }];
  }
  const cleaned = messages.filter(
    (m) => !(m.role === "assistant" && isGenericCreateBuilderChatMessage(m.content)),
  );
  const last = cleaned[cleaned.length - 1];
  if (last?.role === "assistant" && last.content === opener) {
    return cleaned;
  }
  return [...cleaned, { role: "assistant", content: opener }];
}

/** Panel workflow for split-screen sync — use advanceAfterItemPick when ref is stale. */
export function panelWorkflowForBuilderSync(
  typeLabel: string,
  panelWorkflow: CreateWorkflowState,
  sessionId?: string | null,
): CreateWorkflowState {
  const trimmed = typeLabel.trim();
  if (
    panelWorkflow.selectedTypeLabel === trimmed &&
    panelWorkflow.categoryId
  ) {
    return { ...panelWorkflow, questionMode: "split_screen" };
  }
  return {
    ...advanceAfterItemPick(trimmed),
    sessionId: sessionId ?? panelWorkflow.sessionId ?? undefined,
    questionMode: "split_screen",
  };
}

export function bootstrapCreateBuilderFromWorkflow(
  typeLabel: string,
  panelWorkflow: CreateWorkflowState,
): { session: CreateBuilderSession; opener: string } {
  const resolved = typeLabel.trim();
  const merged: CreateWorkflowState = {
    ...panelWorkflow,
    selectedTypeLabel: panelWorkflow.selectedTypeLabel ?? resolved,
    categoryId: panelWorkflow.categoryId ?? categoryIdForType(resolved),
    questionMode: "split_screen",
  };

  if (discoveryComplete(resolved, merged)) {
    const session: CreateBuilderSession = {
      typeLabel: resolved,
      workflow: { ...merged, step: "readiness" },
      phase: "readiness",
    };
    return {
      session,
      opener:
        `I have your answers for **${resolved}**.\n\n` +
        `${READINESS_PROMPT}`,
    };
  }

  const answered = answeredDiscoveryCount(merged);
  if (answered > 0) {
    if (initialQuestionsComplete(resolved, merged)) {
      const sectionWorkflow: CreateWorkflowState = {
        ...merged,
        step: "discovery",
        discoverySubphase: "sections",
      };
      const incomplete = incompleteTemplateSections(sectionWorkflow);
      const session: CreateBuilderSession = {
        typeLabel: resolved,
        workflow: sectionWorkflow,
        phase: "discovery",
      };
      return {
        session,
        opener: incomplete.length
          ? `I have your answers so far for **${resolved}**.\n\n${incompleteSectionsReply(sectionWorkflow, incomplete)}`
          : `I have your answers so far for **${resolved}**.`,
      };
    }
    const workflow: CreateWorkflowState = { ...merged, step: "discovery" };
    const nextQ = discoveryQuestionsForState(resolved, workflow);
    const session: CreateBuilderSession = {
      typeLabel: resolved,
      workflow,
      phase: "discovery",
    };
    if (nextQ) {
      return {
        session,
        opener:
          `I have your answers so far for **${resolved}**.\n\n` +
          `**${nextQ.prompt}**`,
      };
    }
    return bootstrapCreateBuilderFromWorkflow(resolved, {
      ...workflow,
      discoverySubphase: "sections",
    });
  }

  return bootstrapCreateBuilderSession(resolved);
}

export function reviseOfferActions(): CreateBuilderAction[] | undefined {
  return undefined;
}

export function bootstrapCreateBuilderSession(
  typeLabel?: string | null,
): { session: CreateBuilderSession; opener: string } {
  const resolved = typeLabel?.trim() || null;
  if (!resolved || resolved === "content") {
    return {
      session: emptyCreateBuilderSession(),
      opener: CREATE_STEP1_CHAT,
    };
  }

  const session: CreateBuilderSession = {
    typeLabel: resolved,
    workflow: freshDiscoveryWorkflow(resolved),
    phase: "discovery",
  };
  const first = discoveryQuestionsForState(resolved, session.workflow);
  return {
    session,
    opener: formatBuilderOpener(resolved, first?.prompt),
  };
}

function formatBuilderOpener(typeLabel: string, firstQuestion?: string): string {
  const display = userFacingCreateTypeLabel(typeLabel) ?? typeLabel;
  const intro =
    `Let's think through your **${display}** together — no rush to draft.\n\n` +
    `We'll explore the idea first; the workspace fills as you approve decisions.`;
  if (firstQuestion?.trim()) {
    const q = firstQuestion.trim();
    return `${intro}\n\n**${q}**`;
  }
  const article = /^[aeiou]/i.test(display) ? "an" : "a";
  return `${intro}\n\nWhat should we explore first for ${article} **${display}**?`;
}

export type CreateBuilderTurnResult = {
  session: CreateBuilderSession;
  reply: string;
  actions?: CreateBuilderAction[];
  /** When set, parent should trigger draft generation in Create panel. */
  generateBrief?: string;
  generateType?: string;
  /** When set, parent should refine the workspace draft. */
  reviseInstruction?: string;
};

export function processCreateBuilderTurn(
  session: CreateBuilderSession,
  userText: string,
  lastAssistantText = "",
): CreateBuilderTurnResult {
  const trimmed = userText.trim();
  if (!trimmed) {
    return {
      session,
      reply: "Take your time — even a rough answer helps.",
    };
  }

  if (session.phase === "done") {
    return { session, reply: "" };
  }

  if (session.phase === "pick-type") {
    const type = resolveBuilderType(trimmed);
    if (!type) {
      return {
        session,
        reply:
          "Pick one from the dropdown — for example **Marketing Plan**, **Workshop**, **Lead Magnet**, or **SOP**.",
      };
    }
    const next: CreateBuilderSession = {
      typeLabel: type,
      workflow: freshDiscoveryWorkflow(type),
      phase: "discovery",
    };
    const first = discoveryQuestionsForState(type, next.workflow);
    return {
      session: next,
      reply: formatBuilderOpener(type, first?.prompt),
    };
  }

  const typeLabel = session.typeLabel;
  if (!typeLabel) {
    return {
      session: emptyCreateBuilderSession(),
      reply: "What are you creating — SOP, workshop, proposal, strategy, or something else?",
    };
  }

  if (session.phase === "revise-offer") {
    return {
      session,
      reply: `Updating your **${typeLabel}** draft.`,
      reviseInstruction: trimmed,
    };
  }

  if (session.phase === "readiness") {
    if (
      isAffirmative(trimmed) ||
      /^create draft$/i.test(trimmed) ||
      /^build draft$/i.test(trimmed) ||
      /^build it$/i.test(trimmed) ||
      /^create it$/i.test(trimmed) ||
      /^generate it$/i.test(trimmed) ||
      /^draft it$/i.test(trimmed)
    ) {
      const brief = buildFullCreateBrief(session.workflow);
      const generateType = resolvedTypeLabel(session.workflow) || typeLabel;
      logCreateBuild("Build requested", {
        itemType: generateType,
        source: "chat",
      });
      return {
        session: { ...session, phase: "generating", collectingExtra: false },
        reply: "",
        generateBrief: brief,
        generateType,
      };
    }
    if (isAddMoreInformation(trimmed) || /^keep working$/i.test(trimmed)) {
      return enterExtraDiscovery(session, typeLabel);
    }
    if (/^review template$/i.test(trimmed)) {
      return {
        session,
        reply:
          "Your living template is in the panel beside chat — expand any section there, or tell me what you'd like to adjust.",
        actions: READINESS_ACTIONS,
      };
    }
    return {
      session,
      reply: READINESS_PROMPT,
      actions: READINESS_ACTIONS,
    };
  }

  if (session.phase === "discovery") {
    const pendingTurn = handlePendingApprovalTurn(session, typeLabel, trimmed);
    if (pendingTurn) return pendingTurn;

    if (session.collectingExtra) {
      const answers = {
        ...session.workflow.discoveryAnswers,
        "extra-info": [
          session.workflow.discoveryAnswers["extra-info"],
          trimmed,
        ]
          .filter(Boolean)
          .join("\n"),
      };
      const workflow = { ...session.workflow, discoveryAnswers: answers };
      if (isInSectionDiscoveryPhase(workflow)) {
        return handleSectionDiscoveryTurn(
          { ...session, collectingExtra: false, workflow },
          typeLabel,
          trimmed,
          lastAssistantText,
        );
      }
      return enterReadiness(
        {
          ...session,
          collectingExtra: false,
          workflow,
        },
        typeLabel,
      );
    }

    if (isInSectionDiscoveryPhase(session.workflow)) {
      if (isDraftWithWhatWeHaveRequest(trimmed)) {
        return offerDraftWithWhatWeHave(session, session.workflow);
      }
      return handleSectionDiscoveryTurn(session, typeLabel, trimmed, lastAssistantText);
    }

    if (isDraftWithWhatWeHaveRequest(trimmed)) {
      return offerDraftWithWhatWeHave(session, session.workflow);
    }

    if (!shouldCaptureFieldAnswer(trimmed, false)) {
      return { session, reply: "" };
    }

    const question = discoveryQuestionsForState(typeLabel, session.workflow);
    if (!question) {
      if (initialQuestionsComplete(typeLabel, session.workflow)) {
        return transitionToSectionDiscovery(
          session,
          typeLabel,
          session.workflow,
        );
      }
      return {
        session,
        reply: "Keep going — tell me a bit more when you're ready.",
      };
    }

    return offerFieldApproval(session, {
      kind: "discovery",
      questionId: question.id,
      fieldLabel: fieldLabelForPending(typeLabel, {
        kind: "discovery",
        questionId: question.id,
        summary: trimmed,
        rawAnswer: trimmed,
      }),
      summary: approvalSummaryForQuestion(question.id, trimmed),
      rawAnswer: trimmed,
    });
  }

  if (session.phase === "generating") {
    return { session, reply: "" };
  }

  return { session, reply: "" };
}

function handleSectionDiscoveryTurn(
  session: CreateBuilderSession,
  typeLabel: string,
  trimmed: string,
  lastAssistantText = "",
): CreateBuilderTurnResult {
  const pendingTurn = handlePendingApprovalTurn(session, typeLabel, trimmed);
  if (pendingTurn) return pendingTurn;

  let workflow: CreateWorkflowState = materializeDiscoverySections(typeLabel, {
    ...session.workflow,
    discoverySubphase: "sections",
    step: "discovery",
  });

  if (isExplicitBuildApproval(trimmed)) {
    return enterReadiness({ ...session, workflow }, typeLabel);
  }

  if (isDraftWithWhatWeHaveRequest(trimmed)) {
    return offerDraftWithWhatWeHave({ ...session, workflow }, workflow);
  }

  const optionPick = tryResolveSectionOptionApproval(
    trimmed,
    workflow,
    lastAssistantText,
  );
  if (!optionPick && isBuilderAddCommand(trimmed) && workflow.activeSectionId) {
    const pending = extractPendingBuilderContent(lastAssistantText);
    const activeId = workflow.activeSectionId;
    const sections = resolveTemplateSections(workflow) ?? [];
    const activeSection = sections.find((s) => s.id === activeId);
    if (
      pending &&
      activeSection &&
      !isUnsaveableSectionText(pending) &&
      verifySectionWrite(workflow, activeId, pending)
    ) {
      return offerFieldApproval(
        { ...session, workflow },
        {
          kind: "section",
          sectionId: activeId,
          sectionLabel: activeSection.label,
          summary: pending,
          rawAnswer: pending,
        },
      );
    }
  }
  if (optionPick) {
    const sections = resolveTemplateSections(workflow) ?? [];
    const section = sections.find((s) => s.id === optionPick.sectionId);
    if (section && verifySectionWrite(workflow, optionPick.sectionId, optionPick.value)) {
      return offerFieldApproval(
        { ...session, workflow },
        {
          kind: "section",
          sectionId: optionPick.sectionId,
          sectionLabel: section.label,
          summary: optionPick.value,
          rawAnswer: optionPick.value,
        },
      );
    }
  }

  if (isDiscoveryHelpRequest(trimmed)) {
    return { session: { ...session, workflow }, reply: "" };
  }

  const incomplete = incompleteTemplateSections(workflow);
  if (incomplete.length === 0) {
    return enterReadiness({ ...session, workflow }, typeLabel);
  }

  const activeId = workflow.activeSectionId;
  if (activeId) {
    const sections = resolveTemplateSections(workflow) ?? [];
    const activeSection = sections.find((s) => s.id === activeId);
    if (activeSection && !isUnsaveableSectionText(trimmed)) {
      if (verifySectionWrite(workflow, activeId, trimmed)) {
        return offerFieldApproval(
          { ...session, workflow },
          {
            kind: "section",
            sectionId: activeId,
            sectionLabel: activeSection.label,
            summary: trimmed.trim(),
            rawAnswer: trimmed.trim(),
          },
        );
      }
      return {
        session: { ...session, workflow, phase: "discovery" },
        reply: `That looks similar to what's already in **${activeSection.label}**. Want to revise it or pick another section?`,
      };
    }
  }

  const picked = matchSectionFromText(trimmed, incomplete);
  if (picked && isSectionPickIntent(trimmed, picked)) {
    return {
      session: {
        ...session,
        workflow: { ...workflow, activeSectionId: picked.id, pendingSectionOptions: null },
        phase: "discovery",
      },
      reply: formatSectionCollectionPrompt(picked),
    };
  }

  return {
    session: { ...session, workflow, phase: "discovery" },
    reply: incompleteSectionsReply(workflow, incomplete),
  };
}

function transitionToSectionDiscovery(
  session: CreateBuilderSession,
  typeLabel: string,
  workflow: CreateWorkflowState,
): CreateBuilderTurnResult {
  if (hasGuidedTemplateFields(typeLabel)) {
    return enterReadiness({ ...session, workflow }, typeLabel);
  }
  const materialized = materializeDiscoverySections(typeLabel, workflow);
  const incomplete = incompleteTemplateSections(materialized);
  if (incomplete.length === 0) {
    return enterReadiness({ ...session, workflow: materialized }, typeLabel);
  }
  const nextWorkflow: CreateWorkflowState = {
    ...materialized,
    discoverySubphase: "sections",
    step: "discovery",
    activeSectionId: null,
  };
  return {
    session: { ...session, workflow: nextWorkflow, phase: "discovery" },
    reply:
      `Got it — I've captured your answers.\n\n` +
      incompleteSectionsReply(nextWorkflow, incomplete),
  };
}

function enterExtraDiscovery(
  session: CreateBuilderSession,
  typeLabel: string,
): CreateBuilderTurnResult {
  const workflow: CreateWorkflowState = {
    ...session.workflow,
    step: "discovery",
    discoverySubphase: isInSectionDiscoveryPhase(session.workflow)
      ? "sections"
      : session.workflow.discoverySubphase,
  };
  const incomplete = incompleteTemplateSections(workflow);
  return {
    session: {
      ...session,
      phase: "discovery",
      collectingExtra: true,
      workflow,
    },
    reply:
      incomplete.length > 0
        ? `Sure — what else should we add?\n\n${incompleteSectionsReply(workflow, incomplete)}`
        : `Sure — what else should I know before we build your **${typeLabel}**?`,
  };
}

function enterReadiness(
  session: CreateBuilderSession,
  typeLabel: string,
): CreateBuilderTurnResult {
  const ready: CreateBuilderSession = {
    ...session,
    phase: "readiness",
    collectingExtra: false,
    workflow: {
      ...session.workflow,
      step: "readiness",
      questionMode: "split_screen",
      readinessConfirmed: true,
    },
  };
  logCreateBuild("Ready to build set", {
    itemType: typeLabel,
    answersCount: answeredDiscoveryCount(ready.workflow),
  });
  logSharedCreateSession("Ready to build", ready.workflow, ready.workflow.sessionId);
  return {
    session: ready,
    reply: READINESS_PROMPT,
    actions: READINESS_ACTIONS,
  };
}

export function markCreateBuilderGenerated(
  session: CreateBuilderSession,
): CreateBuilderSession {
  return { ...session, phase: "revise-offer" };
}

export function createBuilderExportMessage(typeLabel: string): string {
  return (
    `Your **${typeLabel}** draft is in the workspace.\n\n` +
    "Use **Edit**, **Save**, **Export**, or **Social** in the panel — and keep chatting here to review, improve, or rethink any section together."
  );
}

export function createBuilderActionsForPhase(
  session: CreateBuilderSession | null,
): CreateBuilderAction[] | undefined {
  if (!session) return undefined;
  if (session.phase === "workspace") return undefined;
  if (session.workflow.pendingFieldApproval) return APPROVAL_ACTIONS;
  if (session.phase === "readiness") return READINESS_ACTIONS;
  if (session.phase === "revise-offer") return reviseOfferActions();
  return undefined;
}

export function formatCreateBuilderChatHint(
  session: CreateBuilderSession | null,
): string | undefined {
  if (!session || session.phase === "done") return undefined;
  const type = session.typeLabel ?? "content";
  const name = session.typeLabel ? createBuilderLabel(type) : "Create Builder";
  const q = session.typeLabel
    ? discoveryQuestionsForState(session.typeLabel, session.workflow)
    : null;
  const sectionPhase = isInSectionDiscoveryPhase(session.workflow);
  const incomplete = sectionPhase
    ? incompleteTemplateSections(session.workflow)
    : [];

  const lines = [
    `ACTIVE MODE: ${name} (Create workspace beside chat).`,
    CREATE_THINKING_PARTNER_PRINCIPLES,
    createDepthHintForChat(type),
    "- Ask ONE question per reply when moving the conversation forward.",
    "- Welcome research, brainstorming, and I don't know — those stay in chat until they pick and approve.",
    "- Summarize candidate answers and ask approval (Use This / Revise / Keep Talking) before the workspace updates.",
    "- Do NOT generate a full draft in chat — the Create panel is the living thinking board.",
    "- Do NOT skip to generation without explicit user approval at readiness.",
    `- Artifact type: ${type}. Phase: ${session.phase}.`,
  ];

  if (session.phase === "discovery" && sectionPhase) {
    lines.push(
      "SECTION DISCOVERY: Initial questions are done. Help fill empty template outline sections.",
    );
    if (incomplete.length) {
      if (workspacePanelVisible(session.workflow)) {
        lines.push(
          "INCOMPLETE SECTIONS: visible in the workspace panel — do NOT list section names in chat.",
        );
        lines.push(
          `Nudge: "${WORKSPACE_SECTION_NUDGE}"`,
        );
      } else {
        lines.push(
          `INCOMPLETE SECTIONS: ${incomplete.map((s) => s.label).join(", ")}`,
        );
      }
    }
    const activeId = session.workflow.activeSectionId;
    if (activeId) {
      const active = incomplete.find((s) => s.id === activeId);
      if (active) {
        lines.push(`ACTIVE SECTION: ${active.label}`);
      }
    }
    lines.push(
      "If the user asks for ideas, examples, or suggestions: give 3–5 concrete options tied to their topic and audience. Offer to use one or brainstorm more. Stay in discovery — do NOT enter build-ready.",
    );
    lines.push(
      "After they pick content for a section, confirm briefly. Do NOT list remaining sections in chat when the workspace panel shows them.",
    );
  } else if (session.phase === "discovery" && q) {
    lines.push(`CURRENT TOPIC (explore together): ${q.prompt}`);
    lines.push(
      'If they say "I don\'t know" or ask for ideas: brainstorm in chat (e.g. "Let\'s explore that" + options). Do NOT save options until they approve a choice.',
    );
    lines.push(
      "Research questions (what do you think, what would make a good X) are thinking moments — answer fully, do not save as field content.",
    );
  }
  if (session.phase === "readiness") {
    lines.push(
      "READINESS: Enough decisions are on the thinking board. Ask if they want the first draft — or they can keep exploring.",
    );
  }
  if (session.phase === "revise-offer") {
    lines.push(
      "REVISE: Draft is in the workspace. User edits via Edit / Save / Export / Social dropdowns — do NOT offer quick-edit chip buttons in chat.",
    );
  }

  return lines.join("\n");
}
