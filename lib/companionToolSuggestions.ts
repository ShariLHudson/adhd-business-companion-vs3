import type { EmotionalObstacle } from "./companionEmotions";
import type { EmotionalState } from "./companionEmotions";
import type { SidebarToolId } from "./companionUi";
import {
  buildCompanionIntelligence,
  shouldDeferToolsFromIntelligence,
  type ChatTurn,
} from "./companionIntelligence";
import type { TriageInput } from "./companionTriage";
import { hasConcreteWorkspaceTarget } from "./workspaceMode";

export type ToolSuggestionKind =
  | "clear-mind"
  | "focus-session"
  | "spin-wheel"
  | "breathe"
  | "get-unstuck";

export type ToolSuggestion = {
  kind: ToolSuggestionKind;
  /** Warm, conversational line — supportive, not feature-driven. */
  line: string;
  toolLabel: string;
  toolEmoji: string;
  keepTalkingLabel: string;
  /** Opens a panel, or a guided chat prompt for get-unstuck. */
  action: { type: "tool"; tool: SidebarToolId } | { type: "chat-prompt"; prompt: string };
};

const FROZEN_RE =
  /\b(frozen|freeze|can'?t start|cannot start|can'?t begin|can'?t get started|can'?t get moving|can'?t make myself|body won'?t (start|move)|paralyz)/i;

const OVERWHELMED_RE =
  /\b(overwhelm|overwhelmed|too much|so much|so many|mental clutter|brain is full|drowning|everything at once|everything feels urgent|all at once|pulled in every direction|can'?t keep up|head is spinning|spinning)\b/i;

const ANXIOUS_RE =
  /\b(stressed|stress|anxious|anxiety|worried|worrying|panic|panicking|frazzled|on edge|tense|nervous|can'?t calm|racing thoughts)\b/i;

const PRIORITY_PARALYSIS_RE =
  /\b(everything feels (important|equal)|equally important|all feel(s)? important|can'?t (pick|choose|decide) what|don'?t know what to (work on|do) first|too many (priorities|options)|which (one|thing) first|all the same priority)\b/i;

const STUCK_RE =
  /\b(stuck|procrastinat|putting off|haven'?t started|where to begin|don'?t know where to start|avoiding)\b/i;

const ENERGIZE_RE =
  /\b(energi[sz]e|energi[sz]ing|pep (?:me )?up|pick me up|need (?:more )?energy|get (?:me )?going|wake me up|uplift)\b/i;

export type SuggestToolInput = TriageInput & { messages?: ChatTurn[] };

function overwhelmed(input: SuggestToolInput): boolean {
  return (
    input.state === "overwhelmed" ||
    input.obstacle === "overwhelm" ||
    OVERWHELMED_RE.test(input.text)
  );
}

function anxiousOrStressed(input: SuggestToolInput): boolean {
  return (
    input.state === "emotional" ||
    input.somatic ||
    ANXIOUS_RE.test(input.text)
  );
}

function frozen(input: SuggestToolInput): boolean {
  return input.obstacle === "activation_barrier" || FROZEN_RE.test(input.text);
}

function priorityParalysis(input: SuggestToolInput): boolean {
  if (overwhelmed(input)) return false;
  return (
    input.obstacle === "decision_conflict" ||
    PRIORITY_PARALYSIS_RE.test(input.text)
  );
}

function stuck(input: SuggestToolInput): boolean {
  return input.state === "stuck" || STUCK_RE.test(input.text);
}

/** Whether a gentle tool offer should appear after this user turn. */
export function suggestSupportTool(
  input: SuggestToolInput,
): ToolSuggestion | null {
  if (input.askingHow) return null;

  const t = input.text.trim();
  if (!t) return null;

  // Concrete create/build intent → workspace offer wins over Get Unstuck / etc.
  if (hasConcreteWorkspaceTarget(t)) return null;

  const intel = buildCompanionIntelligence({
    messages: input.messages ?? [],
    text: input.text,
    lastAssistantText: input.lastAssistantText,
    state: input.state,
    obstacle: input.obstacle,
    somatic: input.somatic,
    askingHow: input.askingHow,
  });
  if (shouldDeferToolsFromIntelligence(intel)) return null;

  if (ENERGIZE_RE.test(t)) {
    return {
      kind: "focus-session",
      line:
        "Energizing music can be a fast lift — **Focus Audio** has a **Motivation Boost** playlist for that.",
      toolLabel: "Open Focus Audio",
      toolEmoji: "⚡",
      keepTalkingLabel: "Keep Talking",
      action: { type: "tool", tool: "focus-audio" },
    };
  }

  if (overwhelmed(input)) {
    return {
      kind: "clear-mind",
      line:
        "It sounds like your brain is carrying a lot right now. Before we try to solve anything, would it help to clear your head?",
      toolLabel: "Clear My Mind",
      toolEmoji: "🧠",
      keepTalkingLabel: "Keep Talking",
      action: { type: "tool", tool: "brain-dump" },
    };
  }

  if (anxiousOrStressed(input)) {
    return {
      kind: "breathe",
      line:
        "That sounds like a lot for your nervous system to hold. Would a short reset help before we go further?",
      toolLabel: "Breathe & Reset",
      toolEmoji: "🌿",
      keepTalkingLabel: "Keep Talking",
      action: { type: "tool", tool: "breathe" },
    };
  }

  if (frozen(input)) {
    return {
      kind: "focus-session",
      line:
        "Sometimes the hardest part is just beginning. Want to try a short focus session and see what shifts?",
      toolLabel: "Focus Session",
      toolEmoji: "🎯",
      keepTalkingLabel: "Keep Talking",
      action: { type: "tool", tool: "focus-timer" },
    };
  }

  if (priorityParalysis(input)) {
    return {
      kind: "spin-wheel",
      line:
        "When everything feels equally important, choosing can be the whole battle. Want to spin the wheel and let chance pick one?",
      toolLabel: "Spin The Wheel",
      toolEmoji: "🎡",
      keepTalkingLabel: "Keep Talking",
      action: { type: "tool", tool: "spin-wheel" },
    };
  }

  if (stuck(input)) {
    return {
      kind: "get-unstuck",
      line:
        "We can keep talking — or I can help you find one tiny next step. What sounds better?",
      toolLabel: "Get Unstuck",
      toolEmoji: "🚶",
      keepTalkingLabel: "Keep Talking",
      action: {
        type: "chat-prompt",
        prompt:
          "I'm feeling stuck — can you help me find the smallest next step?",
      },
    };
  }

  return null;
}

/** Nudge the model: UI will offer the tool — don't duplicate or interrogate. */
export function toolOfferHintForChat(offer: ToolSuggestion): string {
  return (
    `TOOL OFFER (handled in UI — do NOT name tools or ask which one): ` +
    `A "${offer.toolLabel}" button will appear below your reply. ` +
    `Acknowledge how they feel in 1–2 sentences. Do not list features or ask if they want a tool. ` +
    `One warm conversational line — optional ONE feeling question, not a coaching interrogation.`
  );
}
