/**
 * Category Intelligence — classify where a task belongs in the user's life.
 * Pure reasoning service — no UI, no workspace imports.
 */

import type {
  ClassifyLifeAreaInput,
  LifeArea,
  LifeAreaClassificationResult,
  LifeAreaCorrection,
} from "./lifeAreas/types";
import { LIFE_AREA_AUTO_APPLY_THRESHOLD } from "./lifeAreas/types";
import { SYSTEM_LIFE_AREA_KEYWORDS } from "./lifeAreas/systemLifeAreas";
import { normalizeLifeAreaPhrase } from "./lifeAreas/lifeAreaLearningStore";

type ScoredArea = {
  lifeAreaId: string;
  name: string;
  score: number;
  signals: string[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseMatches(text: string, phrase: string): boolean {
  if (phrase.includes(" ")) {
    return text.includes(phrase);
  }
  return new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "i").test(text);
}

function scoreFromCorrections(
  normalized: string,
  corrections: LifeAreaCorrection[],
  lifeAreas: LifeArea[],
): ScoredArea[] {
  const results: ScoredArea[] = [];
  for (const correction of corrections) {
    const area = lifeAreas.find((a) => a.id === correction.lifeAreaId);
    if (!area) continue;
    const exact = normalized === correction.phrase;
    const contains =
      normalized.includes(correction.phrase) ||
      correction.phrase.includes(normalized);
    if (!exact && !contains) continue;
    const boost = exact
      ? 0.9 + Math.min(0.08, correction.timesConfirmed * 0.02)
      : 0.65 + correction.confidence * 0.15;
    results.push({
      lifeAreaId: area.id,
      name: area.name,
      score: Math.min(0.98, boost),
      signals: [
        exact
          ? `remembered: "${correction.phrase}"`
          : `similar to: "${correction.phrase}"`,
      ],
    });
  }
  return results;
}

function scoreFromKeywords(
  normalized: string,
  lifeAreas: LifeArea[],
): ScoredArea[] {
  const results: ScoredArea[] = [];
  for (const area of lifeAreas) {
    const keywords = SYSTEM_LIFE_AREA_KEYWORDS[area.id] ?? [];
    const nameWords = area.name.toLowerCase().split(/\s+/);
    const signals: string[] = [];
    let score = 0;

    for (const kw of keywords) {
      if (phraseMatches(normalized, kw)) {
        score += kw.includes(" ") ? 0.35 : 0.22;
        signals.push(`keyword: ${kw}`);
      }
    }
    for (const word of nameWords) {
      if (word.length > 3 && phraseMatches(normalized, word)) {
        score += 0.18;
        signals.push(`life area name: ${word}`);
      }
    }
    if (area.kind === "user" && phraseMatches(normalized, area.name.toLowerCase())) {
      score += 0.55;
      signals.push(`user life area: ${area.name}`);
    }
    if (score > 0) {
      results.push({
        lifeAreaId: area.id,
        name: area.name,
        score: Math.min(0.92, score),
        signals,
      });
    }
  }
  return results;
}

/** Relationship networking heuristics — e.g. "Connect Caleb on LinkedIn". */
function scoreRelationshipNetworking(normalized: string): ScoredArea | null {
  const hasLinkedIn = /\blinkedin\b/.test(normalized);
  const hasConnect =
    /\b(connect|reach out|message|dm|introduce)\b/.test(normalized);
  const hasPersonName =
    /\b(connect|message|call|email|text)\s+[a-z]{2,}\b/.test(normalized);

  if (hasLinkedIn && (hasConnect || hasPersonName)) {
    return {
      lifeAreaId: "sys:relationships-networking",
      name: "Relationships & Networking",
      score: 0.88,
      signals: ["networking: linkedin + connect"],
    };
  }
  if (hasLinkedIn) {
    return {
      lifeAreaId: "sys:relationships-networking",
      name: "Relationships & Networking",
      score: 0.78,
      signals: ["networking: linkedin"],
    };
  }
  return null;
}

function scoreFromContext(
  normalized: string,
  input: ClassifyLifeAreaInput,
  lifeAreas: LifeArea[],
): ScoredArea[] {
  const results: ScoredArea[] = [];
  const contacts = input.contacts ?? [];
  const projects = input.projects ?? [];
  const companies = input.companies ?? [];

  for (const contact of contacts) {
    if (contact && phraseMatches(normalized, contact.toLowerCase())) {
      const rel = lifeAreas.find((a) => a.id === "sys:relationships-networking");
      if (rel) {
        results.push({
          lifeAreaId: rel.id,
          name: rel.name,
          score: 0.75,
          signals: [`known contact: ${contact}`],
        });
      }
    }
  }
  for (const project of projects) {
    if (project.name && phraseMatches(normalized, project.name.toLowerCase())) {
      const area = lifeAreas.find((a) => a.name.toLowerCase() === project.name.toLowerCase());
      if (area) {
        results.push({
          lifeAreaId: area.id,
          name: area.name,
          score: 0.8,
          signals: [`project: ${project.name}`],
        });
      }
    }
  }
  for (const company of companies) {
    if (company && phraseMatches(normalized, company.toLowerCase())) {
      const biz = lifeAreas.find((a) => a.id === "sys:business");
      if (biz) {
        results.push({
          lifeAreaId: biz.id,
          name: biz.name,
          score: 0.55,
          signals: [`company: ${company}`],
        });
      }
    }
  }
  return results;
}

function mergeScores(scored: ScoredArea[]): ScoredArea[] {
  const byId = new Map<string, ScoredArea>();
  for (const entry of scored) {
    const prev = byId.get(entry.lifeAreaId);
    if (!prev) {
      byId.set(entry.lifeAreaId, { ...entry, signals: [...entry.signals] });
      continue;
    }
    byId.set(entry.lifeAreaId, {
      lifeAreaId: entry.lifeAreaId,
      name: entry.name,
      score: Math.min(0.98, prev.score + entry.score * 0.65),
      signals: [...new Set([...prev.signals, ...entry.signals])],
    });
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}

/**
 * Classify task text into a Life Area with confidence and alternates.
 */
export function classifyLifeArea(
  input: ClassifyLifeAreaInput,
  lifeAreas: LifeArea[],
): LifeAreaClassificationResult | null {
  const text = input.taskText.trim();
  if (!text || lifeAreas.length === 0) return null;

  const normalized = normalizeLifeAreaPhrase(text);
  const corrections = input.previousCorrections ?? [];

  const scored = mergeScores([
    ...scoreFromCorrections(normalized, corrections, lifeAreas),
    ...scoreFromKeywords(normalized, lifeAreas),
    ...scoreFromContext(normalized, input, lifeAreas),
    ...(scoreRelationshipNetworking(normalized)
      ? [scoreRelationshipNetworking(normalized)!]
      : []),
  ]);

  if (scored.length === 0) {
    const fallback = lifeAreas.find((a) => a.id === "sys:business");
    if (!fallback) return null;
    return {
      primaryLifeAreaId: fallback.id,
      primaryLifeAreaName: fallback.name,
      secondaryLifeAreaIds: [],
      confidence: 0.35,
      matchedSignals: ["default: business"],
      alternateSuggestions: lifeAreas
        .filter((a) => a.id !== fallback.id)
        .slice(0, 4)
        .map((a) => ({ lifeAreaId: a.id, name: a.name, confidence: 0.2 })),
      needsConfirmation: true,
    };
  }

  const [primary, ...rest] = scored;
  const confidence = Math.min(0.98, primary.score);
  const secondaryLifeAreaIds = rest
    .filter((r) => r.score >= 0.4)
    .slice(0, 2)
    .map((r) => r.lifeAreaId);

  return {
    primaryLifeAreaId: primary.lifeAreaId,
    primaryLifeAreaName: primary.name,
    secondaryLifeAreaIds,
    confidence,
    matchedSignals: primary.signals,
    alternateSuggestions: rest.slice(0, 5).map((r) => ({
      lifeAreaId: r.lifeAreaId,
      name: r.name,
      confidence: Math.min(0.95, r.score),
    })),
    needsConfirmation: confidence < LIFE_AREA_AUTO_APPLY_THRESHOLD,
  };
}
