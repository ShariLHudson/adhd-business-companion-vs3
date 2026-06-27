/**
 * Founder Copilot — diagnose issues and generate actionable fixes.
 */

import type { FounderWarning } from "./founderEarlyWarning";

export type DiagnosisConfidence = "low" | "medium" | "high";

export type FounderDiagnosis = {
  whatHappened: string;
  whyItHappened: string[];
  confidence: DiagnosisConfidence;
  confidencePercent: number;
  recommendedAction: string;
  consequenceOfInaction: string;
  warningId: string;
  interventionId?: string;
};

export type FounderPriority = "critical" | "high" | "medium" | "low";

export type FounderPriorityItem = {
  warning: FounderWarning;
  diagnosis: FounderDiagnosis;
  severityScore: number;
  priority: FounderPriority;
  copilot: FounderCopilotOutput;
};

export type FounderCopilotOutput = {
  problem: string;
  likelyCause: string;
  confidencePercent: number;
  recommendation: string;
  expectedImpact: string;
  filesToReview: string[];
  relatedSystems: string[];
};

export type FounderFixPrompt = {
  title: string;
  markdown: string;
};

const INTERVENTION_FILES: Record<string, string[]> = {
  decision_compass: [
    "components/companion/DecisionCompassWorkspace.tsx",
    "lib/companionIntelligenceRouter.ts",
    "lib/companionMistakeRecovery.ts",
  ],
  clear_my_mind: [
    "components/companion/ClearMyMindSession.tsx",
    "components/companion/BrainDumpPanel.tsx",
    "lib/clearMyMindRouting.ts",
  ],
  plan_my_day: [
    "components/companion/PlanMyDayPanel.tsx",
    "lib/adaptMyDayChatRouting.ts",
  ],
  create_workspace: [
    "app/companion/CompanionPageClient.tsx",
    "lib/workspaceMode.ts",
  ],
  conversation_coaching: [
    "lib/companionPrompt.ts",
    "lib/companionIntelligenceRouter.ts",
  ],
};

const INTERVENTION_SYSTEMS: Record<string, string[]> = {
  decision_compass: ["Decision Compass", "Intervention Learning", "Trust Engine"],
  clear_my_mind: ["Clear My Mind", "Mistake Recovery", "Trust Engine"],
  plan_my_day: ["Plan My Day", "Adaptive User Intelligence"],
  create_workspace: ["Create workspace", "Capability Registry", "Routing"],
  conversation_coaching: ["Companion prompt", "Intuitive Awareness", "Trust Engine"],
};

export function computeSeverityScore(warning: FounderWarning): number {
  const raw =
    warning.trustImpact * 0.28 +
    warning.confidenceImpact * 0.22 +
    warning.retentionImpact * 0.25 +
    warning.businessImpact * 0.15 +
    Math.min(20, warning.usersAffected * 2);
  const categoryBoost =
    warning.category === "critical"
      ? 15
      : warning.category === "high"
        ? 8
        : warning.category === "emerging"
          ? 5
          : 0;
  return Math.min(100, Math.round(raw + categoryBoost));
}

