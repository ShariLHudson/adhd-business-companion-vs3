/**
 * Package 200/205 — grounded re-entry after pause/resume.
 */

export function buildTalkItOutReentry(input: {
  topicAnchor?: string | null;
  currentFocus?: string | null;
  usefulSummary?: string | null;
}): string {
  if (input.usefulSummary?.trim()) {
    return input.usefulSummary.trim();
  }
  const topic = input.topicAnchor?.trim();
  const focus = input.currentFocus?.trim();
  if (topic && focus) {
    return `We were talking about ${topic}. You had reached the point of looking at ${focus}.`;
  }
  if (topic) {
    return `We were talking about ${topic}. We can pick up wherever feels useful.`;
  }
  return "We can continue wherever you left off.";
}

export function isSoftwareReentry(text: string): boolean {
  return /\b(?:welcome back|continue your journey|let'?s continue your)\b/i.test(
    text,
  );
}
