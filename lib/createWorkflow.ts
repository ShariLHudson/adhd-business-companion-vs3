/**
 * Create Workspace 2.0 — guided creation, not one-shot generation.
 * Category → Type → Discovery (one Q at a time) → Readiness → Build → Improve → Export
 */

import { CREATE_CATALOG, findCatalogItem, type CreateCatalogItem, catalogCategory, dropdownItemsInCategory } from "./createCatalog";
import {
  defaultInternalSubtypeForItem,
  effectiveCreateTypeLabel,
  effectiveSubtypeLabel,
  OTHER_OPTION,
} from "./createTypePickers";
import { initializeTemplateForWorkflow } from "./createTemplates";
import { templateOutlineComplete, materializeDiscoverySections } from "./createSectionDiscovery";

export type DiscoverySubphase = "questions" | "sections";

export { catalogCategory, dropdownItemsInCategory, catalogTypesPickerLabel } from "./createCatalog";
import { sortByDropdownLabel } from "./dropdownSort";
import type { CreateTemplateSection } from "./createTemplates";

export type DraftStatus = "idle" | "building" | "ready" | "error";

/** Who asks discovery questions — Create panel alone, or Chat in split view. */
export type CreateQuestionMode = "create_only" | "split_screen";

export type CreateWorkflowStep =
  | "category"
  | "type"
  | "confirm"
  | "template"
  | "discovery"
  | "add-detail"
  | "readiness"
  | "improve"
  | "export";

export type { CreateTemplateSection };

export type DiscoveryQuestion = {
  id: string;
  prompt: string;
  why: string;
  placeholder?: string;
};

export type CreateWorkflowState = {
  step: CreateWorkflowStep;
  categoryId: string | null;
  /** Primary item type (e.g. Newsletter, SOP). */
  selectedTypeLabel: string | null;
  /** Subtype within the item (e.g. Educational, Client Onboarding). */
  selectedSubtype: string | null;
  /** When item type is Other — free-text label. */
  customTypeLabel: string | null;
  /** When subtype is Other — free-text detail. */
  customSubtype: string | null;
  discoveryAnswers: Record<string, string>;
  /** Explicit content per template section id (split-screen section discovery). */
  sectionContent?: Record<string, string>;
  /** Section currently being filled in chat. */
  activeSectionId?: string | null;
  /** After initial questions: collaborate on empty template sections. */
  discoverySubphase?: DiscoverySubphase | null;
  /** Numbered options from the last Discovery Help reply (awaiting user pick). */
  pendingSectionOptions?: string[] | null;
  discoveryIndex: number;
  readinessConfirmed: boolean;
  buildApproved: boolean;
  /** Preset or custom template id; "none" = freeform. */
  selectedTemplateId: string | null;
  selectedTemplateName: string | null;
  templateSections: CreateTemplateSection[] | null;
  useTemplate: boolean;
  draftStatus: DraftStatus;
  draftContent: string | null;
  /** Stable id shared between chat builder and Create panel. */
  sessionId?: string | null;
  /** Question ids skipped — not required for readiness or brief. */
  skippedQuestionIds?: string[];
  /** create_only = panel asks questions; split_screen = chat asks, panel shows output. */
  questionMode: CreateQuestionMode;
};

export const EMPTY_CREATE_WORKFLOW: CreateWorkflowState = {
  step: "category",
  categoryId: null,
  selectedTypeLabel: null,
  selectedSubtype: null,
  customTypeLabel: null,
  customSubtype: null,
  discoveryAnswers: {},
  sectionContent: {},
  activeSectionId: null,
  discoverySubphase: null,
  pendingSectionOptions: null,
  discoveryIndex: 0,
  readinessConfirmed: false,
  buildApproved: false,
  selectedTemplateId: null,
  selectedTemplateName: null,
  templateSections: null,
  useTemplate: true,
  draftStatus: "idle",
  draftContent: null,
  questionMode: "create_only",
};

const DEFAULT_DISCOVERY: DiscoveryQuestion[] = [
  {
    id: "purpose",
    prompt: "What is this for?",
    why: "So the draft matches your real goal, not a generic template.",
    placeholder: "The outcome you want from this piece…",
  },
  {
    id: "audience",
    prompt: "Who is this for?",
    why: "So the tone and examples fit the person reading it.",
    placeholder: "Your ideal client, reader, or buyer…",
  },
  {
    id: "must-include",
    prompt: "What must be included?",
    why: "So we don't miss the details that matter to you.",
    placeholder: "2–3 non-negotiable points…",
  },
];

