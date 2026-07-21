/**
 * 106 — Blueprint Capability Manifest.
 * UI reads capabilities instead of hard-coded Work Type rules.
 */

import {
  getBlueprint,
  getWorkTypePackage,
  type BlueprintDefinition,
  type WorkTypeCapabilityFlags,
} from "@/lib/universalWorkEngine";

export type BlueprintCapabilityId =
  | "groupedSections"
  | "builderMode"
  | "projects"
  | "tasks"
  | "goals"
  | "calendar"
  | "visualThinking"
  | "evidenceLinks"
  | "boardReview"
  | "chamberReview"
  | "assembly"
  | "certification";

export type BlueprintCapabilityManifest = {
  blueprintId: string;
  workTypeId: string | null;
  capabilities: Readonly<Record<BlueprintCapabilityId, boolean>>;
  labels: Readonly<Record<BlueprintCapabilityId, string>>;
};

const LABELS: Record<BlueprintCapabilityId, string> = {
  groupedSections: "Grouped sections",
  builderMode: "Builder Mode",
  projects: "Projects",
  tasks: "Tasks",
  goals: "Goals",
  calendar: "Calendar",
  visualThinking: "Visual Thinking",
  evidenceLinks: "Evidence links",
  boardReview: "Board review",
  chamberReview: "Chamber review",
  assembly: "Assembly",
  certification: "Certification",
};

function fromWorkTypeFlags(
  flags: WorkTypeCapabilityFlags | null | undefined,
  bp: BlueprintDefinition | null,
): Record<BlueprintCapabilityId, boolean> {
  return {
    groupedSections: Boolean(bp?.groups?.length),
    builderMode: true,
    projects: Boolean(flags?.projectBridge),
    tasks: Boolean(flags?.tasks),
    goals: true,
    calendar: true,
    visualThinking: true,
    evidenceLinks: true,
    boardReview: Boolean(flags?.boardReview),
    chamberReview: Boolean(flags?.chamberRouting),
    assembly: true,
    certification: Boolean(bp?.certificationRules?.length),
  };
}

/** Resolve capability manifest for a Blueprint (reads Work Type package flags). */
export function resolveBlueprintCapabilityManifest(
  blueprintId: string,
  version?: string | null,
): BlueprintCapabilityManifest {
  const bp = getBlueprint(blueprintId, version);
  const workTypeId = bp?.compatibleWorkTypeIds[0] ?? null;
  const pkg = workTypeId ? getWorkTypePackage(workTypeId) : null;
  return {
    blueprintId,
    workTypeId,
    capabilities: fromWorkTypeFlags(pkg?.capabilities, bp),
    labels: LABELS,
  };
}

export function listEnabledBlueprintCapabilities(
  manifest: BlueprintCapabilityManifest,
): BlueprintCapabilityId[] {
  return (Object.keys(manifest.capabilities) as BlueprintCapabilityId[]).filter(
    (id) => manifest.capabilities[id],
  );
}
