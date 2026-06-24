/**
 * Conversation workflow continuation — holds context when Shari asks a consent
 * question and the user replies with a short affirmation (yes / sure / okay).
 */

import type { AppSection } from "./companionUi";
import type { SidebarToolId } from "./companionUi";
import { workspaceTitle } from "./workspaceMode";
import { assistantEndsWithQuestion } from "./conversationIntervention";
import { isBareGenericAcceptance } from "./pendingAcceptanceAuthority";

export type ConversationWorkflowKind =
  | "project_list"
  | "project_sort"
  | "open_clear_my_mind"
  | "open_decision_compass"
  | "open_breathe"
  | "open_adjust_my_day"
  | "open_plan_my_day"
  | "open_workspace"
  | "open_focus_timer"
  | "guided_continue";

export type ConversationWorkflow = {
  kind: ConversationWorkflowKind;
  offeredAtTurn: number;
  /** Short summary of what Shari offered — for expiry / debugging. */
  offerSummary: string;
  assistantQuestion: string;
  /** Populated for open_workspace continuations. */
  targetSection?: AppSection;
};

export type WorkflowContinuationResult =
  | {
      action: "reply";
      message: string;
      nextWorkflow?: ConversationWorkflow | null;
    }
  | {
      action: "open_section";
      section: AppSection;
      message: string;
      nextWorkflow?: ConversationWorkflow | null;
    }
  | {
      action: "open_tool";
      tool: SidebarToolId;
      message: string;
      nextWorkflow?: ConversationWorkflow | null;
    };

const CONSENT_OFFER_RE =
  /\b(?:would you like|want me to|shall (?:i|we)|do you want|ready to|like to|can i|should (?:i|we)|want to|open .+ beside)\b/i;

const WORKSPACE_OPEN_RE =
  /\bopen\s+(?:\*\*)?([^*]+?)(?:\*\*)?\s+beside\b/i;

const SECTION_FROM_PHRASE: { re: RegExp; section: AppSection }[] = [
  { re: /\b(?:clear my mind|brain dump)\b/i, section: "brain-dump" },
  { re: /\bdecision compass\b/i, section: "decision-compass" },
  { re: /\b(?:adapt my day|adjust my day)\b/i, section: "energy" },
  { re: /\bplan my day\b/i, section: "plan-my-day" },
  { re: /\b(?:client avatar|audience profile)\b/i, section: "client-avatars" },
  { re: /\b(?:business profile)\b/i, section: "business-profile" },
  { re: /\b(?:create|content generator)\b/i, section: "content-generator" },
  { re: /\bprojects?\b/i, section: "projects" },
  { re: /\bsnippets?\b/i, section: "snippets" },
  { re: /\btemplates?\b/i, section: "templates-library" },
  { re: /\b(?:playbook|strateg)/i, section: "playbook" },
  { re: /\bhow do i\b/i, section: "how-do-i" },
  { re: /\bspin(?:ning)? wheel\b/i, section: "spin-wheel" },
];

export function inferWorkspaceSectionFromConsent(text: string): AppSection | null {
  const t = text.trim();
  if (!t) return null;

  const beside = t.match(WORKSPACE_OPEN_RE)?.[1]?.trim();
  if (beside) {
    const lower = beside.toLowerCase();
    for (const { re, section } of SECTION_FROM_PHRASE) {
      if (re.test(lower)) return section;
    }
  }

  for (const { re, section } of SECTION_FROM_PHRASE) {
    if (re.test(t)) return section;
  }
  return null;
}

