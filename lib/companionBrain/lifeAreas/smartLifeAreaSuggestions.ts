/**
 * Smart Life Areas™ — companion notices patterns and offers to organize.
 */

import type { SmartLifeAreaSuggestion } from "./types";

const SUPPRESS_KEY = "companion-smart-life-area-suppressed-v1";
const MIN_TASK_COUNT = 4;
const MIN_PHRASE_OVERLAP = 3;

function hasStorage(): boolean {
  return (
    typeof globalThis.window !== "undefined" &&
    typeof globalThis.localStorage !== "undefined"
  );
}

export function readSuppressedSmartLifeAreas(): string[] {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(SUPPRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

export function suppressSmartLifeArea(name: string): void {
  if (!hasStorage()) return;
  const key = name.trim().toLowerCase();
  if (!key) return;
  const prev = readSuppressedSmartLifeAreas();
  if (prev.includes(key)) return;
  try {
    localStorage.setItem(SUPPRESS_KEY, JSON.stringify([...prev, key]));
  } catch {
    /* storage unavailable */
  }
}

function tokenize(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function extractCandidatePhrases(titles: string[]): Map<string, string[]> {
  const phraseToTitles = new Map<string, string[]>();
  for (const title of titles) {
    const tokens = tokenize(title);
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      const list = phraseToTitles.get(bigram) ?? [];
      list.push(title);
      phraseToTitles.set(bigram, list);
    }
    for (const token of tokens) {
      if (token.length < 4) continue;
      const list = phraseToTitles.get(token) ?? [];
      list.push(title);
      phraseToTitles.set(token, list);
    }
  }
  return phraseToTitles;
}

function titleCasePhrase(phrase: string): string {
  return phrase
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Detect when the user has repeated work that could become a Smart Life Area.
 */
export function detectSmartLifeAreaSuggestions(
  items: { title: string; lifeAreaId?: string }[],
  suppressed = readSuppressedSmartLifeAreas(),
): SmartLifeAreaSuggestion[] {
  const active = items.filter((i) => i.title.trim());
  if (active.length < MIN_TASK_COUNT) return [];

  const unassigned = active.filter((i) => !i.lifeAreaId);
  const titles = unassigned.map((i) => i.title);
  if (titles.length < MIN_TASK_COUNT) return [];

  const phrases = extractCandidatePhrases(titles);
  const suggestions: SmartLifeAreaSuggestion[] = [];

  for (const [phrase, matchedTitles] of phrases) {
    if (matchedTitles.length < MIN_PHRASE_OVERLAP) continue;
    const proposedName = titleCasePhrase(phrase);
    const key = proposedName.toLowerCase();
    if (suppressed.includes(key)) continue;
    if (proposedName.length < 4) continue;

    suggestions.push({
      proposedName,
      relatedPhrases: [...new Set(matchedTitles)].slice(0, 6),
      taskCount: matchedTitles.length,
      confidence: Math.min(0.9, 0.5 + matchedTitles.length * 0.08),
    });
  }

  return suggestions
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 2);
}

export function resetSmartLifeAreaSuppressForTests(): void {
  if (!hasStorage()) return;
  localStorage.removeItem(SUPPRESS_KEY);
}
