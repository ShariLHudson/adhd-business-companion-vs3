/**
 * Board of Directors discussion intake — one question at a time,
 * then review, then a single discussion handoff.
 *
 * Uses BoardDirectorId only (never Chamber / AdvisoryMemberId).
 * In-progress draft is persisted so remounts cannot restart the intake.
 */

import type { BoardDirectorId } from "@/lib/board/types";
import { THOMAS_ELLISON_DIRECTOR_ID } from "@/lib/board/visibleDirectors";
import { getBoardDirectorById } from "@/lib/board/boardDirectorRegistry";
import { buildDirectorPerspectiveText } from "@/lib/board/buildDirectorPerspectiveText";
import {
  relatedWorkFromBoardDecision,
  type RelatedMatterReference,
} from "@/lib/board/relatedMatter";
import {
  boardPossessiveMatter,
  resolveAddressNameForBoard,
  type BoardPersonalizationOptions,
} from "@/lib/board/resolveBoardAddressName";

/** Question prompts — approved copy; order is fixed. */
export const BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS = [
  {
    id: "decision",
    prompt: "What decision are you considering?",
  },
  {
    id: "why-now",
    prompt: "Why does it matter now?",
  },
  {
    id: "options",
    prompt: "What options are you considering?",
  },
  {
    id: "concerns",
    prompt: "What concerns do you already have?",
  },
] as const;

/** Answer field ids stored on completed discussions (stable). */
export type BoardDirectorIntakeStepId =
  (typeof BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS)[number]["id"];

/**
 * Full intake UI / machine steps.
 * Question steps map to answer fields; review+ never return to decision
 * unless the member explicitly Starts Over.
 */
export type BoardIntakeStep =
  | "decision"
  | "importance"
  | "options"
  | "concerns"
  | "review"
  | "ready_to_begin"
  | "discussion";

export const BOARD_INTAKE_QUESTION_STEPS: readonly BoardIntakeStep[] = [
  "decision",
  "importance",
  "options",
  "concerns",
] as const;

const QUESTION_PROMPT_BY_STEP: Record<
  "decision" | "importance" | "options" | "concerns",
  string
> = {
  decision: BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[0].prompt,
  importance: BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[1].prompt,
  options: BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[2].prompt,
  concerns: BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[3].prompt,
};

export type BoardDiscussionContext = {
  source?: string;
  note?: string;
  /** Current Focus / Project awareness (Prompt 145) */
  projectId?: string | null;
  projectName?: string | null;
  strategyId?: string | null;
  workTitle?: string | null;
};

export type BoardDiscussionIntakeDraft = {
  decision: string;
  importance: string;
  options: string[];
  concerns: string;
  sourceContext?: BoardDiscussionContext;
  selectedDirectorIds: BoardDirectorId[];
  currentStep: BoardIntakeStep;
  chairConfirmed: boolean;
  updatedAt: string;
};

/** @deprecated Prefer BoardDiscussionIntakeDraft — kept for call sites mid-migration. */
export type BoardDirectorDiscussionIntakeState = {
  stepIndex: number;
  answers: Partial<Record<BoardDirectorIntakeStepId, string>>;
  directorIds: BoardDirectorId[];
  chairConfirmed: boolean;
  currentStep?: BoardIntakeStep;
};

export type BoardDirectorDiscussionTurn = {
  id: string;
  role: "chair" | "moderator" | "director";
  /** Present when role is director (or chair speaking as named Director) */
  directorId?: BoardDirectorId;
  speakerName?: string;
  text: string;
};

