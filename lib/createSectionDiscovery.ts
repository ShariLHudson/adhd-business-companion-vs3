/**
 * Template-section discovery — after initial questions, collaborate until every
 * outline section has content (or the user explicitly approves a draft).
 */

import {
  getDiscoveryQuestions,
  requiredFieldsComplete,
  resolvedTypeLabel,
  type CreateWorkflowState,
} from "./createWorkflow";
import {
  resolveTemplateSections,
  type CreateTemplateSection,
} from "./createTemplates";
import { isHelpSeekingAnswer, isInvalidBuilderFieldValue } from "./builderContentSync";
import { isCreateExplorationRequest } from "./createExplorationMode";
import { shouldCaptureFieldAnswer } from "./createBuilderModes";
import {
  createThinkingPartnerHint,
  CREATE_THINKING_PARTNER_PRINCIPLES,
  DRAFT_WITH_WHAT_WE_HAVE_PROMPT,
} from "./createVision";
import { CREATE_WORKSPACE_V2 } from "./createWorkspaceFlags";
import { formatCreateWorkspaceV2ExplorationHint } from "./createWorkspaceExplorationHint";
import { extractNumberedOptions, parseOptionSelection } from "./workspaceSop";

/** Discovery question id → template section id, per item type. */
const DISCOVERY_SECTION_MAP: Record<string, Record<string, string>> = {
  Workshop: {
    topic: "overview",
    audience: "overview",
    outcome: "outcomes",
    duration: "agenda",
    deliverables: "materials",
  },
  Newsletter: {
    reader: "opening",
    theme: "main",
    goal: "main",
    takeaways: "main",
    cta: "cta",
  },
  SOP: {
    process: "purpose",
    who: "scope",
    trigger: "purpose",
    "first-step": "steps",
    next: "steps",
  },
  Email: {
    recipient: "opening",
    goal: "body",
    context: "body",
  },
  Proposal: {
    client: "summary",
    problem: "summary",
    deliverable: "scope",
    included: "scope",
    timeline: "timeline",
    pricing: "investment",
    tone: "approach",
  },
  "Marketing Plan": {
    audience: "audience",
    outcome: "positioning",
    struggle: "content",
  },
  "Lead Magnet": {
    audience: "audience",
    problem: "problem",
    desiredOutcome: "outcome",
    promotion: "promotion",
    format: "format",
    promise: "promise",
    outline: "outline",
    cta: "cta",
    tone: "notes",
    avoid: "notes",
  },
  "Landing Page": {
    offer: "headline",
    audience: "problem",
    action: "cta",
  },
  "Email Sequence": {
    goal: "goal",
    audience: "arc",
    sequence: "emails",
  },
  "Course Outline": {
    audience: "audience",
    transformation: "transformation",
    modules: "modules",
  },
  "Client Onboarding": {
    client: "welcome",
    start: "kickoff",
    deliver: "deliverables",
  },
  "Sales Funnel": {
    offer: "offer",
    audience: "nurture",
    entry: "entry",
  },
  "Social Post": {
    topic: "body",
    audience: "body",
    goal: "cta",
  },
};

const SECTION_ALIASES: Record<string, string[]> = {
  subject: ["subject line", "subject", "headline"],
  opening: ["opening", "intro", "introduction"],
  main: ["main story", "main message", "main content", "body", "topic"],
  tip: ["helpful tip", "tip", "tips"],
  cta: ["offer", "call to action", "cta"],
  closing: ["closing", "sign-off", "signoff", "wrap up"],
  overview: ["overview", "workshop overview"],
  outcomes: ["learning outcomes", "outcomes", "outcome"],
  agenda: ["agenda", "timeline", "duration"],
  activities: ["activities", "exercises"],
  materials: ["materials", "deliverables"],
  purpose: ["purpose"],
  scope: ["scope", "who"],
  steps: ["steps", "process steps"],
  hook: ["hook"],
  hashtags: ["hashtags", "tags"],
};

function sectionMapForType(typeLabel: string): Record<string, string> {
  return DISCOVERY_SECTION_MAP[typeLabel] ?? {};
}

