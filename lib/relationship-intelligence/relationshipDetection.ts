/**
 * Relationship detection — names, repeat mentions, existing matches.
 */

import {
  detectRelationshipSignals,
  normalizePersonName,
} from "./relationshipSignals";
import type { Relationship, RelationshipOffer, RelationshipSignalHit } from "./types";
import { buildRelationshipOffer } from "./relationshipMessages";

export function pickPrimarySignal(
  hits: RelationshipSignalHit[],
): RelationshipSignalHit | null {
  return hits[0] ?? null;
}

export function findExistingRelationship(
  relationships: Relationship[],
  name: string | null,
): Relationship | null {
  if (!name) return null;
  const key = normalizePersonName(name);
  return (
    relationships.find((r) => normalizePersonName(r.name) === key) ?? null
  );
}

export function countRecentMentions(
  mentionCounts: Map<string, number>,
  name: string | null,
): number {
  if (!name) return 0;
  return mentionCounts.get(normalizePersonName(name)) ?? 0;
}

export function recordMention(
  mentionCounts: Map<string, number>,
  name: string | null,
): Map<string, number> {
  if (!name) return mentionCounts;
  const key = normalizePersonName(name);
  const next = new Map(mentionCounts);
  next.set(key, (next.get(key) ?? 0) + 1);
  return next;
}

export function shouldOfferRemember(
  signal: RelationshipSignalHit,
  existing: Relationship | null,
  mentionCount: number,
  dismissedToday: boolean,
): boolean {
  if (dismissedToday) return false;
  if (existing) return false;
  if (signal.extractedName) return true;
  return mentionCount >= 2;
}

export function buildOfferFromSignal(
  signal: RelationshipSignalHit,
  mentionCount: number,
  now = new Date(),
): RelationshipOffer {
  return buildRelationshipOffer(signal, mentionCount, now);
}

export function detectRelationshipOffer(
  text: string,
  relationships: Relationship[],
  mentionCounts: Map<string, number>,
  dismissedToday: boolean,
  now = new Date(),
): RelationshipOffer | null {
  const hits = detectRelationshipSignals(text);
  const primary = pickPrimarySignal(hits);
  if (!primary) return null;

  const count = countRecentMentions(mentionCounts, primary.extractedName);
  const existing = findExistingRelationship(
    relationships,
    primary.extractedName,
  );

  if (!shouldOfferRemember(primary, existing, count, dismissedToday)) {
    return null;
  }

  return buildOfferFromSignal(primary, count, now);
}
