import type { CoachingMode } from "@/lib/companionPrompt";
import type { SidebarNavId } from "@/lib/companionUi";
import { HOMESTEAD_SIGNPOST_DESTINATIONS } from "@/lib/homesteadSignpost";

export type PropertyNavItem = {
  id: SidebarNavId;
  label: string;
  objectId: string;
  mode?: CoachingMode;
  /** Gentle placeholder when the room is not built yet. */
  comingSoonMessage?: string;
};

export type PropertyNavGroup = {
  id: string;
  label: string;
  items: PropertyNavItem[];
};

function toPropertyItem(
  item: (typeof HOMESTEAD_SIGNPOST_DESTINATIONS)[number],
): PropertyNavItem {
  return {
    id: item.id,
    label: item.label,
    objectId: item.objectId,
    mode: item.mode,
  };
}

/** Room / property navigation — five homestead signpost destinations. */
export const COMPANION_PROPERTY_NAV: PropertyNavGroup[] = [
  {
    id: "destinations",
    label: "",
    items: HOMESTEAD_SIGNPOST_DESTINATIONS.map(toPropertyItem),
  },
];

export function propertyNavComingSoonMessage(
  nav: SidebarNavId,
): string | null {
  for (const group of COMPANION_PROPERTY_NAV) {
    const item = group.items.find((entry) => entry.id === nav);
    if (item?.comingSoonMessage) return item.comingSoonMessage;
  }
  return null;
}