function mappedSectionContent(
  typeLabel: string,
  workflow: CreateWorkflowState,
  sectionId: string,
): string | null {
  const map = sectionMapForType(typeLabel);
  if (!Object.keys(map).length) return null;

  const answers = workflow.discoveryAnswers;
  const questions = getDiscoveryQuestions(typeLabel, answers);
  const questionIds = Object.entries(map)
    .filter(([, sid]) => sid === sectionId)
    .map(([qid]) => qid);

  const parts = questionIds
    .map((qid) => {
      const value = answers[qid]?.trim();
      if (!value) return null;
      const q = questions.find((item) => item.id === qid);
      return q ? `${q.prompt}\n${value}` : value;
    })
    .filter(Boolean) as string[];

  return parts.length ? parts.join("\n\n") : null;
}

/** Resolved content for a template section (explicit + mapped discovery). */
export function resolveSectionContent(
  typeLabel: string,
  workflow: CreateWorkflowState,
  sectionId: string,
): string | null {
  const direct = workflow.sectionContent?.[sectionId]?.trim();
  if (direct) return direct;
  return mappedSectionContent(typeLabel, workflow, sectionId);
}

export function isSectionFilled(
  typeLabel: string,
  workflow: CreateWorkflowState,
  section: CreateTemplateSection,
): boolean {
  return Boolean(resolveSectionContent(typeLabel, workflow, section.id)?.trim());
}

export function incompleteTemplateSections(
  workflow: CreateWorkflowState,
): CreateTemplateSection[] {
  const typeLabel = resolvedTypeLabel(workflow);
  if (!typeLabel || !workflow.useTemplate) return [];

  const sections = resolveTemplateSections(workflow);
  if (!sections?.length) return [];

  return sections.filter((s) => !isSectionFilled(typeLabel, workflow, s));
}

export function templateOutlineComplete(workflow: CreateWorkflowState): boolean {
  if (!workflow.useTemplate) return true;
  const sections = resolveTemplateSections(workflow);
  if (!sections?.length) return true;
  return incompleteTemplateSections(workflow).length === 0;
}

export function isInSectionDiscoveryPhase(workflow: CreateWorkflowState): boolean {
  if (workflow.questionMode !== "split_screen") return false;
  const typeLabel = resolvedTypeLabel(workflow);
  if (!typeLabel) return false;

  const questionsDone = requiredFieldsComplete(
    typeLabel,
    workflow.discoveryAnswers,
    workflow.skippedQuestionIds ?? [],
  );
  return questionsDone || workflow.discoverySubphase === "sections";
}

const SECTION_PICK_RE =
  /^(?:let'?s\s+)?(?:work on|fill in|do|tackle|start with|move to|switch to)\s+(?:the\s+)?(.+?)[\s.?!]*$/i;

function findSectionByFragment(
  fragment: string,
  sections: CreateTemplateSection[],
): CreateTemplateSection | null {
  const f = fragment.trim().toLowerCase();
  if (!f) return null;

  for (const section of sections) {
    const label = section.label.toLowerCase();
    if (f === label) return section;
    const aliases = SECTION_ALIASES[section.id] ?? [];
    for (const alias of aliases) {
      if (f === alias.toLowerCase()) return section;
    }
  }

  if (f.length > 40) return null;

  for (const section of sections) {
    const label = section.label.toLowerCase();
    if (label.startsWith(f) || f.startsWith(label)) return section;
    const aliases = SECTION_ALIASES[section.id] ?? [];
    for (const alias of aliases) {
      const a = alias.toLowerCase();
      if (a.startsWith(f) || f.startsWith(a)) return section;
    }
  }

  return null;
}

export function matchSectionFromText(
  text: string,
  sections: CreateTemplateSection[],
): CreateTemplateSection | null {
  const raw = text.trim();
  if (!raw) return null;

  const pickMatch = raw.match(SECTION_PICK_RE);
  if (pickMatch?.[1]) {
    const found = findSectionByFragment(pickMatch[1], sections);
    if (found) return found;
  }

  if (raw.length > 48) return null;

  return findSectionByFragment(raw, sections);
}

/** Looser match for help/exploration — finds section names inside a longer question. */
export function inferSectionFromHelpText(
  text: string,
  sections: CreateTemplateSection[],
): CreateTemplateSection | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  for (const section of sections) {
    const label = section.label.toLowerCase();
    if (label.length >= 3 && t.includes(label)) return section;
    const aliases = SECTION_ALIASES[section.id] ?? [];
    for (const alias of aliases) {
      const a = alias.toLowerCase();
      if (a.length >= 3 && t.includes(a)) return section;
    }
    if (section.id.length >= 4 && t.includes(section.id)) return section;
  }
  return null;
}

