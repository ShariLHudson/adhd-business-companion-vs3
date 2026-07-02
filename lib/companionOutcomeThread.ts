/**
 * Outcome Completion System — what are we trying to accomplish right now?
 * Persists across turns so acceptance and routing never reset the thread.
 */

import { continuationReplyForAssistantQuestion } from "./workspaceOpeningRule";
import {
  buildEstateArrivalContinuation,
  loadEstatePendingTransition,
} from "@/lib/estateMemory";

import type { AppSection } from "./companionUi";
import type { ConversationWorkflowKind } from "./conversationWorkflowContinuation";

export type OutcomeThread = {
  currentGoal?: string;
  currentProblem?: string;
  currentProject?: string;
  pendingQuestion?: string;
  pendingDecision?: string;
  pendingAction?: string;
  desiredOutcome?: string;
  activeFeature?: AppSection;
  lastOfferSummary?: string;
  workflowKind?: ConversationWorkflowKind;
  updatedAt: string;
};

const STORAGE_KEY = "companion-outcome-thread-v1";
export const OUTCOME_THREAD_UPDATED = "companion-outcome-thread-updated";

function read(): OutcomeThread | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OutcomeThread;
    return parsed?.updatedAt ? parsed : null;
  } catch {
    return null;
  }
}

function write(thread: OutcomeThread | null) {
  if (typeof window === "undefined") return;
  try {
    if (!thread) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(thread));
    }
    window.dispatchEvent(new CustomEvent(OUTCOME_THREAD_UPDATED));
  } catch {
    /* noop */
  }
}

export function getOutcomeThread(): OutcomeThread | null {
  return read();
}

export function clearOutcomeThread() {
  write(null);
}

export function patchOutcomeThread(patch: Partial<OutcomeThread>): OutcomeThread {
  const cur = read() ?? { updatedAt: new Date().toISOString() };
  const next: OutcomeThread = {
    ...cur,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  write(next);
  return next;
}

/** User introduced a problem, goal, or challenge — companion owns the thread. */
export function registerProblemFromUser(text: string, label?: string) {
  const problem = label ?? text.trim().slice(0, 200);
  if (!problem) return;
  patchOutcomeThread({
    currentProblem: problem,
    pendingAction: undefined,
    pendingQuestion: undefined,
  });
}

export function registerPendingOffer(input: {
  offerSummary: string;
  section?: AppSection;
  workflowKind?: ConversationWorkflowKind;
  pendingQuestion?: string;
}) {
  patchOutcomeThread({
    lastOfferSummary: input.offerSummary,
    activeFeature: input.section,
    workflowKind: input.workflowKind,
    pendingQuestion: input.pendingQuestion,
    pendingAction: input.offerSummary,
  });
}

export function registerWorkflowContinuation(
  workflowKind: ConversationWorkflowKind,
  offerSummary: string,
) {
  patchOutcomeThread({
    workflowKind,
    lastOfferSummary: offerSummary,
    pendingAction: offerSummary,
  });
}

export function registerFeatureOpened(section: AppSection, guidance: string) {
  patchOutcomeThread({
    activeFeature: section,
    pendingAction: guidance,
    pendingQuestion: undefined,
  });
}

/** When user clearly changes topic — release the old thread. */
export function topicChangeClearsThread(userText: string): boolean {
  const t = userText.trim().toLowerCase();
  if (!t) return false;
  return /\b(?:actually|never mind|nevermind|different topic|something else|forget that|new question|change subject|let'?s talk about)\b/i.test(
    t,
  );
}

export function outcomeThreadHintForChat(thread: OutcomeThread | null): string | undefined {
  if (!thread) return undefined;
  const parts: string[] = [
    "OUTCOME THREAD (mandatory — do not reset): The companion owns this thread until the outcome is achieved or the user changes topic.",
  ];
  if (thread.currentProblem) {
    parts.push(`Current problem: ${thread.currentProblem}`);
  }
  if (thread.currentGoal) parts.push(`Current goal: ${thread.currentGoal}`);
  if (thread.pendingAction) {
    parts.push(`Pending action / last offer: ${thread.pendingAction}`);
  }
  if (thread.pendingQuestion) {
    parts.push(`Unresolved question you asked: ${thread.pendingQuestion}`);
  }
  if (thread.activeFeature) {
    parts.push(`Active feature context: ${thread.activeFeature}`);
  }
  parts.push(
    "FORBIDDEN after user says yes/sure/okay: 'What would you like help with?', 'How can I help you today?', or any conversation reset.",
    "REQUIRED after acceptance: continue the workflow with the next concrete step — pass context, do not restart.",
  );
  return parts.join("\n");
}

export function consumePendingInvitation(): void {
  patchOutcomeThread({
    pendingQuestion: undefined,
    pendingAction: undefined,
    lastOfferSummary: undefined,
  });
}

/** When user shares how they work — not a task continuation. */
export function isEntrepreneurialPatternShare(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return /\b(?:(?:great|good) at starting|don'?t finish(?:ing)?(?: very)? well|never finish|trouble finish(?:ing)?|starting (?:new )?things)\b/i.test(
    t,
  );
}

export function entrepreneurialPatternHintForChat(text: string): string | undefined {
  if (!isEntrepreneurialPatternShare(text)) return undefined;
  return [
    "ENTREPRENEURIAL PATTERN (mandatory): Member shared how they work — not a request for funnel steps or artifact sections.",
    "Acknowledge the pattern with warmth first. One thoughtful question about what finishing would look like or what gets in the way.",
    "FORBIDDEN: sales funnel steps, target audience worksheets, or jumping back to an earlier create topic unless they ask.",
  ].join("\n");
}

/** Non-resetting reply when acceptance cannot be resolved but a thread exists. */
export function threadAwareAcceptanceFallback(thread: OutcomeThread | null): string {
  const estatePending = typeof window !== "undefined" ? loadEstatePendingTransition() : null;
  if (estatePending?.destinationSection === "content-generator") {
    return buildEstateArrivalContinuation(estatePending);
  }
  if (thread?.pendingQuestion) {
    const advanced = continuationReplyForAssistantQuestion(
      thread.pendingQuestion,
    );
    if (advanced) return advanced;
  }
  if (thread?.pendingAction) {
    return `Continuing **${thread.pendingAction}** — here's the next step on that.`;
  }
  if (thread?.pendingDecision) {
    return `Let's keep going on **${thread.pendingDecision}** — which path feels closest right now?`;
  }
  return "I'm still here — what's the next piece you want to look at?";
}
