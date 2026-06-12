import { getCriticalIssues, getRetestQueue } from "./store";
import type { FounderTrackingData } from "./types";
import { issueSeverityLabel, issueStatusLabel, experimentStatusLabel } from "./types";

export function formatTrackingForGuidance(data: FounderTrackingData): string {
  const critical = getCriticalIssues(data);
  const retest = getRetestQueue(data);
  const openIssues = data.issues.filter(
    (i) => i.status !== "fixed" && i.status !== "parked",
  );
  const openExperiments = data.experiments.filter(
    (e) => e.status !== "successful" && e.status !== "parked",
  );

  const lines = [
    "ISSUES & EXPERIMENTS TRACKING:",
    "",
    `Open issues: ${openIssues.length} | Critical/high: ${critical.length} | Retest queue: ${retest.length}`,
    `Open experiments: ${openExperiments.length}`,
    "",
  ];

  if (openIssues.length) {
    lines.push("ISSUES:");
    for (const issue of openIssues.slice(0, 15)) {
      lines.push(
        `- [${issue.id}] ${issue.title} | ${issueSeverityLabel(issue.severity)} | ${issueStatusLabel(issue.status)}`,
        `  ${issue.description.slice(0, 200)}`,
      );
    }
    lines.push("");
  }

  if (openExperiments.length) {
    lines.push("EXPERIMENTS:");
    for (const exp of openExperiments.slice(0, 10)) {
      lines.push(
        `- [${exp.id}] ${exp.title} | ${experimentStatusLabel(exp.status)}`,
        `  Hypothesis: ${exp.hypothesis.slice(0, 160)}`,
        `  Test: ${exp.testPlan.slice(0, 160)}`,
      );
    }
    lines.push("");
  }

  if (retest.length) {
    lines.push("RETEST QUEUE:");
    for (const issue of retest) {
      lines.push(`- [${issue.id}] ${issue.title}`);
    }
  }

  return lines.join("\n");
}