/** True when the user is naming a section to work on — not offering section body text. */
export function isSectionPickIntent(
  text: string,
  section: CreateTemplateSection,
): boolean {
  const raw = text.trim();
  if (!raw || isUnsaveableSectionText(raw)) return false;
  if (raw.length > 48) return false;
  const found = matchSectionFromText(raw, [section]);
  return found?.id === section.id;
}

export function isSectionExplorationRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    /\b(?:what (?:could|should|can) i|ideas?|examples?|suggestions?|brainstorm|options?|what to (?:include|write|put)|help me (?:think|come up|brainstorm)|give me (?:some )?ideas|any (?:ideas|examples|suggestions))\b/i.test(
      t,
    ) ||
    /\b(?:how (?:do|should|could) i (?:write|phrase|word)|what (?:are|is) (?:a|some) good)\b/i.test(
      t,
    )
  );
}

/** User is asking for Discovery Help — not providing section content. */
export function isDiscoveryHelpRequest(text: string): boolean {
  return isCreateExplorationRequest(text);
}

export function isUnsaveableSectionText(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (isDiscoveryHelpRequest(t)) return true;
  if (isInvalidBuilderFieldValue(t, t)) return true;
  return false;
}

export function isExplicitBuildApproval(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    /^(build draft|build it|create draft|create it|generate it|draft it|let'?s draft|good enough|that'?s enough|done gathering|ready to build)\b/.test(
      t,
    ) || /^(generate|create|draft|build)\b/.test(t)
  );
}

/** User wants to draft now with partial / current content. */
export function isDraftWithWhatWeHaveRequest(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  return (
    /\b(?:write|draft|create|build)\b.*\b(?:with what we have|with what (?:we|i) have|anyway|as is|what we have)\b/i.test(
      t,
    ) ||
    /\b(?:just|go ahead and)\s+(?:write|draft|create)\b/i.test(t) ||
    /\buse what we have\b/i.test(t) ||
    /\bwrite (?:the |it |this )?(?:letter|draft|piece)\b/i.test(t)
  );
}

export function draftWithWhatWeHaveConfirmation(): string {
  return DRAFT_WITH_WHAT_WE_HAVE_PROMPT;
}

export const WORKSPACE_SECTION_NUDGE =
  "You can choose a section from the workspace, or tell me what you want to change.";

export function formatIncompleteSectionsPrompt(
  sections: CreateTemplateSection[],
  options?: { workspacePanelVisible?: boolean },
): string {
  if (!sections.length) return "";
  if (options?.workspacePanelVisible) {
    return WORKSPACE_SECTION_NUDGE;
  }
  const bullets = sections.map((s) => `• ${s.label}`).join("\n");
  return (
    `We still have a few sections we can strengthen:\n${bullets}\n\n` +
    `Which would you like to work on next?`
  );
}

export function formatSectionCollectionPrompt(section: CreateTemplateSection): string {
  return (
    `Great — let's work on **${section.label}**.\n\n` +
    `What would you like to include? (Or ask me for ideas and examples.)`
  );
}

export function setSectionContent(
  workflow: CreateWorkflowState,
  sectionId: string,
  content: string,
): CreateWorkflowState {
  const trimmed = content.trim();
  return {
    ...workflow,
    sectionContent: {
      ...workflow.sectionContent,
      [sectionId]: trimmed,
    },
    activeSectionId: null,
    pendingSectionOptions: null,
  };
}

