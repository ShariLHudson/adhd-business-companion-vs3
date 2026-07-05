/**
 * Classify which energy type needs restoring.
 */

import {
  bestRestorationTrigger,
  detectRestorationTriggers,
  shouldBlockRestorationOffer,
} from "@/lib/estateRestoration/detection";
import type { RestorationTrigger } from "@/lib/estateRestoration/types";
import type { SparkEnergyType, SparkRestorationInput } from "./types";

const EMOTIONAL_RE =
  /\b(?:discouraged|hopeless|defeated|giving up|no point|what'?s the use|feel(?:ing)? down|lost hope|don'?t believe)\b/i;

const CREATIVE_STUCK_RE =
  /\b(?:creatively stuck|no ideas|blank page|can'?t write|writer'?s block|nothing sounds good|stale ideas)\b/i;

const SENSORY_RE =
  /\b(?:overstimulat|too (?:loud|much noise|bright)|sensory overload|need quiet|everything (?:is )?too much|fried my senses)\b/i;

const PLAY_NOVELTY_RE =
  /\b(?:need novelty|something different|bored of this|same thing over|refresh my brain|shake things up)\b/i;

const SOCIAL_RE =
  /\b(?:feel alone|no one gets it|need encouragement|could use cheer|wish someone|lonely|isolated)\b/i;

const TRIGGER_TO_ENERGY: Partial<Record<RestorationTrigger, SparkEnergyType>> = {
  mental_fatigue: "mental",
  cognitive_overload: "mental",
  decision_fatigue: "mental",
  frustration: "mental",
  stuck: "creative",
  revision_loop: "creative",
  extended_work: "play",
  natural_pause: "curiosity",
};

export type EnergyClassification = {
  energyType: SparkEnergyType;
  trigger: RestorationTrigger | null;
  weight: number;
};

export function classifySparkEnergy(
  input: SparkRestorationInput,
): EnergyClassification | null {
  if (shouldBlockRestorationOffer(input.userText)) return null;

  const t = input.userText.trim();
  const scores = new Map<SparkEnergyType, number>();

  const bump = (energy: SparkEnergyType, points: number) => {
    scores.set(energy, (scores.get(energy) ?? 0) + points);
  };

  if (input.overwhelmed) bump("sensory", 20);
  if (SENSORY_RE.test(t)) bump("sensory", 28);
  if (EMOTIONAL_RE.test(t)) bump("emotional", 26);
  if (CREATIVE_STUCK_RE.test(t)) bump("creative", 24);
  if (PLAY_NOVELTY_RE.test(t)) bump("play", 22);
  if (SOCIAL_RE.test(t)) bump("social", 22);

  if (input.focusedMinutes != null && input.focusedMinutes >= 75) {
    bump("play", 18);
    bump("curiosity", 14);
  }

  if (input.emotionalState === "overwhelmed") bump("sensory", 16);
  if (input.emotionalState === "stuck") bump("creative", 14);

  const triggers = detectRestorationTriggers({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
    emotionalState: input.emotionalState,
  });

  for (const match of triggers) {
    const energy = TRIGGER_TO_ENERGY[match.trigger];
    if (energy) bump(energy, match.weight);
  }

  if (input.workspace === "content-generator" && triggers.some((m) => m.trigger === "revision_loop")) {
    bump("creative", 12);
  }
  if (input.workspace === "brain-dump") bump("mental", 8);

  if (scores.size === 0) {
    const trigger = bestRestorationTrigger({
      userText: input.userText,
      overwhelmed: input.overwhelmed,
      emotionalState: input.emotionalState,
    });
    if (!trigger) return null;
    return {
      energyType: TRIGGER_TO_ENERGY[trigger] ?? "curiosity",
      trigger,
      weight: 20,
    };
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [energyType, weight] = ranked[0]!;
  const trigger = triggers[0]?.trigger ?? null;

  return { energyType, trigger, weight };
}