/** Structured Decision Record — searchable Board history (Prompt 145). */
export type BoardDecisionRecord = {
  decisionTitle: string;
  date: string;
  participatingDirectors: BoardDirectorId[];
  /** Synthesis of the discussion — not a verbatim Director turn. */
  summary: string;
  keyRisks: string;
  opportunities: string;
  /** Current direction / next useful step synthesis. */
  finalRecommendation: string;
  pointsOfAgreement?: string;
  importantDifferences?: string;
  currentDirection?: string;
  nextUsefulStep?: string;
  userFinalChoice?: string | null;
  relatedProjectId?: string | null;
  relatedProjectName?: string | null;
  relatedStrategyId?: string | null;
  relatedCartographyMapId?: string | null;
  relatedEvidenceId?: string | null;
  relatedWinId?: string | null;
  /** Linked Board / Chamber / research / project items for future timelines. */
  relatedWork?: RelatedMatterReference[];
};

export type BoardDirectorDiscussionRecord = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** Board Director IDs only — never Chamber IDs */
  directorIds: BoardDirectorId[];
  answers: Record<BoardDirectorIntakeStepId, string>;
  turns: BoardDirectorDiscussionTurn[];
  status: "in-progress" | "ended" | "recommendation-accepted";
  sourceContext?: BoardDiscussionContext;
  decisionRecord?: BoardDecisionRecord;
  /** Member accepted “Use This Recommendation” */
  recommendationAcceptedAt?: string | null;
};

export const BOARD_DIRECTOR_DISCUSSIONS_STORAGE_KEY =
  "spark.board.director-discussions.v1" as const;

/** In-progress intake only — not Board history. */
export const BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY =
  "spark.board.director-intake-draft.v1" as const;

