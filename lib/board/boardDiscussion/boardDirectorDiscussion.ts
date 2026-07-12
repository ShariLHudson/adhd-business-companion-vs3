/**
 * Board of Directors discussion intake — one question at a time.
 * Uses BoardDirectorId (never Chamber / AdvisoryMemberId).
 */

import type { BoardDirectorId } from "@/lib/board/types";
import { THOMAS_ELLISON_DIRECTOR_ID } from "@/lib/board/visibleDirectors";
import { getBoardDirectorById } from "@/lib/board/boardDirectorRegistry";

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

export type BoardDirectorIntakeStepId =
  (typeof BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS)[number]["id"];

export type BoardDirectorDiscussionIntakeState = {
  stepIndex: number;
  answers: Partial<Record<BoardDirectorIntakeStepId, string>>;
  directorIds: BoardDirectorId[];
  /** Member confirmed Chair when none selected */
  chairConfirmed: boolean;
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

export function createEmptyBoardDirectorIntake(
  directorIds: readonly BoardDirectorId[] = [],
): BoardDirectorDiscussionIntakeState {
  return {
    stepIndex: 0,
    answers: {},
    directorIds: [...directorIds],
    chairConfirmed: directorIds.includes(THOMAS_ELLISON_DIRECTOR_ID),
  };
}

export function ensureChairInIntake(
  state: BoardDirectorDiscussionIntakeState,
): BoardDirectorDiscussionIntakeState {
  if (state.directorIds.includes(THOMAS_ELLISON_DIRECTOR_ID)) {
    return { ...state, chairConfirmed: true };
  }
  return {
    ...state,
    directorIds: [THOMAS_ELLISON_DIRECTOR_ID, ...state.directorIds],
    chairConfirmed: true,
  };
}

export function currentIntakePrompt(
  state: BoardDirectorDiscussionIntakeState,
): string {
  const step = BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[state.stepIndex];
  return step?.prompt ?? "Begin discussion";
}

export function isIntakeComplete(
  state: BoardDirectorDiscussionIntakeState,
): boolean {
  return state.stepIndex >= BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS.length;
}

export function answerIntakeStep(
  state: BoardDirectorDiscussionIntakeState,
  answer: string,
): BoardDirectorDiscussionIntakeState {
  const step = BOARD_DIRECTOR_DISCUSSION_INTAKE_STEPS[state.stepIndex];
  if (!step) return state;
  const trimmed = answer.trim();
  if (!trimmed) return state;
  return {
    ...state,
    answers: { ...state.answers, [step.id]: trimmed },
    stepIndex: state.stepIndex + 1,
  };
}

export function buildChairOpeningAndSummary(
  answers: Partial<Record<BoardDirectorIntakeStepId, string>>,
): BoardDirectorDiscussionRecord["turns"] {
  const chair = getBoardDirectorById(THOMAS_ELLISON_DIRECTOR_ID);
  const name = chair?.name ?? "Thomas Ellison";
  const decision = answers.decision?.trim() || "this decision";
  const why = answers["why-now"]?.trim() || "its timing";
  const options = answers.options?.trim() || "the options on the table";
  const concerns = answers.concerns?.trim() || "the concerns you named";

  return [
    {
      id: `chair-open-${Date.now().toString(36)}`,
      role: "chair",
      text: [
        `I'm ${name}, Chair of the Board.`,
        `We're examining: ${decision}.`,
        `It matters now because: ${why}.`,
        `I'll keep us focused on long-term direction, Board alignment, and a clear recommendation — without making the decision for you.`,
      ].join("\n\n"),
    },
    {
      id: `chair-summary-${Date.now().toString(36)}`,
      role: "chair",
      text: [
        "Chair summary (Thomas only at the table for now):",
        `Options under consideration: ${options}`,
        `Concerns already named: ${concerns}`,
        "What I protect: tomorrow's stability as well as today's opportunity.",
        "Recommendation: name the real decision in one sentence, then choose the option that best protects long-term strength — or pause for one missing fact before you commit.",
        "When more Directors join the Board, we'll bring additional independent viewpoints. For implementation details later, a Chamber specialist can help — after you decide.",
      ].join("\n\n"),
    },
    {
      id: `mod-${Date.now().toString(36)}`,
      role: "moderator",
      text: "This was a Chair review with Thomas Ellison. No other Directors were present. You can preserve this discussion or return to the Boardroom.",
    },
  ];
}

export function createBoardDirectorDiscussion(
  state: BoardDirectorDiscussionIntakeState,
): BoardDirectorDiscussionRecord {
  const answers = {
    decision: state.answers.decision ?? "",
    "why-now": state.answers["why-now"] ?? "",
    options: state.answers.options ?? "",
    concerns: state.answers.concerns ?? "",
  } satisfies Record<BoardDirectorIntakeStepId, string>;
  const now = new Date().toISOString();
  const title =
    answers.decision.trim().slice(0, 72) || "Board discussion with the Chair";
  return {
    id: `bdd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    createdAt: now,
    updatedAt: now,
    directorIds: state.directorIds.includes(THOMAS_ELLISON_DIRECTOR_ID)
      ? [...state.directorIds]
      : [THOMAS_ELLISON_DIRECTOR_ID, ...state.directorIds],
    answers,
    turns: buildChairOpeningAndSummary(answers),
    status: "ended",
  };
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
