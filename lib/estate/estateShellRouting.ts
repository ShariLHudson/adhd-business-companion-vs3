import type { AppSection } from "@/lib/companionUi";
import type { ProfileEstateRoomId } from "@/lib/growth/profileEstateRooms";
import {
  profileEstateSectionForRoom,
} from "@/lib/growth/profileEstateRooms";
import { isDedicatedEstateRoomPanelSection } from "./directEstateVisit";

/** Profile estate rooms that mount a dedicated panel instead of SparkEstateShell. */
export function profileEstateRoomUsesDedicatedPanel(
  roomId: ProfileEstateRoomId,
): boolean {
  if (roomId === "growth-profile" || roomId === "my-estate") return true;
  return isDedicatedEstateRoomPanelSection(profileEstateSectionForRoom(roomId));
}

export type ResolveSparkEstateShellPlaceIdInput = {
  profileEstateRoomOverlayId: ProfileEstateRoomId | null;
  showDirectEstateOverlay: boolean;
  estateChatRoomId: string | null;
  estateConservatoryEngaged: boolean;
  clearMyMindWorkspaceActive: boolean;
  activeSection: AppSection;
};

/**
 * Single SparkEstateShell owner — dedicated sections and dedicated profile rooms
 * must not also mount the generic shell.
 */
export function resolveSparkEstateShellPlaceId(
  input: ResolveSparkEstateShellPlaceIdInput,
): string | null {
  if (input.clearMyMindWorkspaceActive) return null;
  if (isDedicatedEstateRoomPanelSection(input.activeSection)) return null;

  const profilePlaceId =
    input.profileEstateRoomOverlayId &&
    !profileEstateRoomUsesDedicatedPanel(input.profileEstateRoomOverlayId)
      ? input.profileEstateRoomOverlayId
      : null;

  const directPlaceId =
    input.showDirectEstateOverlay && !input.estateConservatoryEngaged
      ? input.estateChatRoomId
      : null;

  return profilePlaceId ?? directPlaceId;
}
