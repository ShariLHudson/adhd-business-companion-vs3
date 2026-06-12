// Workspace SOP — guided step-by-step workflows (process brain).
// Chat = coach, Workspace = canvas, SOP = structure.

import type { DayLevel } from "./companionStore";
import type { AppSection } from "./companionUi";
import type { WorkspaceContext, WorkspaceFieldId } from "./workspaceAwareness";

export type SopWorkflowId =
  | "workshop"
  | "project"
  | "content"
  | "email"
  | "sales-page";

export type SopStepId = string;

export type SopStep = {
  id: SopStepId;
  label: string;
  fieldId: WorkspaceFieldId;
  coachQuestion: string;
  completeAck: string;
};

export type SopWorkflow = {
  id: SopWorkflowId;
  title: string;
  steps: SopStep[];
  energyScopes: Record<DayLevel, SopStepId[]>;
};

export type WorkspaceSavedStatus = "create-flow" | "saved";

export type WorkspaceSession = {
  workspaceType: AppSection;
  /** SOP workflow — e.g. workshop, project */
  workflowId: SopWorkflowId;
  currentStepId: SopStepId;
  completedStepIds: SopStepId[];
  energyScope: DayLevel;
  acceptedValues: Partial<Record<SopStepId, string>>;
  suggestedValue: string | null;
  suggestedOptions: string[];
  pendingConfirmation: boolean;
  lastAssistantQuestion: string | null;
  currentStepHint: string | null;
  openingContext: string;
  /** Linked project when saved */
  projectId: string | null;
  projectTitle: string | null;
  savedStatus: WorkspaceSavedStatus;
};

const WORKSHOP_STEPS: SopStep[] = [
  {
    id: "workshop-title",
    label: "Title",
    fieldId: "project-title",
    coachQuestion:
      "Let's start with the title. What are you calling this workshop?",
    completeAck: "Great. Title is complete. Now let's define the outcome.",
  },
  {
    id: "workshop-outcome",
    label: "Outcome",
    fieldId: "project-goal",
    coachQuestion:
      "In one sentence — what should someone walk away able to do?",
    completeAck: "Good. Outcome is set. Who is this workshop for?",
  },
  {
    id: "workshop-audience",
    label: "Audience",
    fieldId: "workshop-audience",
    coachQuestion: "Who is this workshop for? Be specific.",
    completeAck: "Got it. What's the core problem they're struggling with?",
  },
  {
    id: "workshop-problem",
    label: "Core problem",
    fieldId: "workshop-problem",
    coachQuestion: "What core problem does this workshop solve?",
    completeAck: "Let's outline three teaching sections — what are they?",
  },
  {
    id: "workshop-sections",
    label: "Sections",
    fieldId: "workshop-sections",
    coachQuestion: "Name three sections you'll teach (one line each).",
    completeAck: "Nice structure. Share one story or example you'll use.",
  },
  {
    id: "workshop-story",
    label: "Story",
    fieldId: "workshop-story",
    coachQuestion: "What story or example will you share?",
    completeAck: "What exercise or action step will attendees do?",
  },
  {
    id: "workshop-exercise",
    label: "Exercise",
    fieldId: "workshop-exercise",
    coachQuestion: "What will attendees actually do during the workshop?",
    completeAck: "What's the offer or call-to-action at the end?",
  },
  {
    id: "workshop-offer",
    label: "Offer",
    fieldId: "workshop-offer",
    coachQuestion: "What's the offer or CTA at the end?",
    completeAck: "Last thing — what's one concrete next action for you?",
  },
  {
    id: "workshop-next-action",
    label: "Next action",
    fieldId: "project-next-action",
    coachQuestion: "What's your next action to move this workshop forward?",
    completeAck: "That's a solid foundation. You can keep editing any field beside us.",
  },
];