export function priorityFromSeverity(score: number): FounderPriority {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function diagnoseWarning(warning: FounderWarning): FounderDiagnosis {
  const causes: string[] = [];
  let confidencePercent = 55;
  let recommendedAction = "Review companion behavior signals and user journey for this pattern.";
  let consequence =
    "Users may lose trust, abandon workflows, and stop returning — issues become complaints.";

  if (warning.metric === "offer_dismissed" || warning.title.includes("dismissal")) {
    causes.push("Offers may be mistimed or mismatched to actual user need");
    causes.push("Intervention ranking may overweight a failing capability");
    causes.push("Trust may be fragile — too many suggestions");
    confidencePercent = warning.deltaPercent != null ? 78 : 65;
    recommendedAction =
      "Reduce push frequency for failing interventions; prefer conversation-first when dismissals spike.";
    consequence = "Dismissal rates compound — users stop reading companion offers entirely.";
  } else if (warning.metric === "workspace_abandoned") {
    causes.push("Workspace friction increased (steps, questions, cognitive load)");
    causes.push("Wrong intervention opened for stated need");
    causes.push("Onboarding or prefill may not match user context");
    confidencePercent = 72;
    recommendedAction =
      "Audit abandon paths in CompanionPageClient; add workspace_used milestones; reduce steps to first value.";
    consequence = "Abandoned workspaces signal broken promises — retention drops sharply.";
  } else if (warning.metric === "misunderstandings" || warning.metric === "explicit_correction") {
    causes.push("Routing assumed wrong problem (symptom vs root need)");
    causes.push("Companion acted too certain without validation");
    causes.push("Recent prompt or routing changes may have shifted behavior");
    confidencePercent = 80;
    recommendedAction =
      "Tune mistake recovery hints; lower adaptive weight for misfiring capabilities; add humility prompts.";
    consequence = "Users correct repeatedly — trust erodes faster than success builds it.";
  } else if (warning.interventionId && warning.metric === "intervention_failure") {
    causes.push(`Users reject ${warning.interventionId} — poor fit or too much friction`);
    causes.push("Repeated recommendations without completion train ignore behavior");
    confidencePercent = 85;
    recommendedAction = `Suppress ${warning.interventionId} in rankInterventionsForContext until completion rate improves.`;
    consequence = "Pushing a failing tool damages overall companion credibility.";
  } else if (warning.metric === "completion_rate") {
    causes.push("Added friction in workspace flow");
    causes.push("Increased question count or unclear next step");
    confidencePercent = 70;
    recommendedAction = "Profile completion funnel; remove nonessential steps; verify first-win moment.";
  } else if (warning.category === "critical") {
    causes.push("System-level failure or churn event detected");
    confidencePercent = 90;
    recommendedAction = "Investigate immediately — check auth, billing, and error logs.";
    consequence = "Critical issues unchecked directly impact revenue and reputation.";
  }

  const confidence: DiagnosisConfidence =
    confidencePercent >= 80 ? "high" : confidencePercent >= 60 ? "medium" : "low";

  return {
    whatHappened: warning.summary,
    whyItHappened: causes.length ? causes : ["Insufficient data — monitor another 7 days"],
    confidence,
    confidencePercent,
    recommendedAction,
    consequenceOfInaction: consequence,
    warningId: warning.id,
    interventionId: warning.interventionId,
  };
}

export function buildFounderCopilotOutput(
  warning: FounderWarning,
  diagnosis: FounderDiagnosis,
): FounderCopilotOutput {
  const interventionId = warning.interventionId ?? "conversation_coaching";
  const files = INTERVENTION_FILES[interventionId] ?? [
    "app/companion/CompanionPageClient.tsx",
    "lib/companionIntelligenceRouter.ts",
    "lib/founderIntelligence.ts",
  ];
  const systems = INTERVENTION_SYSTEMS[interventionId] ?? [
    "Companion routing",
    "Intervention Learning",
    "Trust Engine",
    "Mistake Recovery",
  ];

  let expectedImpact = "Stabilize trust and reduce negative signals within 7–14 days.";
  if (warning.deltaPercent != null && warning.deltaPercent > 0) {
    expectedImpact = `Reverse upward trend (${warning.deltaPercent}% delta) — target 10–20% improvement in 2 weeks.`;
  }
  if (diagnosis.confidencePercent >= 80) {
    expectedImpact = "High-confidence fix — expect measurable improvement in 1–2 sprints.";
  }

  return {
    problem: warning.title,
    likelyCause: diagnosis.whyItHappened[0] ?? "Pattern detected in behavior signals",
    confidencePercent: diagnosis.confidencePercent,
    recommendation: diagnosis.recommendedAction,
    expectedImpact,
    filesToReview: files,
    relatedSystems: systems,
  };
}

export function prioritizeFounderIssues(warnings: FounderWarning[]): FounderPriorityItem[] {
  return warnings
    .map((warning) => {
      const diagnosis = diagnoseWarning(warning);
      const severityScore = computeSeverityScore(warning);
      const priority = priorityFromSeverity(severityScore);
      const copilot = buildFounderCopilotOutput(warning, diagnosis);
      return { warning, diagnosis, severityScore, priority, copilot };
    })
    .sort((a, b) => b.severityScore - a.severityScore);
}

export function generateFounderFixPrompt(item: FounderPriorityItem): FounderFixPrompt {
  const { warning, diagnosis, copilot } = item;
  const title = `Fix: ${warning.title}`;

  const markdown = [
    `# ${title}`,
    "",
    "## Problem",
    copilot.problem,
    "",
    "## What Happened",
    diagnosis.whatHappened,
    "",
    "## Likely Cause",
    ...diagnosis.whyItHappened.map((c) => `- ${c}`),
    "",
    `**Diagnosis confidence:** ${diagnosis.confidence} (${diagnosis.confidencePercent}%)`,
    "",
    "## Recommended Action",
    diagnosis.recommendedAction,
    "",
    "## Consequence If Ignored",
    diagnosis.consequenceOfInaction,
    "",
    "## Expected Impact",
    copilot.expectedImpact,
    "",
    "## Files To Review",
    ...copilot.filesToReview.map((f) => `- \`${f}\``),
    "",
    "## Related Systems",
    ...copilot.relatedSystems.map((s) => `- ${s}`),
    "",
    "## Suggested Implementation",
    `1. Reproduce the pattern (${warning.metric ?? "see dashboard"}).`,
    "2. Apply the recommended action with minimal scope.",
    "3. Wire behavior capture if not already emitting events.",
    "4. Verify adaptive weights / suppression update correctly.",
    "",
    "## Tests",
    "- `lib/founderIntelligence.test.ts`",
    "- `lib/founderCopilot.test.ts`",
    "- `lib/companionMistakeRecovery.test.ts`",
    "- `lib/closedLoopLearning.test.ts`",
    "",
    "## Success Criteria",
    "- Warning metric trends down within 14 days",
    "- Trust repair success rate stable or improving",
    "- No increase in explicit user corrections",
    "- Completion rate for affected capability improves",
    "",
  ].join("\n");

  return { title, markdown };
}

export function generateFounderFixPromptFromWarning(
  warning: FounderWarning,
): FounderFixPrompt {
  const [item] = prioritizeFounderIssues([warning]);
  return generateFounderFixPrompt(item!);
}
