/**
 * Estate Room Context — in-room actions vs navigation.
 */

import type { AppSection } from "@/lib/companionUi";

export type EstateRoomActionKind =
  | "open_journal"
  | "create_journal"
  | "resume_journal"
  | "open_writing_tools"
  | "launch_creation"
  | "open_projects"
  | "begin_brainstorm"
  | "remain_in_room"
  | "open_section";

export type EstateRoomAction = {
  kind: EstateRoomActionKind;
  section?: AppSection;
  creationIntent?: string;
};

export type EstateRoomActionResult = {
  currentRoomId: string;
  action: EstateRoomAction;
  reply: string;
};

export type EvaluateEstateRoomActionInput = {
  userText: string;
  currentPlaceId: string | null;
};