const PROJECT_STEPS: SopStep[] = [
  {
    id: "project-name",
    label: "Name",
    fieldId: "project-title",
    coachQuestion: "What are you calling this project?",
    completeAck: "Good. What's the desired outcome?",
  },
  {
    id: "project-outcome",
    label: "Outcome",
    fieldId: "project-goal",
    coachQuestion: "In one sentence — what does done look like?",
    completeAck: "When does this need to happen — now, soon, or later?",
  },
  {
    id: "project-horizon",
    label: "Horizon",
    fieldId: "project-horizon",
    coachQuestion: "Is this a now, soon, or later project?",
    completeAck: "What's one clear next action?",
  },
  {
    id: "project-next-action",
    label: "Next action",
    fieldId: "project-next-action",
    coachQuestion: "What's the very next step?",
    completeAck: "How would you describe the status right now?",
  },
  {
    id: "project-status",
    label: "Status",
    fieldId: "project-status",
    coachQuestion: "Not started, in progress, or paused?",
    completeAck: "Project basics are captured. Keep editing beside us anytime.",
  },
];

const CONTENT_STEPS: SopStep[] = [
  {
    id: "content-audience",
    label: "Audience",
    fieldId: "create-audience",
    coachQuestion: "Who is this piece for?",
    completeAck: "What's the topic — one line?",
  },
  {
    id: "content-topic",
    label: "Topic",
    fieldId: "create-topic",
    coachQuestion: "What's this piece about?",
    completeAck: "What's the hook — the first line that grabs attention?",
  },
  {
    id: "content-hook",
    label: "Hook",
    fieldId: "create-hook",
    coachQuestion: "What's your opening hook?",
    completeAck: "What's the one main point?",
  },
  {
    id: "content-main-point",
    label: "Main point",
    fieldId: "create-main-point",
    coachQuestion: "What's the single main point?",
    completeAck: "What's the call-to-action?",
  },
  {
    id: "content-cta",
    label: "CTA",
    fieldId: "create-cta",
    coachQuestion: "What should readers do next?",
    completeAck: "Ready to draft — tell me when to generate, or keep refining.",
  },
  {
    id: "content-draft",
    label: "Draft",
    fieldId: "create-brief",
    coachQuestion: "Any notes before we draft?",
    completeAck: "Draft step is ready in the panel beside you.",
  },
];

const EMAIL_STEPS: SopStep[] = [
  {
    id: "email-purpose",
    label: "Purpose",
    fieldId: "create-topic",
    coachQuestion: "What's the purpose of this email?",
    completeAck: "Who is receiving it?",
  },
  {
    id: "email-audience",
    label: "Audience",
    fieldId: "create-audience",
    coachQuestion: "Who is this email for?",
    completeAck: "What subject line are you considering?",
  },
  {
    id: "email-subject",
    label: "Subject",
    fieldId: "create-hook",
    coachQuestion: "Draft a subject line.",
    completeAck: "What's the main message?",
  },
  {
    id: "email-message",
    label: "Message",
    fieldId: "create-main-point",
    coachQuestion: "What's the core message in 2–3 sentences?",
    completeAck: "What's the CTA?",
  },
  {
    id: "email-cta",
    label: "CTA",
    fieldId: "create-cta",
    coachQuestion: "What should they click or do?",
    completeAck: "Ready to draft the email beside you.",
  },
  {
    id: "email-draft",
    label: "Draft",
    fieldId: "create-brief",
    coachQuestion: "Anything else before drafting?",
    completeAck: "Email draft is ready in the panel.",
  },
];

