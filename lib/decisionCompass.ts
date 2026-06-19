/**
 * ADHD Decision Compass — adaptive decision framework.
 * Identifies decision type first, then follows the right question path.
 * Companion-first; optional mind map for working-memory support.
 */

export type DecisionType = "action" | "strategic" | "emotional";

export type DecisionCompassAnswers = Record<string, string>;

export type DecisionCompassStep =
  | { id: "decision"; kind: "text"; label: string; placeholder: string }
  | {
      id: "options";
      kind: "labeled-pair";
      labelA: string;
      labelB: string;
    }
  | { id: "type-pick"; kind: "type-pick" }
  | { id: string; kind: "text"; label: string; placeholder?: string; multiline?: boolean }
  | { id: string; kind: "pick-ab"; label: string }
  | { id: string; kind: "tradeoff"; label: string };

export type DecisionCompassState = {
  stepIndex: number;
  decisionType: DecisionType | null;
  answers: DecisionCompassAnswers;
  showMap: boolean;
  complete: boolean;
};

export const DECISION_TYPE_META: Record<
  DecisionType,
  { emoji: string; title: string; subtitle: string }
> = {
  action: {
    emoji: "⚡",
    title: "Action Decision",
    subtitle: "What should I do first?",
  },
  strategic: {
    emoji: "📈",
    title: "Strategic Decision",
    subtitle: "What will move my business forward?",
  },
  emotional: {
    emoji: "❤️",
    title: "Emotional Decision",
    subtitle: "What feels most aligned?",
  },
};

const ACTION_SIGNALS =
  /\b(?:first|start|do|task|email|video|clean|plan|marketing|sales|write|record|today|this week|hour)\b/i;
const STRATEGIC_SIGNALS =
  /\b(?:hire|launch|membership|course|feature|build|invest|strategy|business|revenue|offer|wait|scale|model)\b/i;
const EMOTIONAL_SIGNALS =
  /\b(?:client|leave|end|say no|opportunity|feel|afraid|guilt|aligned|values|relationship|boundary)\b/i;

/** Suggest a decision type from the user's decision text — user always confirms. */
export function suggestDecisionType(
  decision: string,
  optionA = "",
  optionB = "",
): DecisionType {
  const blob = `${decision} ${optionA} ${optionB}`.toLowerCase();
  let action = 0;
  let strategic = 0;
  let emotional = 0;
  if (ACTION_SIGNALS.test(blob)) action += 2;
  if (STRATEGIC_SIGNALS.test(blob)) strategic += 2;
  if (EMOTIONAL_SIGNALS.test(blob)) emotional += 2;
  if (/\b(?:or|vs\.?|versus)\b/i.test(blob) && blob.length < 120) action += 1;
  if (/\b(?:hire|launch|membership|course)\b/i.test(blob)) strategic += 3;
  if (/\b(?:leave|client|say no|feel)\b/i.test(blob)) emotional += 3;

  const max = Math.max(action, strategic, emotional);
  if (max === 0) return "action";
  if (strategic === max) return "strategic";
  if (emotional === max) return "emotional";
  return "action";
}

function actionSteps(): DecisionCompassStep[] {
  return [
    {
      id: "first-hour-a",
      kind: "text",
      label: "If you chose Option A — what would you do in the first hour?",
      placeholder: "One honest sentence",
      multiline: true,
    },
    {
      id: "first-hour-b",
      kind: "text",
      label: "If you chose Option B — what would you do in the first hour?",
      placeholder: "One honest sentence",
      multiline: true,
    },
    {
      id: "clearer",
      kind: "pick-ab",
      label: "Which first hour feels clearer or more honest?",
    },
    {
      id: "momentum",
      kind: "pick-ab",
      label: "Which option creates more momentum right now?",
    },
  ];
}

function strategicSteps(): DecisionCompassStep[] {
  return [
    { id: "why-a", kind: "text", label: "Why choose Option A?", multiline: true },
    { id: "why-b", kind: "text", label: "Why choose Option B?", multiline: true },
    {
      id: "concern-a",
      kind: "text",
      label: "Biggest concern about Option A?",
      multiline: true,
    },
    {
      id: "concern-b",
      kind: "text",
      label: "Biggest concern about Option B?",
      multiline: true,
    },
    {
      id: "inaction",
      kind: "text",
      label: "What happens if nothing changes?",
      multiline: true,
    },
    {
      id: "success-a",
      kind: "text",
      label: "If Option A succeeds — what does that look like?",
      multiline: true,
    },
    {
      id: "success-b",
      kind: "text",
      label: "If Option B succeeds — what does that look like?",
      multiline: true,
    },
    { id: "freedom", kind: "tradeoff", label: "Which creates more freedom?" },
    { id: "growth", kind: "tradeoff", label: "Which creates more growth?" },
    { id: "stress", kind: "tradeoff", label: "Which creates less stress?" },
    {
      id: "alignment",
      kind: "tradeoff",
      label: "Which has better long-term alignment?",
    },
  ];
}

