/** Explicit topic-change signals. */

const EXPLICIT_CHANGE =
  /\b(?:want to talk about something else|talk about something else|let(?:'s| us) switch topics|switch topics|forget that for now|actually,? i need to think through|i also want to talk about|change (?:the )?subject|different topic)\b/i;

export function detectsExplicitTopicChange(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (EXPLICIT_CHANGE.test(t)) return true;
  // "… hiring a bookkeeper instead."
  if (
    /\binstead\b/i.test(t) &&
    /\b(?:talk|hir(?:e|ing)|think|decid|client|project|bookkeeper)\b/i.test(t)
  ) {
    return true;
  }
  if (
    /\brather\b/i.test(t) &&
    /\b(?:talk|hir(?:e|ing)|think|decid)\b/i.test(t) &&
    t.length > 24
  ) {
    return true;
  }
  return false;
}

/** Soft ask when change is ambiguous. */
export function buildTopicChangeClarifyQuestion(primaryTopic: string): string {
  return `Are you changing the subject, or is this connected to ${primaryTopic}?`;
}
