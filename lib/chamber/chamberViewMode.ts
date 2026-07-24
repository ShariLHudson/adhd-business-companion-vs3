/**
 * Chamber of Momentum — one primary visual layer at a time.
 * Presentation only; does not own conversation storage.
 */

export type ChamberViewMode = "gallery" | "member_profile" | "member_chat";

export function chamberViewModeLabel(mode: ChamberViewMode): string {
  switch (mode) {
    case "gallery":
      return "Chamber member gallery";
    case "member_profile":
      return "Chamber member profile";
    case "member_chat":
      return "Chamber member conversation";
    default:
      return "Chamber";
  }
}

/** Chat chrome mounts only in member_chat — never under a profile. */
export function shouldShowChamberChat(
  mode: ChamberViewMode,
  activeMemberId: string | null | undefined,
): boolean {
  return mode === "member_chat" && Boolean(activeMemberId);
}

export function shouldShowChamberGallery(mode: ChamberViewMode): boolean {
  return mode === "gallery";
}

export function shouldShowChamberMemberProfile(mode: ChamberViewMode): boolean {
  return mode === "member_profile";
}
