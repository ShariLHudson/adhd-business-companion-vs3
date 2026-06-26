import { showDirectorStudio } from "./directorStudio";

export const WELCOME_ROOM_PROTOTYPE_STORAGE_KEY =
  "companion-welcome-room-prototype-v1";

export function showWelcomeRoomPrototypePanel(
  studioParam?: string | null,
  demoParam?: string | null,
): boolean {
  return showDirectorStudio(studioParam, demoParam);
}
