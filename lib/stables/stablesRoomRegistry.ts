/**
 * The Stables — estate room registration.
 */

import type { AppSection } from "@/lib/companionUi";
import { STABLES_SECTION } from "./types";

import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

export const STABLES_ROOM_BG = ESTATE_ROOM_BG.stables;

export const STABLES_ROOM_META = {
  section: STABLES_SECTION,
  title: "The Stables",
  trademark: "The Stables",
  subtitle: "Grounded confidence for entrepreneurs",
  purpose:
    "Develop leadership, trust, confidence, and calm through stories, analogies, reflection, and coaching — not horse training.",
  background: STABLES_ROOM_BG,
  emotionalExperience:
    "safe · grounded · calm · present · confident · capable",
  status: "live" as const,
} as const;

export function isStablesSection(
  section: AppSection | null | undefined,
): section is typeof STABLES_SECTION {
  return section === STABLES_SECTION;
}
