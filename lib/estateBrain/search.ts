/**
 * Estate Brain — search and ranking (internal Spark reasoning).
 */

import {
  allEstateBrainEntries,
  estateBrainEntryById,
  estateBrainEntryBySpaceId,
} from "./knowledgeRegistry";
import type {
  EstateBrainSearchMatch,
  EstateBrainSearchResult,
  EstateKnowledgeEntry,
  EstateKnowledgeUserNeed,
} from "./types";
import type { EstateExperienceId } from "@/lib/estateExperiences/types";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9']+/)
    .filter((t) => t.length >= 2);
}

type ScoreAccumulator = {
  entry: EstateKnowledgeEntry;
  score: number;
  reasons: string[];
};

function bump(
  map: Map<string, ScoreAccumulator>,
  entry: EstateKnowledgeEntry,
  points: number,
  reason: string,
) {
  const existing = map.get(entry.id) ?? { entry, score: 0, reasons: [] };
  existing.score += points;
  if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
  map.set(entry.id, existing);
}

function scoreQueryAgainstEntry(
  query: string,
  entry: EstateKnowledgeEntry,
  map: Map<string, ScoreAccumulator>,
) {
  const q = normalize(query);
  const tokens = tokenize(query);

  for (const phrase of entry.triggers) {
    const p = normalize(phrase);
    if (q.includes(p)) {
      bump(map, entry, p.split(" ").length > 1 ? 28 : 18, `trigger: ${phrase}`);
    }
  }

  for (const alias of entry.aliases) {
    const a = normalize(alias);
    if (q.includes(a)) {
      bump(map, entry, 22, `alias: ${alias}`);
    }
  }

  for (const cap of entry.capabilities) {
    const c = normalize(cap);
    if (tokens.some((t) => c.includes(t) || t.length >= 4 && c.includes(t))) {
      bump(map, entry, 12, `capability: ${cap}`);
    }
    if (q.includes(c)) {
      bump(map, entry, 16, `capability phrase: ${cap}`);
    }
  }

  for (const tool of entry.tools) {
    const t = normalize(tool);
    if (q.includes(t)) {
      bump(map, entry, 14, `tool: ${tool}`);
    }
  }

  for (const activity of entry.suggestedActivities) {
    const a = normalize(activity);
    if (q.includes(a)) {
      bump(map, entry, 10, `activity: ${activity}`);
    }
  }

  if (normalize(entry.purpose).split(" ").some((w) => tokens.includes(w))) {
    bump(map, entry, 4, "purpose overlap");
  }
}

function finalize(map: Map<string, ScoreAccumulator>): EstateBrainSearchMatch[] {
  return [...map.values()]
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => ({ entry: m.entry, score: m.score, reasons: m.reasons }));
}

/**
 * General registry search — powers routing, discovery, and "where should I go?"
 */
export function searchEstateBrain(
  query: string,
  opts?: { limit?: number; experiencesOnly?: boolean },
): EstateBrainSearchResult {
  const limit = opts?.limit ?? 5;
  const entries = allEstateBrainEntries().filter(
    (e) => !opts?.experiencesOnly || e.kind === "experience",
  );
  const map = new Map<string, ScoreAccumulator>();
  for (const entry of entries) {
    scoreQueryAgainstEntry(query, entry, map);
  }
  const matches = finalize(map).slice(0, limit);
  return { query, matches, best: matches[0] ?? null };
}

/**
 * Search by situational need — "overwhelmed", "business", etc.
 */
export function searchEstateBrainByNeed(
  need: EstateKnowledgeUserNeed,
  opts?: { limit?: number },
): EstateBrainSearchMatch[] {
  const limit = opts?.limit ?? 6;
  return allEstateBrainEntries()
    .filter((e) => e.userNeeds?.includes(need))
    .map((entry) => ({
      entry,
      score: 20,
      reasons: [`user need: ${need}`],
    }))
    .slice(0, limit);
}

/**
 * Natural-language need discovery — parses common member questions.
 */