const SALES_PAGE_STEPS: SopStep[] = [
  {
    id: "sales-offer",
    label: "Offer",
    fieldId: "create-topic",
    coachQuestion: "What are you selling?",
    completeAck: "Who is this for?",
  },
  {
    id: "sales-audience",
    label: "Audience",
    fieldId: "create-audience",
    coachQuestion: "Who is the ideal buyer?",
    completeAck: "What pain or problem are they in?",
  },
  {
    id: "sales-pain",
    label: "Pain",
    fieldId: "workshop-problem",
    coachQuestion: "What problem does your offer solve?",
    completeAck: "What result do they want?",
  },
  {
    id: "sales-result",
    label: "Result",
    fieldId: "project-goal",
    coachQuestion: "What transformation or result do they get?",
    completeAck: "List 3 key benefits.",
  },
  {
    id: "sales-benefits",
    label: "Benefits",
    fieldId: "workshop-sections",
    coachQuestion: "What are three main benefits?",
    completeAck: "What proof or credibility can you share?",
  },
  {
    id: "sales-proof",
    label: "Proof",
    fieldId: "workshop-story",
    coachQuestion: "Testimonials, results, or your story?",
    completeAck: "What's the CTA?",
  },
  {
    id: "sales-cta",
    label: "CTA",
    fieldId: "create-cta",
    coachQuestion: "What should they do — buy, book, sign up?",
    completeAck: "Ready to draft a section beside you.",
  },
  {
    id: "sales-draft",
    label: "Draft",
    fieldId: "create-brief",
    coachQuestion: "Which section first — hero, benefits, or offer?",
    completeAck: "Sales page draft is ready in the panel.",
  },
];

export const SOP_WORKFLOWS: Record<SopWorkflowId, SopWorkflow> = {
  workshop: {
    id: "workshop",
    title: "Workshop Builder",
    steps: WORKSHOP_STEPS,
    energyScopes: {
      low: ["workshop-title", "workshop-outcome"],
      medium: [
        "workshop-title",
        "workshop-outcome",
        "workshop-audience",
        "workshop-sections",
      ],
      high: WORKSHOP_STEPS.map((s) => s.id),
    },
  },
  project: {
    id: "project",
    title: "Project Setup",
    steps: PROJECT_STEPS,
    energyScopes: {
      low: ["project-name", "project-outcome"],
      medium: ["project-name", "project-outcome", "project-next-action"],
      high: PROJECT_STEPS.map((s) => s.id),
    },
  },
  content: {
    id: "content",
    title: "Content Builder",
    steps: CONTENT_STEPS,
    energyScopes: {
      low: ["content-topic", "content-main-point"],
      medium: ["content-audience", "content-topic", "content-cta"],
      high: CONTENT_STEPS.map((s) => s.id),
    },
  },
  email: {
    id: "email",
    title: "Email Builder",
    steps: EMAIL_STEPS,
    energyScopes: {
      low: ["email-purpose", "email-subject"],
      medium: ["email-purpose", "email-audience", "email-cta"],
      high: EMAIL_STEPS.map((s) => s.id),
    },
  },
  "sales-page": {
    id: "sales-page",
    title: "Sales Page Builder",
    steps: SALES_PAGE_STEPS,
    energyScopes: {
      low: ["sales-offer", "sales-result"],
      medium: ["sales-offer", "sales-audience", "sales-cta"],
      high: SALES_PAGE_STEPS.map((s) => s.id),
    },
  },
};

export function detectSopWorkflow(
  section: AppSection,
  userText = "",
): SopWorkflowId {
  const t = userText.toLowerCase();
  if (section === "content-generator") {
    if (/\b(email|newsletter|sequence)\b/.test(t)) return "email";
    if (/\b(sales page|landing page|offer page)\b/.test(t)) return "sales-page";
    return "content";
  }
  if (/\b(workshop|webinar|course|masterclass|curriculum)\b/.test(t)) {
    return "workshop";
  }
  return "project";
}

export function getWorkflow(id: SopWorkflowId): SopWorkflow {
  return SOP_WORKFLOWS[id];
}

export function getScopedSteps(
  workflowId: SopWorkflowId,
  energy: DayLevel,
): SopStep[] {
  const wf = getWorkflow(workflowId);
  const ids = wf.energyScopes[energy] ?? wf.energyScopes.medium;
  return wf.steps.filter((s) => ids.includes(s.id));
}

export function getStep(
  workflowId: SopWorkflowId,
  stepId: SopStepId,
): SopStep | undefined {
  return getWorkflow(workflowId).steps.find((s) => s.id === stepId);
}

