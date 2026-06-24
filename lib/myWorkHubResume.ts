/**
 * Bridge My Work Hub resume rows to HomeResumeItem for shared resume handlers.
 */

import type { HomeResumeItem } from "./homeResumeItem";
import type { ContinuityItemType } from "./continuityManifest";
import type { MyWorkHubItem } from "./myWorkHub";

function resumeFields(item: MyWorkHubItem): Pick<
  HomeResumeItem,
  "typeLabel" | "lastAction" | "nextStep"
> {
  const nextStep = item.nextStep ?? "Continue where you left off";
  return {
    typeLabel: item.typeLabel,
    lastAction: nextStep,
    nextStep,
  };
}

export function continuityToHomeResume(item: MyWorkHubItem): HomeResumeItem | null {
  if (item.openTarget.kind !== "resume") {
    if (item.openTarget.kind === "project") {
      return {
        id: item.id,
        kind: "project",
        title: item.title,
        ...resumeFields(item),
        ts: item.date,
        projectId: item.openTarget.projectId,
      };
    }
    return null;
  }

  const type = item.openTarget.continuityType;
  const kind = continuityKindToHome(type);

  return {
    id: item.id,
    kind,
    title: item.title,
    ...resumeFields(item),
    ts: item.date,
    projectId: item.openTarget.projectId,
    avatarId: item.openTarget.avatarId,
    activityId: type === "decision-compass" ? "decision-compass" : undefined,
    strategyId: item.openTarget.strategyId,
  };
}

function continuityKindToHome(
  type: ContinuityItemType,
): HomeResumeItem["kind"] {
  switch (type) {
    case "create-draft":
    case "create-saved-for-later":
      return "create";
    case "workspace-sop":
      return "workspace";
    case "client-avatar":
      return "client-avatar";
    case "decision-compass":
      return "decision-compass";
    case "strategy-apply":
      return "strategy";
    case "visual-focus-map":
      return "visual-focus";
    default:
      return "project";
  }
}
