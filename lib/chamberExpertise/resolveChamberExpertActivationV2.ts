/**
 * Chamber Expert Activation Composition Function — V2-2.
 *
 * A parallel, additive function alongside resolveChamberExpertActivation.ts
 * (V1) — NOT a replacement. Called only when isChamberActivationV2Enabled()
 * is true (see chamberExpertiseHintForChat.ts). Implements exactly the
 * decision procedure finalized in
 * docs/estate/CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md §2, corrected per
 * docs/estate/CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md, and the
 * behavioral contract in docs/estate/CHAMBER_ACTIVATION_DECISION_TABLE.md.
 *
 * What's new versus V1:
 * 1. Corrected eligibility: Tier-1 evidence (a multi-word topic/outcome
 *    phrase match, or a legacy expert ID match) OR two-or-more Tier-2
 *    matches (intent match, single-word topic keyword match) — NOT V1's
 *    "any 2 signal groups", which let estate category (Tier 3) combine
 *    with a single Tier-2 match to produce false eligibility.
 * 2. `outcomeSignals` — a second, deliverable/outcome-shaped vocabulary,
 *    scored identically to a topic phrase match (Tier 1).
 * 3. Generalist tiebreak — "specialist" beats "generalist" only when two
 *    experts are otherwise tied; never a scoring multiplier.
 * 4. `contested` and `co-primary` confidence states, replacing V1's
 *    silent "pick the top score" behavior for genuinely ambiguous or
 *    genuinely dual-relevant requests.
 * 5. Conjunction-aware structural co-primary detection — the only way to
 *    reliably catch compound "X and Y" requests where neither half's
 *    whole-text score alone clears the strong-evidence bar.
 * 6. An "insufficient evidence" clarifying question, built from weak
 *    candidates' founderPlainLanguagePhrase — replacing V1's silent
 *    `primary: null` with something Shari can actually ask.
 */

import {
  CHAMBER_EXPERT_REGISTRY,
  chamberExpertById,
  type ChamberExpertRegistryEntryWithCategory,
} from "./chamberExpertRegistry";
import { resolveLegacyExpertIds } from "./legacyExpertAliasMap";
import { computeTopicMatch, phraseMatches, significantWords, splitOnConjunctions, tokenize } from "./textMatch";
import type {
  ChamberExpertActivation,
  ChamberExpertActivationInput,
  ChamberExpertId,
  ChamberExpertSignalResult,
} from "./types";

const SCORE = {
  topicPhrase: 35,
  topicKeywordOnly: 15,
  bothTopicHitBonus: 10,
  outcomeMatch: 35,
  intent: 25,
  estateCategory: 20,
  legacyExpertId: 40,
} as const;

/** CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md §2.1 — calibrated against observed scores, not arbitrary. */
const STRONG_EVIDENCE_THRESHOLD = 70;
const CONTESTED_MARGIN_RATIO = 0.15;

/**
 * CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md §4/§8 — one genuine Tier-1
 * phrase (topic or outcome) match's worth of score. Explicitly a
 * placeholder pending further corpus calibration, not a load-bearing
 * precision constant.
 */
const SUB_CLAUSE_THRESHOLD = 35;

const MAX_SUPPORTING = 3;
const MAX_POSSIBLE = 2;
/** Decision table mechanism note — up to 3 plain-language options in an insufficient-evidence question. */
const MAX_CLARIFYING_CANDIDATES = 3;

function computeOutcomeMatch(
  entry: ChamberExpertRegistryEntryWithCategory,
  textWords: Set<string>,
): boolean {
  const outcomeSignals = entry.outcomeSignals ?? [];
  return outcomeSignals.some((signal) => {
    const words = significantWords(signal);
    // Outcome signals are, by design, always multi-word (a phrase naming a
    // result) — a single-word "outcome" would just be a topic keyword.
    return words.length >= 2 && phraseMatches(signal, textWords);
  });
}

