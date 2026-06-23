/**
 * Stress routing — recommend first, route second.
 * Understand → Suggest → User Chooses → Open Tool
 */

import { detectAudioRequest } from "./audioSuggestions";
import { isExplicitBreatheRequest } from "./explicitBreatheRouting";
import {
  isGenuineEmotionalDistress,
  shouldSuppressEmotionalTools,
} from "./messageClassification";
import type { SidebarToolId } from "./companionUi";

export type StressReliefOptionId =
  | "breathe"
  | "calm-audio"
  | "clear-mind"
  | "safe-for-today"
  | "talk-through"
  | "adjust-day";

export type StressCauseId =
  | "too-many-thoughts"
  | "anxiety-worry"
  | "calm-body"
  | "too-much-to-do"
  | "something-else";

export type StressReliefOption = {
  id: StressReliefOptionId;
  emoji: string;
  label: string;
};

export type StressCauseOption = {
  id: StressCauseId;
  label: string;
};

export type StressReliefOffer =
  | { kind: "options" }
  | {
      kind: "recommendation";
      cause: StressCauseId;
      primary: StressReliefOption;
      secondary?: StressReliefOption;
    };

const STRESS_ROUTING_RE =
  /\b(?:i'?m stressed|i am stressed|feel(?:ing)? stressed|so stressed|really stressed|i feel anxious|feel(?:ing)? anxious|i'?m anxious|i am anxious|need to calm down|help me calm down|calm me down|trying to calm down|i'?m overwhelmed|feel(?:ing)? overwhelmed|i am overwhelmed|my brain is spinning|brain (?:is )?spinning|head is spinning|everything feels like too much|feels like too much|can'?t think(?: straight)?|losing it|mentally exhausted|mental(?:ly)? exhausted|can'?t calm(?: down)?|racing thoughts|wound up|on edge|frazzled|too wound up|too much right now|carrying too much)\b/i;

const EXPLICIT_OPEN_RE =
  /\b(?:open|start|launch|show|play|take me to|go to)\s+(?:the\s+)?/i;

const EXPLICIT_FOCUS_AUDIO_RE =
  /\b(?:focus audio|focus music|(?:open|play|start|launch|show)\s+(?:the\s+)?(?:focus\s+)?(?:audio|music)|(?:calming|relaxing|calm)\s+(?:audio|music|sounds?|playlist)|play calming (?:music|audio)|music|audio|playlist|listen to (?:music|something calm|rain)|brown noise|white noise|lo-?fi)\b/i;

const STRESS_TOOL_ACCEPT_RE =
  /\b(?:let'?s|let us|i'?ll|i will|i want to|want to|try|do the|do a|go with|yes to|sounds good|let me try)\b/i;

export const STRESS_RELIEF_OPTIONS: StressReliefOption[] = [
  { id: "breathe", emoji: "🌬️", label: "Breathing Exercise" },
  { id: "calm-audio", emoji: "🎵", label: "Calm Audio" },
  { id: "clear-mind", emoji: "🧠", label: "Clear My Mind" },
  { id: "safe-for-today", emoji: "🛡️", label: "Safe For Today" },
  { id: "talk-through", emoji: "💬", label: "Talk It Through" },
];

export const STRESS_CAUSE_OPTIONS: StressCauseOption[] = [
  { id: "too-many-thoughts", label: "Too many thoughts" },
  { id: "anxiety-worry", label: "Anxiety or worry" },
  { id: "calm-body", label: "Need to calm my body" },
  { id: "too-much-to-do", label: "Too much to do" },
  { id: "something-else", label: "Something else" },
];

export function isStressRoutingSignal(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (shouldSuppressEmotionalTools(t)) return false;
  if (STRESS_ROUTING_RE.test(t)) return true;
  return isGenuineEmotionalDistress(t);
}

export function isExplicitFocusAudioRequest(text: string): boolean {
  const t = text.trim();
  if (!t || isRhetoricalSoundInStressContext(t)) return false;
  if (EXPLICIT_FOCUS_AUDIO_RE.test(t)) return true;
  const { isAudio } = detectAudioRequest(t);
  return isAudio;
}

function isRhetoricalSoundInStressContext(text: string): boolean {
  return /\b(?:that|this|it)\s+sounds?\b/i.test(text);
}

function matchesStressToolPhrase(text: string): StressReliefOptionId | null {
  const t = text.trim().toLowerCase();
  if (
    /\b(?:clear my mind|brain dump|get (?:it )?out of my head)\b/.test(t)
  ) {
    return "clear-mind";
  }
  if (
    /\b(?:breathing exercise|breathe(?:\s+and\s+reset)?|breathing exercise|do breathing|take a breath|take a moment to breathe|just breathe|need to breathe)\b/.test(
      t,
    )
  ) {
    return "breathe";
  }
  if (
    /\b(?:calm audio|calming audio|calming music|focus audio|play calming)\b/.test(
      t,
    )
  ) {
    return "calm-audio";
  }
  if (/\b(?:safe for today|safe-for-today)\b/.test(t)) {
    return "safe-for-today";
  }
  if (/\b(?:adjust my day|rebuild (?:my )?day|tune my day)\b/.test(t)) {
    return "adjust-day";
  }
  if (/\b(?:talk it through|keep talking|just talk)\b/.test(t)) {
    return "talk-through";
  }
  return null;
}

/** User chose a relief tool in chat — open only after explicit or accepting language. */
export function detectStressReliefToolChoice(text: string): StressReliefOptionId | null {
  const t = text.trim();
  if (!t) return null;

  const tool = matchesStressToolPhrase(t);
  if (!tool) return null;

  const imperative =
    EXPLICIT_OPEN_RE.test(t) ||
    /\b(?:start|play|launch)\b/i.test(t) ||
    /\bopen (?:the )?(?:clear my mind|brain dump|safe for today|breathe|breathing|focus audio|focus session|adjust my day)\b/i.test(
      t,
    );

  if (imperative || STRESS_TOOL_ACCEPT_RE.test(t)) {
    return tool;
  }

  return null;
}

export function isExplicitStressToolRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isExplicitFocusAudioRequest(t)) return true;
  if (detectStressReliefToolChoice(t)) return true;

  if (
    EXPLICIT_OPEN_RE.test(t) &&
    /\b(?:clear my mind|brain dump|safe for today|breathe|breathing|focus session|focus timer|adjust my day)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\b(?:start|launch)\s+(?:a )?(?:focus session|focus timer|breathing exercise)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/\bplay calming (?:music|audio)\b/i.test(t)) return true;

  return false;
}