export function createEmptyBoardIntakeDraft(
  directorIds: readonly BoardDirectorId[] = [],
  sourceContext?: BoardDiscussionContext,
): BoardDiscussionIntakeDraft {
  const ids = [...directorIds];
  return {
    decision: "",
    importance: "",
    options: [],
    concerns: "",
    sourceContext,
    selectedDirectorIds: ids,
    currentStep: "decision",
    chairConfirmed: ids.includes(THOMAS_ELLISON_DIRECTOR_ID),
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyBoardDirectorIntake(
  directorIds: readonly BoardDirectorId[] = [],
): BoardDirectorDiscussionIntakeState {
  return draftToLegacyState(createEmptyBoardIntakeDraft(directorIds));
}

/**
 * Chair is optional. Never auto-insert the Chair into a member selection.
 * Only marks chairConfirmed when Chair is already among selected directors.
 */
export function ensureChairInDraft(
  draft: BoardDiscussionIntakeDraft,
): BoardDiscussionIntakeDraft {
  const chairIncluded = draft.selectedDirectorIds.includes(
    THOMAS_ELLISON_DIRECTOR_ID,
  );
  if (draft.chairConfirmed === chairIncluded) return draft;
  return {
    ...draft,
    chairConfirmed: chairIncluded,
    updatedAt: new Date().toISOString(),
  };
}

/** True when discussion may begin: topic + at least one Director. */
export function canBeginBoardDiscussion(
  draft: BoardDiscussionIntakeDraft,
): boolean {
  return (
    Boolean(draft.decision.trim()) && draft.selectedDirectorIds.length > 0
  );
}

/**
 * Skip Optional Details — first-class workflow (Prompt 145).
 * Leaves the decision intact, clears unanswered optional fields from the
 * current step forward, and advances to review. Never stores prompt copy.
 */
export function skipBoardIntakeStep(
  draft: BoardDiscussionIntakeDraft,
): BoardDiscussionIntakeDraft {
  if (!isQuestionIntakeStep(draft.currentStep)) return draft;
  if (draft.currentStep === "decision") return draft;
  const next: BoardDiscussionIntakeDraft = {
    ...draft,
    currentStep: "review",
    updatedAt: new Date().toISOString(),
  };
  if (draft.currentStep === "importance") {
    next.importance = "";
    next.options = [];
    next.concerns = "";
  } else if (draft.currentStep === "options") {
    next.options = [];
    next.concerns = "";
  } else if (draft.currentStep === "concerns") {
    next.concerns = "";
  }
  return next;
}

/** After a decision is captured, jump to review (optional details skipped). */
export function advanceDecisionToReview(
  draft: BoardDiscussionIntakeDraft,
): BoardDiscussionIntakeDraft {
  if (!draft.decision.trim()) return draft;
  return {
    ...draft,
    currentStep: "review",
    updatedAt: new Date().toISOString(),
  };
}

export function ensureChairInIntake(
  state: BoardDirectorDiscussionIntakeState,
): BoardDirectorDiscussionIntakeState {
  return draftToLegacyState(ensureChairInDraft(legacyStateToDraft(state)));
}

export function isQuestionIntakeStep(
  step: BoardIntakeStep,
): step is "decision" | "importance" | "options" | "concerns" {
  return (
    step === "decision" ||
    step === "importance" ||
    step === "options" ||
    step === "concerns"
  );
}

export function currentIntakePrompt(draftOrState: {
  currentStep?: BoardIntakeStep;
  stepIndex?: number;
}): string {
  const step =
    draftOrState.currentStep ??
    (typeof draftOrState.stepIndex === "number"
      ? BOARD_INTAKE_QUESTION_STEPS[draftOrState.stepIndex]
      : undefined);
  if (step && isQuestionIntakeStep(step)) {
    return QUESTION_PROMPT_BY_STEP[step];
  }
  return "Begin discussion";
}

export function questionStepNumber(step: BoardIntakeStep): number {
  const idx = BOARD_INTAKE_QUESTION_STEPS.indexOf(step);
  return idx >= 0 ? idx + 1 : BOARD_INTAKE_QUESTION_STEPS.length;
}

export function isIntakeComplete(
  draftOrState: BoardDiscussionIntakeDraft | BoardDirectorDiscussionIntakeState,
): boolean {
  if ("currentStep" in draftOrState && draftOrState.currentStep) {
    /** Questions finished — review or later (never still on a question). */
    return (
      draftOrState.currentStep === "review" ||
      draftOrState.currentStep === "ready_to_begin" ||
      draftOrState.currentStep === "discussion"
    );
  }
  const legacy = draftOrState as BoardDirectorDiscussionIntakeState;
  return legacy.stepIndex >= BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS.length;
}

export function areIntakeQuestionsComplete(
  draft: BoardDiscussionIntakeDraft,
): boolean {
  return (
    isIntakeComplete(draft) ||
    (Boolean(draft.decision.trim()) &&
      Boolean(draft.importance.trim()) &&
      draft.options.length > 0 &&
      Boolean(draft.concerns.trim()))
  );
}

export function isIntakeReadyForReview(draft: BoardDiscussionIntakeDraft): boolean {
  return (
    Boolean(draft.decision.trim()) &&
    Boolean(draft.importance.trim()) &&
    draft.options.length > 0 &&
    Boolean(draft.concerns.trim())
  );
}

export function parseOptionsAnswer(raw: string): string[] {
  return raw
    .split(/\n|;|\u2022|\|/)
    .map((s) => s.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Merge one answer into the draft and advance exactly one step.
 * Never jumps backward. Concerns → review (not decision).
 */
export function answerBoardIntakeStep(
  draft: BoardDiscussionIntakeDraft,
  answer: string,
): BoardDiscussionIntakeDraft {
  const trimmed = answer.trim();
  if (!trimmed) return draft;
  if (!isQuestionIntakeStep(draft.currentStep)) return draft;

  const next: BoardDiscussionIntakeDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  switch (draft.currentStep) {
    case "decision":
      next.decision = trimmed;
      next.currentStep = "importance";
      break;
    case "importance":
      next.importance = trimmed;
      next.currentStep = "options";
      break;
    case "options":
      next.options = parseOptionsAnswer(trimmed);
      if (next.options.length === 0) next.options = [trimmed];
      next.currentStep = "concerns";
      break;
    case "concerns":
      next.concerns = trimmed;
      next.currentStep = "review";
      break;
  }
  return next;
}

/** Legacy wrapper — advances question index; concerns completion lands on review via draft API. */
export function answerIntakeStep(
  state: BoardDirectorDiscussionIntakeState,
  answer: string,
): BoardDirectorDiscussionIntakeState {
  const draft = answerBoardIntakeStep(legacyStateToDraft(state), answer);
  return draftToLegacyState(draft);
}

export function advanceDraftToReady(
  draft: BoardDiscussionIntakeDraft,
): BoardDiscussionIntakeDraft {
  if (draft.currentStep !== "review") return draft;
  return {
    ...draft,
    currentStep: "ready_to_begin",
    updatedAt: new Date().toISOString(),
  };
}

export function markDraftInDiscussion(
  draft: BoardDiscussionIntakeDraft,
): BoardDiscussionIntakeDraft {
  return {
    ...draft,
    currentStep: "discussion",
    updatedAt: new Date().toISOString(),
  };
}

export function updateDraftDirectors(
  draft: BoardDiscussionIntakeDraft,
  directorIds: readonly BoardDirectorId[],
): BoardDiscussionIntakeDraft {
  const ids = [...directorIds];
  return {
    ...draft,
    selectedDirectorIds: ids,
    chairConfirmed: ids.includes(THOMAS_ELLISON_DIRECTOR_ID),
    updatedAt: new Date().toISOString(),
  };
}

export function setDraftStep(
  draft: BoardDiscussionIntakeDraft,
  step: BoardIntakeStep,
): BoardDiscussionIntakeDraft {
  return {
    ...draft,
    currentStep: step,
    updatedAt: new Date().toISOString(),
  };
}

export function loadBoardIntakeDraft(): BoardDiscussionIntakeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BoardDiscussionIntakeDraft;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.currentStep) return null;
    return {
      ...createEmptyBoardIntakeDraft(parsed.selectedDirectorIds ?? []),
      ...parsed,
      options: Array.isArray(parsed.options)
        ? parsed.options.map(String)
        : parseOptionsAnswer(String(parsed.options ?? "")),
      selectedDirectorIds: Array.isArray(parsed.selectedDirectorIds)
        ? (parsed.selectedDirectorIds as BoardDirectorId[])
        : [],
    };
  } catch {
    return null;
  }
}

export function saveBoardIntakeDraft(draft: BoardDiscussionIntakeDraft): void {
  if (typeof window === "undefined") return;
  const next = { ...draft, updatedAt: new Date().toISOString() };
  localStorage.setItem(
    BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY,
    JSON.stringify(next),
  );
}

export function clearBoardIntakeDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY);
}

