// Emotional / environmental triage — delegates to Companion Intelligence Layer.

import type { EmotionalObstacle, EmotionalState } from "./companionEmotions";
import {
  buildCompanionIntelligence,
  getDiscoveryPhase,
  intelligenceHintForChat,
  type ChatTurn,
  type DiscoveryPhase,
} from "./companionIntelligence";
import {
  shouldRunEmotionalTriage,
} from "./messageClassification";

export type TriagePhase = "none" | "needs_question" | "needs_paths" | "ready";

export type TriageInput = {
  text: string;
  lastAssistantText: string;
  state: EmotionalState;
  obstacle: EmotionalObstacle | null;
  somatic: boolean;
  askingHow: boolean;
  messages?: ChatTurn[];
};

function discoveryToTriage(phase: DiscoveryPhase): TriagePhase {
  switch (phase) {
    case "issue":
      return "needs_question";
    case "factors":
    case "advisor":
      return "needs_paths";
    case "ready":
      return "ready";
    default:
      return "none";
  }
}

export function matchesTriageOpening(text: string): boolean {
  return shouldRunEmotionalTriage(text);
}

/** @deprecated Use getDiscoveryPhase from companionIntelligence */
export function getTriagePhase(input: TriageInput): TriagePhase {
  const messages =
    input.messages ??
    (input.text.trim()
      ? [{ role: "user" as const, content: input.text }]
      : []);
  const phase = getDiscoveryPhase({
    messages,
    text: input.text,
    lastAssistantText: input.lastAssistantText,
    state: input.state,
    obstacle: input.obstacle,
    somatic: input.somatic,
    askingHow: input.askingHow,
  });
  return discoveryToTriage(phase);
}

export function shouldDeferToolSuggestion(phase: TriagePhase): boolean {
  return phase === "needs_question" || phase === "needs_paths";
}

/** Prompt block for the chat API — prefer intelligenceHintForChat when messages are available. */
export function triageHintForChat(
  phase: TriagePhase,
  userText: string,
  input?: Omit<TriageInput, "text">,
): string | undefined {
  if (input?.messages?.length) {
    const intel = buildCompanionIntelligence({
      messages: input.messages,
      text: userText,
      lastAssistantText: input.lastAssistantText,
      state: input.state,
      obstacle: input.obstacle,
      somatic: input.somatic,
      askingHow: input.askingHow,
    });
    if (intel.discoveryPhase !== "none") {
      return intelligenceHintForChat(intel, userText);
    }
  }

  if (phase === "none" || phase === "ready") return undefined;

  if (phase === "needs_question") {
    return (
      `EMOTIONAL TRIAGE (ACTIVE — no tools yet): The user signaled "${userText.slice(0, 80)}" — ` +
      `do NOT suggest Clear My Mind, Timer, Focus, Spin, Projects, or any tool button. ` +
      `Validate briefly. Ask ONE clarifying question. No tool names.`
    );
  }

  return (
    `EMOTIONAL TRIAGE — PATHS (no tool buttons yet): Offer 2–3 possible paths in plain language. ` +
    `End with ONE gentle question. No timer as first move.`
  );
}
