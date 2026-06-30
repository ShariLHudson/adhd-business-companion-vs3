import type { CoachingMode } from "@/lib/companionPrompt";
import type { AppSection, SidebarNavId } from "@/lib/companionUi";
import { normalizeSidebarNav } from "@/lib/companionUi";
import { isGrowthPanelSection } from "@/lib/growthNavigation";
import { isMyWorkPanelSection } from "@/lib/myWorkNavigation";

export type HomesteadSignTier = "destination" | "knowledge";

export type HomesteadSignpostItem = {
  id: SidebarNavId;
  label: string;
  tier: HomesteadSignTier;
  mode?: CoachingMode;
  /** Intelligence registry hook — not shown in UI. */
  objectId: string;
};

/** Primary homestead destinations — hanging from the lamp post. */
export const HOMESTEAD_SIGNPOST_DESTINATIONS: readonly HomesteadSignpostItem[] = [
  { id: "chat", label: "Today", tier: "destination", objectId: "messages", mode: "today" },
  {
    id: "focus",
    label: "Focus",
    tier: "destination",
    objectId: "focus-my-brain",
    mode: "focus",
  },
  { id: "grow", label: "Grow", tier: "destination", objectId: "grow" },
  { id: "create", label: "Create", tier: "destination", objectId: "create" },
  { id: "other", label: "Other", tier: "destination", objectId: "my-work" },
];

/** Knowledge resources — dropdown under the Other sign, not separate sidebar signs. */
export const HOMESTEAD_OTHER_DROPDOWN_ITEMS: readonly HomesteadSignpostItem[] = [
  {
    id: "growth",
    label: "Your Story",
    tier: "knowledge",
    objectId: "growth",
  },
  {
    id: "welcome-room",
    label: "Welcome Room",
    tier: "knowledge",
    objectId: "welcome-room",
  },
  { id: "how-do-i", label: "How Do I?", tier: "knowledge", objectId: "help" },
  { id: "playbook", label: "Strategies", tier: "knowledge", objectId: "playbook" },
  {
    id: "visual-thinking",
    label: "Visual Thinking",
    tier: "knowledge",
    objectId: "visual-thinking",
  },
];

/** @deprecated Use HOMESTEAD_OTHER_DROPDOWN_ITEMS — not rendered as sidebar signs. */
export const HOMESTEAD_SIGNPOST_KNOWLEDGE = HOMESTEAD_OTHER_DROPDOWN_ITEMS;

export const HOMESTEAD_SIGNPOST_ALL: readonly HomesteadSignpostItem[] = [
  ...HOMESTEAD_SIGNPOST_DESTINATIONS,
  ...HOMESTEAD_OTHER_DROPDOWN_ITEMS,
];

export function isHomesteadOtherNavActive(
  nav: SidebarNavId,
  section: AppSection,
): boolean {
  if (normalizeSidebarNav(nav) === "other") return true;
  if (isMyWorkPanelSection(section)) return true;
  if (isGrowthPanelSection(section)) return true;
  if (
    section === "how-do-i" ||
    section === "playbook" ||
    section === "visual-focus" ||
    section === "welcome-room"
  ) {
    return true;
  }
  if (normalizeSidebarNav(nav) === "welcome-room") return true;
  return false;
}