const DISCOVERY_BY_TYPE: Record<string, DiscoveryQuestion[]> = {
  Proposal: [
    {
      id: "client",
      prompt: "Who is the proposal for?",
      why: "So it speaks directly to them, not a generic client.",
    },
    {
      id: "problem",
      prompt: "What problem are they trying to solve?",
      why: "So the proposal leads with their pain, not your features.",
    },
    {
      id: "deliverable",
      prompt: "What are you offering?",
      why: "So scope stays clear and concrete.",
    },
    {
      id: "included",
      prompt: "What deliverables are included?",
      why: "So expectations are spelled out up front.",
    },
    {
      id: "timeline",
      prompt: "What is the timeline?",
      why: "So expectations feel realistic from the start.",
    },
    {
      id: "pricing",
      prompt: "Is there pricing to include?",
      why: "So money isn't an awkward afterthought.",
      placeholder: "Amount, range, or \"discuss on call\"…",
    },
    {
      id: "tone",
      prompt: "What tone should it have?",
      why: "So it sounds like you talking to them.",
      placeholder: "Warm, professional, direct…",
    },
  ],
  Email: [
    {
      id: "recipient",
      prompt: "Who is receiving this email?",
      why: "So it sounds like a real person wrote to a real person.",
    },
    {
      id: "goal",
      prompt: "What should this email accomplish?",
      why: "So every line supports one clear outcome.",
    },
    {
      id: "context",
      prompt: "What context should I know?",
      why: "So the draft doesn't miss important background.",
      placeholder: "Prior conversation, offer, deadline…",
    },
  ],
  "LinkedIn Post": [
    {
      id: "topic",
      prompt: "What's the post about?",
      why: "So we stay on one idea instead of cramming three.",
    },
    {
      id: "takeaway",
      prompt: "What's the one takeaway for your reader?",
      why: "So the post has a point, not just vibes.",
    },
    {
      id: "cta",
      prompt: "What action do you want (if any)?",
      why: "So the ending feels intentional.",
      placeholder: "Comment, DM, link, or none…",
    },
  ],
  "Social Post": [
    {
      id: "topic",
      prompt: "What is the post about?",
      why: "So we stay on one clear idea.",
    },
    {
      id: "audience",
      prompt: "Who is it for?",
      why: "So the post speaks to the right person.",
      placeholder: "Pick avatars below or describe your audience…",
    },
    {
      id: "goal",
      prompt: "What outcome do you want?",
      why: "So the post drives the result you care about.",
      placeholder: "Engagement, Leads, Sales, Awareness, Comments…",
    },
  ],
  "Facebook Post": [
    {
      id: "topic",
      prompt: "What's the post about?",
      why: "So we stay on one clear idea.",
    },
    {
      id: "audience",
      prompt: "Who is this for?",
      why: "So the tone fits your readers.",
    },
    {
      id: "cta",
      prompt: "What action do you want (if any)?",
      why: "So the ending feels intentional.",
    },
  ],
  "Blog Post": [
    {
      id: "topic",
      prompt: "What's the blog post about?",
      why: "So we build around one clear idea.",
    },
    {
      id: "reader",
      prompt: "Who is reading this?",
      why: "So examples and depth fit your audience.",
    },
    {
      id: "angle",
      prompt: "What's your angle or opinion?",
      why: "So it sounds like you, not a textbook.",
    },
  ],
  SOP: [
    {
      id: "process",
      prompt: "What process are we documenting?",
      why: "So steps stay scoped to one workflow.",
    },
    {
      id: "who",
      prompt: "Who performs this process?",
      why: "So instructions match their role and skill level.",
    },
    {
      id: "trigger",
      prompt: "What triggers the process?",
      why: "So people know exactly when to start.",
    },
    {
      id: "first-step",
      prompt: "What is the first step?",
      why: "So the SOP starts with something concrete.",
    },
    {
      id: "next",
      prompt: "What happens next?",
      why: "So the flow continues clearly after step one.",
    },
    {
      id: "tools",
      prompt: "Are there tools, links, or files involved?",
      why: "So nothing important is left out of the checklist.",
      placeholder: "Apps, templates, folders, links…",
    },
    {
      id: "complete",
      prompt: "How do we know the process is complete?",
      why: "So \"done\" is obvious, not fuzzy.",
    },
  ],
  Workshop: [
    {
      id: "topic",
      prompt: "What is the workshop about?",
      why: "So every activity supports one theme.",
    },
    {
      id: "audience",
      prompt: "Who is it for?",
      why: "So examples and pace fit the room.",
    },
    {
      id: "outcome",
      prompt: "What outcome do you want attendees to achieve?",
      why: "So the workshop has a clear payoff.",
    },
    {
      id: "duration",
      prompt: "How long is the workshop?",
      why: "So the outline fits real time.",
      placeholder: "90 minutes, half-day, full day…",
    },
    {
      id: "deliverables",
      prompt: "What deliverables do you want?",
      why: "So we know what to build alongside the outline.",
      placeholder: "Slides, workbook, facilitator guide…",
    },
  ],
  Strategy: [
    {
      id: "strategy-kind",
      prompt:
        "What kind of strategy are we building — personal Companion strategy, or business / marketing / content / sales?",
      why: "So the questions match what you're actually planning.",
    },
  ],
  Offer: [
    {
      id: "offer",
      prompt: "What are you offering?",
      why: "So the description stays specific.",
    },
    {
      id: "who",
      prompt: "Who is it for?",
      why: "So benefits speak to the right person.",
    },
    {
      id: "transformation",
      prompt: "What changes for them after they buy?",
      why: "So the offer sells outcomes, not features.",
    },
  ],
  "Sales Page": [
    {
      id: "product",
      prompt: "What are you selling?",
      why: "So the page stays focused on one offer.",
    },
    {
      id: "buyer",
      prompt: "Who is the ideal buyer?",
      why: "So headlines hit their real desires.",
    },
    {
      id: "objection",
      prompt: "What hesitation do they usually have?",
      why: "So we address it before they bounce.",
    },
  ],
  "Marketing Plan": [
    {
      id: "business",
      prompt: "What business or offer is this plan for?",
      why: "So marketing ties to something real.",
    },
    {
      id: "goal",
      prompt: "What are you trying to grow?",
      why: "So tactics align with the goal.",
    },
    {
      id: "channel",
      prompt: "Where do your people already show up?",
      why: "So the plan is realistic for your capacity.",
    },
  ],
  Presentation: [
    {
      id: "title",
      prompt: "What is the presentation title?",
      why: "So the deck has a clear headline.",
    },
    {
      id: "audience",
      prompt: "Who is in the room?",
      why: "So examples land with them.",
    },
    {
      id: "purpose",
      prompt: "What is the purpose of this presentation?",
      why: "So slides match the setting and goal.",
    },
    {
      id: "length",
      prompt: "How long is the presentation?",
      why: "So the outline fits your time slot.",
      placeholder: "15 minutes, 30 minutes, 1 hour…",
    },
    {
      id: "main-message",
      prompt: "What is the main message?",
      why: "So every slide supports one core idea.",
    },
    {
      id: "outcome",
      prompt: "What should they think or do afterward?",
      why: "So the arc builds to one outcome.",
    },
  ],
  Newsletter: [
    {
      id: "theme",
      prompt: "What is this newsletter about?",
      why: "So the newsletter has one clear thread.",
    },
    {
      id: "reader",
      prompt: "Who is it for?",
      why: "So tone matches your list.",
    },
    {
      id: "goal",
      prompt: "What is the main message?",
      why: "So every section supports one core idea.",
    },
    {
      id: "cta",
      prompt: "What action should readers take?",
      why: "So the ending drives action.",
      placeholder: "Reply, click, book, shop…",
    },
  ],
  "Video Script": [
    {
      id: "topic",
      prompt: "What is the script for?",
      why: "So the script stays focused on one purpose.",
    },
    {
      id: "audience",
      prompt: "Who is watching or listening?",
      why: "So the tone fits them.",
    },
    {
      id: "length",
      prompt: "How long should it run?",
      why: "So pacing matches your slot.",
      placeholder: "60 seconds, 5 minutes, 20 minutes…",
    },
  ],
  "Email Campaign": [
    {
      id: "goal",
      prompt: "What is this campaign trying to achieve?",
      why: "So every email supports one outcome.",
    },
    {
      id: "audience",
      prompt: "Who is on this list?",
      why: "So messaging fits the people receiving it.",
    },
    {
      id: "sequence",
      prompt: "How many emails, and what is the arc?",
      why: "So the sequence has a clear flow.",
      placeholder: "3 emails over 5 days — welcome, value, offer…",
    },
  ],
  "Sales Funnel": [
    {
      id: "offer",
      prompt: "What are you selling?",
      why: "So the funnel stays focused on one offer.",
    },
    {
      id: "audience",
      prompt: "Who is the ideal buyer?",
      why: "So each step speaks to them.",
    },
    {
      id: "entry",
      prompt: "What is the entry point or lead magnet?",
      why: "So the top of the funnel is concrete.",
    },
  ],
  "Training Guide": [
    {
      id: "audience",
      prompt: "Who is this training for?",
      why: "So examples and pace fit learners.",
    },
    {
      id: "purpose",
      prompt: "What is the purpose of this training?",
      why: "So the guide matches why it exists.",
    },
    {
      id: "learning-goal",
      prompt: "What is the learning goal?",
      why: "So learners know what they'll gain.",
    },
    {
      id: "key-topics",
      prompt: "What are the key topics to cover?",
      why: "So nothing important is left out.",
      placeholder: "2–5 main topics or modules…",
    },
    {
      id: "outcome",
      prompt: "What should they be able to do after?",
      why: "So the guide has a clear payoff.",
    },
  ],
  "Follow-Up Email": [
    {
      id: "recipient",
      prompt: "Who are you following up with?",
      why: "So it sounds personal, not generic.",
    },
    {
      id: "context",
      prompt: "What happened before this follow-up?",
      why: "So the email picks up the right thread.",
    },
    {
      id: "goal",
      prompt: "What should this email accomplish?",
      why: "So you know when it's done its job.",
    },
  ],
};