function emotionalSteps(): DecisionCompassStep[] {
  return [
    {
      id: "fear-a",
      kind: "text",
      label: "What are you afraid will happen if you choose Option A?",
      multiline: true,
    },
    {
      id: "fear-b",
      kind: "text",
      label: "What are you afraid will happen if you choose Option B?",
      multiline: true,
    },
    {
      id: "hope-a",
      kind: "text",
      label: "What are you hoping will happen if you choose Option A?",
      multiline: true,
    },
    {
      id: "hope-b",
      kind: "text",
      label: "What are you hoping will happen if you choose Option B?",
      multiline: true,
    },
    {
      id: "values",
      kind: "pick-ab",
      label: "Which option aligns more with your values?",
    },
    {
      id: "relief",
      kind: "pick-ab",
      label: "Which option feels lighter?",
    },
    {
      id: "future-me",
      kind: "pick-ab",
      label: "Which would Future You thank you for?",
    },
  ];
}

const SETUP_STEPS: DecisionCompassStep[] = [
  {
    id: "decision",
    kind: "text",
    label: "What decision are you trying to make?",
    placeholder: "One line — plain language",
  },
  {
    id: "options",
    kind: "labeled-pair",
    labelA: "Option A",
    labelB: "Option B",
  },
  { id: "type-pick", kind: "type-pick" },
];

export function stepsForType(type: DecisionType): DecisionCompassStep[] {
  switch (type) {
    case "action":
      return actionSteps();
    case "strategic":
      return strategicSteps();
    case "emotional":
      return emotionalSteps();
  }
}

export function allStepsForState(state: DecisionCompassState): DecisionCompassStep[] {
  if (!state.decisionType) return SETUP_STEPS;
  return [...SETUP_STEPS, ...stepsForType(state.decisionType)];
}

export function emptyDecisionCompassState(): DecisionCompassState {
  return {
    stepIndex: 0,
    decisionType: null,
    answers: {},
    showMap: false,
    complete: false,
  };
}

export type DecisionCompassPrefill = {
  decision: string;
  optionA?: string;
  optionB?: string;
};

/** Seed compass state from chat — lands on the right setup step. */
export function stateFromDecisionCompassPrefill(
  prefill?: DecisionCompassPrefill | null,
): {
  state: DecisionCompassState;
  optionA: string;
  optionB: string;
  draft: string;
} {
  const base = emptyDecisionCompassState();
  if (!prefill?.decision?.trim()) {
    return { state: base, optionA: "", optionB: "", draft: "" };
  }

  const decision = prefill.decision.trim();
  const optionA = prefill.optionA?.trim() ?? "";
  const optionB = prefill.optionB?.trim() ?? "";
  const answers: DecisionCompassAnswers = { decision };

  if (optionA && optionB) {
    answers.options = `${optionA}\n---\n${optionB}`;
    return {
      state: { ...base, stepIndex: 2, answers },
      optionA,
      optionB,
      draft: "",
    };
  }

  return {
    state: { ...base, stepIndex: 1, answers },
    optionA,
    optionB,
    draft: decision,
  };
}

export function currentStep(state: DecisionCompassState): DecisionCompassStep | null {
  const steps = allStepsForState(state);
  return steps[state.stepIndex] ?? null;
}

export function optionLabels(answers: DecisionCompassAnswers): {
  a: string;
  b: string;
} {
  const raw = answers.options ?? "";
  const parts = raw.split("\n---\n");
  return {
    a: parts[0]?.trim() || "Option A",
    b: parts[1]?.trim() || "Option B",
  };
}

/** Use the user's option names in question copy instead of generic Option A/B. */
export function personalizeStepLabel(
  label: string,
  labelA: string,
  labelB: string,
): string {
  return label
    .replace(/\bOption A\b/g, labelA)
    .replace(/\bOption B\b/g, labelB);
}

