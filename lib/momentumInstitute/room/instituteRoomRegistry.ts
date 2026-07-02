/**
 * Momentum Institute™ — estate room registration (Entrepreneur Development Center).
 */

import type { AppSection } from "@/lib/companionUi";
import {
  MOMENTUM_INSTITUTE_OBJECT_ID,
  MOMENTUM_INSTITUTE_SECTION,
} from "../instituteRegistry";

import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

/** Permanent drawer-wall background — card catalog room. */
export const MOMENTUM_INSTITUTE_ROOM_BG = ESTATE_ROOM_BG.momentumInstitute;

export const MOMENTUM_INSTITUTE_ROOM_META = {
  section: MOMENTUM_INSTITUTE_SECTION,
  objectId: MOMENTUM_INSTITUTE_OBJECT_ID,
  title: "Momentum Institute™",
  trademark: "Momentum Institute™",
  subtitle: "Entrepreneur Development Center",
  purpose: "Develop entrepreneurial capability — drawer by drawer.",
  background: MOMENTUM_INSTITUTE_ROOM_BG,
  status: "live" as const,
} as const;

export function isMomentumInstituteSection(
  section: AppSection | null | undefined,
): section is typeof MOMENTUM_INSTITUTE_SECTION {
  return section === MOMENTUM_INSTITUTE_SECTION;
}