const STRATEGY_PERSONAL: DiscoveryQuestion[] = [
  {
    id: "focus",
    prompt: "What personal or ADHD pattern are we strategizing around?",
    why: "So the plan fits your brain, not a generic productivity template.",
  },
  {
    id: "situation",
    prompt: "What's happening right now that made this strategy necessary?",
    why: "So we address reality, not theory.",
  },
  {
    id: "outcome",
    prompt: "What would success look like in the next few weeks?",
    why: "So actions tie to something you can actually notice.",
  },
  {
    id: "constraint",
    prompt: "What's the biggest constraint — time, energy, or attention?",
    why: "So the strategy is honest about limits.",
  },
];

const STRATEGY_BUSINESS: DiscoveryQuestion[] = [
  {
    id: "goal",
    prompt: "What is the business goal?",
    why: "So the strategy aims at one clear outcome.",
  },
  {
    id: "audience",
    prompt: "Who is the target audience?",
    why: "So the strategy fits who you serve.",
  },
  {
    id: "challenge",
    prompt: "What is the current challenge?",
    why: "So the strategy addresses what's actually true.",
  },
  {
    id: "outcome",
    prompt: "What is the desired result?",
    why: "So actions tie to a measurable win.",
  },
  {
    id: "timeframe",
    prompt: "What is the timeframe?",
    why: "So the plan fits a real horizon.",
    placeholder: "30 days, 90 days, this quarter…",
  },
];