const MIND_MAP_SHORT_LABELS: Record<string, string> = {
  "why-a": "Reason",
  "why-b": "Reason",
  "concern-a": "Concern",
  "concern-b": "Concern",
  "success-a": "Success",
  "success-b": "Success",
  "first-hour-a": "First hour",
  "first-hour-b": "First hour",
  "fear-a": "Fear",
  "fear-b": "Fear",
  "hope-a": "Hope",
  "hope-b": "Hope",
  inaction: "If nothing changes",
  clearer: "Clearer path",
  momentum: "Momentum",
  values: "Values",
  relief: "Feels lighter",
  "future-me": "Future You",
  freedom: "More freedom",
  growth: "More growth",
  stress: "Less stress",
  alignment: "Long-term fit",
};

function mindMapPickLabel(
  step: DecisionCompassStep & { kind: "pick-ab" | "tradeoff" },
  answers: DecisionCompassAnswers,
  labelA: string,
  labelB: string,
): MindMapNode | null {
  const val = answers[step.id];
  if (val !== "A" && val !== "B") return null;
  const pick = val === "A" ? labelA : labelB;
  const short = MIND_MAP_SHORT_LABELS[step.id] ?? step.label;
  return { id: step.id, label: `${short}: ${pick}` };
}

function mindMapTextNodesForSide(
  steps: DecisionCompassStep[],
  side: "a" | "b",
  answers: DecisionCompassAnswers,
): MindMapNode[] {
  return steps
    .filter((s): s is Extract<DecisionCompassStep, { kind: "text" }> => {
      return s.kind === "text" && s.id.endsWith(`-${side}`);
    })
    .map((s) => {
      const val = answers[s.id]?.trim();
      if (!val) return null;
      const short = MIND_MAP_SHORT_LABELS[s.id] ?? "Note";
      return { id: s.id, label: `${short}: ${val}` };
    })
    .filter((n): n is MindMapNode => n !== null);
}

export function canAdvanceStep(
  step: DecisionCompassStep,
  answers: DecisionCompassAnswers,
): boolean {
  switch (step.kind) {
    case "text":
      return Boolean(answers[step.id]?.trim());
    case "labeled-pair": {
      const { a, b } = optionLabels(answers);
      return Boolean(a && b && a !== "Option A" && b !== "Option B");
    }
    case "type-pick":
      return Boolean(answers["decision-type"]);
    case "pick-ab":
    case "tradeoff":
      return answers[step.id] === "A" || answers[step.id] === "B";
    default:
      return false;
  }
}

export function advanceDecisionCompass(
  state: DecisionCompassState,
  patch?: Partial<DecisionCompassAnswers> & { decisionType?: DecisionType },
): DecisionCompassState {
  const answers: DecisionCompassAnswers = { ...state.answers };
  let decisionType = state.decisionType;
  if (patch) {
    const { decisionType: pick, ...rest } = patch;
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) answers[k] = v;
    }
    if (pick) {
      decisionType = pick;
      answers["decision-type"] = pick;
    }
  }

  const steps = decisionType
    ? [...SETUP_STEPS, ...stepsForType(decisionType)]
    : SETUP_STEPS;
  const step = steps[state.stepIndex];
  if (!step || !canAdvanceStep(step, answers)) return { ...state, answers };

  const nextIndex = state.stepIndex + 1;
  if (nextIndex >= steps.length) {
    return {
      ...state,
      answers,
      decisionType,
      stepIndex: nextIndex,
      complete: true,
    };
  }

  const nextStep = steps[nextIndex];
  if (nextStep?.kind === "type-pick" && !decisionType) {
    const suggested = suggestDecisionType(
      answers.decision ?? "",
      optionLabels(answers).a,
      optionLabels(answers).b,
    );
    if (!answers["decision-type-suggested"]) {
      answers["decision-type-suggested"] = suggested;
    }
  }

  return {
    ...state,
    answers,
    decisionType,
    stepIndex: nextIndex,
    complete: false,
  };
}

export function setDecisionType(
  state: DecisionCompassState,
  type: DecisionType,
): DecisionCompassState {
  return {
    ...state,
    decisionType: type,
    answers: { ...state.answers, "decision-type": type },
  };
}

export type DecisionResult = {
  headline: string;
  choice: string;
  type: DecisionType;
  summary: string;
};

function countAbPicks(answers: DecisionCompassAnswers, keys: string[]): {
  a: number;
  b: number;
} {
  let a = 0;
  let b = 0;
  for (const key of keys) {
    if (answers[key] === "A") a += 1;
    if (answers[key] === "B") b += 1;
  }
  return { a, b };
}