/**
 * Restore an in-progress draft, or create empty.
 * Never overwrites an existing in-progress draft with empty defaults.
 */
export function resolveInitialBoardIntakeDraft(
  directorIds: readonly BoardDirectorId[] = [],
): BoardDiscussionIntakeDraft {
  const existing = loadBoardIntakeDraft();
  if (existing && existing.currentStep !== "discussion") {
    let draft = existing;
    if (
      directorIds.length > 0 &&
      draft.selectedDirectorIds.length === 0
    ) {
      draft = updateDraftDirectors(draft, directorIds);
    }
    return draft;
  }
  return createEmptyBoardIntakeDraft(directorIds);
}

export function legacyStateToDraft(
  state: BoardDirectorDiscussionIntakeState,
): BoardDiscussionIntakeDraft {
  const fromIndex =
    BOARD_INTAKE_QUESTION_STEPS[state.stepIndex] ??
    (state.stepIndex >= BOARD_INTAKE_QUESTION_STEPS.length
      ? "review"
      : "decision");
  const optionsRaw = state.answers.options ?? "";
  return {
    decision: state.answers.decision ?? "",
    importance: state.answers["why-now"] ?? "",
    options: optionsRaw ? parseOptionsAnswer(optionsRaw) : [],
    concerns: state.answers.concerns ?? "",
    selectedDirectorIds: [...state.directorIds],
    currentStep: state.currentStep ?? fromIndex,
    chairConfirmed: state.chairConfirmed,
    updatedAt: new Date().toISOString(),
  };
}

