/**
 * Guided Create Strategy — progressive stages (128–132).
 * Never start with a blank form.
 */

export type GuidedCreateStageId =
  | "problem"
  | "success"
  | "constraints"
  | "knowledge"
  | "options"
  | "chamber"
  | "board"
  | "visual"
  | "build"
  | "connect"
  | "review";

export type GuidedCreateAnswers = {
  happening: string;
  whoAffected: string;
  whyNow: string;
  recurring: "recurring" | "one-time" | "";
  betterLooksLike: string;
  outcome: string;
  protect: string;
  time: string;
  energy: string;
  adhdFriction: string;
  otherConstraints: string;
  approachChoice: string;
  title: string;
  steps: string;
  boardChoice: "full" | "skip" | "";
  visualChoice: "yes" | "skip" | "";
};

export const EMPTY_GUIDED_CREATE: GuidedCreateAnswers = {
  happening: "",
  whoAffected: "",
  whyNow: "",
  recurring: "",
  betterLooksLike: "",
  outcome: "",
  protect: "",
  time: "",
  energy: "",
  adhdFriction: "",
  otherConstraints: "",
  approachChoice: "",
  title: "",
  steps: "",
  boardChoice: "",
  visualChoice: "",
};

export const GUIDED_CREATE_STAGES: {
  id: GuidedCreateStageId;
  title: string;
  prompt: string;
}[] = [
  {
    id: "problem",
    title: "Define the problem",
    prompt: "What is happening, who is affected, and why it matters now.",
  },
  {
    id: "success",
    title: "Define success",
    prompt: "What better would look like, and what must stay protected.",
  },
  {
    id: "constraints",
    title: "Understand constraints",
    prompt: "Time, energy, ADHD friction, and anything else that shapes the plan.",
  },
  {
    id: "knowledge",
    title: "Review what you already know",
    prompt: "Past attempts and patterns that should inform this strategy.",
  },
  {
    id: "options",
    title: "Choose an approach",
    prompt: "Pick one of a few viable directions — not a long menu.",
  },
  {
    id: "chamber",
    title: "Specialist guidance",
    prompt: "Chamber expertise that fits this problem — shown as guidance, not a second chat.",
  },
  {
    id: "board",
    title: "Optional Board review",
    prompt: "Only if risk, investment, or long-term trade-offs matter.",
  },
  {
    id: "visual",
    title: "Optional visual thinking",
    prompt: "Only if a map or sequence would make the plan clearer.",
  },
  {
    id: "build",
    title: "Build the strategy",
    prompt: "Name it and list the steps you will actually use.",
  },
  {
    id: "connect",
    title: "Connect to execution",
    prompt: "Choose follow-through supports — nothing is created without your say-so.",
  },
  {
    id: "review",
    title: "Review and save",
    prompt: "See the whole strategy, then save when it feels right.",
  },
];

export function guidedCreateApproachOptions(answers: GuidedCreateAnswers): string[] {
  const base = answers.happening.trim() || "this situation";
  return [
    `Smallest first step — shrink “${base.slice(0, 40)}” until it fits today’s energy.`,
    `Protected focus block — one clear window, then stop without finishing everything.`,
    `Support rhythm — a light weekly review so this does not rely on memory alone.`,
  ];
}

export function chamberGuidanceForCreate(
  answers: GuidedCreateAnswers,
): { roleLabel: string; guidance: string }[] {
  const blob = [
    answers.happening,
    answers.outcome,
    answers.adhdFriction,
  ]
    .join(" ")
    .toLowerCase();
  if (/\b(price|pricing|rate|sales|offer)\b/.test(blob)) {
    return [
      {
        roleLabel: "Finance & Sales",
        guidance:
          "Keep the next ask specific and tied to value you already deliver. Avoid rebuilding the whole offer before one clear conversation.",
      },
    ];
  }
  if (/\b(client|customer|email|follow.?up|boundary)\b/.test(blob)) {
    return [
      {
        roleLabel: "Client Relationships",
        guidance:
          "One honest next message beats a perfect system. Name the boundary once, then keep the follow-up simple.",
      },
    ];
  }
  return [
    {
      roleLabel: "ADHD Support",
      guidance:
        "Design for a tired Tuesday, not an ideal Monday. The first step should fit low energy.",
    },
  ];
}

export function shouldOfferBoardForCreate(answers: GuidedCreateAnswers): boolean {
  const blob = [answers.happening, answers.outcome, answers.otherConstraints]
    .join(" ")
    .toLowerCase();
  return /\b(price|hire|invest|launch|risk|contract|partner|long.?term)\b/.test(
    blob,
  );
}

export function buildGuidedStrategyDraft(answers: GuidedCreateAnswers): {
  title: string;
  description: string;
  whenToUse: string;
  steps: string[];
  whyItWorks: string;
} {
  const title =
    answers.title.trim() ||
    (answers.outcome.trim()
      ? `Strategy: ${answers.outcome.trim().slice(0, 60)}`
      : "My custom strategy");
  const steps = answers.steps
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!steps.length && answers.approachChoice) {
    steps.push(answers.approachChoice);
  }
  if (!steps.length) {
    steps.push("Name the smallest next action and do only that.");
  }
  return {
    title,
    description:
      answers.happening.trim() ||
      "A strategy shaped around your real situation.",
    whenToUse:
      answers.whyNow.trim() ||
      "When this pattern shows up again and you need a clear next move.",
    steps,
    whyItWorks: [
      answers.betterLooksLike && `Success looks like: ${answers.betterLooksLike}`,
      answers.approachChoice && `Chosen approach: ${answers.approachChoice}`,
      answers.adhdFriction && `ADHD friction considered: ${answers.adhdFriction}`,
      answers.protect && `Protect: ${answers.protect}`,
    ]
      .filter(Boolean)
      .join("\n\n") || "Built from what matters in your situation right now.",
  };
}

export function canAdvanceGuidedCreate(
  stage: GuidedCreateStageId,
  answers: GuidedCreateAnswers,
): boolean {
  switch (stage) {
    case "problem":
      return answers.happening.trim().length > 0;
    case "success":
      return answers.outcome.trim().length > 0;
    case "constraints":
      return true;
    case "knowledge":
      return true;
    case "options":
      return answers.approachChoice.trim().length > 0;
    case "chamber":
      return true;
    case "board":
      return answers.boardChoice !== "" || !shouldOfferBoardForCreate(answers);
    case "visual":
      return answers.visualChoice !== "";
    case "build":
      return answers.title.trim().length > 0 || answers.steps.trim().length > 0;
    case "connect":
      return true;
    case "review":
      return true;
    default:
      return false;
  }
}

export function nextGuidedCreateStage(
  stage: GuidedCreateStageId,
  answers: GuidedCreateAnswers,
): GuidedCreateStageId | null {
  const ids = GUIDED_CREATE_STAGES.map((s) => s.id);
  let i = ids.indexOf(stage);
  if (i < 0) return null;
  while (i < ids.length - 1) {
    i += 1;
    const next = ids[i]!;
    if (next === "board" && !shouldOfferBoardForCreate(answers)) {
      continue;
    }
    return next;
  }
  return null;
}
