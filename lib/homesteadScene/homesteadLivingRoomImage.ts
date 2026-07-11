import { getChatBackdropImageUrl } from "@/lib/chatBackdrop";
import { masterLivingRoomImageId } from "@/lib/livingRoomMaster/masterLivingRoom";
import {
  companionPresenceWelcomeImageUrl,
  resolveCompanionPresenceLibraryImage,
} from "@/lib/companionPresenceLibrary";

/**
 * Image behind everyday chat.
 * Member may change via Room menu → Change background — chat chrome stays the same.
 */
export function homesteadLivingRoomImageUrl(): string {
  const preferred = getChatBackdropImageUrl();
  if (preferred) return preferred;
  return (
    resolveCompanionPresenceLibraryImage(
      "chat-welcome",
      masterLivingRoomImageId(),
    ) ?? companionPresenceWelcomeImageUrl()
  );
}