export function createWorkspaceSession(
  section: AppSection,
  userText: string,
  energy: DayLevel,
): WorkspaceSession {
  const workflowId = detectSopWorkflow(section, userText);
  const steps = getScopedSteps(workflowId, energy);
  const first = steps[0]!;
  return {
    workspaceType: section,
    workflowId,
    currentStepId: first.id,
    completedStepIds: [],
    energyScope: energy,
    acceptedValues: {},
    suggestedValue: null,
    suggestedOptions: [],
    pendingConfirmation: false,
    lastAssistantQuestion: first.coachQuestion,
    currentStepHint: `Shari is helping you with the ${first.label.toLowerCase()}.`,
    openingContext: userText,
    projectId: null,
    projectTitle: null,
    savedStatus: "create-flow",
  };
}

export function updateSessionEnergy(
  session: WorkspaceSession,
  energy: DayLevel,
): WorkspaceSession {
  if (session.energyScope === energy) return session;
  const steps = getScopedSteps(session.workflowId, energy);
  const stillValid = steps.some((s) => s.id === session.currentStepId);
  return {
    ...session,
    energyScope: energy,
    currentStepId: stillValid
      ? session.currentStepId
      : (steps[0]?.id ?? session.currentStepId),
  };
}

export function getCurrentSopStep(session: WorkspaceSession): SopStep {
  return (
    getStep(session.workflowId, session.currentStepId) ??
    getScopedSteps(session.workflowId, session.energyScope)[0]!
  );
}

export function getStepValue(
  session: WorkspaceSession,
  stepId: SopStepId,
): string {
  return session.acceptedValues[stepId]?.trim() ?? "";
}

export function hasStepValue(session: WorkspaceSession, stepId?: SopStepId): boolean {
  const id = stepId ?? session.currentStepId;
  return Boolean(getStepValue(session, id));
}

export function advanceSopSession(
  session: WorkspaceSession,
  opts: { skip?: boolean } = {},
): WorkspaceSession {
  const steps = getScopedSteps(session.workflowId, session.energyScope);
  const idx = steps.findIndex((s) => s.id === session.currentStepId);
  const current = steps[idx];
  if (!current) return session;

  const completed = session.completedStepIds.includes(current.id)
    ? session.completedStepIds
    : [...session.completedStepIds, current.id];

  const next = steps[idx + 1];
  if (!next) {
    return {
      ...session,
      completedStepIds: completed,
      pendingConfirmation: false,
      suggestedValue: null,
      suggestedOptions: [],
    };
  }

  return {
    ...session,
    completedStepIds: completed,
    currentStepId: next.id,
    pendingConfirmation: false,
    suggestedValue: null,
    suggestedOptions: [],
    lastAssistantQuestion: next.coachQuestion,
    currentStepHint: `Shari is helping you with the ${next.label.toLowerCase()}.`,
  };
}

export function retreatSopSession(session: WorkspaceSession): WorkspaceSession {
  const steps = getScopedSteps(session.workflowId, session.energyScope);
  const idx = steps.findIndex((s) => s.id === session.currentStepId);
  if (idx <= 0) return session;
  const prev = steps[idx - 1]!;
  return goToSopStep(session, prev.id);
}

export function goToSopStep(
  session: WorkspaceSession,
  stepId: SopStepId,
): WorkspaceSession {
  const steps = getScopedSteps(session.workflowId, session.energyScope);
  const step = steps.find((s) => s.id === stepId);
  if (!step) return session;
  return {
    ...session,
    currentStepId: step.id,
    pendingConfirmation: false,
    suggestedValue: null,
    suggestedOptions: [],
    lastAssistantQuestion: step.coachQuestion,
    currentStepHint: `Shari is helping you with the ${step.label.toLowerCase()}.`,
  };
}

export function setSopStepValue(
  session: WorkspaceSession,
  stepId: SopStepId,
  value: string,
): WorkspaceSession {
  if (session.acceptedValues[stepId] === value) return session;
  return {
    ...session,
    acceptedValues: { ...session.acceptedValues, [stepId]: value },
    pendingConfirmation: false,
    suggestedValue: null,
    suggestedOptions: [],
  };
}

