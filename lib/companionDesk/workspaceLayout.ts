/**
 * Workspace layout — where companion UI lives in the room.
 *
 * Two placements, one visual language (warm frosted glass, parchment/cream, soft shadows):
 * - **Floating card** — static image scenes and Focus My Brain guided workflows.
 * - **Companion Desk** — reserved; guided Focus workflows no longer use the bottom dock.
 *
 * Do not force every workspace into the bottom dock.
 */
import type { AppSection } from "@/lib/companionUi";
import { GROWTH_PANEL_SECTIONS } from "@/lib/growthNavigation";

export type WorkspacePresentationMode = "floating-card" | "companion-desk";

export type ActivitySessionSlice = {
  activityId: string;
  phase: "browse" | "active" | "stopped" | "complete";
};

export type WorkspaceLayoutContext = {
  activeSection: AppSection;
  overlay: string | null;
  workspacePanel: AppSection | null;
  welcomeScene: boolean;
  activitySession: ActivitySessionSlice;
};

/** Shared frosted surface for floating room workspaces. */
export const COMPANION_FLOATING_CARD_CLASS = "companion-workspace-frosted";

/**
 * Static image scene workspaces — content sits in a floating frosted card in the room.
 * @see docs/companion-homestead/COMPANION_WORKSPACE_STANDARD.md
 */
export const FLOATING_CARD_SECTIONS = [
  "home",
  "brain-dump", // Clear My Mind
  "energy", // Today's Reality
  "plan-my-day",
  "focus-audio", // Peaceful Places — ambient video, not step-by-step desk
  "games",
  "today",
  "visual-focus",
  ...GROWTH_PANEL_SECTIONS,
] as const satisfies readonly AppSection[];

export type FloatingCardSection = (typeof FLOATING_CARD_SECTIONS)[number];

/**
 * Video-guided experiences — bottom Companion Desk (interaction desk, not room card).
 * Resolved dynamically via sanctuary rules; listed here for product reference.
 */
export const COMPANION_DESK_GUIDED_EXPERIENCE_IDS = [
  "first-step-finder",
  "priority-sort",
  "break-into-pieces",
  "reset-reenergize",
] as const;

/** True when this section is designed as a static-scene floating card workspace. */
export function isFloatingCardSection(
  section: AppSection,
): section is FloatingCardSection {
  return (FLOATING_CARD_SECTIONS as readonly AppSection[]).includes(section);
}

/**
 * Companion Desk — reserved for future video workflows that need a bottom dock.
 * Focus My Brain guided activities use CompanionFloatingCard instead.
 */
export function usesCompanionDesk(_ctx: WorkspaceLayoutContext): boolean {
  return false;
}

export function usesFloatingWorkspaceCard(ctx: WorkspaceLayoutContext): boolean {
  return !usesCompanionDesk(ctx);
}

export function resolveWorkspacePresentationMode(
  ctx: WorkspaceLayoutContext,
): WorkspacePresentationMode {
  return usesCompanionDesk(ctx) ? "companion-desk" : "floating-card";
}

/** Desk layer should span edge-to-edge over video sanctuary scenes. */
export function companionDeskFullBleed(ctx: WorkspaceLayoutContext): boolean {
  return usesCompanionDesk(ctx);
}
