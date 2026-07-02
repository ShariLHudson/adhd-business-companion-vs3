/**
 * Detect when conversation content belongs in an Estate collection room.
 * Permission-first — never auto-save.
 *
 * Routing follows the Estate Collections Playbook™.
 * @see docs/estate/ESTATE_COLLECTIONS_PLAYBOOK.md
 */

import { emptyCaptureValues } from "./captureUtils";
import {
  formatMultiRoomCollectionOffer,
  isComplementaryRoomPair,
  scorePlaybookRooms,
  singleRoomOfferLine,
} from "./estateCollectionsPlaybook";
import { getEstateCollectionRoom } from "./registry";
import type {
  EstateCollectionCaptureValues,
  EstateCollectionRoomId,
} from "./types";
import { ESTATE_COLLECTION_ROOM_IDS } from "./types";

export type CollectionSaveOffer = {
  roomId: EstateCollectionRoomId;
  /** Additional rooms when the Playbook says the moment may belong in more than one place. */
  alternateRoomIds?: EstateCollectionRoomId[];
  offerLine: string;
  prefill: EstateCollectionCaptureValues;
  confidence: number;
};

const SKIP_RE =
  /^(?:hi|hello|hey|thanks|thank you|ok|okay|yes|no|yep|nope)\b/i;

const NAV_RE =
  /\b(?:take me to|go to|open |visit |show me the estate|estate map)\b/i;

export function buildCollectionPrefill(
  roomId: EstateCollectionRoomId,
  sourceText: string,
): EstateCollectionCaptureValues {
  const room = getEstateCollectionRoom(roomId);
  const values = emptyCaptureValues(room.capture.fields);
  const text = sourceText.trim();
  const primary = room.capture.primaryFieldId;
  values[primary] = text;

  if (roomId === "evidence-vault") {
    values.situation = text;
    if (/\b(?:solved|figured|fixed|handled|overcame)\b/i.test(text)) {
      values.whatIDid = text;
    }
    if (/\b(?:problem|issue|crisis|stuck)\b/i.test(text)) {
      values.problem = text;
    }
  }

  if (roomId === "celebration-garden" && /\b(?:matter|because|means)\b/i.test(text)) {
    values.whyItMatters = text;
  }

  if (roomId === "journal") {
    if (/\bgrateful|thankful\b/i.test(text)) values.category = "gratitude";
    else if (/\blesson\b/i.test(text)) values.category = "lesson";
    else if (/\bdream\b/i.test(text)) values.category = "dream";
    else if (/\bpray|prayer\b/i.test(text)) values.category = "prayer";
    else values.category = "reflection";
  }

  if (roomId === "greenhouse") {
    if (/\bhabit\b/i.test(text)) values.category = "habit";
    else if (/\bskill\b/i.test(text)) values.category = "skill";
    else if (/\bgoal\b/i.test(text)) values.category = "goal";
    else if (/\brelationship\b/i.test(text)) values.category = "relationship";
    else values.category = "character";
  }

  if (roomId === "achievement-library") {
    if (/\bbook\b/i.test(text)) values.achievementType = "book";
    else if (/\bcourse\b/i.test(text)) values.achievementType = "course";
    else if (/\bpodcast\b/i.test(text)) values.achievementType = "podcast";
    else if (/\bbusiness\b/i.test(text)) values.achievementType = "business";
    else values.achievementType = "milestone";
    const title = text.split(/\n/)[0]?.trim().slice(0, 80);
    if (title) values.title = title;
  }

  if (roomId === "celebration-hall") {
    const title = text.split(/\n/)[0]?.trim().slice(0, 80);
    if (title) values.chapterTitle = title;
  }

  return values;
}

function resolveMultiRoomOffer(
  ranked: Array<{ id: EstateCollectionRoomId; score: number }>,
): { primary: EstateCollectionRoomId; alternates: EstateCollectionRoomId[] } | null {
  if (ranked.length < 2) return null;
  const top = ranked[0]!;
  const second = ranked[1]!;
  if (second.score < 1 || top.score - second.score > 0.35) return null;
  if (!isComplementaryRoomPair(top.id, second.id)) return null;
  return { primary: top.id, alternates: [second.id] };
}

export function evaluateCollectionSaveOffer(input: {
  userText: string;
  currentTurn: number;
  workspaceOpen?: boolean;
  overwhelmed?: boolean;
  cooldownActive?: boolean;
}): CollectionSaveOffer | null {
  const text = input.userText.trim();
  if (text.length < 28) return null;
  if (SKIP_RE.test(text)) return null;
  if (NAV_RE.test(text)) return null;
  if (/^\s*(how|what|why|when|where|can you|could you|should i)\b/i.test(text)) {
    return null;
  }
  if (input.overwhelmed) return null;
  if (input.cooldownActive) return null;

  const ranked = scorePlaybookRooms(text);
  if (!ranked.length) return null;
  const top = ranked[0]!;
  if (top.score < 1) return null;

  const multi = resolveMultiRoomOffer(ranked);
  if (multi) {
    return {
      roomId: multi.primary,
      alternateRoomIds: multi.alternates,
      offerLine: formatMultiRoomCollectionOffer(multi.primary, multi.alternates),
      prefill: buildCollectionPrefill(multi.primary, text),
      confidence: top.score,
    };
  }

  if (ranked.length > 1 && ranked[1]!.score === top.score && top.score < 1.4) {
    return null;
  }

  return {
    roomId: top.id,
    offerLine: singleRoomOfferLine(top.id),
    prefill: buildCollectionPrefill(top.id, text),
    confidence: top.score,
  };
}

export function collectionOfferForRoom(
  roomId: EstateCollectionRoomId,
  sourceText: string,
): CollectionSaveOffer {
  return {
    roomId,
    offerLine: singleRoomOfferLine(roomId),
    prefill: buildCollectionPrefill(roomId, sourceText),
    confidence: 2,
  };
}

export function isCollectionOfferMessage(text: string): boolean {
  const t = text.trim();
  if (!t.includes("?")) return false;
  return (
    /\bwould you like to\b/i.test(t) ||
    /\bwhere would you like this to rest\b/i.test(t) ||
    /\bmore than one place in the estate\b/i.test(t) ||
    /\bwould you like to do both\b/i.test(t)
  );
}

export function listCollectionRoomMenuLines(): string[] {
  return ESTATE_COLLECTION_ROOM_IDS.map((id, index) => {
    const room = getEstateCollectionRoom(id);
    return `${index + 1}. ${room.roomName}`;
  });
}

export function formatCollectionRoomMenu(): string {
  const lines = listCollectionRoomMenuLines();
  return [
    "Where would you like this to rest?",
    "",
    ...lines,
    "",
    "Reply with a number or room name when you're ready.",
  ].join("\n");
}
