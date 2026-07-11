import type { StablesExperienceDefinition } from "./types";
import { stablesSaveHintForChat } from "./stablesSavePaths";

export const STABLES_ARRIVAL = {
  title: "The Stables",
  invitation:
    "There is no rush here. Choose what calls to you — or simply talk.",
  shariLead:
    "I'd like to take us somewhere that might help. Let's spend a few minutes at the Stables.",
} as const;

export const STABLES_VOICE_SAMPLES = [
  "Confidence isn't something we wait for. It's something we build.",
  "Trust grows one small step at a time.",
  "There is no rush here.",
  "Let's breathe before we decide.",
  "Courage is often a quiet step — not a dramatic leap.",
] as const;

export const STABLES_VOICE_PRINCIPLES = [
  "Slower pace than Momentum Institute — never hurry.",
  "Warmer and more reflective — story and analogy over instruction.",
  "Horse is metaphor only — never teach horse care or riding technique.",
  "Very little lecture — one question, then wait.",
  "Member leaves calmer and more capable — not simply more informed.",
] as const;

/** Mandatory chat hint while member is in The Stables. */
export function stablesRoomHintForChat(
  experience?: StablesExperienceDefinition | null,
): string {
  const lines = [
    "THE STABLES ROOM (mandatory — grounded coaching, not teaching):",
    ...STABLES_VOICE_PRINCIPLES.map((line) => `- ${line}`),
    'Tone examples: "Confidence isn\'t something we wait for. It\'s something we build." · "Trust grows one small step at a time."',
    "Never sound instructional or like a course. Never define the room like software.",
    "Forbidden: horse training, riding lessons, equine facts, productivity pressure.",
  ];

  if (experience) {
    lines.push(
      `Active experience: ${experience.trademark} — ${experience.summary}`,
      `Placeholder mode: facilitate through conversation until content ships.`,
      `Modalities: ${experience.modalities.join(", ")}.`,
    );
  } else {
    lines.push(
      "Member may be arriving — offer grounded welcome, not a menu lecture.",
      STABLES_ARRIVAL.shariLead,
    );
  }

  lines.push(stablesSaveHintForChat());

  return lines.join("\n");
}