function computeSignalV2(
  entry: ChamberExpertRegistryEntryWithCategory,
  input: ChamberExpertActivationInput,
  textWords: Set<string>,
  resolvedLegacyIds: readonly ChamberExpertId[],
): ChamberExpertSignalResult {
  const { phraseMatch: topicPhraseMatch, keywordMatch: topicKeywordMatch } = computeTopicMatch(
    [...entry.activationSignals, ...entry.expertiseAreas],
    textWords,
  );
  const outcomeMatch = computeOutcomeMatch(entry, textWords);
  const topicMatch = topicPhraseMatch || topicKeywordMatch || outcomeMatch;

  const intentMatch = Boolean(
    input.intentCategory && entry.intentAffinities.includes(input.intentCategory),
  );
  const estateCategoryMatch = Boolean(
    input.estateCategory && entry.estateCategories.includes(input.estateCategory),
  );
  const estateExpertIdMatch = resolvedLegacyIds.includes(entry.id);

  let score = 0;
  if (topicPhraseMatch) score += SCORE.topicPhrase;
  else if (topicKeywordMatch) score += SCORE.topicKeywordOnly;
  if (topicPhraseMatch && topicKeywordMatch) score += SCORE.bothTopicHitBonus;
  if (outcomeMatch) score += SCORE.outcomeMatch;
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
    topicPhraseMatch,
    outcomeMatch,
  };
}

/**
 * Corrected eligibility (§6 of the outcome-layer analysis): Tier-1
 * evidence present (a multi-word topic/outcome phrase, or a legacy expert
 * ID match), OR two-or-more Tier-2 matches (intent match, single-word
 * topic keyword). Estate category (Tier 3) never counts toward
 * eligibility alone or paired with only one Tier-2 match.
 */
function isEligibleV2(signal: ChamberExpertSignalResult): boolean {
  const tier1Present = Boolean(signal.topicPhraseMatch) || Boolean(signal.outcomeMatch) || signal.estateExpertIdMatch;
  if (tier1Present) return true;
  const topicKeywordOnly = signal.topicMatch && !signal.topicPhraseMatch && !signal.outcomeMatch;
  const tier2Count = (signal.intentMatch ? 1 : 0) + (topicKeywordOnly ? 1 : 0);
  return tier2Count >= 2;
}

function tier1EvidenceCount(signal: ChamberExpertSignalResult): number {
  return (signal.topicPhraseMatch ? 1 : 0) + (signal.outcomeMatch ? 1 : 0) + (signal.estateExpertIdMatch ? 1 : 0);
}

/**
 * Exact tiebreak order per CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md §2.3,
 * with the generalist-deprioritization step inserted per
 * CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md §5.2. Array order is never
 * an input — the id-alphabetical fallback at the end only fires when
 * every other criterion is truly, fully tied, and exists purely for
 * deterministic output, not as a relevance judgment.
 */
function tiebreak(
  a: ChamberExpertSignalResult,
  b: ChamberExpertSignalResult,
): ChamberExpertId {
  if (a.estateExpertIdMatch !== b.estateExpertIdMatch) {
    return a.estateExpertIdMatch ? a.id : b.id;
  }
  const tier1A = tier1EvidenceCount(a);
  const tier1B = tier1EvidenceCount(b);
  if (tier1A !== tier1B) return tier1A > tier1B ? a.id : b.id;

  const categoryA = chamberExpertById(a.id)?.expertCategory ?? "specialist";
  const categoryB = chamberExpertById(b.id)?.expertCategory ?? "specialist";
  if (categoryA !== categoryB) return categoryA === "specialist" ? a.id : b.id;

  if (a.signalGroupsMatched !== b.signalGroupsMatched) {
    return a.signalGroupsMatched > b.signalGroupsMatched ? a.id : b.id;
  }
  if (a.score !== b.score) return a.score > b.score ? a.id : b.id;
  return a.id < b.id ? a.id : b.id;
}

