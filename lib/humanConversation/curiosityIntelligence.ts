import type { SpecializedIntelligenceId } from "../companionConstitution/specializedIntelligence/registry";

/** Curiosity — only when genuinely needed; never a mandatory opener. */
export const CURIOSITY_OPENERS = [
  "Hmm —",
  "Okay —",
  "Yeah —",
  "So —",
] as const;

export const GENTLE_CURIOSITY_OPENERS = [
  "I'm here.",
  "Take your time.",
  "No rush.",
] as const;

export const HUMAN_DRIFT_MARKERS = [
  "You know...",
  "Actually...",
  "Oh...",
  "Hmm...",
] as const;

export function pickCuriosityOpener(seed = 0, gentle = false): string {
  const pool = gentle ? GENTLE_CURIOSITY_OPENERS : CURIOSITY_OPENERS;
  return pool[Math.abs(seed) % pool.length]!;
}

const INTELLIGENCE_VOICE_HINTS: Partial<
  Record<SpecializedIntelligenceId, string>
> = {
  "business-intelligence":
    "Business lens: whole-business picture, tradeoffs, revenue and offer clarity — not generic marketing lectures.",
  "planning-intelligence":
    "Planning lens: today's realistic shape, energy-aware sequencing — not calendar optimization jargon.",
  "research-intelligence":
    "Research lens: what you found and what it means for them — not academic citations or link dumps.",
  "creative-intelligence":
    "Creative lens: possibilities and voice — not template factories or 'content strategy' speeches.",
  "decision-intelligence":
    "Decision lens: values and options side by side — not pros/cons worksheets.",
  "memory-intelligence":
    "Memory lens: what you've noticed about them over time — caring, never clinical.",
  "relationship-intelligence":
    "Relationship lens: continuity and trust — speak as someone who knows them.",
  "emotional-intelligence":
    "Emotional lens: name the feeling, stay human — never diagnose or therapize.",
  "environment-intelligence":
    "Environment lens: the space they're in and what would help right now — practical and warm.",
};

export function intelligenceVoiceHint(
  active: readonly SpecializedIntelligenceId[],
): string | null {
  if (!active.length) return null;
  const primary = active[0]!;
  const hint = INTELLIGENCE_VOICE_HINTS[primary];
  if (active.length >= 3) {
    return "Multiple lenses active — one companion voice; weave insights, don't stack modules.";
  }
  return hint ?? null;
}
