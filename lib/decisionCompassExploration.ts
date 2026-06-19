/**
 * Decision Compass V3 — confidence, exploration, alternatives, action plans.
 * Companion-first: supports thinking, not deciding for the user.
 */

import { buildDecisionMapView, type DecisionMapViewModel } from "./decisionMapView";
import type { PersistedDecisionCompassSession } from "./decisionCompassSessionStore";
import { buildDecisionRecommendationReport } from "./decisionRecommendationReport";
import {
  createSavedWork,
  linkSavedWorkToProject,
} from "./savedWorkStore";
import { addDecisionToProject } from "./decisionProjectBridge";

export type DecisionConfidenceLevel = "high" | "moderate" | "low";

export type ExploredQuestion = {
  id: string;
  question: string;
  answer?: string;
  exploredAt?: string;
};

export type AlternativePathGroup = {
  primary: string;
  alternatives: string[];
  experimental: string[];
};

export type DecisionActionPlan = {
  decision: string;
  recommendedChoice: string;
  steps: string[];
  createdAt: string;
};

export type DecisionExplorationState = {
  confidence: DecisionConfidenceLevel;
  whatCouldChange: string[];
  exploredQuestions: ExploredQuestion[];
  alternativePaths: AlternativePathGroup | null;
  actionPlan: DecisionActionPlan | null;
  updatedAt: string;
};

export const CONFIDENCE_META: Record<
  DecisionConfidenceLevel,
  { emoji: string; label: string; description: string }
> = {
  high: {
    emoji: "🟢",
    label: "High Confidence",
    description: "Most factors point in the same direction.",
  },
  moderate: {
    emoji: "🟡",
    label: "Moderate Confidence",
    description:
      "A recommendation exists, but important tradeoffs remain.",
  },
  low: {
    emoji: "🔴",
    label: "Low Confidence",
    description:
      "The options are still very close. Additional exploration is recommended.",
  },
};

function leadingSide(
  vm: DecisionMapViewModel,
): "A" | "B" | null {
  const rec = vm.recommendation;
  if (!rec) return null;
  const a = vm.optionA.label.toLowerCase();
  const b = vm.optionB.label.toLowerCase();
  const c = rec.choice.toLowerCase();
  if (c === a || c.includes(a.slice(0, 10))) return "A";
  if (c === b || c.includes(b.slice(0, 10))) return "B";
  return null;
}

export function computeDecisionConfidence(
  session: PersistedDecisionCompassSession,
  vm?: DecisionMapViewModel,
): DecisionConfidenceLevel {
  const view = vm ?? buildDecisionMapView(session);
  const side = leadingSide(view);
  if (!side || !view.scores.length) return "low";

  const wins = view.scores.filter((s) => s.winner === side).length;
  const total = view.scores.length;
  const winRatio = total ? wins / total : 0;
  const concernCount =
    view.optionA.concerns.length + view.optionB.concerns.length;

  if (winRatio >= 0.65 && concernCount <= 2) return "high";
  if (winRatio >= 0.45 && concernCount <= 4) return "moderate";
  return "low";
}

export function whatCouldChangeRecommendation(
  session: PersistedDecisionCompassSession,
): string[] {
  const choice = session.recommendation?.choice ?? "";
  const lower = choice.toLowerCase();
  const items: string[] = [];

  if (/\bhire|sales|rep|employee|staff\b/i.test(lower)) {
    items.push(
      "Budget changes significantly",
      "A commission-only test succeeds",
      "You document a repeatable sales process first",
      "Your workload decreases enough to sell yourself",
      "Your product line or offer changes",
    );
  } else if (/\blaunch|ship|release\b/i.test(lower)) {
    items.push(
      "User feedback shifts priorities",
      "A critical dependency is not ready",
      "Market timing changes",
      "You find a smaller pilot that de-risks launch",
    );
  } else {
    items.push(
      "New information changes the tradeoffs",
      "A concern you listed becomes more or less important",
      "An assumption you are making turns out wrong",
      "Your capacity or energy shifts in the next 30 days",
    );
  }

  const vm = buildDecisionMapView(session);
  for (const c of [...vm.optionA.concerns, ...vm.optionB.concerns].slice(0, 2)) {
    items.push(`If "${c}" becomes non-negotiable`);
  }

  return [...new Set(items)].slice(0, 6);
}

const EXPLORATION_QUESTION_POOL = [
  "What would success look like 12 months from now?",
  "What is the biggest risk if you do nothing?",
  "What assumption are you making that might be wrong?",
  "What would Future You recommend?",
  "What part of this recommendation feels least certain to you?",
  "What would need to be true for you to feel ready?",
  "What is the smallest experiment you could run this week?",
];