function filterRelatedByRelevance(
  ids: readonly ChamberExpertId[],
  signalsById: ReadonlyMap<ChamberExpertId, ChamberExpertSignalResult>,
): ChamberExpertId[] {
  const withSignal = ids.filter((id) => (signalsById.get(id)?.score ?? 0) > 0);
  return withSignal.length > 0 ? withSignal : [...ids];
}

function buildSupportingAndPossible(
  primaryId: ChamberExpertId,
  signalsById: ReadonlyMap<ChamberExpertId, ChamberExpertSignalResult>,
): { supporting: ChamberExpertId[]; possible: ChamberExpertId[] } {
  const primaryEntry = chamberExpertById(primaryId);
  if (!primaryEntry) return { supporting: [], possible: [] };
  return {
    supporting: filterRelatedByRelevance(primaryEntry.supportingRelationships, signalsById).slice(
      0,
      MAX_SUPPORTING,
    ),
    possible: filterRelatedByRelevance(primaryEntry.possibleRelationships, signalsById).slice(0, MAX_POSSIBLE),
  };
}

/**
 * Conjunction-aware structural co-primary detection.
 * CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md §4: split on coordinating
 * conjunctions, score each clause independently (topic + outcome only —
 * intent/estate are whole-request signals and don't split), and treat two
 * clauses whose best-matching experts DIFFER (and each clears
 * SUB_CLAUSE_THRESHOLD) as a structural co-primary signal. The "differ"
 * requirement is the false-positive guard — same-domain compound
 * sentences ("write an email and send it") never trigger this.
 */
function detectStructuralCoPrimary(userText: string): readonly [ChamberExpertId, ChamberExpertId] | null {
  const clauses = splitOnConjunctions(userText);
  if (!clauses) return null;

  type ClauseWinner = { id: ChamberExpertId; score: number };
  const winners: ClauseWinner[] = [];

  for (const clause of clauses) {
    const clauseWords = tokenize(clause);
    let best: ClauseWinner | null = null;
    for (const entry of CHAMBER_EXPERT_REGISTRY) {
      const { phraseMatch } = computeTopicMatch(
        [...entry.activationSignals, ...entry.expertiseAreas],
        clauseWords,
      );
      const outcomeMatch = computeOutcomeMatch(entry, clauseWords);
      let clauseScore = 0;
      if (phraseMatch) clauseScore += SCORE.topicPhrase;
      if (outcomeMatch) clauseScore += SCORE.outcomeMatch;
      if (clauseScore < SUB_CLAUSE_THRESHOLD) continue;
      if (!best || clauseScore > best.score || (clauseScore === best.score && entry.id < best.id)) {
        best = { id: entry.id, score: clauseScore };
      }
    }
    if (best) winners.push(best);
  }

  const distinctById = new Map<ChamberExpertId, number>();
  for (const w of winners) {
    const existing = distinctById.get(w.id);
    if (existing === undefined || w.score > existing) distinctById.set(w.id, w.score);
  }
  if (distinctById.size < 2) return null;

  const ranked = [...distinctById.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0] < b[0] ? -1 : 1;
  });
  return [ranked[0][0], ranked[1][0]];
}

/**
 * Decision-table mechanism note: builds one plain-language clarifying
 * question from up to MAX_CLARIFYING_CANDIDATES weakly-scoring
 * candidates' founderPlainLanguagePhrase — never an expert name, never
 * more than one question. Returns null when there's nothing to build
 * from (no candidate has any real signal at all — an ordinary chat
 * turn, not a business request needing this at all).
 */
function buildClarifyingQuestion(candidateIds: readonly ChamberExpertId[]): string | null {
  const phrases = candidateIds
    .map((id) => chamberExpertById(id)?.founderPlainLanguagePhrase)
    .filter((p): p is string => Boolean(p?.trim()));
  if (phrases.length === 0) return null;
  if (phrases.length === 1) {
    return `This might be about ${phrases[0]} — or is it something else entirely?`;
  }
  if (phrases.length === 2) {
    return `What part of this feels most important right now — ${phrases[0]} or ${phrases[1]}?`;
  }
  const last = phrases[phrases.length - 1];
  const rest = phrases.slice(0, -1);
  return `What part of this feels most important right now — ${rest.join(", ")}, or ${last}?`;
}

