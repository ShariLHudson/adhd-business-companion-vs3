import { JOURNAL_WELCOME_NOTE_SIGN } from "./hospitality";
import { getJournalGazeboVisitorName } from "./memberName";

/** Desk-note lines — encouragement, reflection, writing invitation. */
const DESK_NOTES = [
  "I'm glad you came back. Write whatever wants a page today.",
  "A quiet page can hold a lot. Take your time.",
  "What's one thing you'd like to remember from today?",
  "Your words matter here — even one honest line is enough.",
  "Is there something weighing on you that wants a page?",
  "If you wrote just one true sentence, what would it be?",
  "What felt meaningful since you were last here?",
  "This is your writing sanctuary. Nowhere you need to be.",
  "What are you grateful for in this moment?",
  "Is there a dream, idea, or prayer waiting to be named?",
  "What would feel good to leave on the page before you go?",
  "Who or what has been on your heart lately?",
  "The Gazebo is quiet. Your journal is ready when you are.",
  "Begin where you are. The page will meet you there.",
] as const;

const LAST_DESK_NOTE_KEY = "companion-journal-gazebo-last-desk-note-v1";

export type JournalGazeboReturnNote = {
  greeting: string;
  question: string;
  sign: string;
  /** Full card body — used for rotation / exclusion. */
  body: string;
};

function applyName(template: string, name: string): string {
  const suffix = name ? `, ${name}` : "";
  return template.replace("{name}", suffix);
}

function readLastDeskNoteBody(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(LAST_DESK_NOTE_KEY);
  } catch {
    return null;
  }
}

function writeLastDeskNoteBody(body: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LAST_DESK_NOTE_KEY, body);
  } catch {
    /* ignore quota */
  }
}

function pickDeskLine(exclude?: string | null): string {
  const name = getJournalGazeboVisitorName();
  const pool = DESK_NOTES.map((line) =>
    line.includes("{name}") ? applyName(line, name) : line,
  );
  const candidates =
    exclude && pool.length > 1 ? pool.filter((line) => line !== exclude) : pool;
  return (
    candidates[Math.floor(Math.random() * candidates.length)] ??
    pool[0] ??
    DESK_NOTES[0]!
  );
}

function toNote(body: string): JournalGazeboReturnNote {
  return {
    greeting: body,
    question: "",
    sign: JOURNAL_WELCOME_NOTE_SIGN,
    body,
  };
}

/** Return-visit greeting — never the welcome envelope again. */
export function pickJournalGazeboReturnGreeting(): string {
  return pickJournalGazeboReturnNote().greeting;
}

/**
 * Shari's desk note for a return visit.
 * Content rotates each visit (excludes the previous note when possible).
 */
export function pickJournalGazeboReturnNote(
  excludeBody?: string | null,
): JournalGazeboReturnNote {
  const exclude = excludeBody ?? readLastDeskNoteBody();
  const body = pickDeskLine(exclude);
  writeLastDeskNoteBody(body);
  return toNote(body);
}

/** Rotating sanctuary messages on the gazebo table — personal and encouraging. */
export function pickJournalGazeboSanctuaryMessage(exclude?: string | null): string {
  return pickJournalGazeboReturnNote(exclude ?? undefined).body;
}
