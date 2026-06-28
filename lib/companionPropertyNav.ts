import type { CoachingMode } from "@/lib/companionPrompt";
import type { SidebarNavId } from "@/lib/companionUi";

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

/** Room / property navigation — sidebar groups. */
export const COMPANION_PROPERTY_NAV: PropertyNavGroup[] = [
  {
    id: "core",
    label: "Core",
    items: [
      { id: "chat", label: "Home", objectId: "messages", mode: "today" },
      { id: "clear-my-mind", label: "Clear My Mind", objectId: "clear-my-mind" },
      { id: "plan-my-day", label: "Plan My Day", objectId: "plan-my-day" },
      { id: "focus", label: "Focus My Brain", objectId: "focus-my-brain", mode: "focus" },
      { id: "todays-reality", label: "Today's Reality", objectId: "todays-reality" },
    ],
  },
  {
    id: "create-think",
    label: "Create + Think",
    items: [
      { id: "create", label: "Kitchen / Create", objectId: "create" },
      { id: "visual-thinking", label: "Art Studio", objectId: "visual-thinking" },
      { id: "how-do-i", label: "Library / How Do I", objectId: "help" },
      { id: "playbook", label: "Detective Room", objectId: "playbook" },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { id: "growth", label: "The Gallery", objectId: "the-gallery" },
      {
        id: "journal",
        label: "Journal",
        objectId: "journal",
        comingSoonMessage: "Journal is almost ready. For now, keep walking.",
      },
      {
        id: "portfolio",
        label: "Portfolio",
        objectId: "portfolio",
        comingSoonMessage:
          "Portfolio is almost ready — finished work and published content will live here. For now, keep walking.",
      },
      { id: "evidence-bank", label: "Evidence Bank", objectId: "evidence-bank" },
      { id: "confidence-vault", label: "Highlights", objectId: "my-highlights" },
    ],
  },
  {
    id: "peaceful",
    label: "Peaceful Places",
    items: [
      { id: "welcome-room", label: "Welcome Room", objectId: "welcome-room" },
      {
        id: "fire-pit",
        label: "Fire Pit",
        objectId: "fire-pit",
        comingSoonMessage: "The Fire Pit is coming soon. A quiet place to unwind.",
      },
      {
        id: "butterfly-conservatory",
        label: "Butterfly Conservatory",
        objectId: "butterfly-conservatory",
        comingSoonMessage: "The Conservatory is coming soon. Keep walking for now.",
      },
      {
        id: "rain-porch",
        label: "Rain Porch",
        objectId: "rain-porch",
        comingSoonMessage: "The Rain Porch is coming soon.",
      },
      {
        id: "pool",
        label: "Pool",
        objectId: "pool",
        comingSoonMessage: "The Pool is coming soon.",
      },
      {
        id: "deck-balcony",
        label: "Deck / Balcony",
        objectId: "deck-balcony",
        comingSoonMessage: "The Deck is coming soon.",
      },
    ],
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