export function computeDecisionResult(state: DecisionCompassState): DecisionResult | null {
  if (!state.decisionType || !state.complete) return null;
  const { a: labelA, b: labelB } = optionLabels(state.answers);
  const type = state.decisionType;

  if (type === "action") {
    const pick =
      state.answers.momentum === "A"
        ? labelA
        : state.answers.momentum === "B"
          ? labelB
          : state.answers.clearer === "A"
            ? labelA
            : labelB;
    const firstHour =
      state.answers.momentum === "A"
        ? state.answers["first-hour-a"]
        : state.answers["first-hour-b"];
    return {
      type,
      headline: "Best Next Action",
      choice: pick,
      summary: firstHour?.trim()
        ? `Start with **${pick}** — your first hour looks like: ${firstHour.trim()}`
        : `**${pick}** has the clearer momentum path right now.`,
    };
  }

  if (type === "strategic") {
    const tradeoffs = countAbPicks(state.answers, [
      "freedom",
      "growth",
      "stress",
      "alignment",
    ]);
    const pick =
      tradeoffs.a >= tradeoffs.b ? labelA : labelB;
    return {
      type,
      headline: "Strategic Recommendation",
      choice: pick,
      summary: `On tradeoffs, **${pick}** leads. If nothing changes: ${state.answers.inaction?.trim() || "staying put has a cost too."}`,
    };
  }

  const emotional = countAbPicks(state.answers, ["values", "relief", "future-me"]);
  const pick =
    emotional.a >= emotional.b ? labelA : labelB;
  return {
    type,
    headline: "Most Aligned Choice",
    choice: pick,
    summary: `**${pick}** aligns with your values, feels lighter, and is what Future You would thank you for.`,
  };
}

export type MindMapNode = {
  id: string;
  label: string;
  children?: MindMapNode[];
};

/** ADHD-friendly mind map from answers — optional visual aid. */
export function buildDecisionMindMap(state: DecisionCompassState): MindMapNode {
  const decision = state.answers.decision?.trim() || "Your decision";
  const { a: labelA, b: labelB } = optionLabels(state.answers);
  const type = state.decisionType;

  if (!type) {
    return {
      id: "root",
      label: decision,
      children: [
        { id: "opt-a", label: labelA },
        { id: "opt-b", label: labelB },
      ],
    };
  }

  const steps = stepsForType(type);
  const sharedText = steps.filter(
    (s): s is Extract<DecisionCompassStep, { kind: "text" }> =>
      s.kind === "text" && !s.id.endsWith("-a") && !s.id.endsWith("-b"),
  );
  const picks = steps.filter(
    (s): s is Extract<DecisionCompassStep, { kind: "pick-ab" | "tradeoff" }> =>
      s.kind === "pick-ab" || s.kind === "tradeoff",
  );

  const branchA: MindMapNode = {
    id: "opt-a",
    label: labelA,
    children: mindMapTextNodesForSide(steps, "a", state.answers),
  };
  const branchB: MindMapNode = {
    id: "opt-b",
    label: labelB,
    children: mindMapTextNodesForSide(steps, "b", state.answers),
  };

  const sharedNodes: MindMapNode[] = [
    ...sharedText
      .map((s) => {
        const val = state.answers[s.id]?.trim();
        if (!val) return null;
        const short = MIND_MAP_SHORT_LABELS[s.id] ?? s.label;
        return { id: s.id, label: `${short}: ${val}` };
      })
      .filter((n): n is MindMapNode => n !== null),
    ...picks
      .map((s) => mindMapPickLabel(s, state.answers, labelA, labelB))
      .filter((n): n is MindMapNode => n !== null),
  ];

  const meta = DECISION_TYPE_META[type];
  return {
    id: "root",
    label: decision,
    children: [
      {
        id: type,
        label: `${meta.emoji} ${meta.title}`,
        children: [
          ...(branchA.children?.length ? [branchA] : []),
          ...(branchB.children?.length ? [branchB] : []),
          ...sharedNodes,
        ],
      },
    ],
  };
}

export function decisionCompassHintForChat(): string {
  return [
    "ADHD DECISION COMPASS:",
    "- First identify decision type: Action (what to do first), Strategic (business forward), or Emotional (alignment).",
    "- Action: first-hour clarity + momentum. Strategic: reasons, concerns, inaction cost, tradeoffs. Emotional: fears, hopes, values, relief, Future Me.",
    "- Never force a visual map — offer 🗺️ Show Decision Map only when helpful.",
    "- Results are drafts for momentum, not verdicts. Momentum Over Perfection.",
  ].join("\n");
}
