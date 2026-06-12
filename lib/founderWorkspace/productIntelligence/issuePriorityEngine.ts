import type { AggregatedSignal, PrioritizedIssue, PriorityLevel } from "./types";

const SEVERITY_PATTERNS: { score: number; re: RegExp }[] = [
  { score: 30, re: /\b(critical|blocker|crash|broken|data loss|cannot save)\b/i },
  { score: 24, re: /\b(urgent|every user|all users|constantly|always)\b/i },
  { score: 18, re: /\b(confus|lost|where did|doesn't work|not working)\b/i },
  { score: 12, re: /\b(hard to|struggl|unclear|frustrat)\b/i },
  { score: 6, re: /\b(sometimes|occasionally|minor)\b/i },
];

const HIGH_EFFORT_RE =
  /\b(redesign|rewrite|rebuild|new feature|integration|mobile app|architecture)\b/i;
const LOW_EFFORT_RE =
  /\b(rename|label|wording|helper text|tooltip|hint|copy|button text)\b/i;

function severityScore(text: string): number {
  for (const { score, re } of SEVERITY_PATTERNS) {
    if (re.test(text)) return score;
  }
  return 10;
}

function frequencyScore(count: number): number {
  if (count >= 8) return 40;
  if (count >= 5) return 32;
  if (count >= 3) return 24;
  if (count >= 2) return 16;
  return 8;
}

function impactScore(text: string, count: number): number {
  let score = Math.min(12, count * 3);
  if (/\b(document|create|save|project|focus|time block)\b/i.test(text)) {
    score += 6;
  }
  if (/\bevery\b/i.test(text)) score += 4;
  return Math.min(20, score);
}

function effortScore(text: string): number {
  if (LOW_EFFORT_RE.test(text)) return 10;
  if (HIGH_EFFORT_RE.test(text)) return 2;
  return 6;
}

function toPriority(total: number): PriorityLevel {
  if (total >= 65) return "high";
  if (total >= 40) return "medium";
  return "low";
}

export function prioritizeIssue(signal: AggregatedSignal): PrioritizedIssue {
  const frequency = frequencyScore(signal.count);
  const severity = severityScore(signal.text);
  const impact = impactScore(signal.text, signal.count);
  const effort = effortScore(signal.text);
  const priorityScore = frequency + severity + impact + effort;

  return {
    ...signal,
    frequencyScore: frequency,
    severityScore: severity,
    impactScore: impact,
    effortScore: effort,
    priorityScore,
    priority: toPriority(priorityScore),
  };
}

export function prioritizeIssues(
  signals: AggregatedSignal[],
): PrioritizedIssue[] {
  return [...signals]
    .map(prioritizeIssue)
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
