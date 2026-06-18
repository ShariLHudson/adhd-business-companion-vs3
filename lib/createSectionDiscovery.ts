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
import { isInvalidBuilderFieldValue } from "./builderContentSync";
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

export function matchSectionFromText(
  text: string,
  sections: CreateTemplateSection[],
): CreateTemplateSection | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  for (const section of sections) {
    const label = section.label.toLowerCase();
    if (t === label || t.includes(label)) return section;
    const aliases = SECTION_ALIASES[section.id] ?? [];
    for (const alias of aliases) {
      if (t === alias || t.includes(alias)) return section;
    }
  }
  return null;
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
  const t = text.trim();
  if (!t) return false;
  if (isSectionExplorationRequest(t)) return true;
  return (
    /\bhelp me (?:create|write|draft|come up with|with|build)\b/i.test(t) ||
    /\bwhat should (?:the |my )?.+ be\b/i.test(t) ||
    /\bsuggest (?:a |an |the |some )?\b/i.test(t) ||
    /\bgive me (?:some )?options\b/i.test(t) ||
    /\bwhat could i put (?:here|in)\b/i.test(t)
  );
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

export function formatIncompleteSectionsPrompt(
  sections: CreateTemplateSection[],
): string {
  if (!sections.length) return "";
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
  const useBare = t.match(/\buse\s+(\d+)\b/);
  if (useBare) {
    const idx = parseInt(useBare[1]!, 10) - 1;
    const value = options[idx]?.trim();
    if (value && !isUnsaveableSectionText(value)) {
      return { sectionId, value, index: idx };
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
): { typeLabel: string | null; workflow: CreateWorkflowState } {
  const typeLabel = session.typeLabel;
  if (!typeLabel) return session;

  const allSections = resolveTemplateSections(session.workflow) ?? [];
  const incomplete = incompleteTemplateSections(session.workflow);
  const pool = incomplete.length ? incomplete : allSections;
  const matched = matchSectionFromText(userText, pool);

  const workflow: CreateWorkflowState = {
    ...session.workflow,
    discoverySubphase:
      session.workflow.discoverySubphase ??
      (isInSectionDiscoveryPhase(session.workflow) ? "sections" : null),
    activeSectionId: matched?.id ?? session.workflow.activeSectionId ?? null,
    pendingSectionOptions: null,
  };

  return { ...session, workflow };
}

export function discoveryHelpHintForChat(
  session: { typeLabel: string | null; workflow: CreateWorkflowState },
  userText: string,
): string {
  const typeLabel = session.typeLabel ?? "content";
  const activeId = session.workflow.activeSectionId;
  const sections = resolveTemplateSections(session.workflow) ?? [];
  const active = sections.find((s) => s.id === activeId);
  const incomplete = incompleteTemplateSections(session.workflow);

  return [
    "DISCOVERY HELP MODE (Create template section — mandatory):",
    `User is building a **${typeLabel}** beside the Create workspace.`,
    active
      ? `ACTIVE SECTION: **${active.label}** — all suggestions apply here until they pick another section.`
      : "Infer the section from their message if they named one.",
    incomplete.length
      ? `Still open: ${incomplete.map((s) => s.label).join(", ")}`
      : "",
    `User asked: "${userText.trim()}"`,
    "Do NOT save their question as section content.",
    "Do NOT say you added anything to the workspace yet.",
    "Generate 3–5 concrete numbered options tied to their topic and audience.",
    'End with: "Would you like to use one of these, revise one, or see more?"',
    "Stay in discovery — do NOT enter build-ready.",
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

/** Route Discovery Help to the LLM instead of the state machine. */
export function shouldBypassCreateBuilderForSectionHelp(
  session: { phase: string; workflow: CreateWorkflowState; typeLabel?: string | null } | null,
  text: string,
): boolean {
  if (!session || session.phase !== "discovery") return false;
  if (!session.typeLabel) return false;
  return isDiscoveryHelpRequest(text);
}
