/**
 * Weekly Growth reflection — one small question at a time.
 */

import { weekKeyForDate } from "./weeklyWins";
import { createJourneyEntry } from "./myJourneyStore";

const STORAGE_KEY = "companion-growth-reflection-v1";

export const GROWTH_REFLECTION_UPDATED_EVENT = "companion-growth-reflection-updated";

const REFLECTION_QUESTIONS = [
  "What are you most proud of this week?",
  "What moved forward?",
  "What surprised you?",
  "What did you learn?",
] as const;

export type GrowthReflectionEntry = {
  weekKey: string;
  question: string;
  answer: string;
  savedToJourney: boolean;
  updatedAt: string;
};

function readAll(): GrowthReflectionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: GrowthReflectionEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(GROWTH_REFLECTION_UPDATED_EVENT));
  } catch {
    /* noop */
  }
}

export function getReflectionQuestionForWeek(
  weekKey = weekKeyForDate(),
): string {
  const index =
    Math.abs(
      weekKey.split("-").reduce((sum, part) => sum + Number(part), 0),
    ) % REFLECTION_QUESTIONS.length;
  return REFLECTION_QUESTIONS[index];
}

export function getWeeklyReflection(
  weekKey = weekKeyForDate(),
): GrowthReflectionEntry | null {
  return readAll().find((e) => e.weekKey === weekKey) ?? null;
}

export function saveWeeklyReflection(
  answer: string,
  weekKey = weekKeyForDate(),
): GrowthReflectionEntry {
  const trimmed = answer.trim();
  const question = getReflectionQuestionForWeek(weekKey);
  const existing = getWeeklyReflection(weekKey);
  const entry: GrowthReflectionEntry = {
    weekKey,
    question,
    answer: trimmed,
    savedToJourney: existing?.savedToJourney ?? false,
    updatedAt: new Date().toISOString(),
  };
  const rest = readAll().filter((e) => e.weekKey !== weekKey);
  writeAll([entry, ...rest]);
  return entry;
}

export function getAllReflectionEntries(): GrowthReflectionEntry[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function saveReflectionToJourney(weekKey = weekKeyForDate()): void {
  const reflection = getWeeklyReflection(weekKey);
  if (!reflection?.answer.trim() || reflection.savedToJourney) return;
  createJourneyEntry({
    title: reflection.question.replace(/\?$/, ""),
    category: "Lessons Learned",
    chapter: "Current Season",
    date: new Date().toISOString().slice(0, 10),
    whatHappened: reflection.answer,
    whatDidILearn: reflection.answer,
    howDidThisShapeMe: "",
    whatWisdom: "",
    attachments: [],
  });
  const updated: GrowthReflectionEntry = {
    ...reflection,
    savedToJourney: true,
    updatedAt: new Date().toISOString(),
  };
  const rest = readAll().filter((e) => e.weekKey !== weekKey);
  writeAll([updated, ...rest]);
}
