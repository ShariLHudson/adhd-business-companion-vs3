import type { EmotionalState } from "../companionEmotions";
import type { AppSection } from "../companionUi";
import {
  resolveCompanionIntelligence,
  resolveConversationIntelligence,
} from "../companionConstitution";
import type { SpecializedIntelligenceId } from "../companionConstitution/specializedIntelligence/registry";
import { isBusinessAdviceRequest } from "../businessAdviceIntent";
import { isResearchIntelligenceRequest } from "../researchIntelligence";
import type { VisibleThinkingContext, VisibleThinkingKind } from "./types";

const PLANNING_RE =
  /\b(?:plan (?:my|your|the) day|shape (?:my|your|the) day|today'?s plan|schedule|time block|calendar|prioriti[sz]e today)\b/i;

const CREATIVE_RE =
  /\b(?:write|draft|create|build|generate|design)\s+(?:an?|the|my)?\s*(?:email|sop|post|newsletter|proposal|plan|draft|content|copy|script|page|funnel|sequence)\b/i;

const DECISION_RE =
  /\b(?:should i|which (?:one|option)|decide|decision|compare|choose between|not sure whether)\b/i;

const WORKSPACE_PREP_RE =
  /\b(?:open|show|bring up|pull up)\s+(?:my |the )?(?:create|projects?|snippets?|templates?|playbook|brain dump|clear my mind|my thoughts|decision compass|plan my day)\b/i;

const MEMORY_SIGNAL_RE =
  /\b(?:we talked about|last time|you mentioned|remember when|pick(?:ing)? up where|continue where)\b/i;

const GENTLE_EMOTIONS: ReadonlySet<EmotionalState> = new Set([
  "overwhelmed",
  "emotional",
]);

const INTELLIGENCE_KIND: Partial<
  Record<SpecializedIntelligenceId, VisibleThinkingKind>
> = {
  "research-intelligence": "research",
  "business-intelligence": "business",
  "planning-intelligence": "planning",
  "decision-intelligence": "decision",
  "creative-intelligence": "creative",
  "memory-intelligence": "memory",
  "relationship-intelligence": "relationship",
  "environment-intelligence": "environment",
};

function kindsFromIntelligences(
  active: readonly SpecializedIntelligenceId[],
): VisibleThinkingKind[] {
  const kinds = new Set<VisibleThinkingKind>();
  for (const id of active) {
    const kind = INTELLIGENCE_KIND[id];
    if (kind) kinds.add(kind);
  }
  return [...kinds];
}

function kindFromHeuristics(
  userText: string,
  preparingWorkspace: boolean,
): VisibleThinkingKind | null {
  if (isResearchIntelligenceRequest(userText)) return "research";
  if (preparingWorkspace) return "workspace";
  if (isBusinessAdviceRequest(userText)) return "business";
  if (PLANNING_RE.test(userText)) return "planning";
  if (DECISION_RE.test(userText)) return "decision";
  if (CREATIVE_RE.test(userText)) return "creative";
  if (MEMORY_SIGNAL_RE.test(userText)) return "memory";
  return null;
}

function pickPrimaryKind(
  heuristic: VisibleThinkingKind | null,
  fromIntelligences: VisibleThinkingKind[],
): VisibleThinkingKind {
  if (heuristic && heuristic !== "general") {
    return heuristic;
  }
  if (fromIntelligences.length >= 2) return "multiple";
  if (fromIntelligences.length === 1) return fromIntelligences[0]!;
  return heuristic ?? "general";
}

export function buildVisibleThinkingContext(input: {
  userText: string;
  emotionalState: EmotionalState;
  activeSection?: AppSection | null;
  workspaceBeside?: boolean;
  offeredAtTurn?: number;
}): VisibleThinkingContext {
  const conversation = resolveConversationIntelligence({
    activeSection: input.activeSection ?? undefined,
    workspaceBesideChat: input.workspaceBeside ?? false,
    messageCount: 0,
    userText: input.userText,
  });

  const orchestration = resolveCompanionIntelligence({
    conversation,
    emotionalState: input.emotionalState,
    overwhelmed: input.emotionalState === "overwhelmed",
    userText: input.userText,
    activeSection: input.activeSection ?? undefined,
  });

  const preparingWorkspace = WORKSPACE_PREP_RE.test(input.userText.trim());
  const heuristicKind = kindFromHeuristics(
    input.userText,
    preparingWorkspace,
  );
  const intelligenceKinds = kindsFromIntelligences(
    orchestration.activeIntelligences,
  );
  const kind = pickPrimaryKind(heuristicKind, intelligenceKinds);
  const gentle = GENTLE_EMOTIONS.has(input.emotionalState);

  return {
    kind: gentle ? "gentle" : kind,
    gentle,
    workspaceBeside: input.workspaceBeside ?? false,
    preparingWorkspace,
    activeIntelligences: orchestration.activeIntelligences,
    emotionalState: input.emotionalState,
    seed: input.offeredAtTurn ?? Date.now(),
  };
}
