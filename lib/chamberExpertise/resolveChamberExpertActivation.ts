/**
 * Chamber Expert Activation Composition Function — Phase B.
 *
 * Fuses multiple, already-computed Work Recognition signals to decide
 * which Chamber Expert Intelligence Profile(s) — if any — would help Shari
 * think through a request. Not called from the chat runtime yet (Phase C).
 *
 * Signals fused:
 * - userText topic/vocabulary match against each expert's registry entry
 * - intentCategory (Work Recognition — lib/intentRoutingIntelligence.ts)
 * - estateCategory (Estate Intelligence Route — lib/estateBrain/)
 * - legacyExpertIds (already-resolved Estate Brain / Phase 33 expert IDs)
 *
 * Anti-keyword-only rule (required by the task): a topic/vocabulary match
 * on userText ALONE is never sufficient to name a primary expert. Primary
 * selection requires at least two independent signal groups to agree —
 * see SIGNAL_GROUPS below and docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md §5.2.
 *
 * Supporting/possible tiers surface the curated collaboration cast already
 * authored in each profile's §11 Cross-Chamber Collaboration section
 * (chamberExpertRegistry.ts `supportingRelationships` / `possibleRelationships`),
 * lightly filtered to drop entries with zero signal for this specific request.
 */

import {
  CHAMBER_EXPERT_REGISTRY,
  chamberExpertById,
  type ChamberExpertRegistryEntryWithCategory,
} from "./chamberExpertRegistry";
import { resolveLegacyExpertIds } from "./legacyExpertAliasMap";
import type {
  ChamberExpertActivation,
  ChamberExpertActivationInput,
  ChamberExpertId,
  ChamberExpertSignalResult,
} from "./types";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "for",
  "and",
  "or",
  "my",
  "our",
  "your",
  "is",
  "are",
  "i",
  "we",
  "you",
  "it",
  "this",
  "that",
  "need",
  "want",
  "on",
  "in",
  "with",
  "do",
  "does",
  "help",
  "me",
  "just",
  "please",
  "can",
  "could",
]);

const SCORE = {
  topicPhrase: 35,
  topicKeywordOnly: 15,
  bothTopicHitBonus: 10,
  intent: 25,
  estateCategory: 20,
  legacyExpertId: 40,
} as const;

/** Minimum score AND minimum distinct signal groups required to become primary. */
const PRIMARY_MIN_SIGNAL_GROUPS = 2;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): Set<string> {
  return new Set(normalize(text).split(" ").filter(Boolean));
}

function significantWords(phrase: string): string[] {
  return normalize(phrase)
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w));
}

/** A phrase matches when every one of its significant words appears in the text. */
function phraseMatches(phrase: string, textWords: Set<string>): boolean {
  const words = significantWords(phrase);
  if (words.length === 0) return false;
  return words.every((w) => textWords.has(w));
}

type TopicMatchResult = {
  phraseMatch: boolean;
  keywordMatch: boolean;
};

function computeTopicMatch(
  entry: ChamberExpertRegistryEntryWithCategory,
  textWords: Set<string>,
): TopicMatchResult {
  let phraseMatch = false;
  let keywordMatch = false;

  for (const signal of [...entry.activationSignals, ...entry.expertiseAreas]) {
    const words = significantWords(signal);
    if (words.length === 0) continue;
    if (!phraseMatches(signal, textWords)) continue;
    if (words.length >= 2) {
      phraseMatch = true;
    } else {
      keywordMatch = true;
    }
  }

  return { phraseMatch, keywordMatch };
}

function computeSignal(
  entry: ChamberExpertRegistryEntryWithCategory,
  input: ChamberExpertActivationInput,
  textWords: Set<string>,
  resolvedLegacyIds: readonly ChamberExpertId[],
): ChamberExpertSignalResult {
  const { phraseMatch, keywordMatch } = computeTopicMatch(entry, textWords);
  const topicMatch = phraseMatch || keywordMatch;

  const intentMatch = Boolean(
    input.intentCategory && entry.intentAffinities.includes(input.intentCategory),
  );
  const estateCategoryMatch = Boolean(
    input.estateCategory && entry.estateCategories.includes(input.estateCategory),
  );
  const estateExpertIdMatch = resolvedLegacyIds.includes(entry.id);

  let score = 0;
  if (phraseMatch) score += SCORE.topicPhrase;
  else if (keywordMatch) score += SCORE.topicKeywordOnly;
  if (phraseMatch && keywordMatch) score += SCORE.bothTopicHitBonus;
  if (intentMatch) score += SCORE.intent;
  if (estateCategoryMatch) score += SCORE.estateCategory;
  if (estateExpertIdMatch) score += SCORE.legacyExpertId;

  const signalGroupsMatched = [topicMatch, intentMatch, estateCategoryMatch, estateExpertIdMatch].filter(
    Boolean,
  ).length;

  return {
    id: entry.id,
    score,
    signalGroupsMatched,
    topicMatch,
    intentMatch,
    estateCategoryMatch,
    estateExpertIdMatch,
  };
}

function filterRelatedByRelevance(
  ids: readonly ChamberExpertId[],
  signalsById: ReadonlyMap<ChamberExpertId, ChamberExpertSignalResult>,
): ChamberExpertId[] {
  const withSignal = ids.filter((id) => (signalsById.get(id)?.score ?? 0) > 0);
  // Safety net: if a curated collaborator has zero measurable signal for this
  // specific request, still surface the top of the curated list rather than
  // returning nothing — the collaboration relationship is domain-stable,
  // not solely derived from this one message.
  return withSignal.length > 0 ? withSignal : [...ids];
}

/**
 * Resolve which Chamber Expert Intelligence Profile(s) would help Shari
 * think through this request, fusing multiple Work Recognition signals.
 *
 * Never activates a primary or supporting expert from a single keyword —
 * see PRIMARY_MIN_SIGNAL_GROUPS and the module doc comment above.
 */
export function resolveChamberExpertActivation(
  input: ChamberExpertActivationInput,
): ChamberExpertActivation {
  const textWords = tokenize(input.userText ?? "");
  const resolvedLegacyIds = resolveLegacyExpertIds(input.legacyExpertIds);

  const signals = CHAMBER_EXPERT_REGISTRY.map((entry) =>
    computeSignal(entry, input, textWords, resolvedLegacyIds),
  );
  const signalsById = new Map(signals.map((s) => [s.id, s] as const));

  const eligible = signals
    .filter((s) => s.signalGroupsMatched >= PRIMARY_MIN_SIGNAL_GROUPS)
    .sort((a, b) => b.score - a.score);

  const primarySignal = eligible[0] ?? null;

  if (!primarySignal) {
    // No expert reached multi-signal confidence — do not force an
    // activation. Offer only very weak, single-signal hints as "possible".
    const weakHints = signals
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((s) => s.id);
    return {
      primary: null,
      supporting: [],
      possible: weakHints,
      confidence: "low",
      signals,
    };
  }

  const primaryEntry = chamberExpertById(primarySignal.id);
  const supporting = primaryEntry
    ? filterRelatedByRelevance(primaryEntry.supportingRelationships, signalsById).slice(0, 2)
    : [];
  const possible = primaryEntry
    ? filterRelatedByRelevance(primaryEntry.possibleRelationships, signalsById).slice(0, 2)
    : [];

  const confidence = primarySignal.signalGroupsMatched >= 3 ? "high" : "medium";

  return {
    primary: primarySignal.id,
    supporting,
    possible,
    confidence,
    signals,
  };
}