export function draftToLegacyState(
  draft: BoardDiscussionIntakeDraft,
): BoardDirectorDiscussionIntakeState {
  const qIndex = BOARD_INTAKE_QUESTION_STEPS.indexOf(draft.currentStep);
  return {
    stepIndex:
      qIndex >= 0
        ? qIndex
        : draft.currentStep === "review" ||
            draft.currentStep === "ready_to_begin" ||
            draft.currentStep === "discussion"
          ? BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS.length
          : 0,
    answers: {
      decision: draft.decision,
      "why-now": draft.importance,
      options: draft.options.join("\n"),
      concerns: draft.concerns,
    },
    directorIds: [...draft.selectedDirectorIds],
    chairConfirmed: draft.chairConfirmed,
    currentStep: draft.currentStep,
  };
}

export function draftToAnswerRecord(
  draft: BoardDiscussionIntakeDraft,
): Record<BoardDirectorIntakeStepId, string> {
  return {
    decision: draft.decision,
    "why-now": draft.importance,
    options: draft.options.join("\n"),
    concerns: draft.concerns,
  };
}

const SKIPPED_OPTIONAL_LABEL = "No additional concerns were provided.";

/** Never treat instructional placeholder prompts as member answers. */
export function formatOptionalAnswerForDisplay(
  value: string | undefined | null,
  emptyLabel = SKIPPED_OPTIONAL_LABEL,
): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  // Guard against leaked prompt copy if it ever was stored.
  if (
    /^(what matters most to you|the options you are weighing|the concerns you are carrying)$/i.test(
      trimmed,
    )
  ) {
    return null;
  }
  return trimmed;
}