export function generateExplorationQuestions(
  session: PersistedDecisionCompassSession,
  existing: ExploredQuestion[] = [],
): ExploredQuestion[] {
  const report = buildDecisionRecommendationReport(session);
  const asked = new Set(existing.map((q) => q.question));
  const candidates: string[] = [];

  for (const q of report?.questionsWorthConsidering ?? []) {
    candidates.push(q.replace(/\*\*/g, ""));
  }
  for (const q of EXPLORATION_QUESTION_POOL) {
    candidates.push(q);
  }

  const confidence = computeDecisionConfidence(session);
  if (confidence === "low") {
    candidates.unshift(
      "What information would most reduce uncertainty right now?",
    );
  }

  const vm = buildDecisionMapView(session);
  if (vm.optionA.concerns[0]) {
    candidates.push(
      `How would you address: ${vm.optionA.concerns[0]}?`,
    );
  }
  if (vm.optionB.concerns[0]) {
    candidates.push(
      `How would you address: ${vm.optionB.concerns[0]}?`,
    );
  }

  const fresh = candidates
    .filter((q) => !asked.has(q))
    .slice(0, 5)
    .map((question, i) => ({
      id: `eq-${Date.now()}-${i}`,
      question,
    }));

  return fresh;
}

function pathVariantsForChoice(choice: string): AlternativePathGroup {
  const c = choice.trim();
  const lower = c.toLowerCase();

  if (/\bhire|salesperson|sales rep|employee\b/i.test(lower)) {
    return {
      primary: c,
      alternatives: [
        "Contractor or freelancer on a trial",
        "Commission-only rep for a pilot period",
        "Part-time support before a full hire",
        "Outsourced sales team",
        "Delayed hire while you document the process",
      ],
      experimental: [
        "Run a 2-week sales sprint yourself with a clear script",
        "Partner with someone who already has a pipeline",
      ],
    };
  }

  if (/\bmyself|diy|keep doing|alone\b/i.test(lower)) {
    return {
      primary: c,
      alternatives: [
        "Stay solo but batch sales into focused blocks",
        "Hire fractional help for admin only",
        "Automate one step before committing to hire",
      ],
      experimental: [
        "Track time on sales for two weeks — then revisit",
      ],
    };
  }

  return {
    primary: c,
    alternatives: [
      `Pilot ${c} at a smaller scale first`,
      `Delay ${c} and gather one more data point`,
      `Blend both original options with a time-boxed test`,
    ],
    experimental: [
      "Set a review date in two weeks with a clear success metric",
    ],
  };
}

export function generateAlternativePaths(
  session: PersistedDecisionCompassSession,
): AlternativePathGroup | null {
  const choice = session.recommendation?.choice;
  if (!choice) return null;
  return pathVariantsForChoice(choice);
}

export function buildDecisionActionPlan(
  session: PersistedDecisionCompassSession,
): DecisionActionPlan | null {
  const choice = session.recommendation?.choice;
  if (!choice) return null;

  const lower = choice.toLowerCase();
  let steps: string[];

  if (/\bhire|sales|rep\b/i.test(lower)) {
    steps = [
      "Define the role and what success looks like in 90 days",
      "Document your current sales process",
      "Draft a job description or contractor brief",
      "Identify 3–5 candidates or partners to talk to",
      "Run a small pilot before committing fully",
    ];
  } else if (/\blaunch|ship\b/i.test(lower)) {
    steps = [
      "List what must be true for launch",
      "Identify the smallest shippable version",
      "Set a launch date or review checkpoint",
      "Prepare one channel for first users",
      "Schedule a post-launch retrospective",
    ];
  } else {
    steps = [
      "Write down the decision in one sentence",
      "Name the first concrete step",
      "Set a time box for the next check-in",
      "Identify one person to sanity-check with",
      "Define what would make you revisit this choice",
    ];
  }

  return {
    decision: session.decision || session.recommendation?.headline || "Decision",
    recommendedChoice: choice,
    steps,
    createdAt: new Date().toISOString(),
  };
}

export function buildDecisionExplorationState(
  session: PersistedDecisionCompassSession,
): DecisionExplorationState | null {
  if (!session.recommendation) return null;

  const confidence = computeDecisionConfidence(session);
  const existing = session.exploration;

  return {
    confidence,
    whatCouldChange: whatCouldChangeRecommendation(session),
    exploredQuestions: existing?.exploredQuestions ?? [],
    alternativePaths:
      existing?.alternativePaths ?? generateAlternativePaths(session),
    actionPlan: existing?.actionPlan ?? null,
    updatedAt: new Date().toISOString(),
  };
}

export function mergeExplorationIntoSession(
  session: PersistedDecisionCompassSession,
  patch: Partial<DecisionExplorationState>,
): PersistedDecisionCompassSession {
  const base = buildDecisionExplorationState(session);
  return {
    ...session,
    exploration: {
      ...(base ?? {
        confidence: "moderate",
        whatCouldChange: [],
        exploredQuestions: [],
        alternativePaths: null,
        actionPlan: null,
        updatedAt: new Date().toISOString(),
      }),
      ...patch,
      updatedAt: new Date().toISOString(),
    },
    lastTouchedAt: new Date().toISOString(),
  };
}

