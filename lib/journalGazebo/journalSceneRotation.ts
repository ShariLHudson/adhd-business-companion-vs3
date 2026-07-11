import {
  GAZEBO_JOURNAL_BACKGROUND_URL,
  JOURNAL_WELCOME_PLATE_URL,
} from "./journalGazeboMedia";

const RETURN_VISIT_COUNT_KEY = "spark-journal-gazebo-return-visit-count";

export type JournalSessionScenes = {
  /** Always the Gazebo — every session opens here. */
  gazeboUrl: string;
  /** Return visits crossfade here after a quiet beat. */
  settledUrl: string | null;
  transitionAfterMs: number;
};

function safeGetCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(RETURN_VISIT_COUNT_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function safeSetCount(n: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RETURN_VISIT_COUNT_KEY, String(n));
  } catch {
    /* ignore */
  }
}

/** Canonical gazebo vista for every journal session. */
export function journalGazeboStartUrl(): string {
  return GAZEBO_JOURNAL_BACKGROUND_URL;
}

/**
 * Return visits — always the clean gazebo desk (no welcome letter on the plate).
 */
export function recordJournalReturnSession(): JournalSessionScenes {
  const count = safeGetCount() + 1;
  safeSetCount(count);

  return {
    gazeboUrl: journalGazeboStartUrl(),
    settledUrl: null,
    transitionAfterMs: 0,
  };
}

export function resolveJournalWelcomeScenes(): JournalSessionScenes {
  return {
    gazeboUrl: JOURNAL_WELCOME_PLATE_URL,
    settledUrl: null,
    transitionAfterMs: 0,
  };
}

/** First journal creation — full gazebo vista behind the design studio and gift. */
export function resolveJournalWorkshopScenes(): JournalSessionScenes {
  return {
    gazeboUrl: journalGazeboStartUrl(),
    settledUrl: null,
    transitionAfterMs: 0,
  };
}

/** Full gazebo vista — member steps back from the open book to the garden scene. */
export function resolveJournalGazeboRestScenes(): JournalSessionScenes {
  return {
    gazeboUrl: journalGazeboStartUrl(),
    settledUrl: null,
    transitionAfterMs: 0,
  };
}

export function resetJournalSceneRotation(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RETURN_VISIT_COUNT_KEY);
  } catch {
    /* ignore */
  }
}
