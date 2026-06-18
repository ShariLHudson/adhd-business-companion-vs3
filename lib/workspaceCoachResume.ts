/**
 * Decide whether Build With Shari should resume an in-progress workspace coach
 * session instead of re-seeding a fresh opener.
 */

import type { AppSection } from "./companionUi";
import type { WorkspaceContext } from "./workspaceAwareness";
import { workspaceCoachSeedKey, type WorkspaceCoachExtras } from "./workspaceCoachAutoStart";

export type WorkspaceCoachResumeInput = {
  sourceSection: AppSection;
  ctx: WorkspaceContext | null;
  extras?: WorkspaceCoachExtras;
  projectCoachActive: boolean;
  businessStrategyActive: boolean;
  chatHasProjectContext: boolean;
  seededKey: string | null;
};

/** True when chat should continue the current workspace session — not restart. */
export function shouldResumeWorkspaceCoach(input: WorkspaceCoachResumeInput): boolean {
  const {
    sourceSection,
    ctx,
    extras,
    projectCoachActive,
    businessStrategyActive,
    chatHasProjectContext,
    seededKey,
  } = input;

  if (sourceSection === "projects") {
    return (
      projectCoachActive ||
      Boolean(ctx?.selectedItemId) ||
      chatHasProjectContext
    );
  }

  if (sourceSection === "playbook") {
    return businessStrategyActive;
  }

  if (seededKey != null) {
    return true;
  }

  void extras;
  return false;
}

export function workspaceCoachResumeSeedKey(
  ctx: WorkspaceContext | null,
  extras?: WorkspaceCoachExtras,
): string | null {
  return ctx ? workspaceCoachSeedKey(ctx, extras) : null;
}
