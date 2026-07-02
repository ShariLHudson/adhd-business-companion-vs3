/**
 * Spark Estate Collection™ — permission-first suggestion lines.
 * Room routing follows the Estate Collections Playbook™.
 */

import { playbookRoomForDecisionTreeKeyword } from "./estateCollectionsPlaybook";
import type { EstateCollectionRoomId } from "./types";
import { getEstateCollectionRoom } from "./registry";

export function sparkCollectionSuggestionLine(
  roomId: EstateCollectionRoomId,
  index = 0,
): string {
  const room = getEstateCollectionRoom(roomId);
  const lines = room.sparkSuggestionLines;
  return lines[index % lines.length] ?? lines[0] ?? "";
}

export function sparkCollectionRoomForConversationSignal(
  text: string,
): EstateCollectionRoomId | null {
  return playbookRoomForDecisionTreeKeyword(text);
}
