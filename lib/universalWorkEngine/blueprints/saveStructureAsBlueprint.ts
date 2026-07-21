/**
 * Save Create workshop structure as a UWE Blueprint (099).
 * Content is not copied unless explicitly retained via defaults.
 */

import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { workspaceV2Sections } from "@/lib/createWorkspaceSections";
import { resolveWorkTypeIdFromMemberLabel } from "../registry/universalWorkTypeRegistry";
import { getWorkTypePackage } from "../registry/universalWorkTypeRegistry";
import { registerBlueprint } from "./registry";
import { recordBlueprintAudit } from "./auditHistory";
import { ALL_BLUEPRINT_DEPTH_MODES } from "./types";
import type { BlueprintDefinition, BlueprintGroup, BlueprintSectionDef } from "./types";
import { resolveWorkshopMapForWorkflow } from "./resolveWorkshopMap";

export type SaveStructureAsBlueprintInput = {
  workflow: CreateWorkflowState;
  name: string;
  description?: string;
  category?: "personal" | "company" | "spark";
  /** When true, attach current section text as defaultValues (rare). */
  retainSectionDefaults?: boolean;
  workId?: string;
};

export function saveStructureAsBlueprint(
  input: SaveStructureAsBlueprintInput,
): BlueprintDefinition {
  const name = input.name.trim();
  if (!name) throw new Error("Blueprint name is required");

  const sectionsView = workspaceV2Sections(input.workflow);
  const sections: BlueprintSectionDef[] = sectionsView.map((s, order) => ({
    id: s.id,
    title: s.label,
    role: s.optional ? "optional" : "required",
    required: !s.optional,
    skippable: true,
    order,
  }));

  const map = resolveWorkshopMapForWorkflow(input.workflow);
  const groups: BlueprintGroup[] =
    map.mode === "grouped"
      ? map.groups.map((g) => ({
          groupId: g.groupId,
          title: g.title,
          description: g.description,
          order: g.order,
          collapsedByDefault: g.collapsedByDefault,
          sectionIds: g.sectionIds,
        }))
      : [];

  const workTypeId =
    resolveWorkTypeIdFromMemberLabel(input.workflow.selectedTypeLabel) ??
    (input.workflow.creationWorkspaceKind === "event" ? "event_plan" : null);

  const pkg = workTypeId ? getWorkTypePackage(workTypeId) : null;

  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Date.now().toString(36);

  const category = input.category ?? "personal";
  const blueprintId = `bp-${category}-${suffix}`;

  const defaultValues: Record<string, string> = {};
  if (input.retainSectionDefaults) {
    for (const s of sectionsView) {
      if (s.content.trim()) defaultValues[s.id] = s.content;
    }
  }

  const definition: BlueprintDefinition = {
    blueprintId,
    version: "1.0.0",
    category,
    compatibleWorkTypeIds: workTypeId
      ? [workTypeId]
      : pkg
        ? [pkg.workTypeId]
        : ["event_plan"],
    title: name,
    description: input.description?.trim() || `Structure saved from Create.`,
    intendedUse: "Reusable workshop structure for future Work.",
    complexity: sections.length >= 12 ? "complex" : "moderate",
    supportedDepthModes: ALL_BLUEPRINT_DEPTH_MODES,
    sections,
    groups,
    includeGroupHeadingsInAssembly: false,
    defaultValues,
    adaptiveQuestions: [],
    suggestedTasks: [],
    suggestedMilestones: [],
    commonlyForgottenItems: [],
    riskPrompts: [],
    researchPrompts: [],
    deliverables: [],
    chamberRoutingRecommendations: [],
    boardReviewRecommendations: [],
    projectBridgeRecommendations: workTypeId
      ? ["Bridge when structure is ready to execute"]
      : [],
    cartographyRelationshipRecommendations: [
      { relationship: "implements", note: "Work implements this structure" },
    ],
    completionCriteria: ["Structure has at least one section"],
    certificationRules: [],
  };

  registerBlueprint(definition);
  recordBlueprintAudit({
    blueprintId: definition.blueprintId,
    blueprintVersion: definition.version,
    workId: (input.workId as never) ?? null,
    action: category === "company" ? "save_as_company" : "save_as_personal",
    detail: `save_structure:${name}`,
  });
  return definition;
}
