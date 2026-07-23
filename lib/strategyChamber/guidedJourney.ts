/**
 * Strategy Chamber live guided journey — one stage question at a time.
 * Advances work-item fields without becoming a rigid five-step workshop.
 */

import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import type {
  StrategyThinkingStage,
  StrategyWorkItem,
  StrategyWorkStatus,
} from "./types";
import { openingQuestionForEntry } from "./entryOpening";

export type GuidedJourneyPrompt = {
  stage: StrategyThinkingStage;
  question: string;
  whyItMatters?: string;
  exampleHint?: string;
  fieldHint:
    | "currentReality"
    | "desiredDirection"
    | "optionsConsidered"
    | "chosenDirection"
    | "handoffReady";
};

const STAGE_ORDER: StrategyThinkingStage[] = [
  "understand_current_state",
  "choose_direction",
  "explore_options",
  "evaluate_decision",
  "handoff_direction",
];

const STAGE_QUESTION: Record<
  StrategyThinkingStage,
  { question: string; whyItMatters: string; exampleHint: string; fieldHint: GuidedJourneyPrompt["fieldHint"] }
> = {
  understand_current_state: {
    question: "What is actually happening right now — in plain words?",
    whyItMatters:
      "Clearer reality makes the next choice smaller and more honest.",
    exampleHint:
      "Example: “I’m stretched across three offers and none feel finished.”",
    fieldHint: "currentReality",
  },
  choose_direction: {
    question: "If this went well, what would feel meaningfully better?",
    whyItMatters:
      "Direction is a choice about what deserves priority — not a perfect vision statement.",
    exampleHint:
      "Example: “I’d know which offer to grow and what to pause for now.”",
    fieldHint: "desiredDirection",
  },
  explore_options: {
    question:
      "What two or three real paths could you take — including doing less?",
    whyItMatters:
      "Naming options reduces the feeling that there is only one risky leap.",
    exampleHint:
      "Example: “Focus on one offer · keep both lightly · pause and test a small experiment.”",
    fieldHint: "optionsConsidered",
  },
  evaluate_decision: {
    question:
      "Which path are you leaning toward, and what would make you change your mind?",
    whyItMatters:
      "A decision with guardrails is easier to live with than a forced permanent answer.",
    exampleHint:
      "Example: “Lean toward focusing on one offer unless cash gets tight in 60 days.”",
    fieldHint: "chosenDirection",
  },
  handoff_direction: {
    question:
      "What should stay true after you leave here — and where should that direction go next?",
    whyItMatters:
      "Strategy decides the direction. Another place can help carry it without rewriting it.",
    exampleHint:
      "Example: “Keep the focus narrow; start a project for the chosen offer.”",
    fieldHint: "handoffReady",
  },
};

export function stageOrderIndex(stage: StrategyThinkingStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function nextThinkingStage(
  stage: StrategyThinkingStage,
): StrategyThinkingStage | null {
  const idx = stageOrderIndex(stage);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1]!;
}

export function statusForStage(stage: StrategyThinkingStage): StrategyWorkStatus {
  switch (stage) {
    case "understand_current_state":
      return "understanding";
    case "choose_direction":
      return "understanding";
    case "explore_options":
      return "exploring";
    case "evaluate_decision":
      return "evaluating";
    case "handoff_direction":
      return "direction_chosen";
    default:
      return "understanding";
  }
}

/**
 * Opening uses entry-specific question once; later stages use stage prompts.
 */
export function guidedPromptForWorkItem(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): GuidedJourneyPrompt {
  const hasOpeningAnswer = Boolean(
    item.currentReality?.trim() || item.decisionStatement?.trim(),
  );
  if (!hasOpeningAnswer) {
    return {
      stage: item.currentStage,
      question: openingQuestionForEntry(item.entryReason),
      whyItMatters: presentation?.shortParagraphs
        ? undefined
        : "You do not need the perfect strategy label — just the real situation.",
      exampleHint: presentation?.preferExamples
        ? "Example: “I need to decide whether to grow this offer or simplify.”"
        : undefined,
      fieldHint: "currentReality",
    };
  }

  const stagePrompt = STAGE_QUESTION[item.currentStage];
  return {
    stage: item.currentStage,
    question: stagePrompt.question,
    whyItMatters: presentation?.summaryFirst
      ? undefined
      : stagePrompt.whyItMatters,
    exampleHint: presentation?.preferExamples
      ? stagePrompt.exampleHint
      : undefined,
    fieldHint: stagePrompt.fieldHint,
  };
}