const STRATEGY_MARKETING: DiscoveryQuestion[] = [
  {
    id: "focus",
    prompt: "What marketing goal are we strategizing for?",
    why: "So tactics serve one clear outcome.",
  },
  {
    id: "audience",
    prompt: "Who are you trying to reach?",
    why: "So messaging lands with the right people.",
  },
  {
    id: "channel",
    prompt: "Where do they already show up?",
    why: "So the plan fits your real channels.",
  },
  {
    id: "outcome",
    prompt: "What would a win look like in 90 days?",
    why: "So we know what we're aiming at.",
  },
];

const STRATEGY_CONTENT: DiscoveryQuestion[] = [
  {
    id: "focus",
    prompt: "What content strategy are we defining?",
    why: "So we stay on one content lane.",
  },
  {
    id: "audience",
    prompt: "Who is the content for?",
    why: "So topics and tone fit them.",
  },
  {
    id: "cadence",
    prompt: "How often can you realistically publish?",
    why: "So the plan matches your capacity.",
  },
  {
    id: "outcome",
    prompt: "What should this content achieve?",
    why: "So posts aren't just activity — they have a job.",
  },
];

const STRATEGY_SALES: DiscoveryQuestion[] = [
  {
    id: "focus",
    prompt: "What sales outcome is this strategy for?",
    why: "So every step points toward revenue.",
  },
  {
    id: "offer",
    prompt: "What are you selling?",
    why: "So the strategy stays tied to a real offer.",
  },
  {
    id: "buyer",
    prompt: "Who is the ideal buyer?",
    why: "So outreach and messaging fit them.",
  },
  {
    id: "outcome",
    prompt: "What would a win look like in 90 days?",
    why: "So we know when the strategy is working.",
  },
];

function strategyFollowUpQuestions(kindAnswer: string): DiscoveryQuestion[] {
  const k = kindAnswer.toLowerCase();
  if (/personal|companion|adhd/i.test(k)) return STRATEGY_PERSONAL;
  if (/marketing/i.test(k)) return STRATEGY_MARKETING;
  if (/content/i.test(k)) return STRATEGY_CONTENT;
  if (/sales/i.test(k)) return STRATEGY_SALES;
  return STRATEGY_BUSINESS;
}

function strategyDiscoveryQuestions(answers: Record<string, string>): DiscoveryQuestion[] {
  const kind = answers["strategy-kind"]?.trim();
  const kindQ = DISCOVERY_BY_TYPE.Strategy![0]!;
  if (!kind) return [kindQ];
  return [kindQ, ...strategyFollowUpQuestions(kind)];
}

