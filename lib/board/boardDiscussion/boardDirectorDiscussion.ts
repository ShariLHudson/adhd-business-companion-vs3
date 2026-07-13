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

export type BoardDirectorDiscussionRecord = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** Board Director IDs only — never Chamber IDs */
  directorIds: BoardDirectorId[];
  answers: Record<BoardDirectorIntakeStepId, string>;
  turns: Array<{ id: string; role: "chair" | "moderator"; text: string }>;
  status: "in-progress" | "ended";
};

export const BOARD_DIRECTOR_DISCUSSIONS_STORAGE_KEY =
  "spark.board.director-discussions.v1" as const;

/** In-progress intake only — not Board history. */
export const BOARD_DIRECTOR_INTAKE_DRAFT_STORAGE_KEY =
  "spark.board.director-intake-draft.v1" as const;

export function createEmptyBoardIntakeDraft(
  directorIds: readonly BoardDirectorId[] = [],
): BoardDiscussionIntakeDraft {
  const ids = [...directorIds];
  return {
    decision: "",
    importance: "",
    options: [],
    concerns: "",
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

export function ensureChairInDraft(
  draft: BoardDiscussionIntakeDraft,
): BoardDiscussionIntakeDraft {
  if (draft.selectedDirectorIds.includes(THOMAS_ELLISON_DIRECTOR_ID)) {
    return { ...draft, chairConfirmed: true };
  }
  return {
    ...draft,
    selectedDirectorIds: [
      THOMAS_ELLISON_DIRECTOR_ID,
      ...draft.selectedDirectorIds,
    ],
    chairConfirmed: true,
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

export function buildChairOpeningAndSummary(
  answers: Partial<Record<BoardDirectorIntakeStepId, string>>,
  directorIds: readonly BoardDirectorId[] = [THOMAS_ELLISON_DIRECTOR_ID],
): BoardDirectorDiscussionRecord["turns"] {
  const chair = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);
  const name = chair?.name ?? "Thomas Ellison";
  const decision = answers.decision?.trim() || "this decision";
  const why = answers["why-now"]?.trim() || "its timing";
  const options = answers.options?.trim() || "the options on the table";
  const concerns = answers.concerns?.trim() || "the concerns you named";
  const participants = directorIds
    .map((id) => getBoardDirectorById(id)?.name)
    .filter(Boolean)
    .join(", ");

  return [
    {
      id: `chair-open-${Date.now().toString(36)}`,
      role: "chair",
      text: [
        `I'm ${name}, Chair of the Board.`,
        `We're examining: ${decision}.`,
        `It matters now because: ${why}.`,
        `Options under consideration: ${options}`,
        `Concerns already named: ${concerns}`,
        participants
          ? `At the table: ${participants}.`
          : "At the table: Thomas Ellison.",
        `I'll keep us focused on long-term direction, Board alignment, and a clear recommendation — without making the decision for you.`,
        `Does that capture what you brought, or should we adjust anything before we continue?`,
      ].join("\n\n"),
    },
    {
      id: `chair-summary-${Date.now().toString(36)}`,
      role: "chair",
      text: [
        "Chair summary:",
        `Decision: ${decision}`,
        `Why now: ${why}`,
        `Options: ${options}`,
        `Concerns: ${concerns}`,
        "What I protect: tomorrow's stability as well as today's opportunity.",
        "Recommendation: name the real decision in one sentence, then choose the option that best protects long-term strength — or pause for one missing fact before you commit.",
        "When more Directors join the Board, we'll bring additional independent viewpoints. For implementation details later, a Chamber specialist can help — after you decide.",
      ].join("\n\n"),
    },
    {
      id: `mod-${Date.now().toString(36)}`,
      role: "moderator",
      text: "This Board discussion has begun with the Chair. You can continue here, preserve this discussion, or return to the Boardroom.",
    },
  ];
}

export function createBoardDirectorDiscussionFromDraft(
  draft: BoardDiscussionIntakeDraft,
): BoardDirectorDiscussionRecord {
  const withChair = ensureChairInDraft(draft);
  const answers = draftToAnswerRecord(withChair);
  const now = new Date().toISOString();
  const title =
    answers.decision.trim().slice(0, 72) || "Board discussion with the Chair";
  return {
    id: `bdd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    createdAt: now,
    updatedAt: now,
    directorIds: withChair.selectedDirectorIds.includes(THOMAS_ELLISON_DIRECTOR_ID)
      ? [...withChair.selectedDirectorIds]
      : [THOMAS_ELLISON_DIRECTOR_ID, ...withChair.selectedDirectorIds],
    answers,
    turns: buildChairOpeningAndSummary(
      answers,
      withChair.selectedDirectorIds,
    ),
    status: "in-progress",
  };
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