/**
 * V2-2 resolution — see module doc comment for what's new versus V1.
 * Never activates a primary from a single keyword, same anti-keyword-only
 * guarantee as V1, now enforced by a corrected eligibility rule.
 */
export function resolveChamberExpertActivationV2(
  input: ChamberExpertActivationInput,
): ChamberExpertActivation {
  const userText = input.userText ?? "";
  const textWords = tokenize(userText);
  const resolvedLegacyIds = resolveLegacyExpertIds(input.legacyExpertIds);

  const signals = CHAMBER_EXPERT_REGISTRY.map((entry) =>
    computeSignalV2(entry, input, textWords, resolvedLegacyIds),
  );
  const signalsById = new Map(signals.map((s) => [s.id, s] as const));

  const eligible = signals.filter(isEligibleV2).sort((a, b) => b.score - a.score);

  if (eligible.length === 0) {
    const weakHints = signals
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_CLARIFYING_CANDIDATES)
      .map((s) => s.id);
    return {
      primary: null,
      supporting: [],
      possible: weakHints.slice(0, MAX_POSSIBLE),
      confidence: "low",
      signals,
      coPrimary: null,
      runnerUp: null,
      clarifyingQuestion: buildClarifyingQuestion(weakHints),
    };
  }

  const top = eligible[0];
  const runnerUp = eligible[1] ?? null;
  const marginRatio = runnerUp ? (top.score - runnerUp.score) / Math.max(top.score, 1) : 1.0;

  // 1. Magnitude co-primary: both strong, close, genuinely different domains.
  if (
    runnerUp &&
    marginRatio < CONTESTED_MARGIN_RATIO &&
    top.score >= STRONG_EVIDENCE_THRESHOLD &&
    runnerUp.score >= STRONG_EVIDENCE_THRESHOLD &&
    (chamberExpertById(top.id)?.category ?? top.id) !== (chamberExpertById(runnerUp.id)?.category ?? runnerUp.id)
  ) {
    const { supporting, possible } = buildSupportingAndPossible(top.id, signalsById);
    return {
      primary: top.id,
      supporting,
      possible,
      confidence: "co-primary",
      signals,
      coPrimary: [top.id, runnerUp.id],
      runnerUp: null,
      clarifyingQuestion: null,
    };
  }

  // 2. Structural co-primary: compound "X and Y" request, either half of
  // which may not clear STRONG_EVIDENCE_THRESHOLD alone.
  const structural = detectStructuralCoPrimary(userText);
  if (structural) {
    const [a, b] = structural;
    const { supporting, possible } = buildSupportingAndPossible(a, signalsById);
    return {
      primary: a,
      supporting,
      possible,
      confidence: "co-primary",
      signals,
      coPrimary: [a, b],
      runnerUp: null,
      clarifyingQuestion: null,
    };
  }

  // 3. Contested: close race, but not both strong — genuine ambiguity, not dual strength.
  if (runnerUp && marginRatio < CONTESTED_MARGIN_RATIO) {
    const primaryId = tiebreak(top, runnerUp);
    const { supporting, possible } = buildSupportingAndPossible(primaryId, signalsById);
    return {
      primary: primaryId,
      supporting,
      possible,
      confidence: "contested",
      signals,
      coPrimary: null,
      runnerUp: runnerUp.id,
      clarifyingQuestion: null,
    };
  }

  // 4. Clear separation.
  const confidence = top.score >= STRONG_EVIDENCE_THRESHOLD ? "high" : "medium";
  const { supporting, possible } = buildSupportingAndPossible(top.id, signalsById);
  return {
    primary: top.id,
    supporting,
    possible,
    confidence,
    signals,
    coPrimary: null,
    runnerUp: null,
    clarifyingQuestion: null,
  };
}