export function getDiscoveryQuestions(
  typeLabel: string,
  answers: Record<string, string> = {},
): DiscoveryQuestion[] {
  if (typeLabel === "Personal Companion Strategy") return STRATEGY_PERSONAL;
  if (typeLabel === "Business Strategy") return STRATEGY_BUSINESS;
  if (typeLabel === "Marketing Strategy") return STRATEGY_MARKETING;
  if (typeLabel === "Content Strategy") return STRATEGY_CONTENT;
  if (typeLabel === "Strategy") {
    return strategyDiscoveryQuestions(answers);
  }
  return DISCOVERY_BY_TYPE[typeLabel] ?? DEFAULT_DISCOVERY;
}

export function categoryIdForType(typeLabel: string): string | null {
  for (const cat of CREATE_CATALOG) {
    if (cat.items.some((i) => i.label === typeLabel)) return cat.id;
  }
  return null;
}

export function creatableItemsInCategory(categoryId: string): CreateCatalogItem[] {
  return dropdownItemsInCategory(categoryId).filter((i) => !i.route);
}

export function workflowStepLabel(step: CreateWorkflowStep): string {
  const labels: Record<CreateWorkflowStep, string> = {
    category: "Item type",
    type: "Subtype",
    confirm: "Ready",
    template: "Template",
    discovery: "Discovery",
    "add-detail": "Add detail",
    readiness: "Readiness",
    improve: "Improve",
    export: "Save / Export",
  };
  return labels[step];
}

/** Resolved label used for discovery, briefs, and generation. */
export function resolvedTypeLabel(state: CreateWorkflowState): string {
  return (
    effectiveCreateTypeLabel(state.selectedTypeLabel, state.customTypeLabel) ||
    state.selectedTypeLabel?.trim() ||
    ""
  );
}

export function discoveryIndexForAnswers(
  typeLabel: string,
  answers: Record<string, string>,
  skippedQuestionIds: string[] = [],
): number {
  const questions = getDiscoveryQuestions(typeLabel, answers);
  const skipped = new Set(skippedQuestionIds);
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]!;
    if (skipped.has(q.id)) continue;
    if (!answers[q.id]?.trim()) return i;
  }
  return questions.length;
}

/** Merge chat + panel workflow — furthest progress wins. */
export function mergeCreateWorkflow(
  local: CreateWorkflowState,
  incoming: CreateWorkflowState,
  typeLabel: string,
): CreateWorkflowState {
  const discoveryAnswers = {
    ...local.discoveryAnswers,
    ...incoming.discoveryAnswers,
  };
  const sectionContent = {
    ...local.sectionContent,
    ...incoming.sectionContent,
  };
  const stepRank: Record<CreateWorkflowStep, number> = {
    category: 0,
    type: 1,
    confirm: 2,
    template: 3,
    discovery: 4,
    "add-detail": 5,
    readiness: 5,
    improve: 6,
    export: 7,
  };
  const merged: CreateWorkflowState = {
    ...local,
    ...incoming,
    discoveryAnswers,
    sectionContent,
    activeSectionId: incoming.activeSectionId ?? local.activeSectionId ?? null,
    discoverySubphase: incoming.discoverySubphase ?? local.discoverySubphase ?? null,
    pendingSectionOptions:
      incoming.pendingSectionOptions !== undefined
        ? incoming.pendingSectionOptions
        : local.pendingSectionOptions ?? null,
    selectedTypeLabel:
      incoming.selectedTypeLabel ?? local.selectedTypeLabel ?? typeLabel,
    selectedSubtype: incoming.selectedSubtype ?? local.selectedSubtype,
    customTypeLabel: incoming.customTypeLabel ?? local.customTypeLabel,
    customSubtype: incoming.customSubtype ?? local.customSubtype,
    categoryId:
      incoming.categoryId ??
      local.categoryId ??
      categoryIdForType(typeLabel),
    selectedTemplateId:
      incoming.selectedTemplateId ?? local.selectedTemplateId,
    selectedTemplateName:
      incoming.selectedTemplateName ?? local.selectedTemplateName,
    templateSections: incoming.templateSections ?? local.templateSections,
    useTemplate: incoming.useTemplate ?? local.useTemplate,
    draftStatus:
      incoming.draftStatus === "ready" || local.draftStatus === "ready"
        ? "ready"
        : incoming.draftStatus === "building" || local.draftStatus === "building"
          ? "building"
          : incoming.draftStatus === "error" || local.draftStatus === "error"
            ? "error"
            : "idle",
    draftContent: incoming.draftContent ?? local.draftContent,
    questionMode:
      incoming.questionMode === "split_screen" ||
      local.questionMode === "split_screen"
        ? "split_screen"
        : "create_only",
    step:
      stepRank[incoming.step] >= stepRank[local.step]
        ? incoming.step
        : local.step,
    buildApproved: local.buildApproved || incoming.buildApproved,
    readinessConfirmed:
      local.readinessConfirmed || incoming.readinessConfirmed,
    skippedQuestionIds: [
      ...new Set([
        ...(local.skippedQuestionIds ?? []),
        ...(incoming.skippedQuestionIds ?? []),
      ]),
    ],
  };

  const mergedSkipped = merged.skippedQuestionIds ?? [];

  if (merged.buildApproved) return merged;

  const resolved = resolvedTypeLabel(merged) || typeLabel;
  if (
    merged.step === "readiness" ||
    discoveryComplete(resolved, merged)
  ) {
    return {
      ...merged,
      step: discoveryComplete(resolved, merged) ? "readiness" : "discovery",
      discoveryIndex: discoveryIndexForAnswers(
        resolved,
        discoveryAnswers,
        mergedSkipped,
      ),
    };
  }

  const answered = answeredDiscoveryCount(merged);
  if (answered > 0) {
    const idx = discoveryIndexForAnswers(
      resolved,
      discoveryAnswers,
      mergedSkipped,
    );
    const questions = getDiscoveryQuestions(resolved, discoveryAnswers);
    if (idx >= questions.length) {
      return { ...merged, step: "readiness", discoveryIndex: idx };
    }
    return { ...merged, step: "discovery", discoveryIndex: idx };
  }

  return merged;
}

