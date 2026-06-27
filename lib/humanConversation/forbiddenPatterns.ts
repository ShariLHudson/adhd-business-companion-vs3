/**
 * Human Conversation — forbidden AI-default language.
 */

export const HUMAN_CONVERSATION_FORBIDDEN_OPENERS: readonly RegExp[] = [
  /^it sounds like\b/i,
  /^it seems like\b/i,
  /^it appears that\b/i,
  /^it sounds like you(?:'re| are)\b/i,
  /^i understand\b/i,
  /^i'm sorry you(?:'re| are)\b/i,
  /^what you(?:'re| are) experiencing is\b/i,
  /^many people with adhd\b/i,
  /^people with adhd\b/i,
  /^many people\b/i,
  /^many entrepreneurs\b/i,
  /^research shows\b/i,
  /^studies (?:show|indicate)\b/i,
  /^this is completely normal\b/i,
  /^i understand how you feel\b/i,
  /^as an ai\b/i,
  /^i can imagine\b/i,
  /^it is important to\b/i,
  /^it's important to\b/i,
  /^let's break this down\b/i,
  /^here's why\b/i,
  /^here is why\b/i,
  /^based on what you said\b/i,
  /^the adhd brain\b/i,
  /^your adhd brain\b/i,
  /^you should\b/i,
];

export const HUMAN_CONVERSATION_FORBIDDEN_PHRASES: readonly RegExp[] = [
  /\bexecutive function\b/i,
  /\bpeople with adhd often\b/i,
  /\bmany people with adhd\b/i,
  /\bthis is completely normal\b/i,
  /\bi understand how you feel\b/i,
  /\bi'm sorry you(?:'re| are)\b/i,
  /\bwhat you(?:'re| are) experiencing is\b/i,
  /\bas an ai\b/i,
  /\byou should be able to\b/i,
  /\byou just need to\b/i,
  /\bif you would\b/i,
  /\btry breaking it into smaller steps\b/i,
  /\bbreak (?:it )?into smaller (?:steps|pieces)\b/i,
  /\bset a timer\b/i,
  /\buse (?:a )?pomodoro\b/i,
  /\btake a walk\b/i,
  /\bmake a checklist\b/i,
  /\bstart with one tiny task\b/i,
  /\bi think you should\b/i,
  /\bthe system detected\b/i,
  /\bmemory intelligence\b/i,
  /\bpattern intelligence\b/i,
];

/** Mechanical system transitions — Action Transition forbids these. */
export const FORBIDDEN_SYSTEM_TRANSITION_PATTERNS: readonly RegExp[] = [
  /\bis open beside us\b/i,
  /\bopening \*\*/i,
  /\bworkspace launched\b/i,
  /\bredirecting\b/i,
  /\bdocuments opened\b/i,
  /\bworkspace opened\b/i,
  /^loading[.!]?\s*$/im,
  /\b(?:create|documents?|focus mode)\s+is open\b/i,
];

export const FORBIDDEN_SYSTEM_TRANSITION_LABELS = [
  "X is open beside us",
  "Opening **X** beside us",
  "Workspace launched",
  "Redirecting",
  "Loading",
  "Documents opened",
] as const;

export const HUMAN_CONVERSATION_FORBIDDEN_OPENER_LABELS = [
  "It sounds like...",
  "It seems like...",
  "I understand...",
  "I'm sorry you're...",
  "What you're experiencing is...",
  "It appears that...",
  "Many people with ADHD...",
  "Research shows...",
  "Studies indicate...",
  "This is completely normal.",
  "I understand how you feel.",
  "As an AI...",
  "Let's break this down.",
  "Here's why...",
  "Based on what you said...",
  "The ADHD brain...",
  "You should...",
  "You just need to...",
  "Try breaking it into smaller steps.",
  "Set a timer.",
  "Use Pomodoro.",
  "Take a walk.",
  "Make a checklist.",
] as const;

export function detectForbiddenHumanConversationOpener(
  text: string,
): string | null {
  const first = extractLeadingSentence(text);
  for (const pattern of HUMAN_CONVERSATION_FORBIDDEN_OPENERS) {
    if (pattern.test(first)) return pattern.source;
  }
  return null;
}

export function containsForbiddenHumanConversationPhrase(
  text: string,
): string | null {
  for (const pattern of HUMAN_CONVERSATION_FORBIDDEN_PHRASES) {
    if (pattern.test(text)) return pattern.source;
  }
  return null;
}

export function containsForbiddenSystemTransitionPhrase(
  text: string,
): string | null {
  for (const pattern of FORBIDDEN_SYSTEM_TRANSITION_PATTERNS) {
    if (pattern.test(text)) return pattern.source;
  }
  return null;
}

export function extractLeadingSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const firstParagraph = trimmed.split(/\n\s*\n/)[0]?.trim() ?? trimmed;
  const match = firstParagraph.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] ?? firstParagraph).trim();
}
