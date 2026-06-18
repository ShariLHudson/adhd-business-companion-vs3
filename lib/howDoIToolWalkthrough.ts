import type { AppSection } from "./companionUi";
import { supportsWorkspace } from "./workspaceMode";

/** How Do I must never stay pinned on the left — chat + coach replaces the guide. */
export function isHowDoIGuideBesideSource(section: AppSection): boolean {
  return section === "how-do-i";
}

export function shouldWalkThroughFromHowDoI(source: AppSection | null): boolean {
  return Boolean(source && isHowDoIGuideBesideSource(source));
}

/** Standalone panels (Focus, Adjust My Day) open beside chat without workspace panel. */
export function isHowDoIStandaloneTarget(section: AppSection): boolean {
  return !supportsWorkspace(section);
}
