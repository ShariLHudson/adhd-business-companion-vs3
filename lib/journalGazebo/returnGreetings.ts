import { JOURNAL_WELCOME_NOTE_SIGN } from "./hospitality";
import { getJournalGazeboVisitorName } from "./memberName";

const MORNING = [
  "Welcome back{name}. The Gazebo is especially peaceful this morning.",
  "Good morning{name}. I've prepared everything for you.",
  "Welcome back{name}. The light is gentle today — a good day to write.",
] as const;

const AFTERNOON = [
  "Welcome back{name}.",
  "It's nice to see you again{name}. Your journal is here whenever you're ready.",
  "Welcome back{name}. Take your time — your page is waiting.",
] as const;

const EVENING = [
  "Welcome back{name}. The Gazebo is quiet this evening.",
  "Good evening{name}. Take your time — there's nowhere you need to be.",
  "Welcome back{name}. The day can wait a little longer.",
] as const;

const ANYTIME = [
  "Welcome back{name}.",
  "I'm glad you're here{name}.",
  "Your page is waiting{name}, whenever you are.",
] as const;

const SANCTUARY_GREETINGS = [
  "This is your writing sanctuary{name}.",
  "Take your time{name} — there's nowhere you need to be.",
  "Your words matter here{name}.",
  "A quiet page can hold a lot{name}.",
  "I'm glad you came back to write{name}.",
  "Whatever wants to be said can find room here{name}.",
] as const;

const RETURN_QUESTIONS = [
  "What's one thing you'd like to remember from today?",
  "Is there something weighing on you that wants a page?",
  "What felt meaningful since you were last here?",
  "If you wrote just one honest line today, what would it be?",
  "What are you grateful for in this moment?",
  "Is there a dream, idea, or prayer waiting to be named?",
  "What would feel good to leave on the page before you go?",
  "Who or what has been on your heart lately?",
] as const;

export type JournalGazeboReturnNote = {
  greeting: string;
  question: string;
  sign: string;
};

function applyName(template: string, name: string): string {
  const suffix = name ? `, ${name}` : "";
  return template.replace("{name}", suffix);
}

function poolForHour(hour: number): readonly string[] {
  if (hour >= 5 && hour < 12) return MORNING;
  if (hour >= 12 && hour < 17) return AFTERNOON;
  if (hour >= 17 || hour < 5) return EVENING;
  return ANYTIME;
}

function pickFromPool(
  pool: readonly string[],
  exclude?: string | null,
): string {
  const name = getJournalGazeboVisitorName();
  const candidates =
    exclude && pool.length > 1
      ? pool.filter((line) => applyName(line, name) !== exclude)
      : pool;
  const line =
    candidates[Math.floor(Math.random() * candidates.length)] ??
    pool[0] ??
    ANYTIME[0]!;
  return applyName(line, name);
}

/** Return-visit greeting — varies by time of day; never the welcome envelope again. */
export function pickJournalGazeboReturnGreeting(): string {
  return pickJournalGazeboReturnNote().greeting;
}

/** Shari's welcome-back note on the return desk — greeting plus a gentle prompt. */
export function pickJournalGazeboReturnNote(
  excludeQuestion?: string | null,
): JournalGazeboReturnNote {
  const hour = new Date().getHours();
  const greetingPool = [...poolForHour(hour), ...SANCTUARY_GREETINGS];
  const greeting = pickFromPool(greetingPool);
  const questionCandidates =
    excludeQuestion && RETURN_QUESTIONS.length > 1
      ? RETURN_QUESTIONS.filter((q) => q !== excludeQuestion)
      : RETURN_QUESTIONS;
  const question =
    questionCandidates[
      Math.floor(Math.random() * questionCandidates.length)
    ] ?? RETURN_QUESTIONS[0]!;
  return {
    greeting,
    question,
    sign: JOURNAL_WELCOME_NOTE_SIGN,
  };
}

/** Rotating sanctuary messages on the gazebo table — personal and encouraging. */
export function pickJournalGazeboSanctuaryMessage(exclude?: string | null): string {
  const note = pickJournalGazeboReturnNote(exclude ?? undefined);
  return `${note.greeting} ${note.question}`;
}
