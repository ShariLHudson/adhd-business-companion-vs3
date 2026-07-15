import {
  JOURNAL_GAZEBO_BACKGROUND_URL,
  JOURNAL_GAZEBO_RETURN_BACKGROUND_URL,
} from "./journalGazeboMedia";

const RETURN_VISIT_COUNT_KEY = "spark-journal-gazebo-return-visit-count";

export type JournalSessionScenes = {
  /** Always the Gazebo — every session opens here. */
  gazeboUrl: string;
  /** Return visits crossfade here after a quiet beat. */
  settledUrl: string | null;
  transitionAfterMs: number;
  /** Letter desk plate framing (Create / Write sit under the letter). */
  framing: "welcome-letter" | "return-desk";
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

function letterDeskScenes(): JournalSessionScenes {
  return {
    gazeboUrl: JOURNAL_GAZEBO_BACKGROUND_URL,
    settledUrl: null,
    transitionAfterMs: 0,
    framing: "welcome-letter",
  };
}

/** Canonical gazebo desk with welcome letter. */
export function journalGazeboStartUrl(): string {
  return JOURNAL_GAZEBO_BACKGROUND_URL;
}

/** Return visits — same letter desk; Create + Write are the actions. */
export function recordJournalReturnSession(): JournalSessionScenes {
  const count = safeGetCount() + 1;
  safeSetCount(count);
  return letterDeskScenes();
}

/** First visit — letter desk. */
export function resolveJournalWelcomeScenes(): JournalSessionScenes {
  return letterDeskScenes();
}

/** Creation / gift — letter-free gazebo desk so the stationery is not behind choices. */
export function resolveJournalWorkshopScenes(): JournalSessionScenes {
  return {
    gazeboUrl: JOURNAL_GAZEBO_RETURN_BACKGROUND_URL,
    settledUrl: null,
    transitionAfterMs: 0,
    framing: "return-desk",
  };
}

/** Gazebo rest — letter desk with Create + Write. */
export function resolveJournalGazeboRestScenes(): JournalSessionScenes {
  return letterDeskScenes();
}

export function resetJournalSceneRotation(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RETURN_VISIT_COUNT_KEY);
  } catch {
    /* ignore */
  }
}
