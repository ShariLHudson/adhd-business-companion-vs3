/**
 * Create Workspace 2.0 — guided creation, not one-shot generation.
 * Category → Type → Discovery (one Q at a time) → Readiness → Build → Improve → Export
 */

import { CREATE_CATALOG, findCatalogItem, type CreateCatalogItem } from "./createCatalog";

export type CreateWorkflowStep =
  | "category"
  | "type"
  | "discovery"
  | "readiness"
  | "improve"
  | "export";

export type DiscoveryQuestion = {
  id: string;
  prompt: string;
  why: string;
  placeholder?: string;
};

export type CreateWorkflowState = {
  step: CreateWorkflowStep;
  categoryId: string | null;
  discoveryAnswers: Record<string, string>;
  discoveryIndex: number;
  readinessConfirmed: boolean;
  buildApproved: boolean;
};

export const EMPTY_CREATE_WORKFLOW: CreateWorkflowState = {
  step: "category",
  categoryId: null,
  discoveryAnswers: {},
  discoveryIndex: 0,
  readinessConfirmed: false,
  buildApproved: false,
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
      prompt: "What problem are you solving?",
      why: "So the proposal leads with their pain, not your features.",
    },
    {
      id: "deliverable",
      prompt: "What are you proposing to deliver?",
      why: "So scope stays clear and concrete.",
    },
    {
      id: "timeline",
      prompt: "What's the rough timeline or scope?",
      why: "So expectations feel realistic from the start.",
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
  "Social Campaign": [
    {
      id: "campaign",
      prompt: "What is the campaign about?",
      why: "So all posts feel connected.",
    },
    {
      id: "platform",
      prompt: "Where will this live?",
      why: "So length and tone match the platform.",
    },
    {
      id: "goal",
      prompt: "What is the campaign trying to achieve?",
      why: "So content supports a business goal.",
    },
  ],
  Blog: [
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
      prompt: "What process should this SOP cover?",
      why: "So steps stay scoped to one workflow.",
    },
    {
      id: "who",
      prompt: "Who will follow this SOP?",
      why: "So instructions match their skill level.",
    },
    {
      id: "pain",
      prompt: "What usually goes wrong without it?",
      why: "So the SOP prevents real mistakes.",
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
      id: "occasion",
      prompt: "What is the presentation for?",
      why: "So slides match the setting.",
    },
    {
      id: "audience",
      prompt: "Who is in the room?",
      why: "So examples land with them.",
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
      prompt: "What's this issue about?",
      why: "So the newsletter has one thread.",
    },
    {
      id: "reader",
      prompt: "Who subscribes?",
      why: "So tone matches your list.",
    },
    {
      id: "value",
      prompt: "What value should they walk away with?",
      why: "So it's worth opening next time.",
    },
  ],
};

export function getDiscoveryQuestions(typeLabel: string): DiscoveryQuestion[] {
  return DISCOVERY_BY_TYPE[typeLabel] ?? DEFAULT_DISCOVERY;
}

export function categoryIdForType(typeLabel: string): string | null {
  for (const cat of CREATE_CATALOG) {
    if (cat.items.some((i) => i.label === typeLabel)) return cat.id;
  }
  return null;
}

export function catalogCategory(id: string) {
  return CREATE_CATALOG.find((c) => c.id === id);
}

export function creatableItemsInCategory(categoryId: string): CreateCatalogItem[] {
  const cat = catalogCategory(categoryId);
  if (!cat) return [];
  return cat.items.filter((i) => !i.route);
}

export function workflowStepLabel(step: CreateWorkflowStep): string {
  const labels: Record<CreateWorkflowStep, string> = {
    category: "Category",
    type: "Type",
    discovery: "Discovery",
    readiness: "Readiness",
    improve: "Improve",
    export: "Save / Export",
  };
  return labels[step];
}

export function discoveryQuestionsForState(
  typeLabel: string,
  state: CreateWorkflowState,
): DiscoveryQuestion | null {
  const questions = getDiscoveryQuestions(typeLabel);
  return questions[state.discoveryIndex] ?? null;
}

export function discoveryComplete(typeLabel: string, state: CreateWorkflowState): boolean {
  const questions = getDiscoveryQuestions(typeLabel);
  return state.discoveryIndex >= questions.length;
}

export function answeredDiscoveryCount(state: CreateWorkflowState): number {
  return Object.values(state.discoveryAnswers).filter((v) => v.trim()).length;
}

export function buildBriefFromDiscovery(
  typeLabel: string,
  answers: Record<string, string>,
): string {
  const questions = getDiscoveryQuestions(typeLabel);
  const lines = questions
    .map((q) => {
      const a = answers[q.id]?.trim();
      if (!a) return null;
      return `${q.prompt}\n${a}`;
    })
    .filter(Boolean) as string[];
  if (!lines.length) return `Create a ${typeLabel}.`;
  return [`Content type: ${typeLabel}`, ...lines].join("\n\n");
}

export function readinessSummary(
  typeLabel: string,
  answers: Record<string, string>,
): { label: string; value: string }[] {
  const questions = getDiscoveryQuestions(typeLabel);
  return questions
    .map((q) => {
      const v = answers[q.id]?.trim();
      if (!v) return null;
      return { label: q.prompt, value: v };
    })
    .filter(Boolean) as { label: string; value: string }[];
}

export function advanceAfterTypePick(
  typeLabel: string,
  categoryId: string | null,
): CreateWorkflowState {
  return {
    ...EMPTY_CREATE_WORKFLOW,
    step: "discovery",
    categoryId: categoryId ?? categoryIdForType(typeLabel),
    discoveryIndex: 0,
    discoveryAnswers: {},
  };
}

export function advanceAfterDiscoveryAnswer(
  state: CreateWorkflowState,
  typeLabel: string,
  questionId: string,
  answer: string,
): CreateWorkflowState {
  const answers = { ...state.discoveryAnswers, [questionId]: answer };
  const questions = getDiscoveryQuestions(typeLabel);
  const nextIndex = state.discoveryIndex + 1;
  if (nextIndex >= questions.length) {
    return {
      ...state,
      discoveryAnswers: answers,
      discoveryIndex: nextIndex,
      step: "readiness",
    };
  }
  return {
    ...state,
    discoveryAnswers: answers,
    discoveryIndex: nextIndex,
  };
}

export function skipDiscoveryQuestion(
  state: CreateWorkflowState,
  typeLabel: string,
  questionId: string,
): CreateWorkflowState {
  const answers = { ...state.discoveryAnswers };
  delete answers[questionId];
  const questions = getDiscoveryQuestions(typeLabel);
  const nextIndex = state.discoveryIndex + 1;
  if (nextIndex >= questions.length) {
    return { ...state, discoveryAnswers: answers, discoveryIndex: nextIndex, step: "readiness" };
  }
  return { ...state, discoveryAnswers: answers, discoveryIndex: nextIndex };
}

export function itemRoutedElsewhere(item: CreateCatalogItem): boolean {
  return Boolean(item.route);
}

export function resolveCatalogItem(label: string): CreateCatalogItem | undefined {
  return findCatalogItem(label);
}
