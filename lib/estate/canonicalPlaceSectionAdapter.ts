/**
 * Canonical place → AppSection adapter (Phase C).
 * UI shells still use AppSection — subordinate to Estate Directory.
 *
 * @see lib/estate/directory/shell.ts
 * @see lib/estate/goToPlace.ts
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateMenuActionId } from "@/lib/estateMenu/menuConfig";
import {
  ESTATE_DIRECTORY_MENU_ACTION,
  ESTATE_DIRECTORY_PLACE_SECTION,
  resolveEstateLocationShell,
} from "./directory/shell";

/** @deprecated Use ESTATE_DIRECTORY_PLACE_SECTION */
export const CANONICAL_PLACE_SECTION = ESTATE_DIRECTORY_PLACE_SECTION;

/** @deprecated Use ESTATE_DIRECTORY_MENU_ACTION */
const MENU_ACTION_BY_PLACE = ESTATE_DIRECTORY_MENU_ACTION;

export type CanonicalPlaceShell = {
  section: AppSection | null;
  menuActionId?: EstateMenuActionId;
};

export function resolveCanonicalPlaceShell(placeId: string): CanonicalPlaceShell {
  const shell = resolveEstateLocationShell(placeId);
  return {
    section: shell.section,
    menuActionId: shell.menuActionId,
  };
}