/** Copy discovery answers into sectionContent so the outline updates immediately. */
export function materializeDiscoverySections(
  typeLabel: string,
  workflow: CreateWorkflowState,
): CreateWorkflowState {
  const map = sectionMapForType(typeLabel);
  if (!Object.keys(map).length) return workflow;

  const sectionContent = { ...(workflow.sectionContent ?? {}) };
  const bySection: Record<string, string[]> = {};

  for (const [qid, sid] of Object.entries(map)) {
    const val = workflow.discoveryAnswers[qid]?.trim();
    if (!val) continue;
    if (!bySection[sid]) bySection[sid] = [];
    bySection[sid].push(val);
  }

  for (const [sid, values] of Object.entries(bySection)) {
    if (sectionContent[sid]?.trim()) continue;
    sectionContent[sid] = values.join("\n\n");
  }

  return { ...workflow, sectionContent };
}

export function verifySectionWrite(
  workflow: CreateWorkflowState,
  sectionId: string,
  nextContent: string,
): boolean {
  const typeLabel = resolvedTypeLabel(workflow);
  if (!typeLabel) return false;
  const trimmed = nextContent.trim();
  if (!trimmed) return false;
  const before = resolveSectionContent(typeLabel, workflow, sectionId)?.trim() ?? "";
  return before !== trimmed;
}

export type SectionOptionPick = {
  sectionId: string;
  value: string;
  index: number;
};