/** Block auto-opening any tool when the user is expressing distress, not requesting one. */
export function shouldBlockStressAutoToolRouting(text: string): boolean {
  if (isExplicitBreatheRequest(text)) return false;
  if (!isStressRoutingSignal(text)) return false;
  return !isExplicitStressToolRequest(text);
}

/** @deprecated Use shouldBlockStressAutoToolRouting */
export function shouldBlockStressAudioRouting(text: string): boolean {
  return shouldBlockStressAutoToolRouting(text);
}

export function shouldOfferStressRelief(
  text: string,
  _messages?: { role: string; content: string }[],
): boolean {
  if (!isStressRoutingSignal(text)) return false;
  if (isExplicitStressToolRequest(text)) return false;
  return true;
}

export function buildStressReliefOffer(): StressReliefOffer {
  return { kind: "options" };
}

const CAUSE_PATTERNS: { id: StressCauseId; re: RegExp }[] = [
  {
    id: "too-many-thoughts",
    re: /\b(?:too many thoughts|thoughts (?:are )?racing|racing thoughts|brain (?:is )?full|mental clutter|can'?t stop thinking|mind (?:is )?racing|head (?:is )?full)\b/i,
  },
  {
    id: "anxiety-worry",
    re: /\b(?:anxious|anxiety|worried|worry|worrying|panic|panicking|on edge|nervous|scared|afraid|i feel anxious)\b/i,
  },
  {
    id: "calm-body",
    re: /\b(?:calm my body|body (?:is )?tense|tight chest|chest tight|can'?t breathe|shaking|nauseous|sick to my stomach|need to calm (?:my body|down physically))\b/i,
  },
  {
    id: "too-much-to-do",
    re: /\b(?:too much to do|so much to do|everything (?:to|on my) do|too many tasks|too many things|can'?t keep up|drowning in|to-?do list|too much on my plate|everything feels like too much)\b/i,
  },
  {
    id: "something-else",
    re: /\b(?:something else|not sure|don'?t know|hard to say|can'?t name it|other)\b/i,
  },
];

export function detectStressCauseChoice(text: string): StressCauseId | null {
  const t = text.trim();
  if (!t) return null;

  for (const { id, label } of STRESS_CAUSE_OPTIONS) {
    if (new RegExp(`\\b${escapeRegExp(label)}\\b`, "i").test(t)) {
      return id;
    }
  }

  for (const row of CAUSE_PATTERNS) {
    if (row.re.test(t)) return row.id;
  }
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function option(id: StressReliefOptionId): StressReliefOption {
  return STRESS_RELIEF_OPTIONS.find((o) => o.id === id)!;
}

export function recommendForStressCause(cause: StressCauseId): {
  primary: StressReliefOption;
  secondary?: StressReliefOption;
} {
  switch (cause) {
    case "too-many-thoughts":
      return { primary: option("clear-mind") };
    case "anxiety-worry":
      return { primary: option("breathe"), secondary: option("calm-audio") };
    case "calm-body":
      return { primary: option("breathe") };
    case "too-much-to-do":
      return {
        primary: { id: "adjust-day", emoji: "⚡", label: "Adapt My Day" },
      };
    case "something-else":
    default:
      return { primary: option("talk-through") };
  }
}

export function buildStressCauseRecommendation(
  cause: StressCauseId,
): StressReliefOffer {
  const { primary, secondary } = recommendForStressCause(cause);
  return { kind: "recommendation", cause, primary, secondary };
}

export function stressReliefToolAction(
  id: StressReliefOptionId,
):
  | { type: "tool"; tool: SidebarToolId }
  | { type: "section"; section: "brain-dump" | "energy" }
  | { type: "activity"; activityId: string }
  | { type: "chat-prompt"; prompt: string } {
  switch (id) {
    case "breathe":
      return { type: "tool", tool: "breathe" };
    case "calm-audio":
      return { type: "tool", tool: "focus-audio" };
    case "clear-mind":
      return { type: "section", section: "brain-dump" };
    case "safe-for-today":
      return { type: "activity", activityId: "safe-for-today" };
    case "talk-through":
      return {
        type: "chat-prompt",
        prompt:
          "I'm carrying a lot right now — can we talk it through and find what would help most?",
      };
    case "adjust-day":
      return { type: "section", section: "energy" };
  }
}

export function stressToolOpenAck(id: StressReliefOptionId): string {
  switch (id) {
    case "breathe":
      return "Opening **Breathe & Reset** — take your time. Chat stays right here.";
    case "calm-audio":
      return "Opening **Focus Audio** with calm sounds — pick a track or add your own link.";
    case "clear-mind":
      return "Opening **Clear My Mind** beside us — get it out of your head without fixing it all.";
    case "safe-for-today":
      return "Opening **Safe For Today** — permission to postpone, not a guilt list.";
    case "adjust-day":
      return "Opening **Adapt My Day** — let's rebuild today to fit your real energy.";
    case "talk-through":
      return "I'm here — let's talk it through.";
  }
}

export function stressReliefHintForChat(text: string): string {
  return (
    `STRESS ROUTING (ACTIVE): User signaled stress or overwhelm — "${text.slice(0, 80)}". ` +
    `Respond with brief empathy: it sounds like they're carrying a lot; different things help depending on the cause. ` +
    `Do NOT open or name a specific tool. Relief options appear in the UI below — do not list buttons. ` +
    `Optional: ask what feels strongest right now — one gentle question only.`
  );
}

export function stressCauseRecommendationLine(cause: StressCauseId): string {
  switch (cause) {
    case "too-many-thoughts":
      return "When thoughts are loud, getting them out of your head can help before solving anything.";
    case "anxiety-worry":
      return "For worry in the body, a short breath reset or calm audio often lands first.";
    case "calm-body":
      return "Let's start with your body — a breathing exercise can help before anything else.";
    case "too-much-to-do":
      return "When the list is the problem, adjusting today's plan can release pressure.";
    default:
      return "We can keep talking — you don't have to name it perfectly.";
  }
}