export function buildChairOpeningAndSummary(
  answers: Partial<Record<BoardDirectorIntakeStepId, string>>,
  directorIds: readonly BoardDirectorId[] = [],
  personalization?: BoardPersonalizationOptions,
): BoardDirectorDiscussionTurn[] {
  const chairIncluded = directorIds.includes(THOMAS_ELLISON_DIRECTOR_ID);
  const chair = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);
  const name = chair?.name ?? "Thomas Ellison";
  const decision = answers.decision?.trim() || "this decision";
  const why = formatOptionalAnswerForDisplay(answers["why-now"]);
  const options = formatOptionalAnswerForDisplay(answers.options);
  const concerns = formatOptionalAnswerForDisplay(answers.concerns);
  const addressName = resolveAddressNameForBoard(personalization);
  const questionMatter = boardPossessiveMatter(addressName, "question");
  const decisionMatter = boardPossessiveMatter(addressName, "decision");
  const optionsMatter = boardPossessiveMatter(addressName, "options");
  const participants = directorIds
    .map((id) => getBoardDirectorById(id)?.name)
    .filter(Boolean)
    .join(", ");
  const participantLine = participants
    ? `At the table: ${participants}.`
    : "At the table: the Directors you selected.";

  const stamp = Date.now().toString(36);

  if (chairIncluded) {
    const openLines = [
      `I'm ${name}, Chair of the Board.`,
      `We are evaluating ${questionMatter} about whether to move forward with: ${decision}.`,
      addressName
        ? `${addressName}, here is how I see this decision from the Chair's perspective.`
        : `Here is how I see ${decisionMatter} from the Chair's perspective.`,
      why ? `It matters now because: ${why}.` : null,
      options ? `In reviewing ${optionsMatter}: ${options}` : null,
      concerns ? `Concerns already named: ${concerns}` : null,
      !why && !options && !concerns
        ? "No additional optional details were provided — we'll work with the decision as stated."
        : null,
      participantLine,
      `I'll keep us focused on long-term direction, Board alignment, and a clear recommendation — without making the decision for you.`,
      `I'll invite each Director to speak in their role.`,
    ].filter(Boolean) as string[];

    const summaryLines = [
      "Chair summary:",
      `Decision: ${decision}`,
      why ? `Why now: ${why}` : null,
      options ? `Options: ${options}` : null,
      concerns ? `Concerns: ${concerns}` : null,
      "What I protect: tomorrow's stability as well as today's opportunity.",
      addressName
        ? `Recommendation: name the real decision in one sentence, then choose the option that best protects the long-term strength ${addressName} has been building — or pause for one missing fact before committing.`
        : "Recommendation: name the real decision in one sentence, then choose the option that best protects long-term strength — or pause for one missing fact before you commit.",
    ].filter(Boolean) as string[];

    return [
      {
        id: `chair-open-${stamp}`,
        role: "chair",
        directorId: THOMAS_ELLISON_DIRECTOR_ID,
        speakerName: name,
        text: openLines.join("\n\n"),
      },
      {
        id: `chair-summary-${stamp}`,
        role: "chair",
        directorId: THOMAS_ELLISON_DIRECTOR_ID,
        speakerName: name,
        text: summaryLines.join("\n\n"),
      },
    ];
  }

  return [
    {
      id: `mod-open-${stamp}`,
      role: "moderator",
      text: [
        `I've brought this to the Directors you selected. Let's look at it from their different perspectives.`,
        `We are evaluating ${questionMatter}: ${decision}.`,
        why ? `What matters now: ${why}.` : null,
        options ? `Options on the table: ${options}` : null,
        concerns ? `Concerns named: ${concerns}` : null,
        !why && !options && !concerns
          ? "No additional optional details were provided."
          : null,
        participantLine,
        `I'll invite each Director to contribute in their role — without making the decision for you.`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  ];
}

/**
 * One spoken turn per selected Director (Prompt 145).
 * Chair may facilitate separately; other Directors are never replaced by the Chair.
 * Each Director uses a unique response contract — no shared closing boilerplate.
 */
export function buildDirectorPerspectiveTurns(
  answers: Partial<Record<BoardDirectorIntakeStepId, string>>,
  directorIds: readonly BoardDirectorId[],
  personalization?: BoardPersonalizationOptions,
): BoardDirectorDiscussionTurn[] {
  const decision = answers.decision?.trim() || "this decision";
  const addressName = resolveAddressNameForBoard(personalization);
  const whyNow = formatOptionalAnswerForDisplay(answers["why-now"]);
  const concerns = formatOptionalAnswerForDisplay(answers.concerns);
  const stamp = Date.now().toString(36);
  const turns: BoardDirectorDiscussionTurn[] = [];

  for (const id of directorIds) {
    if (id === THOMAS_ELLISON_DIRECTOR_ID) continue;
    const director = getBoardDirectorById(id);
    if (!director) continue;
    turns.push({
      id: `dir-${id}-${stamp}`,
      role: "director",
      directorId: id,
      speakerName: director.name,
      text: buildDirectorPerspectiveText({
        director,
        decision,
        addressName,
        whyNow,
        concerns,
      }),
    });
  }

  return turns;
}

export function buildBoardDiscussionTurns(
  answers: Partial<Record<BoardDirectorIntakeStepId, string>>,
  directorIds: readonly BoardDirectorId[],
  personalization?: BoardPersonalizationOptions,
): BoardDirectorDiscussionTurn[] {
  const opening = buildChairOpeningAndSummary(
    answers,
    directorIds,
    personalization,
  );
  const perspectives = buildDirectorPerspectiveTurns(
    answers,
    directorIds,
    personalization,
  );
  const stamp = Date.now().toString(36);
  const close: BoardDirectorDiscussionTurn = {
    id: `mod-close-${stamp}`,
    role: "moderator",
    text:
      "You've heard each selected Director. When you're ready, you can use the recommendation as your working choice — or keep refining.",
  };
  return [...opening, ...perspectives, close];
}

export function buildDecisionRecordFromDiscussion(
  record: Pick<
    BoardDirectorDiscussionRecord,
    | "id"
    | "title"
    | "createdAt"
    | "directorIds"
    | "answers"
    | "turns"
    | "sourceContext"
  >,
): BoardDecisionRecord {
  const synthesis = synthesizeBoardDecisionRecord(record);
  const relatedWork = relatedWorkFromBoardDecision({
    decisionTitle: record.title,
    discussionId: "id" in record && record.id ? record.id : `draft-${record.createdAt}`,
    projectId: record.sourceContext?.projectId,
    projectName: record.sourceContext?.projectName,
    strategyId: record.sourceContext?.strategyId,
    evidenceId: null,
  });
  return {
    decisionTitle: record.title,
    date: record.createdAt,
    participatingDirectors: [...record.directorIds],
    summary: synthesis.summary,
    keyRisks: synthesis.keyRisks,
    opportunities: synthesis.pointsOfAgreement,
    finalRecommendation: synthesis.nextUsefulStep,
    pointsOfAgreement: synthesis.pointsOfAgreement,
    importantDifferences: synthesis.importantDifferences,
    currentDirection: synthesis.currentDirection,
    nextUsefulStep: synthesis.nextUsefulStep,
    userFinalChoice: null,
    relatedProjectId: record.sourceContext?.projectId ?? null,
    relatedProjectName: record.sourceContext?.projectName ?? null,
    relatedStrategyId: record.sourceContext?.strategyId ?? null,
    relatedCartographyMapId: null,
    relatedEvidenceId: null,
    relatedWinId: null,
    relatedWork,
  };
}

/**
 * Synthesize Board discussion into a Decision Record.
 * Must not repeat one Director's wording verbatim or claim false consensus.
 */
export function synthesizeBoardDecisionRecord(
  record: Pick<
    BoardDirectorDiscussionRecord,
    "title" | "directorIds" | "answers" | "turns"
  >,
): {
  summary: string;
  pointsOfAgreement: string;
  importantDifferences: string;
  keyRisks: string;
  currentDirection: string;
  nextUsefulStep: string;
} {
  const decision = record.answers.decision?.trim() || record.title;
  const concerns =
    formatOptionalAnswerForDisplay(record.answers.concerns) ??
    "No specific risks were named in intake.";
  const why = formatOptionalAnswerForDisplay(record.answers["why-now"]);
  const directorTurns = record.turns.filter((t) => t.role === "director");
  const names = record.directorIds
    .map((id) => getBoardDirectorById(id)?.shortRole || getBoardDirectorById(id)?.name)
    .filter(Boolean);

  const themes = directorTurns.map((t) => {
    const role =
      (t.directorId && getBoardDirectorById(t.directorId)?.shortRole) ||
      t.speakerName ||
      "Director";
    const firstLine =
      t.text
        .split("\n")
        .map((l) => l.trim())
        .find(
          (l) =>
            l &&
            !l.startsWith("I'm ") &&
            !/^My current view:/i.test(l),
        ) ?? "";
    return { role, firstLine };
  });

  const pointsOfAgreement =
    themes.length >= 2
      ? `The Board treated “${decision}” as a real decision worth examining carefully${
          why ? `, especially given timing: ${why}` : ""
        }. Multiple Directors pressed for clearer evidence before a firm commit.`
      : themes.length === 1
        ? `${themes[0].role} examined “${decision}” from a single specialist seat — agreement across the Board was not claimed.`
        : `The decision “${decision}” was recorded for review.`;

  const importantDifferences =
    themes.length >= 2
      ? themes
          .slice(0, 4)
          .map((t) => `${t.role}: ${t.firstLine.slice(0, 140)}${t.firstLine.length > 140 ? "…" : ""}`)
          .join("\n")
      : "Only one Director perspective was present, so cross-role differences were not compared.";

  const currentDirection =
    names.length > 0
      ? `Current direction: hold a working view informed by ${names.join(", ")} — without treating the Board as unanimous.`
      : "Current direction: review the perspectives gathered, then choose deliberately.";

  const nextUsefulStep =
    directorTurns
      .map((t) =>
        t.text
          .split("\n")
          .map((l) => l.trim())
          .find((l) => /^Next useful/i.test(l)),
      )
      .find(Boolean)
      ?.replace(/^Next useful (test|check):\s*/i, "")
      .trim() ||
    "Name one concrete next test that would reduce the biggest uncertainty before you commit further.";

  const summary = [
    `Decision: ${decision}`,
    "",
    "Strongest points of agreement:",
    pointsOfAgreement,
    "",
    "Important differences:",
    importantDifferences,
    "",
    "Risks or unknowns:",
    concerns,
    "",
    "Current direction:",
    currentDirection,
    "",
    "Next useful step:",
    nextUsefulStep,
  ].join("\n");

  return {
    summary,
    pointsOfAgreement,
    importantDifferences,
    keyRisks: concerns,
    currentDirection,
    nextUsefulStep,
  };
}

export function createBoardDirectorDiscussionFromDraft(
  draft: BoardDiscussionIntakeDraft,
): BoardDirectorDiscussionRecord {
  const normalized = ensureChairInDraft(draft);
  const answers = draftToAnswerRecord(normalized);
  const now = new Date().toISOString();
  const directorIds = [...normalized.selectedDirectorIds];
  const title =
    answers.decision.trim().slice(0, 72) || "Board discussion";
  const turns = buildBoardDiscussionTurns(answers, directorIds);
  const base: BoardDirectorDiscussionRecord = {
    id: `bdd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    createdAt: now,
    updatedAt: now,
    directorIds,
    answers,
    turns,
    status: "in-progress",
    sourceContext: normalized.sourceContext,
  };
  return {
    ...base,
    decisionRecord: buildDecisionRecordFromDiscussion(base),
  };
}

export function acceptBoardRecommendation(
  record: BoardDirectorDiscussionRecord,
  userChoice?: string | null,
): BoardDirectorDiscussionRecord {
  const decisionRecord: BoardDecisionRecord = {
    ...(record.decisionRecord ?? buildDecisionRecordFromDiscussion(record)),
    userFinalChoice: userChoice?.trim() || "Use this recommendation",
  };
  return upsertBoardDirectorDiscussion({
    ...record,
    status: "recommendation-accepted",
    recommendationAcceptedAt: new Date().toISOString(),
    decisionRecord,
  });
}

export function createBoardDirectorDiscussion(
  state: BoardDirectorDiscussionIntakeState,
): BoardDirectorDiscussionRecord {
  return createBoardDirectorDiscussionFromDraft(legacyStateToDraft(state));
}

type StoreSnap = { version: 1; discussions: BoardDirectorDiscussionRecord[] };

function readStore(): StoreSnap {
  if (typeof window === "undefined") return { version: 1, discussions: [] };
  try {
    const raw = localStorage.getItem(BOARD_DIRECTOR_DISCUSSIONS_STORAGE_KEY);
    if (!raw) return { version: 1, discussions: [] };
    const parsed = JSON.parse(raw) as StoreSnap;
    if (!parsed || !Array.isArray(parsed.discussions)) {
      return { version: 1, discussions: [] };
    }
    return { version: 1, discussions: parsed.discussions };
  } catch {
    return { version: 1, discussions: [] };
  }
}

function writeStore(snap: StoreSnap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOARD_DIRECTOR_DISCUSSIONS_STORAGE_KEY, JSON.stringify(snap));
}

export function listBoardDirectorDiscussions(
  limit = 50,
): BoardDirectorDiscussionRecord[] {
  return readStore()
    .discussions.slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

export function upsertBoardDirectorDiscussion(
  record: BoardDirectorDiscussionRecord,
): BoardDirectorDiscussionRecord {
  const snap = readStore();
  const idx = snap.discussions.findIndex((d) => d.id === record.id);
  const next = { ...record, updatedAt: new Date().toISOString() };
  if (idx >= 0) snap.discussions[idx] = next;
  else snap.discussions.unshift(next);
  writeStore(snap);
  return next;
}