export function setSopOptions(
  session: WorkspaceSession,
  options: string[],
  hint?: string,
): WorkspaceSession {
  return {
    ...session,
    suggestedOptions: options,
    suggestedValue: null,
    pendingConfirmation: true,
    currentStepHint: hint ?? session.currentStepHint,
  };
}

export function setSopSuggestion(
  session: WorkspaceSession,
  value: string,
): WorkspaceSession {
  return {
    ...session,
    suggestedValue: value,
    suggestedOptions: [],
    pendingConfirmation: true,
  };
}

/** Pick from a numbered list — fills field only; user says next to advance. */
export function selectSopOption(
  session: WorkspaceSession,
  index: number,
  options = session.suggestedOptions,
): WorkspaceSession {
  const value = options[index]?.trim();
  if (!value) return session;
  const withOptions =
    options === session.suggestedOptions
      ? session
      : { ...session, suggestedOptions: options, pendingConfirmation: true };
  return setSopStepValue(withOptions, session.currentStepId, value);
}

export function parseOptionSelection(
  text: string,
  optionCount: number,
): number | null {
  if (optionCount < 1) return null;
  const t = text.trim().toLowerCase();

  const bare = t.match(/^(\d+)$/);
  if (bare) {
    const idx = parseInt(bare[1]!, 10) - 1;
    if (idx >= 0 && idx < optionCount) return idx;
  }

  const ordinal: Record<string, number> = {
    first: 0,
    "1st": 0,
    second: 1,
    "2nd": 1,
    third: 2,
    "3rd": 2,
  };
  for (const [word, idx] of Object.entries(ordinal)) {
    if (idx >= optionCount) continue;
    if (
      new RegExp(`\\b${word}\\b`).test(t) ||
      new RegExp(`number\\s*${idx + 1}`).test(t) ||
      new RegExp(`(?:option|#)\\s*${idx + 1}\\b`).test(t) ||
      t === String(idx + 1)
    ) {
      return idx;
    }
  }

  const likeNumMatch = t.match(/\bi like (?:the )?number\s*(\d+)\b/);
  if (likeNumMatch) {
    const idx = parseInt(likeNumMatch[1]!, 10) - 1;
    if (idx >= 0 && idx < optionCount) return idx;
  }

  const useOptionMatch = t.match(/\buse option\s*(\d+)\b/);
  if (useOptionMatch) {
    const idx = parseInt(useOptionMatch[1]!, 10) - 1;
    if (idx >= 0 && idx < optionCount) return idx;
  }

  const numMatch = t.match(/(?:number|option|#)\s*(\d+)/);
  if (numMatch) {
    const idx = parseInt(numMatch[1]!, 10) - 1;
    if (idx >= 0 && idx < optionCount) return idx;
  }

  if (/^(?:that one|use that|the one)$/i.test(t)) return 0;

  const useOneMatch = t.match(/\buse the (first|second|third)(?:\s+one)?\b/);
  if (useOneMatch?.[1] && useOneMatch[1] in ordinal) {
    const idx = ordinal[useOneMatch[1]!]!;
    if (idx < optionCount) return idx;
  }

  const theOneMatch = t.match(/\bthe (first|second|third)(?:\s+one)?\b/);
  if (theOneMatch?.[1] && theOneMatch[1] in ordinal) {
    const idx = ordinal[theOneMatch[1]!]!;
    if (idx < optionCount) return idx;
  }

  const likeMatch = t.match(/\bi like the (first|second|third)\b/);
  if (likeMatch?.[1] && likeMatch[1] in ordinal) {
    const idx = ordinal[likeMatch[1]!]!;
    if (idx < optionCount) return idx;
  }

  return null;
}

export function extractNumberedOptions(text: string): string[] {
  const options: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*\d+[.)]\s*(.+)$/);
    if (m?.[1]) options.push(m[1].replace(/\*\*/g, "").trim());
  }
  return options;
}