export function shouldOfferDiscovery(state: CreateWorkflowState): boolean {
  if (state.buildApproved) return false;
  if (state.step === "readiness") return false;
  return answeredDiscoveryCount(state) === 0;
}

export function discoveryQuestionsForState(
  typeLabel: string,
  state: CreateWorkflowState,
): DiscoveryQuestion | null {
  const questions = getDiscoveryQuestions(typeLabel, state.discoveryAnswers);
  const idx = discoveryIndexForAnswers(
    typeLabel,
    state.discoveryAnswers,
    state.skippedQuestionIds ?? [],
  );
  if (idx >= questions.length) return null;
  return questions[idx] ?? null;
}

export function discoveryQuestionProgress(
  typeLabel: string,
  state: CreateWorkflowState,
): { current: number; total: number } {
  const questions = getDiscoveryQuestions(typeLabel, state.discoveryAnswers);
  const total = Math.max(questions.length, 1);
  const idx = discoveryIndexForAnswers(
    typeLabel,
    state.discoveryAnswers,
    state.skippedQuestionIds ?? [],
  );
  return {
    current: Math.min(idx + 1, total),
    total,
  };
}

/** True when every required discovery question has an answer or was skipped. */
export function requiredFieldsComplete(
  typeLabel: string,
  answers: Record<string, string>,
  skippedQuestionIds: string[] = [],
): boolean {
  const questions = getDiscoveryQuestions(typeLabel, answers);
  const skipped = new Set(skippedQuestionIds);
  return questions.every(
    (q) => skipped.has(q.id) || Boolean(answers[q.id]?.trim()),
  );
}

export function discoveryComplete(
  typeLabel: string,
  state: CreateWorkflowState,
): boolean {
  const questionsDone = requiredFieldsComplete(
    typeLabel,
    state.discoveryAnswers,
    state.skippedQuestionIds ?? [],
  );
  if (!questionsDone) return false;
  if (state.questionMode === "split_screen") {
    return templateOutlineComplete(state);
  }
  return true;
}

export function answeredDiscoveryCount(state: CreateWorkflowState): number {
  return Object.values(state.discoveryAnswers).filter((v) => v.trim()).length;
}

export function buildBriefFromDiscovery(
  typeLabel: string,
  answers: Record<string, string>,
  subtype?: string | null,
): string {
  const questions = getDiscoveryQuestions(typeLabel, answers);
  const lines = questions
    .map((q) => {
      const a = answers[q.id]?.trim();
      if (!a) return null;
      return `${q.prompt}\n${a}`;
    })
    .filter(Boolean) as string[];
  const extra = answers["extra-detail"]?.trim();
  if (extra) {
    lines.push(`Additional detail\n${extra}`);
  }
  const header = subtype
    ? `Creating: ${typeLabel} (${subtype})`
    : `Creating: ${typeLabel}`;
  if (!lines.length) {
    return subtype
      ? `Create a ${typeLabel} — ${subtype}.`
      : `Create a ${typeLabel}.`;
  }
  return [header, ...lines].join("\n\n");
}

export function buildBriefFromWorkflow(state: CreateWorkflowState): string {
  const typeLabel = resolvedTypeLabel(state);
  const subtype = effectiveSubtypeLabel(state.selectedSubtype, state.customSubtype);
  return buildBriefFromDiscovery(typeLabel, state.discoveryAnswers, subtype);
}

