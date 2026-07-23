export function isSinglePrimaryQuestion(question: string): boolean {
  const marks = (question.match(/\?/g) || []).length;
  return marks <= 1;
}

export function conversationQualityIssues(question: string): string[] {
  const issues: string[] = [];
  if (!isSinglePrimaryQuestion(question)) {
    issues.push("multiple_questions");
  }
  if (/\b(please (fill|complete|provide)|required field)\b/i.test(question)) {
    issues.push("form_language");
  }
  return issues;
}