const DECLINE_RE =
  /^(?:no|nope|nah|not now|not yet|maybe later|skip|pass|don'?t|rather not)\.?$/i;

/** Shari asked for consent — not just any question. */
export function assistantOfferedConsent(text: string): boolean {
  const t = text.trim();
  if (!t || !assistantEndsWithQuestion(t)) return false;
  return CONSENT_OFFER_RE.test(t);
}

export function inferConversationWorkflowFromAssistant(
  assistantText: string,
): Omit<ConversationWorkflow, "offeredAtTurn"> | null {
  const t = assistantText.trim();
  if (!assistantOfferedConsent(t)) return null;

  if (
    /\blist(?:ing)?\s+(?:those\s+)?projects?\b/i.test(t) ||
    /\bprojects?\s+(?:you(?:'re| are)?\s+)?considering\b/i.test(t) ||
    /\bsort(?:ing)?\s+through\s+(?:them|those|projects?)\b/i.test(t)
  ) {
    return {
      kind: "project_list",
      offerSummary: "List projects for discernment",
      assistantQuestion: t,
    };
  }

  if (
    /\b(?:prioriti[sz]e|sort|rank|compare|weigh)\s+(?:them|those|projects?|options?)\b/i.test(
      t,
    )
  ) {
    return {
      kind: "project_sort",
      offerSummary: "Sort or prioritize projects",
      assistantQuestion: t,
    };
  }

  if (
    /\b(?:clear my mind|brain dump|get (?:it |everything )?out of (?:your|my) head)\b/i.test(
      t,
    )
  ) {
    return {
      kind: "open_clear_my_mind",
      offerSummary: "Open Clear My Mind",
      assistantQuestion: t,
    };
  }

  if (/\bdecision compass\b/i.test(t)) {
    return {
      kind: "open_decision_compass",
      offerSummary: "Open Decision Compass",
      assistantQuestion: t,
    };
  }

  if (/\bhelp you decide\b/i.test(t)) {
    return {
      kind: "guided_continue",
      offerSummary: "Structured decision support",
      assistantQuestion: t,
    };
  }

  if (
    /\b(?:breath(?:ing)?(?:\s+reset)?|breathe(?:\s+and\s+reset)?|take a breath)\b/i.test(
      t,
    )
  ) {
    return {
      kind: "open_breathe",
      offerSummary: "Breathing reset",
      assistantQuestion: t,
    };
  }

  if (/\b(?:adapt my day|adjust my day|today'?s reality|rebuild today)\b/i.test(t)) {
    return {
      kind: "open_adjust_my_day",
      offerSummary: "Adapt My Day",
      assistantQuestion: t,
    };
  }

  if (/\b(?:plan my day|plan today|shape your day)\b/i.test(t)) {
    return {
      kind: "open_plan_my_day",
      offerSummary: "Plan My Day",
      assistantQuestion: t,
    };
  }

  if (
    /\b(?:focus (?:session|timer)|pomodoro|\d+\s*min(?:ute)?s? focus)\b/i.test(t) &&
    CONSENT_OFFER_RE.test(t)
  ) {
    return {
      kind: "open_focus_timer",
      offerSummary: "Focus timer",
      assistantQuestion: t,
    };
  }

  const workspaceSection = inferWorkspaceSectionFromConsent(t);
  if (workspaceSection && CONSENT_OFFER_RE.test(t)) {
    return {
      kind: "open_workspace",
      offerSummary: workspaceTitle(workspaceSection),
      assistantQuestion: t,
      targetSection: workspaceSection,
    };
  }

  if (/\b(?:walk through|work through|go through|figure out|discern|sort through)\b/i.test(t)) {
    return {
      kind: "guided_continue",
      offerSummary: "Guided workflow continuation",
      assistantQuestion: t,
    };
  }

  return null;
}

export function createConversationWorkflow(
  assistantText: string,
  offeredAtTurn: number,
): ConversationWorkflow | null {
  const inferred = inferConversationWorkflowFromAssistant(assistantText);
  if (!inferred) return null;
  return { ...inferred, offeredAtTurn };
}

export function userDeclinedWorkflow(text: string): boolean {
  return DECLINE_RE.test(text.trim());
}

export function continuationForWorkflow(
  workflow: ConversationWorkflow,
): WorkflowContinuationResult {
  switch (workflow.kind) {
    case "project_list":
      return {
        action: "reply",
        message:
          "Great. Tell me the projects you're considering — no need to organize them yet. Just list them however they come to mind.",
        nextWorkflow: {
          kind: "project_sort",
          offeredAtTurn: workflow.offeredAtTurn,
          offerSummary: "Collecting project list",
          assistantQuestion: workflow.assistantQuestion,
        },
      };
    case "project_sort":
      return {
        action: "reply",
        message:
          "Thanks — I'm holding those. Which one feels most urgent, most energizing, or most aligned with where you want to go right now?",
        nextWorkflow: null,
      };
    case "open_clear_my_mind":
      return {
        action: "open_section",
        section: "brain-dump",
        message:
          "I've opened **Clear My Mind**. Start by entering everything competing for your attention right now. Don't organize it yet — just get it out.",
        nextWorkflow: null,
      };
    case "open_decision_compass":
      return {
        action: "open_section",
        section: "decision-compass",
        message:
          "I've opened **Decision Compass**. We'll work through this one step at a time — what's the decision in front of you right now?",
        nextWorkflow: null,
      };
    case "open_breathe":
      return {
        action: "open_tool",
        tool: "breathe",
        message:
          "Let's take a moment. Opening **Breathe & Reset** — chat stays right here when you're done.",
        nextWorkflow: null,
      };
    case "open_adjust_my_day":
      return {
        action: "open_section",
        section: "energy",
        message:
          "Opening **Adapt My Day** — let's tune today to how you're actually feeling.",
        nextWorkflow: null,
      };
    case "open_plan_my_day":
      return {
        action: "open_section",
        section: "plan-my-day",
        message:
          "I've opened **Plan My Day**. What's competing for your attention today — we'll shape it without rigid pressure.",
        nextWorkflow: null,
      };
    case "open_focus_timer":
      return {
        action: "open_tool",
        tool: "focus-timer",
        message:
          "Opening **Focus Timer** — pick a length that feels doable and we'll go from there.",
        nextWorkflow: null,
      };
    case "open_workspace":
      return {
        action: "open_section",
        section: workflow.targetSection ?? "how-do-i",
        message: `Opening **${workflow.offerSummary}** beside us — we'll work through it together.`,
        nextWorkflow: null,
      };
    case "guided_continue":
      return continuationForGuidedWorkflow(workflow);
  }
}

export type GuidedContinuationContext = {
  pendingDecision?: string;
  currentProblem?: string;
};

/** Guided continuation with decision-intelligence context — no conversation reset. */
export function continuationForGuidedWorkflow(
  workflow: ConversationWorkflow,
  context?: GuidedContinuationContext,
): WorkflowContinuationResult {
  if (context?.pendingDecision) {
    return {
      action: "reply",
      message: `Let's keep going on **${context.pendingDecision}**. Based on what you shared, the three paths are: keep your current offer, replace it, or run both. Which feels closest — even if you're not sure yet?`,
      nextWorkflow: {
        kind: "guided_continue",
        offeredAtTurn: workflow.offeredAtTurn,
        offerSummary: context.pendingDecision,
        assistantQuestion: workflow.assistantQuestion,
      },
    };
  }
  if (context?.currentProblem) {
    return {
      action: "reply",
      message: `Picking up **${context.currentProblem.slice(0, 100)}** — tell me one thing you're most unsure about: customers, pricing, or timing?`,
      nextWorkflow: workflow,
    };
  }
  const q = workflow.assistantQuestion;
  if (/\bdecision compass\b/i.test(q)) {
    return {
      action: "open_section",
      section: "decision-compass",
      message:
        "Perfect — I've opened **Decision Compass**. We'll compare keep both, replace, or phasing in — one step at a time.",
      nextWorkflow: null,
    };
  }
  if (/\b(?:expansion|product line|new offer|group program)\b/i.test(q)) {
    return {
      action: "reply",
      message:
        "Great — who buys your current offer today, and who would the new line serve?",
      nextWorkflow: workflow,
    };
  }
  return {
    action: "reply",
    message:
      "Great — let's work through this together. What's the one variable that worries you most: existing customers, pricing, or adoption?",
    nextWorkflow: workflow,
  };
}

/** Alias for decision-intelligence callers. */
export function continuationForWorkflowWithIntent(
  workflow: ConversationWorkflow,
  context?: GuidedContinuationContext,
): WorkflowContinuationResult {
  if (workflow.kind === "guided_continue") {
    return continuationForGuidedWorkflow(workflow, context);
  }
  return continuationForWorkflow(workflow);
}

export function resolveConversationWorkflowAcceptance(input: {
  userText: string;
  lastAssistantText: string;
  workflow: ConversationWorkflow | null;
  currentTurn: number;
  maxTurnsSinceOffer?: number;
}): WorkflowContinuationResult | null {
  const t = input.userText.trim();
  if (!t || !input.workflow) return null;
  if (userDeclinedWorkflow(t)) return null;
  if (!isBareGenericAcceptance(t)) return null;

  const turnsSince = input.currentTurn - input.workflow.offeredAtTurn;
  const limit = input.maxTurnsSinceOffer ?? 3;
  if (turnsSince > limit) return null;

  return continuationForWorkflow(input.workflow);
}

/** Infer workflow from the last assistant turn when no record was stored yet. */
export function resolveWorkflowFromLastAssistant(
  userText: string,
  lastAssistantText: string,
  currentTurn: number,
): WorkflowContinuationResult | null {
  if (!isBareGenericAcceptance(userText.trim())) return null;
  const workflow = createConversationWorkflow(lastAssistantText, currentTurn - 1);
  if (!workflow) return null;
  return resolveConversationWorkflowAcceptance({
    userText,
    lastAssistantText,
    workflow,
    currentTurn,
  });
}