export function acceptSopSuggestion(session: WorkspaceSession): WorkspaceSession {
  if (!session.suggestedValue?.trim()) return session;
  const withValue = setSopStepValue(
    session,
    session.currentStepId,
    session.suggestedValue.trim(),
  );
  return advanceSopSession(withValue);
}

export function syncSessionFromPanel(
  session: WorkspaceSession,
  ctx: WorkspaceContext,
): WorkspaceSession {
  const next = { ...session, acceptedValues: { ...session.acceptedValues } };
  const current = getCurrentSopStep(session);

  for (const s of getWorkflow(session.workflowId).steps) {
    if (s.fieldId === "project-title" && ctx.selectedItemName?.trim()) {
      next.acceptedValues[s.id] = ctx.selectedItemName.trim();
    }
    if (s.fieldId === "project-goal" && ctx.selectedItemGoal?.trim()) {
      next.acceptedValues[s.id] = ctx.selectedItemGoal.trim();
    }
    if (s.fieldId === "project-next-action" && ctx.nextAction?.trim()) {
      next.acceptedValues[s.id] = ctx.nextAction.trim();
    }
  }

  if (!next.acceptedValues[current.id]) {
    if (current.fieldId === "project-title" && ctx.selectedItemName?.trim()) {
      next.acceptedValues[current.id] = ctx.selectedItemName.trim();
    }
    if (current.fieldId === "project-goal" && ctx.selectedItemGoal?.trim()) {
      next.acceptedValues[current.id] = ctx.selectedItemGoal.trim();
    }
  }

  return next;
}

export function extractSuggestedValue(assistantText: string): string | null {
  const howAbout = assistantText.match(
    /how about[:\s]+(.+?)(?:\.\s*(?:does that work|sound good|work for you)|\?)/i,
  );
  if (howAbout?.[1]) return howAbout[1].replace(/\*\*/g, "").trim();

  const doesWork = assistantText.match(
    /["“](.+?)["”]\s*(?:work|sound good|as the title)/i,
  );
  if (doesWork?.[1]) return doesWork[1].trim();

  return null;
}

export function formatSopSessionForPrompt(session: WorkspaceSession): string {
  const wf = getWorkflow(session.workflowId);
  const steps = getScopedSteps(session.workflowId, session.energyScope);
  const current = getCurrentSopStep(session);
  const lines = [
    "WORKSPACE SOP (ACTIVE — guided process, not freeform chat):",
    `- Workflow: ${wf.title}`,
    `- Energy scope: ${session.energyScope} (${steps.length} steps today)`,
    `- Current step: ${current.label} (${current.id})`,
    `- Completed: ${session.completedStepIds.length ? session.completedStepIds.join(", ") : "none"}`,
    `- Active field: ${current.fieldId}`,
    session.suggestedOptions.length
      ? `- Pending options: ${session.suggestedOptions.map((o, i) => `${i + 1}. ${o}`).join("; ")}`
      : session.pendingConfirmation && session.suggestedValue
        ? `- Pending confirmation: "${session.suggestedValue}"`
        : null,
    getStepValue(session, current.id)
      ? `- Current value on screen: ${getStepValue(session, current.id).slice(0, 120)}`
      : null,
    "RULES:",
    "- ONE question per reply. Never list all SOP steps.",
    "- Navigation (next, skip, back) advances SOP — never write to fields.",
    "- Confirmations accept suggested/current value — never write 'yes' to fields.",
    "- Questions, help requests, and feedback stay in chat — never write to fields.",
    "- Only projectContent populates the active field.",
    "- Reference the visible workspace beside chat.",
  ].filter(Boolean);
  return lines.join("\n");
}

export type SopProgressItem = {
  id: SopStepId;
  label: string;
  status: "done" | "current" | "upcoming";
};

export function getSopProgress(session: WorkspaceSession): SopProgressItem[] {
  const steps = getScopedSteps(session.workflowId, session.energyScope);
  return steps.map((s) => ({
    id: s.id,
    label: s.label,
    status: session.completedStepIds.includes(s.id)
      ? "done"
      : s.id === session.currentStepId
        ? "current"
        : "upcoming",
  }));
}
