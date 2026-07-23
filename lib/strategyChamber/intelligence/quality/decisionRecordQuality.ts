import type { StrategyDecisionRecordView } from "../../types";

export function decisionRecordQualityIssues(
  record: StrategyDecisionRecordView,
): string[] {
  const issues: string[] = [];
  const sections: Array<[string, string | string[]]> = [
    ["whatYouWereDeciding", record.whatYouWereDeciding],
    ["whatIsHappeningNow", record.whatIsHappeningNow],
    ["directionYouChose", record.directionYouChose],
    ["whyThisDirectionFits", record.whyThisDirectionFits],
  ];
  for (const [key, value] of sections) {
    const text = Array.isArray(value) ? value.join(" ") : value;
    if (!text?.trim()) {
      // empty is OK — UI must hide, not pad
      continue;
    }
    if (/^(tbd|n\/a|none|TODO)$/i.test(text.trim())) {
      issues.push(`placeholder_${key}`);
    }
  }
  if (
    record.whatIsHappeningNow.trim() &&
    record.whatYouWereDeciding.trim() &&
    record.whatIsHappeningNow.trim() === record.whatYouWereDeciding.trim()
  ) {
    issues.push("situation_duplicates_question");
  }
  return issues;
}