export function readinessSummary(
  typeLabel: string,
  answers: Record<string, string>,
): { label: string; value: string }[] {
  const questions = getDiscoveryQuestions(typeLabel, answers);
  const rows = questions
    .map((q) => {
      const v = answers[q.id]?.trim();
      if (!v) return null;
      return { label: q.prompt, value: v };
    })
    .filter(Boolean) as { label: string; value: string }[];
  const extra = answers["extra-detail"]?.trim();
  if (extra) {
    rows.push({ label: "Additional detail", value: extra });
  }
  return rows;
}

/** One answered question is enough before first draft (create-only panel mode). */
export const SIMPLIFIED_DISCOVERY_ANSWER_TARGET = 1;

export function hasEnoughDiscoveryForDraft(
  answers: Record<string, string>,
): boolean {
  return (
    Object.values(answers).filter((v) => v.trim()).length >=
    SIMPLIFIED_DISCOVERY_ANSWER_TARGET
  );
}

export function discoveryReadyForDraft(
  typeLabel: string,
  state: CreateWorkflowState,
): boolean {
  if (state.questionMode === "split_screen") {
    return discoveryComplete(typeLabel, state);
  }
  if (hasEnoughDiscoveryForDraft(state.discoveryAnswers)) return true;
  return discoveryComplete(typeLabel, state);
}

/** Initial discovery questions answered — may still need template sections. */
export function initialQuestionsComplete(
  typeLabel: string,
  state: CreateWorkflowState,
): boolean {
  return requiredFieldsComplete(
    typeLabel,
    state.discoveryAnswers,
    state.skippedQuestionIds ?? [],
  );
}

function withDefaultTemplate(
  state: CreateWorkflowState,
): CreateWorkflowState {
  const typeLabel =
    effectiveCreateTypeLabel(state.selectedTypeLabel, state.customTypeLabel) ||
    state.selectedTypeLabel?.trim() ||
    "";
  const withSubtype =
    state.selectedSubtype == null && typeLabel
      ? {
          ...state,
          selectedSubtype: defaultInternalSubtypeForItem(typeLabel),
        }
      : state;
  return advanceFromTemplate(initializeTemplateForWorkflow(withSubtype));
}

/** Skip subtype + template screens — outcome → one Shari question → draft. */
export function advanceAfterItemPick(typeLabel: string): CreateWorkflowState {
  if (typeLabel === OTHER_OPTION) {
    return {
      ...EMPTY_CREATE_WORKFLOW,
      step: "category",
      selectedTypeLabel: OTHER_OPTION,
      customTypeLabel: "",
    };
  }
  return withDefaultTemplate({
    ...EMPTY_CREATE_WORKFLOW,
    categoryId: categoryIdForType(typeLabel),
    selectedTypeLabel: typeLabel,
  });
}

export function advanceAfterCustomItem(customLabel: string): CreateWorkflowState {
  const trimmed = customLabel.trim();
  return withDefaultTemplate({
    ...EMPTY_CREATE_WORKFLOW,
    categoryId: categoryIdForType(trimmed),
    selectedTypeLabel: OTHER_OPTION,
    customTypeLabel: trimmed,
    selectedSubtype: null,
    customSubtype: null,
    discoveryIndex: 0,
    discoveryAnswers: {},
  });
}

/** Normalize legacy sessions that still sit on subtype/template steps. */
export function normalizeSimplifiedCreateWorkflow(
  state: CreateWorkflowState,
): CreateWorkflowState {
  if (
    state.step !== "type" &&
    state.step !== "template" &&
    state.step !== "confirm"
  ) {
    return state;
  }
  if (!resolvedTypeLabel(state) && !state.selectedTypeLabel) return state;
  return withDefaultTemplate(state);
}

/** Apply a chat line as the current discovery answer when Create is open. */
export function applyCreateDiscoveryFromChat(
  state: CreateWorkflowState,
  userText: string,
): CreateWorkflowState | null {
  const typeLabel = resolvedTypeLabel(state);
  const text = userText.trim();
  if (!typeLabel || !text || state.step !== "discovery") return null;
  if (text.length < 4 || /^(?:yes|no|ok|okay|skip|next)$/i.test(text)) {
    return null;
  }
  const question = discoveryQuestionsForState(typeLabel, state);
  if (!question) return null;
  return advanceAfterDiscoveryAnswer(
    state,
    typeLabel,
    question.id,
    text,
  );
}

export function advanceAfterSubtypePick(
  state: CreateWorkflowState,
  subtype: string,
): CreateWorkflowState {
  if (subtype === OTHER_OPTION) {
    return {
      ...state,
      step: "type",
      selectedSubtype: OTHER_OPTION,
      customSubtype: "",
    };
  }
  return initializeTemplateForWorkflow({
    ...state,
    step: "template",
    selectedSubtype: subtype,
    customSubtype: null,
    discoveryIndex: 0,
    discoveryAnswers: state.discoveryAnswers,
  });
}

