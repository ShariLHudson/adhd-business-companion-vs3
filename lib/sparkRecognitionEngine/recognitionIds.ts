/**
 * Canonical Recognition ID map — Sprint 1 Foundation Alignment.
 *
 * One vocabulary for recognition rooms across place IDs, AppSections,
 * collection room IDs, and member-facing names.
 *
 * Collisions resolved:
 * - Evidence Bank (section) → Evidence Vault (place)
 * - Wins This Week (section) → Celebration Garden (place `gardens`)
 * - Celebration Hall (collection) → Celebration Room (place)
 * - Hall of Accomplishments (portfolio shell) ≠ Gallery (`gallery-of-firsts`)
 * - Asset Library (`the-gallery`) ≠ Hall of Accomplishments
 *
 * @see docs/estate/recognition/SPRINT_1_FOUNDATION_ALIGNMENT.md
 */

import { resolvePlaceId } from "@/lib/estate/placeIdAliases";
import {
  RECOGNITION_ROOM_IDS,
  type RecognitionRoomId,
} from "./types";

/** Member-facing official names (). */
export const RECOGNITION_ROOM_OFFICIAL_NAMES: Readonly<
  Record<RecognitionRoomId, string>
> = {
  "evidence-vault": "Evidence Vault",
  gardens: "Celebration Garden",
  "celebration-room": "Celebration Room",
  "legacy-studio": "Legacy Studio",
  portfolio: "Hall of Accomplishments",
};

/**
 * Canonical place ID → primary AppSection shell.
 */
export const RECOGNITION_PLACE_TO_SECTION: Readonly<
  Record<RecognitionRoomId, string>
> = {
  "evidence-vault": "evidence-bank",
  gardens: "wins-this-week",
  "celebration-room": "growth-reports",
  "legacy-studio": "home",
  portfolio: "growth-portfolio",
};

/**
 * Collection framework room IDs (legacy keys) → canonical place IDs.
 * Collection adapters keep these keys; routing always uses canonical places.
 */
export const COLLECTION_ROOM_TO_CANONICAL: Readonly<Record<string, RecognitionRoomId>> =
  {
    "evidence-vault": "evidence-vault",
    "celebration-garden": "gardens",
    "celebration-hall": "celebration-room",
  };

/** AppSection / route vocabulary → canonical recognition place (when applicable). */
export const SECTION_TO_CANONICAL_RECOGNITION: Readonly<
  Record<string, RecognitionRoomId>
> = {
  "evidence-bank": "evidence-vault",
  "wins-this-week": "gardens",
  "growth-reports": "celebration-room",
};

/**
 * Deprecated member-facing labels — do not use in new UI copy.
 * Prefer RECOGNITION_ROOM_OFFICIAL_NAMES.
 */
export const DEPRECATED_RECOGNITION_LABELS: Readonly<Record<string, string>> = {
  "Evidence Bank": "Evidence Vault",
  "Wins This Week": "Celebration Garden",
  "Celebration Hall": "Celebration Room",
  "Growth Portfolio": "Hall of Accomplishments",
  Portfolio: "Hall of Accomplishments",
  Gallery: "Gallery (not Hall of Accomplishments)",
};

/**
 * Explicit non-equivalences — these IDs must never be treated as the same room.
 */
export const RECOGNITION_NON_EQUIVALENT_PAIRS: ReadonlyArray<
  readonly [string, string]
> = [
  ["gallery-of-firsts", "portfolio"],
  ["gallery-of-firsts", "growth-portfolio"],
  ["gallery-of-firsts", "the-gallery"],
  ["gardens", "portfolio"],
  ["celebration-room", "gallery-of-firsts"],
  ["celebration-room", "portfolio"],
  ["evidence-vault", "confidence-vault"],
];

/** All known aliases that resolve to a recognition room. */
const ALIAS_TO_CANONICAL: Readonly<Record<string, RecognitionRoomId>> = {
  "evidence-vault": "evidence-vault",
  "evidence-bank": "evidence-vault",
  gardens: "gardens",
  "celebration-garden": "gardens",
  "wins-this-week": "gardens",
  /** estate-gardens is a separate living place — never alias to Celebration Garden */
  "celebration-room": "celebration-room",
  "celebration-hall": "celebration-room",
  "growth-reports": "celebration-room",
  "legacy-studio": "legacy-studio",
  "legacy-room-main": "legacy-studio",
  portfolio: "portfolio",
  "growth-portfolio": "portfolio",
  "hall-of-accomplishments": "portfolio",
  "hall-of-achievements": "portfolio",
};

export function isRecognitionRoomId(
  placeId: string | null | undefined,
): placeId is RecognitionRoomId {
  if (!placeId) return false;
  return (RECOGNITION_ROOM_IDS as readonly string[]).includes(placeId);
}

/**
 * Resolve any place / section / collection / alias ID to a canonical
 * RecognitionRoomId, or null if not a recognition room.
 */
export function toCanonicalRecognitionRoomId(
  id: string | null | undefined,
): RecognitionRoomId | null {
  if (!id?.trim()) return null;
  const trimmed = id.trim().toLowerCase();

  const direct = ALIAS_TO_CANONICAL[trimmed];
  if (direct) return direct;

  const viaPlaceAlias = resolvePlaceId(trimmed);
  if (isRecognitionRoomId(viaPlaceAlias)) return viaPlaceAlias;

  const viaCollection = COLLECTION_ROOM_TO_CANONICAL[viaPlaceAlias];
  if (viaCollection) return viaCollection;

  const viaSection = SECTION_TO_CANONICAL_RECOGNITION[trimmed];
  if (viaSection) return viaSection;

  return null;
}

/** True when two IDs refer to the same recognition room (alias-aware). */
export function recognitionRoomsEquivalent(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const ca = toCanonicalRecognitionRoomId(a);
  const cb = toCanonicalRecognitionRoomId(b);
  if (ca && cb) return ca === cb;
  if (!a || !b) return false;
  return resolvePlaceId(a) === resolvePlaceId(b);
}

/** Official member-facing name for a recognition room (or null). */
export function recognitionOfficialName(
  id: string | null | undefined,
): string | null {
  const canonical = toCanonicalRecognitionRoomId(id);
  if (!canonical) return null;
  return RECOGNITION_ROOM_OFFICIAL_NAMES[canonical];
}

/** Shell section for a recognition place (alias-aware). */
export function recognitionSectionForPlace(
  id: string | null | undefined,
): string | null {
  const canonical = toCanonicalRecognitionRoomId(id);
  if (!canonical) return null;
  return RECOGNITION_PLACE_TO_SECTION[canonical];
}

/**
 * Sync helper: given current shell signals, pick the best visual_room place ID.
 * Prefer direct visit / place, then section mapping, then null.
 */
export function resolveVisualRecognitionRoom(input: {
  placeId?: string | null;
  section?: string | null;
  collectionRoomId?: string | null;
}): RecognitionRoomId | null {
  return (
    toCanonicalRecognitionRoomId(input.placeId) ??
    toCanonicalRecognitionRoomId(input.collectionRoomId) ??
    toCanonicalRecognitionRoomId(input.section)
  );
}
