import type { AppSection } from "./companionUi";
import {
  MOMENTUM_BUILDER_ROOM_META,
  MOMENTUM_BUILDER_SECTION,
  isMomentumBuilderSection,
} from "./momentumBuilderRoom/roomRegistry";
import { isMomentumBuilderRoomSection } from "./momentumBuilderRoom/momentumBuilderPrompt";

export {
  MOMENTUM_BUILDER_SECTION,
  isMomentumBuilderSection,
  isMomentumBuilderRoomSection,
};

export const MOMENTUM_BUILDER_NAV_META = {
  section: MOMENTUM_BUILDER_SECTION,
  objectId: MOMENTUM_BUILDER_ROOM_META.objectId,
  title: MOMENTUM_BUILDER_ROOM_META.trademark,
  lead: MOMENTUM_BUILDER_ROOM_META.purpose,
  route: "/companion/momentum-builder",
} as const;

export function resolveMomentumBuilderSection(
  section: AppSection,
): AppSection {
  return section === "grow-momentum-builders"
    ? MOMENTUM_BUILDER_SECTION
    : section;
}