export function advanceAfterCustomSubtype(
  state: CreateWorkflowState,
  customSubtype: string,
): CreateWorkflowState {
  return initializeTemplateForWorkflow({
    ...state,
    step: "template",
    selectedSubtype: OTHER_OPTION,
    customSubtype: customSubtype.trim(),
    discoveryIndex: 0,
    discoveryAnswers: state.discoveryAnswers,
  });
}

export function advanceFromTemplate(
  state: CreateWorkflowState,
): CreateWorkflowState {
  return {
    ...initializeTemplateForWorkflow(state),
    step: "discovery",
    discoveryIndex: discoveryIndexForAnswers(
      resolvedTypeLabel(state),
      state.discoveryAnswers,
      state.skippedQuestionIds ?? [],
    ),
  };
}

export function advanceAfterTypePick(
  typeLabel: string,
  categoryId: string | null,
): CreateWorkflowState {
  return {
    ...EMPTY_CREATE_WORKFLOW,
    step: "confirm",
    categoryId: categoryId ?? categoryIdForType(typeLabel),
    selectedTypeLabel: typeLabel,
    selectedSubtype: null,
    customTypeLabel: null,
    customSubtype: null,
  };
}

export function advanceToDiscovery(
  state: CreateWorkflowState,
  opts?: { preserveAnswers?: boolean },
): CreateWorkflowState {
  const preserve = opts?.preserveAnswers ?? false;
  return {
    ...state,
    step: "discovery",
    discoveryIndex: preserve
      ? discoveryIndexForAnswers(
          resolvedTypeLabel(state),
          state.discoveryAnswers,
          state.skippedQuestionIds ?? [],
        )
      : 0,
    discoveryAnswers: preserve ? state.discoveryAnswers : {},
    skippedQuestionIds: preserve ? state.skippedQuestionIds : [],
  };
}

export function advanceAfterDiscoveryAnswer(
  state: CreateWorkflowState,
  typeLabel: string,
  questionId: string,
  answer: string,
): CreateWorkflowState {
  const answers = { ...state.discoveryAnswers, [questionId]: answer };
  const skipped = state.skippedQuestionIds ?? [];
  const idx = discoveryIndexForAnswers(typeLabel, answers, skipped);
  const withAnswers = { ...state, discoveryAnswers: answers };
  const materialized =
    state.questionMode === "split_screen"
      ? materializeDiscoverySections(typeLabel, withAnswers)
      : withAnswers;
  const fieldsComplete = requiredFieldsComplete(typeLabel, answers, skipped);
  const outlineComplete = templateOutlineComplete(materialized);
  const complete =
    state.questionMode === "split_screen"
      ? outlineComplete
      : hasEnoughDiscoveryForDraft(answers) || fieldsComplete;
  const enterSections =
    state.questionMode === "split_screen" && fieldsComplete && !outlineComplete;
  return {
    ...materialized,
    discoveryIndex: idx,
    discoverySubphase: enterSections
      ? "sections"
      : materialized.discoverySubphase,
    step: complete ? "readiness" : "discovery",
  };
}

export function skipDiscoveryQuestion(
  state: CreateWorkflowState,
  typeLabel: string,
  questionId: string,
): CreateWorkflowState {
  const answers = { ...state.discoveryAnswers };
  delete answers[questionId];
  const skippedQuestionIds = [
    ...new Set([...(state.skippedQuestionIds ?? []), questionId]),
  ];
  const questions = getDiscoveryQuestions(typeLabel, answers);
  const fieldsComplete = requiredFieldsComplete(
    typeLabel,
    answers,
    skippedQuestionIds,
  );
  const withSkipped = {
    ...state,
    discoveryAnswers: answers,
    skippedQuestionIds,
  };
  const outlineComplete = templateOutlineComplete(withSkipped);
  const complete =
    state.questionMode === "split_screen"
      ? fieldsComplete && outlineComplete
      : fieldsComplete;
  return {
    ...withSkipped,
    discoveryIndex: fieldsComplete
      ? questions.length
      : discoveryIndexForAnswers(typeLabel, answers, skippedQuestionIds),
    discoverySubphase:
      state.questionMode === "split_screen" && fieldsComplete && !outlineComplete
        ? "sections"
        : state.discoverySubphase,
    step: complete ? "readiness" : "discovery",
  };
}

export function itemRoutedElsewhere(item: CreateCatalogItem): boolean {
  return Boolean(item.route);
}

export function resolveCatalogItem(label: string): CreateCatalogItem | undefined {
  return findCatalogItem(label);
}
