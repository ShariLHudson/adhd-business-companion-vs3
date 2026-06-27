import type { EmotionalObstacle, EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import { isResearchIntelligenceRequest } from "@/lib/researchIntelligence";
import type { ConversationIntelligenceVerdict } from "../conversationIntelligence/types";
import { createCompanionState, type CompanionState } from "../companionState";
import type { SpecializedIntelligenceId } from "../specializedIntelligence/registry";

export type CompanionIntelligenceInput = {
  conversation: ConversationIntelligenceVerdict;
  emotionalState?: EmotionalState;
  obstacle?: EmotionalObstacle | null;
  activeSection?: AppSection | null;
  workspaceId?: string;
  overwhelmed?: boolean;
  lowEnergy?: boolean;
  writingActive?: boolean;
  voiceConversation?: boolean;
  userText?: string | null;
};

export type CompanionOrchestration = {
  /** Intelligences participating this turn — silent to the user */
  activeIntelligences: readonly SpecializedIntelligenceId[];
  /** Intelligences deliberately held back */
  silentIntelligences: readonly SpecializedIntelligenceId[];
  /** What matters right now for the experience */
  primaryObjective: string | null;
  /** Suggested next experience — Companion Intelligence decides, not individual engines */
  nextExperience: AppSection | "stay-in-conversation" | null;
  companionState: CompanionState;
  dataAttributes: Record<string, string>;
};

const ALL_SPECIALIZED: SpecializedIntelligenceId[] = [
  "user-intelligence",
  "emotional-intelligence",
  "energy-intelligence",
  "business-intelligence",
  "project-intelligence",
  "planning-intelligence",
  "focus-intelligence",
  "decision-intelligence",
  "content-intelligence",
  "opportunity-intelligence",
  "pattern-intelligence",
  "evidence-intelligence",
  "memory-intelligence",
  "creative-intelligence",
  "research-intelligence",
  "relationship-intelligence",
  "wellness-intelligence",
  "environment-intelligence",
  "presence-intelligence",
];

function inferEnergy(
  emotional: EmotionalState,
  lowEnergy?: boolean,
): CompanionState["energy"] {
  if (lowEnergy || emotional === "overwhelmed") return "low";
  if (emotional === "focused" || emotional === "building") return "high";
  return "medium";
}

function inferMomentum(emotional: EmotionalState): CompanionState["momentum"] {
  if (emotional === "stuck" || emotional === "overwhelmed") return "low";
  if (emotional === "focused" || emotional === "building") return "high";
  return "steady";
}

function addIntelligences(
  active: Set<SpecializedIntelligenceId>,
  ...ids: SpecializedIntelligenceId[]
): void {
  for (const id of ids) active.add(id);
}

function selectIntelligences(input: CompanionIntelligenceInput): {
  active: SpecializedIntelligenceId[];
  silent: SpecializedIntelligenceId[];
} {
  const active = new Set<SpecializedIntelligenceId>([
    "memory-intelligence",
    "user-intelligence",
  ]);
  const { state } = input.conversation;
  const section = input.activeSection ?? state.activeSection;
  const text = (input.userText ?? state.userText ?? "").toLowerCase();

  active.add("emotional-intelligence");

  if (input.overwhelmed || input.lowEnergy || state.mode === "regulation") {
    addIntelligences(active, "energy-intelligence", "wellness-intelligence");
  }

  if (section === "brain-dump") {
    addIntelligences(active, "focus-intelligence", "wellness-intelligence");
  }
  if (section === "plan-my-day") {
    addIntelligences(active, "planning-intelligence", "energy-intelligence");
  }
  if (section === "focus") {
    addIntelligences(active, "focus-intelligence", "wellness-intelligence");
  }
  if (section === "projects") active.add("project-intelligence");
  if (section === "decision-compass") active.add("decision-intelligence");
  if (
    section === "content-generator" ||
    section === "my-work" ||
    section === "templates-library"
  ) {
    addIntelligences(active, "creative-intelligence", "content-intelligence");
  }
  if (section === "business-profile" || section === "client-avatars") {
    addIntelligences(active, "business-intelligence", "relationship-intelligence");
  }
  if (section === "how-do-i") active.add("research-intelligence");
  if (isResearchIntelligenceRequest(text)) active.add("research-intelligence");
  if (section === "wins-this-week" || section === "evidence-bank") {
    active.add("evidence-intelligence");
  }

  if (/\b(client|customer|launch|offer|sell|marketing)\b/i.test(text)) {
    active.add("business-intelligence");
  }
  if (/\b(decide|choice|which one|trade.?off)\b/i.test(text)) {
    active.add("decision-intelligence");
  }
  if (/\b(stuck|can'?t start|avoid|procrastinat)\b/i.test(text)) {
    addIntelligences(active, "focus-intelligence", "pattern-intelligence");
  }

  // Render layers always receive constitutional environment + presence
  addIntelligences(active, "environment-intelligence", "presence-intelligence");

  const silent = ALL_SPECIALIZED.filter((id) => !active.has(id));
  return { active: [...active], silent };
}

function inferNextExperience(
  input: CompanionIntelligenceInput,
): CompanionOrchestration["nextExperience"] {
  const { state } = input.conversation;
  if (state.mode === "arrival") return "home";
  if (state.mode === "regulation") return state.activeSection;
  if (input.overwhelmed && state.mode === "chat") return "brain-dump";
  if (input.emotionalState === "stuck" && state.mode === "chat") return "focus";
  return state.activeSection === "home" ? "stay-in-conversation" : state.activeSection;
}

/**
 * Companion Intelligence — the conductor. Sole orchestration authority.
 * Decides which specialized intelligences participate and what matters now.
 * The user experiences one companion — never individual intelligences.
 */
export function resolveCompanionIntelligence(
  input: CompanionIntelligenceInput,
): CompanionOrchestration {
  const emotional = input.emotionalState ?? "unclear";
  const { active, silent } = selectIntelligences(input);

  const companionState = createCompanionState({
    emotionalState: emotional,
    energy: inferEnergy(emotional, input.lowEnergy),
    overwhelmed: Boolean(input.overwhelmed ?? emotional === "overwhelmed"),
    intent: input.userText ?? input.conversation.state.userText,
    objective: input.workspaceId ?? input.activeSection ?? null,
    momentum: inferMomentum(emotional),
    writingActive: input.writingActive,
    voiceConversation: input.voiceConversation,
  });

  return {
    activeIntelligences: active,
    silentIntelligences: silent,
    primaryObjective: companionState.objective,
    nextExperience: inferNextExperience(input),
    companionState,
    dataAttributes: {
      "data-companion-intelligence": "1",
      "data-orchestration-active-count": String(active.length),
    },
  };
}
