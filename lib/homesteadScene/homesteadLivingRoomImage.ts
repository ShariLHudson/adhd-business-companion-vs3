import { masterLivingRoomImageId } from "@/lib/livingRoomMaster/masterLivingRoom";
import {
  companionPresenceWelcomeImageUrl,
  resolveCompanionPresenceLibraryImage,
} from "@/lib/companionPresenceLibrary";

/** Fixed living-room photograph — lighting shifts; image does not. */
export function homesteadLivingRoomImageUrl(): string {
  return (
    resolveCompanionPresenceLibraryImage(
      "chat-welcome",
      masterLivingRoomImageId(),
    ) ?? companionPresenceWelcomeImageUrl()
  );
}
