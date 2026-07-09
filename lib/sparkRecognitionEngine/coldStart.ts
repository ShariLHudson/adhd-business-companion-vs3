/**
 * Cold-start copy — empty rooms feel inviting, never disappointing.
 */

import type { RecognitionRoomId } from "./types";

export const RECOGNITION_COLD_START: Record<
  RecognitionRoomId,
  { title: string; body: string }
> = {
  "evidence-vault": {
    title: "Your Evidence Vault™ is ready.",
    body: "When something feels worth remembering, Spark can help you preserve it here.",
  },
  gardens: {
    title: "The garden is ready.",
    body: "The garden is ready for small steps, quiet wins, and moments of gratitude.",
  },
  "celebration-room": {
    title: "This room is ready.",
    body: "This room is ready whenever something deserves joyful celebration.",
  },
  "legacy-studio": {
    title: "Legacy Studio™ is ready.",
    body: "When you want to tell the fuller story, you can shape it here — nothing has to be finished today.",
  },
  "gallery-of-firsts": {
    title: "Your Hall is waiting.",
    body: "Your Hall is waiting for the moments that become part of your story. Nothing has to be added today.",
  },
};

export function coldStartForRoom(roomId: RecognitionRoomId): {
  title: string;
  body: string;
} {
  return RECOGNITION_COLD_START[roomId];
}
