import { CREATE_BACKGROUND_SRC } from "@/lib/estateExperienceBackgrounds";

/**
 * Ghost ownership quarantine — legacy Create split shell.
 *
 * openCreateWorkspace is now Estate-only (dual shell retired at open).
 * Prefer Create Estate paths; do not reintroduce chat|panel split ownership.
 *
 * ROOT CAUSE (pre-fix):
 * Menu Create → openCreateEstateCore → CreateEstateEntrancePanel (Art Studio) ✅
 * Type pick → startFreshCreateFromEstate → openCreateWorkspace →
 *   activeSection "home" + workspacePanel "content-generator" + chatLayoutMode "split"
 *   → WorkspaceLayout + ContentGeneratorPanel (legacy Chat | blank panel) ❌
 *
 * ACTIVE BEFORE FIX:
 * - Shell: WorkspaceLayout split beside ContentGeneratorPanel
 * - Component: ContentGeneratorPanel / CreateWorkspaceV2Panel in split mode
 *
 * ACTIVE AFTER FIX:
 * - Shell: CreateEstateRoomShell (Art Studio full-bleed)
 * - Component: CreateEstateWorkingPanel (+ CreateWorkspaceV2Panel presentation="estate")
 *
 * Do not delete ContentGeneratorPanel or openCreateWorkspace until authenticated
 * Create + Project Home paths are proven and all references retargeted.
 */

export const LEGACY_CREATE_SPLIT_SHELL = {
  status: "quarantined" as const,
  shell: "WorkspaceLayout + content-generator split",
  panel: "ContentGeneratorPanel",
  replacedBy: {
    shell: "CreateEstateRoomShell",
    panel: "CreateEstateWorkingPanel",
    roomBg: CREATE_BACKGROUND_SRC,
  },
  rule: "Create shapes the work. Projects carries the work forward.",
};

/** True when the mounted Create UI is the Estate Art Studio destination. */
export function isEstateCreateShellMounted(input: {
  activeSection: string | null | undefined;
  createShellAttr?: string | null;
}): boolean {
  if (input.activeSection !== "create") return false;
  if (input.createShellAttr && input.createShellAttr !== "estate-art-studio") {
    return false;
  }
  return true;
}

/** Detect legacy split Create still owning the viewport. */
export function isLegacyCreateSplitActive(input: {
  activeSection: string | null | undefined;
  workspacePanel: string | null | undefined;
  chatLayoutMode: string | null | undefined;
}): boolean {
  return (
    input.workspacePanel === "content-generator" &&
    input.chatLayoutMode === "split" &&
    (input.activeSection === "home" || input.activeSection === "create")
  );
}