export function companionLeanLine(session: PersistedDecisionCompassSession): string {
  const choice = session.recommendation?.choice;
  if (!choice) return "";
  const conf = computeDecisionConfidence(session);
  const meta = CONFIDENCE_META[conf];
  return (
    `The Compass is currently leaning toward **${choice}** (${meta.emoji} ${meta.label}). ` +
    `What part of that feels least certain to you?`
  );
}

export function explorationSummaryForExport(
  session: PersistedDecisionCompassSession,
): string {
  const exp = session.exploration ?? buildDecisionExplorationState(session);
  if (!exp) return "";
  const lines: string[] = [];
  lines.push(`Confidence: ${CONFIDENCE_META[exp.confidence].label}`);
  if (exp.whatCouldChange.length) {
    lines.push("\nWhat Could Change This:\n" + exp.whatCouldChange.map((w) => `• ${w}`).join("\n"));
  }
  if (exp.exploredQuestions.length) {
    lines.push(
      "\nExplored Questions:\n" +
        exp.exploredQuestions
          .map((q) => `Q: ${q.question}${q.answer ? `\nA: ${q.answer}` : ""}`)
          .join("\n\n"),
    );
  }
  if (exp.alternativePaths) {
    lines.push(
      "\nAlternative Paths:\n" +
        exp.alternativePaths.alternatives.map((a) => `• ${a}`).join("\n"),
    );
  }
  if (exp.actionPlan) {
    lines.push(
      "\nAction Plan:\n" +
        exp.actionPlan.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    );
  }
  return lines.join("\n");
}

export function buildDecisionSaveBody(
  session: PersistedDecisionCompassSession,
): string {
  const report = buildDecisionRecommendationReport(session);
  const exp = session.exploration ?? buildDecisionExplorationState(session);
  const lines: string[] = [];

  lines.push(`# Decision Compass: ${session.decision || "Decision"}`);
  lines.push(`Options: ${session.optionA} vs ${session.optionB}`);
  lines.push("");

  if (session.recommendation) {
    lines.push(`## Compass Lean (not a verdict)`);
    lines.push(`**${session.recommendation.choice}**`);
    lines.push(session.recommendation.summary.replace(/\*\*/g, ""));
    lines.push("");
  }

  if (exp) {
    lines.push(`## Confidence: ${CONFIDENCE_META[exp.confidence].label}`);
    lines.push(CONFIDENCE_META[exp.confidence].description);
    lines.push("");
    if (exp.whatCouldChange.length) {
      lines.push("## What Could Change This");
      for (const w of exp.whatCouldChange) lines.push(`- ${w}`);
      lines.push("");
    }
  }

  if (report) {
    if (report.potentialAdvantages.length) {
      lines.push("## Potential Advantages");
      for (const a of report.potentialAdvantages) lines.push(`- ${a.replace(/\*\*/g, "")}`);
      lines.push("");
    }
    if (report.potentialConcerns.length) {
      lines.push("## Potential Concerns");
      for (const c of report.potentialConcerns) lines.push(`- ${c.replace(/\*\*/g, "")}`);
      lines.push("");
    }
    if (report.questionsWorthConsidering.length) {
      lines.push("## Questions Worth Considering");
      for (const q of report.questionsWorthConsidering) lines.push(`- ${q.replace(/\*\*/g, "")}`);
      lines.push("");
    }
  }

  if (exp?.exploredQuestions.length) {
    lines.push("## Explored Questions");
    for (const q of exp.exploredQuestions) {
      lines.push(`**${q.question}**`);
      if (q.answer) lines.push(q.answer);
      lines.push("");
    }
  }

  if (exp?.alternativePaths) {
    lines.push("## Alternative Paths");
    lines.push(`Primary: ${exp.alternativePaths.primary}`);
    for (const a of exp.alternativePaths.alternatives) lines.push(`- ${a}`);
    for (const e of exp.alternativePaths.experimental) lines.push(`- (experiment) ${e}`);
    lines.push("");
  }

  if (exp?.actionPlan) {
    lines.push("## Action Plan");
    exp.actionPlan.steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  }

  return lines.join("\n").trim();
}

export function saveDecisionToSavedWork(
  session: PersistedDecisionCompassSession,
  projectId?: string | null,
  projectName?: string | null,
): { itemId: string; location: string } {
  const title =
    session.decision?.trim().slice(0, 80) ||
    session.recommendation?.choice?.slice(0, 80) ||
    "Decision Compass";
  const item = createSavedWork({
    title,
    artifactType: "Decision",
    body: buildDecisionSaveBody(session),
    sourceWorkspace: "decision-compass",
    tags: ["decision-compass"],
  });
  if (projectId && projectName) {
    linkSavedWorkToProject(item.id, projectId, projectName);
  }
  return { itemId: item.id, location: item.savedLocation };
}

export function saveDecisionActionPlanToProject(
  session: PersistedDecisionCompassSession,
  projectId: string,
  projectName = "Project",
): number {
  const result = addDecisionToProject(session, projectId, projectName);
  return result.taskCount;
}
