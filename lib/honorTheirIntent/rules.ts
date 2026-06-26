/**
 * Honor Their Intent™ — momentum protection and forbidden detours.
 */

/** Never interrupt purposeful momentum with these patterns */
export const FORBIDDEN_MOMENTUM_INTERRUPTIONS = [
  /\bbefore we (?:begin|do|start|get started|that)\b/i,
  /\bhow are you feeling today\b/i,
  /\byou'?ve been working hard\b/i,
  /\bbefore we get (?:started|going)\b/i,
  /\bfirst[, ]+how (?:are you|have you been)\b/i,
] as const;

export const GOOD_MOMENTUM_OPENERS = [
  "Absolutely. Let's build it.",
  "Let's do it.",
  "I can help with that.",
] as const;

export const POOR_MOMENTUM_OPENERS = [
  "Before we do that, how are you feeling today?",
  "You've been working hard lately…",
  "Before we begin, tell me how you're doing.",
] as const;

export function violatesMomentumProtection(text: string): boolean {
  return FORBIDDEN_MOMENTUM_INTERRUPTIONS.some((p) => p.test(text.trim()));
}

export function isGoodMomentumOpener(text: string): boolean {
  const t = text.trim();
  return GOOD_MOMENTUM_OPENERS.some((line) => t.includes(line) || line.includes(t));
}
