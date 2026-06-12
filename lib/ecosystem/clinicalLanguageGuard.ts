// Shared guardrail for outputs — clinical/diagnostic phrasing only.
// Product and project names (e.g. "ADHD Business Ecosystem") are allowed.

const CLINICAL_PATTERNS = [
  /\bdiagnos/i,
  /\bdisorder\b/i,
  /\bdepress/i,
  /\banxiety disorder\b/i,
  /\bmedication\b/i,
  /\bmental illness\b/i,
  /\btherapy\b/i,
  /\bbipolar\b/i,
  /\b(adhd|add) disorder\b/i,
  /\badhd diagnos/i,
  /\byou are (lazy|broken|depressed|anxious)\b/i,
  /\bpersonality\b/i,
];

export function containsClinicalLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return CLINICAL_PATTERNS.some((re) => re.test(lower));
}