export function tryResolveSectionOptionApproval(
  userText: string,
  workflow: CreateWorkflowState,
  lastAssistantText = "",
): SectionOptionPick | null {
  const sectionId = workflow.activeSectionId;
  if (!sectionId) return null;

  const options =
    workflow.pendingSectionOptions?.length
      ? workflow.pendingSectionOptions
      : extractNumberedOptions(lastAssistantText);
  if (options.length < 1) return null;

  const t = userText.trim().toLowerCase();
  const useBare = t.match(/\b(?:use|pick|choose|take|save)\s*#?\s*(\d+)\b/);
  if (useBare) {
    const idx = parseInt(useBare[1]!, 10) - 1;
    const value = options[idx]?.trim();
    if (value && !isUnsaveableSectionText(value)) {
      return { sectionId, value, index: idx };
    }
  }

  const useBareLegacy = t.match(/\buse\s+(\d+)\b/);
  if (useBareLegacy) {
    const idx = parseInt(useBareLegacy[1]!, 10) - 1;
    const value = options[idx]?.trim();
    if (value && !isUnsaveableSectionText(value)) {
      return { sectionId, value, index: idx };
    }
  }

  if (
    /^(?:i like that one|use this|save that)\.?$/i.test(userText.trim()) &&
    options.length === 1
  ) {
    const value = options[0]?.trim();
    if (value && !isUnsaveableSectionText(value)) {
      return { sectionId, value, index: 0 };
    }
  }

  const idx = parseOptionSelection(userText, options.length);
  if (idx === null) return null;

  const value = options[idx]?.trim();
  if (!value || isUnsaveableSectionText(value)) return null;

  return { sectionId, value, index: idx };
}

export function captureDiscoveryHelpOptions(
  workflow: CreateWorkflowState,
  assistantText: string,
): CreateWorkflowState {
  const options = extractNumberedOptions(assistantText);
  if (options.length < 2) return workflow;
  return { ...workflow, pendingSectionOptions: options };
}

export function prepareDiscoveryHelpContext(
  session: { typeLabel: string | null; workflow: CreateWorkflowState },
  userText: string,
  lastAssistantText = "",
): { typeLabel: string | null; workflow: CreateWorkflowState } {
  const typeLabel = session.typeLabel;
  if (!typeLabel) return session;

  const allSections = resolveTemplateSections(session.workflow) ?? [];
  const incomplete = incompleteTemplateSections(session.workflow);
  const pool = incomplete.length ? incomplete : allSections;
  const matched =
    inferSectionFromHelpText(userText, pool) ??
    inferSectionFromHelpText(lastAssistantText, pool) ??
    matchSectionFromText(userText, pool) ??
    matchSectionFromText(lastAssistantText, pool);

  const workflow: CreateWorkflowState = {
    ...session.workflow,
    discoverySubphase:
      session.workflow.discoverySubphase ??
      (isInSectionDiscoveryPhase(session.workflow) ? "sections" : null),
    activeSectionId:
      matched?.id ??
      session.workflow.activeSectionId ??
      null,
    pendingSectionOptions: null,
  };

  return { ...session, workflow };
}

export function discoveryHelpHintForChat(
  session: { typeLabel: string | null; workflow: CreateWorkflowState },
  userText: string,
): string {
  if (CREATE_WORKSPACE_V2 && session.workflow.workspaceFirst) {
    const sections = resolveTemplateSections(session.workflow) ?? [];
    const active = sections.find(
      (s) => s.id === session.workflow.activeSectionId,
    );
    return formatCreateWorkspaceV2ExplorationHint(
      session,
      userText,
      active?.label,
    );
  }

  const typeLabel = session.typeLabel ?? "content";
  const activeId = session.workflow.activeSectionId;
  const sections = resolveTemplateSections(session.workflow) ?? [];
  const active = sections.find((s) => s.id === activeId);
  const incomplete = incompleteTemplateSections(session.workflow);

  return [
    "EXPLORATION MODE (Create workflow — mandatory):",
    createThinkingPartnerHint(typeLabel, session.workflow, userText),
    active
      ? `ACTIVE SECTION: **${active.label}** — suggestions apply here until they pick another.`
      : "",
    incomplete.length
      ? `Thinking board still open: ${incomplete.map((s) => s.label).join(", ")}`
      : "",
    "Generate 3–5 concrete numbered options when useful.",
    "When they offer a candidate answer, they confirm separately — never auto-save.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function outlineSectionBriefLines(
  workflow: CreateWorkflowState,
): string[] {
  const typeLabel = resolvedTypeLabel(workflow);
  if (!typeLabel) return [];

  const sections = resolveTemplateSections(workflow);
  if (!sections?.length) return [];

  return sections
    .map((s) => {
      const content = resolveSectionContent(typeLabel, workflow, s.id);
      if (!content) return null;
      return `${s.label}\n${content}`;
    })
    .filter(Boolean) as string[];
}

export type OutlineSectionStatus = {
  id: string;
  label: string;
  content: string | null;
  status: "empty" | "partial" | "filled";
};

export function buildOutlineSectionStatuses(
  typeLabel: string,
  workflow: CreateWorkflowState,
): OutlineSectionStatus[] {
  const sections = resolveTemplateSections(workflow);
  if (!sections?.length) return [];

  const map = sectionMapForType(typeLabel);

  return sections.map((section) => {
    const content = resolveSectionContent(typeLabel, workflow, section.id);
    if (!content) {
      return { id: section.id, label: section.label, content: null, status: "empty" };
    }

    const mappedIds = Object.entries(map)
      .filter(([, sid]) => sid === section.id)
      .map(([qid]) => qid);
    const hasDirect = Boolean(workflow.sectionContent?.[section.id]?.trim());

    if (hasDirect || !mappedIds.length) {
      return { id: section.id, label: section.label, content, status: "filled" };
    }

    const allMappedAnswered = mappedIds.every((qid) =>
      Boolean(workflow.discoveryAnswers[qid]?.trim()),
    );
    return {
      id: section.id,
      label: section.label,
      content,
      status: allMappedAnswered ? "filled" : "partial",
    };
  });
}

/** Route thinking / exploration to the LLM instead of the state machine. */
export function shouldBypassCreateBuilderForSectionHelp(
  session: { phase: string; workflow: CreateWorkflowState; typeLabel?: string | null } | null,
  text: string,
): boolean {
  if (!session || session.phase !== "discovery") return false;
  if (!session.typeLabel) return false;
  if (session.workflow.pendingFieldApproval) return false;
  if (isDiscoveryHelpRequest(text)) return true;
  return !shouldCaptureFieldAnswer(text, false);
}
