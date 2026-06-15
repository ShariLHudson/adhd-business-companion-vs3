/**
 * Relationship Intelligence — remember people, reduce executive function burden.
 */

import { detectRelationshipOffer, recordMention } from "./relationshipDetection";
import { detectRelationshipSignals, normalizePersonName } from "./relationshipSignals";
import { rememberConfirmation, touchpointsForSignal } from "./relationshipMessages";
import {
  dismissRelationshipOffer,
  getMentionCountMap,
  getRelationships,
  isNameDismissedToday,
  isRelationshipOfferDismissedToday,
  notifyRelationshipUpdated,
  recordOfferShown,
  saveMentionCountMap,
  saveRelationship,
} from "./relationshipStore";
import type {
  Relationship,
  RelationshipImportance,
  RelationshipInput,
  RelationshipOffer,
} from "./types";

function uid(): string {
  return `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function observeRelationshipMentions(text: string): void {
  const hits = detectRelationshipSignals(text);
  if (!hits.length) return;
  let map = getMentionCountMap();
  for (const hit of hits) {
    map = recordMention(map, hit.extractedName);
  }
  saveMentionCountMap(map);
}

export function evaluateRelationshipOffer(
  input: RelationshipInput = {},
): RelationshipOffer | null {
  const now = input.now ?? new Date();
  const text = input.text?.trim() ?? "";
  if (!text) return null;

  const hits = detectRelationshipSignals(text);
  const primary = hits[0];
  if (primary?.extractedName && isNameDismissedToday(primary.extractedName, now)) {
    return null;
  }
  if (isRelationshipOfferDismissedToday(now)) {
    return null;
  }

  observeRelationshipMentions(text);

  const offer = detectRelationshipOffer(
    text,
    getRelationships(),
    getMentionCountMap(),
    isRelationshipOfferDismissedToday(now),
    now,
  );

  if (offer) {
    const key = normalizePersonName(offer.signal.extractedName ?? "");
    const total = getMentionCountMap().get(key) ?? offer.mentionCount;
    recordOfferShown({ ...offer, mentionCount: total });
    return { ...offer, mentionCount: total };
  }
  return offer;
}

export function rememberRelationshipFromOffer(
  offer: RelationshipOffer,
  overrides?: {
    name?: string;
    importance?: RelationshipImportance;
    notes?: string;
  },
): Relationship {
  const now = new Date().toISOString();
  const name =
    overrides?.name?.trim() ||
    offer.signal.extractedName ||
    "Someone important";
  const touchpoint =
    offer.suggestedTouchpoints[0] ??
    touchpointsForSignal(offer.signal.kind)[0] ??
    null;

  const relationship: Relationship = {
    id: uid(),
    name,
    relationshipType: offer.signal.inferredType,
    importance: overrides?.importance ?? "medium",
    lastInteraction: now,
    nextSuggestedTouchpoint: touchpoint,
    notes: overrides?.notes ?? "",
    tags: [offer.signal.kind],
    lastContext: offer.signal.contextSnippet,
    createdAt: now,
    updatedAt: now,
  };

  saveRelationship(relationship);
  notifyRelationshipUpdated();
  return relationship;
}

export function shouldSurfaceRelationshipOffer(
  offer: RelationshipOffer | null,
): boolean {
  return Boolean(offer?.companionOffer.trim());
}

export function acceptRelationshipRemember(
  offer: RelationshipOffer,
): { relationship: Relationship; message: string } {
  const relationship = rememberRelationshipFromOffer(offer);
  return {
    relationship,
    message: rememberConfirmation(relationship.name),
  };
}

export {
  dismissRelationshipOffer,
  deleteRelationship,
  getRelationships,
} from "./relationshipStore";