export function applyGuidedJourneyAnswer(
  item: StrategyWorkItem,
  answer: string,
): Partial<StrategyWorkItem> {
  const trimmed = answer.trim();
  if (!trimmed) return {};

  const hasOpeningAnswer = Boolean(
    item.currentReality?.trim() || item.decisionStatement?.trim(),
  );

  if (!hasOpeningAnswer) {
    const title =
      trimmed.length > 72 ? `${trimmed.slice(0, 69).trim()}…` : trimmed;
    // Opening anchors the work, then advance so the next prompt is not a repeat.
    const nextStage = nextThinkingStage(item.currentStage) ?? item.currentStage;
    return {
      decisionStatement: trimmed,
      currentReality: trimmed,
      plainLanguageSummary: trimmed.slice(0, 220),
      title,
      status: statusForStage(nextStage),
      currentStage: nextStage,
    };
  }

  const stage = item.currentStage;
  const nextStage = nextThinkingStage(stage);
  const base: Partial<StrategyWorkItem> = {
    plainLanguageSummary: trimmed.slice(0, 220),
  };

  switch (stage) {
    case "understand_current_state":
      return {
        ...base,
        currentReality: trimmed,
        status: nextStage ? statusForStage(nextStage) : "understanding",
        currentStage: nextStage ?? stage,
      };
    case "choose_direction":
      return {
        ...base,
        desiredDirection: trimmed,
        status: nextStage ? statusForStage(nextStage) : "understanding",
        currentStage: nextStage ?? stage,
      };
    case "explore_options": {
      const titles = trimmed
        .split(/\n|;|·|\u2022|(?:\s+or\s+)/i)
        .map((s) => s.replace(/^\d+[\).\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 5);
      const options =
        titles.length > 0
          ? titles.map((title, i) => ({
              id: `opt_${i + 1}`,
              title,
            }))
          : [{ id: "opt_1", title: trimmed }];
      return {
        ...base,
        optionsConsidered: options,
        status: nextStage ? statusForStage(nextStage) : "exploring",
        currentStage: nextStage ?? stage,
      };
    }
    case "evaluate_decision":
      return {
        ...base,
        chosenDirection: trimmed,
        decisionRationale:
          item.decisionRationale?.trim() ||
          "Chosen during Strategy Chamber guided thinking.",
        status: "direction_chosen",
        currentStage: nextStage ?? "handoff_direction",
      };
    case "handoff_direction":
      return {
        ...base,
        guardrails: [trimmed],
        recommendedNextDestination: trimmed.slice(0, 120),
        status: "direction_chosen",
        currentStage: "handoff_direction",
      };
    default:
      return base;
  }
}

export function buildStrategyResumeSummary(
  item: StrategyWorkItem,
  presentation?: AdaptivePresentationResolved,
): string {
  const depth = presentation?.resumeDepth ?? "standard";
  const central =
    item.decisionStatement?.trim() ||
    item.title ||
    "Your strategic question";
  const last =
    item.chosenDirection?.trim() ||
    item.desiredDirection?.trim() ||
    item.currentReality?.trim() ||
    "You had started thinking this through.";

  if (depth === "brief") {
    return `You were working on: ${central}`;
  }

  const lines = [
    `You were working on: ${central}`,
    `Last confirmed: ${last}`,
    `Current stage: ${humanStage(item.currentStage)}`,
  ];

  if (depth === "detailed") {
    if (item.assumptions?.length) {
      lines.push(`Assumptions noted: ${item.assumptions.slice(0, 2).join("; ")}`);
    }
    if (item.risks?.length) {
      lines.push(`Risks to watch: ${item.risks.slice(0, 2).join("; ")}`);
    }
    lines.push("You can resume, review what you have, or start something new.");
  } else {
    lines.push("Resume when you are ready — nothing here forces a finish line.");
  }

  return lines.join("\n");
}

function humanStage(stage: StrategyThinkingStage): string {
  switch (stage) {
    case "understand_current_state":
      return "seeing what is happening";
    case "choose_direction":
      return "choosing direction";
    case "explore_options":
      return "exploring options";
    case "evaluate_decision":
      return "thinking through the decision";
    case "handoff_direction":
      return "ready to put the direction into motion";
    default:
      return "in progress";
  }
}

export function guidedJourneyIsComplete(item: StrategyWorkItem): boolean {
  return Boolean(
    item.chosenDirection?.trim() &&
      (item.currentStage === "handoff_direction" ||
        item.status === "direction_chosen" ||
        item.status === "handed_off" ||
        item.status === "completed"),
  );
}

/** Skip the current stage without forcing an answer — preserves prior fields. */
export function skipGuidedJourneyStage(
  item: StrategyWorkItem,
): Partial<StrategyWorkItem> {
  const hasOpeningAnswer = Boolean(
    item.currentReality?.trim() || item.decisionStatement?.trim(),
  );
  if (!hasOpeningAnswer) {
    // Cannot skip the opening without any anchor — stay put
    return {};
  }
  const next = nextThinkingStage(item.currentStage);
  if (!next) return {};
  return {
    currentStage: next,
    status: statusForStage(next),
  };
}
