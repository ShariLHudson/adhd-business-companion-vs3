/** Cognitive design rules — motion must never pull attention from thinking */

export const SUNROOM_COGNITIVE_FORBIDDEN = [
  "sudden-motion-near-workspace",
  "repetitive-animation",
  "center-screen-movement",
  "attention-demanding-motion",
  "rhythmic-water-like-music",
  "countdown-pressure",
  "dashboard-clutter",
  "urgency-visual",
] as const;

export function violatesSunroomCognitiveRule(patternId: string): boolean {
  const normalized = patternId.trim().toLowerCase().replace(/\s+/g, "-");
  return SUNROOM_COGNITIVE_FORBIDDEN.some(
    (f) => normalized.includes(f) || f.includes(normalized),
  );
}
