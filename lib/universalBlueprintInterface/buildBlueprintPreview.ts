/**
 * Member-facing Blueprint preview — plain language, no schema names.
 */

import {
  getBlueprint,
  UnknownBlueprintError,
  type BlueprintDefinition,
  type BlueprintDepthMode,
} from "@/lib/universalWorkEngine";
import type { MemberBlueprintPreview } from "./types";

const DEPTH_LABEL: Record<BlueprintDepthMode, string> = {
  quick_start: "Quick Start — a useful first version",
  guided_build: "Guided Build — explanations and next steps",
  complete_planning: "Complete Planning — full expert depth",
};

const COMPLEXITY_LABEL: Record<BlueprintDefinition["complexity"], string> = {
  simple: "A lighter plan with the essentials",
  moderate: "A balanced plan with room to grow",
  complex: "A thorough plan for a larger undertaking",
};

function visibleSections(bp: BlueprintDefinition): string[] {
  return bp.sections
    .filter((s) => s.role !== "hidden_system" && !s.softDeleted)
    .map((s) => s.title);
}

function knownInfoHints(bp: BlueprintDefinition): string[] {
  const keys = new Set<string>();
  for (const q of bp.adaptiveQuestions) {
    for (const k of q.knownContextKeys ?? []) keys.add(k);
  }
  const labels: Record<string, string> = {
    business_name: "Business name",
    audience: "Audience",
    offers: "Offers",
    brand_preferences: "Brand preferences",
    project_id: "Existing Project",
    dates: "Dates",
    people: "People",
    budget: "Budget assumptions",
  };
  return [...keys].map((k) => labels[k] ?? k.replace(/_/g, " "));
}

export function buildMemberBlueprintPreview(
  blueprintId: string,
  version?: string | null,
): MemberBlueprintPreview {
  const bp = getBlueprint(blueprintId, version);
  if (!bp) throw new UnknownBlueprintError(blueprintId);

  return {
    blueprintId: bp.blueprintId,
    version: bp.version,
    title: bp.title,
    helpsCreate: bp.description,
    whoItIsFor: bp.intendedUse,
    detailLevel: COMPLEXITY_LABEL[bp.complexity],
    availableDepthModes: bp.supportedDepthModes,
    majorSections: visibleSections(bp),
    likelyDeliverables: [...bp.deliverables],
    suggestedTasks: bp.suggestedTasks.map((t) => t.title),
    suggestedMilestones: bp.suggestedMilestones.map((m) => m.title),
    commonlyForgotten: [...bp.commonlyForgottenItems],
    knownInfoMayReuse: knownInfoHints(bp),
    createsOrConnectsProject: bp.projectBridgeRecommendations.length > 0,
    chamberSupport: [...bp.chamberRoutingRecommendations],
    boardSupport: [...bp.boardReviewRecommendations],
    researchSupport: [...bp.researchPrompts],
    cartographySupport: bp.cartographyRelationshipRecommendations.map(
      (r) => r.note?.trim() || r.relationship.replace(/_/g, " "),
    ),
  };
}

export function depthModeMemberLabel(mode: BlueprintDepthMode): string {
  return DEPTH_LABEL[mode];
}