export function searchEstateBrainFromNaturalQuestion(
  question: string,
): EstateBrainSearchResult {
  const q = normalize(question);

  if (/\boverwhelm/.test(q)) {
    const matches = searchEstateBrainByNeed("overwhelmed", { limit: 8 });
    return { query: question, matches, best: matches[0] ?? null };
  }
  if (/\b(?:build|grow|run).*\bbusiness\b|\bbusiness\b.*\b(?:build|grow|help)\b/.test(q)) {
    const ids: EstateExperienceId[] = [
      "business",
      "momentum",
      "create",
      "think",
    ];
    const matches = ids
      .map((id) => {
        const entry = estateBrainEntryById(id);
        if (!entry) return null;
        return {
          entry,
          score: 25,
          reasons: ["business building discovery"],
        };
      })
      .filter((m): m is NonNullable<typeof m> => Boolean(m));
    return { query: question, matches, best: matches[0] ?? null };
  }
  if (/\bwhat can i do\b|\bwhat (?:is there|can we do) here\b/.test(q)) {
    return { query: question, matches: [], best: null };
  }
  if (/\bwhere should i go\b|\bwhere can i\b|\bhelp me find\b/.test(q)) {
    return searchEstateBrain(question.replace(/where should i go|where can i/gi, ""), {
      limit: 5,
    });
  }

  return searchEstateBrain(question, { limit: 5 });
}

/** Best experience for routing — prefers experience entries over spaces */
export function resolveExperienceFromBrain(
  userText: string,
): EstateExperienceId | null {
  const result = searchEstateBrain(userText, { limit: 3 });
  const best = result.best;
  if (!best || best.score < 14) return null;
  return best.entry.experienceId;
}

/** What can I do here? — capabilities at current space */
export function whatCanIDoHere(spaceId: string): EstateKnowledgeEntry | null {
  return estateBrainEntryBySpaceId(spaceId) ?? null;
}

/** Related spaces for cross-suggestion */
export function relatedSpacesFor(
  spaceOrEntryId: string,
): EstateKnowledgeEntry[] {
  const entry =
    estateBrainEntryById(spaceOrEntryId) ??
    estateBrainEntryBySpaceId(spaceOrEntryId);
  if (!entry) return [];
  return entry.relatedSpaceIds
    .map((id) => estateBrainEntryBySpaceId(id) ?? estateBrainEntryById(id))
    .filter((e): e is EstateKnowledgeEntry => Boolean(e));
}

/** Is there a better place? — rank alternatives for intent while at current space */
export function betterPlaceFor(
  currentSpaceId: string,
  intentText: string,
): EstateBrainSearchMatch[] {
  const current = estateBrainEntryBySpaceId(currentSpaceId);
  const result = searchEstateBrain(intentText, { limit: 6 });
  return result.matches.filter((m) => m.entry.spaceId !== current?.spaceId);
}

/** Arrival copy from brain */
export function defaultGreetingForSpace(spaceId: string): string | null {
  return estateBrainEntryBySpaceId(spaceId)?.defaultGreeting ?? null;
}

export function defaultGreetingForExperience(
  experienceId: EstateExperienceId,
): string | null {
  return estateBrainEntryById(experienceId)?.defaultGreeting ?? null;
}

/** Next suggestions after completion */
export function nextSuggestionsFor(
  spaceOrExperienceId: string,
): readonly string[] {
  const entry =
    estateBrainEntryById(spaceOrExperienceId) ??
    estateBrainEntryBySpaceId(spaceOrExperienceId);
  return entry?.nextSuggestions ?? [];
}

/** Build inverted trigger index for fast lookup */
export function buildEstateBrainTriggerIndex(): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  const add = (key: string, entryId: string) => {
    const k = normalize(key);
    if (!k) return;
    const set = index.get(k) ?? new Set<string>();
    set.add(entryId);
    index.set(k, set);
    for (const token of k.split(/\s+/)) {
      if (token.length >= 3) {
        const ts = index.get(token) ?? new Set<string>();
        ts.add(entryId);
        index.set(token, ts);
      }
    }
  };
  for (const entry of allEstateBrainEntries()) {
    for (const t of entry.triggers) add(t, entry.id);
    for (const a of entry.aliases) add(a, entry.id);
    for (const c of entry.capabilities) add(c, entry.id);
  }
  return index;
}
