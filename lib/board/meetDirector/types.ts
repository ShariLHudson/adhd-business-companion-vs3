/**
 * Meet This Director — private one-on-one conversation.
 * Completely separate from Board discussion records and Chamber chats.
 */

import type { BoardDirectorId } from "@/lib/board/types";

/** In-room routing for Meet the Directors (no Estate navigation). */
export type MeetDirectorScreen = "gallery" | "profile" | "meet";

export type MeetDirectorRoute =
  | { screen: "gallery" }
  | { screen: "profile"; directorId: BoardDirectorId }
  | { screen: "meet"; directorId: BoardDirectorId };

export type MeetDirectorMessageRole = "director" | "member";

export type MeetDirectorMessage = {
  id: string;
  role: MeetDirectorMessageRole;
  content: string;
  createdAt: string;
};

export type MeetDirectorConversation = {
  directorId: BoardDirectorId;
  messages: MeetDirectorMessage[];
  /** Conversation is open over the faded profile */
  open: boolean;
};

export type MeetDirectorExperienceState = {
  route: MeetDirectorRoute;
  conversation: MeetDirectorConversation | null;
};
