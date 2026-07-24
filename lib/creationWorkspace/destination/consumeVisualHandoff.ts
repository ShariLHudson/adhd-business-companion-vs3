/**
 * Visual Thinking consumer — projects Creation Workspace handoff into a
 * populated Thinking Workspace without re-running original research.
 */

import {
  applyExperiencePlanOverride,
  applyRequestText,
  clearGenerationBundle,
  clearKnowledgeBundle,
  clearPresentationPlan,
  clearThinkingWorkspace,
  createThinkingWorkspace,
  createVisualThinkingRequest,
  interpretVisualThinkingUnderstanding,
  knowledgeHandoffToGenerationContext,
  orchestrateVisualThinkingExperience,
  planVisualThinkingPresentation,
  prepareVisualThinkingKnowledge,
  saveGenerationBundle,
  saveKnowledgeBundle,
  savePresentationPlan,
  saveThinkingWorkspace,
  saveVisualThinkingRequestDraft,
  startGenerationFromConfirmedPlan,
  type ThinkingWorkspaceState,
  type VisualThinkingExperiencePlan,
  type VisualThinkingGenerationBundle,
  type VisualThinkingPresentationPlan,
} from "@/lib/cartographersStudio";
import {
  CREATION_WORKSPACE_VISUAL_HANDOFF_VERSION,
  MAX_HANDOFF_AGE_MS,
  type CreationWorkspaceVisualHandoff,
} from "./contracts";
import {
  isHandoffReusable,
  markHandoffConsumed,
  markHandoffFailed,
  markHandoffOpening,
} from "./registry";
import {
  clearVisualHandoff,
  peekVisualHandoff,
  storeVisualHandoff,
} from "./storage";

export type VisualSubstanceValidation = {
  valid: boolean;
  substantiveObjectCount: number;
  sequencePreserved: boolean;
  titleOnly: boolean;
  outlineOnly: boolean;
  warningAsPrimary: boolean;
  userEditedRepresented: boolean;
  fiveDayGroupsOk: boolean | null;
  failures: string[];
};

export type ConsumeVisualHandoffResult =
  | {
      ok: true;
      handoff: CreationWorkspaceVisualHandoff;
      thinkingWorkspace: ThinkingWorkspaceState;
      generationBundle: VisualThinkingGenerationBundle;
      presentationPlan: VisualThinkingPresentationPlan;
      initialRepresentation: string;
    }
  | {
      ok: false;
      reason: string;
      stage: string;
      handoff?: CreationWorkspaceVisualHandoff | null;
      validation?: VisualSubstanceValidation;
    };

function isStale(createdAt: string): boolean {
  const t = Date.parse(createdAt);
  if (!Number.isFinite(t)) return true;
  return Date.now() - t > MAX_HANDOFF_AGE_MS;
}

export function validateVisualHandoff(
  raw: unknown,
):
  | { ok: true; handoff: CreationWorkspaceVisualHandoff }
  | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "Missing Visual Thinking handoff." };
  }
  const h = raw as Partial<CreationWorkspaceVisualHandoff>;
  if (h.version !== CREATION_WORKSPACE_VISUAL_HANDOFF_VERSION) {
    return { ok: false, reason: "Unsupported Visual Thinking handoff version." };
  }
  if (!h.id || !h.workspaceId || !h.title || !Array.isArray(h.sections)) {
    return { ok: false, reason: "Malformed Visual Thinking handoff." };
  }
  if (h.createdAt && isStale(h.createdAt)) {
    return { ok: false, reason: "Visual Thinking handoff is stale." };
  }
  return { ok: true, handoff: h as CreationWorkspaceVisualHandoff };
}

export function validateVisualSubstance(
  handoff: CreationWorkspaceVisualHandoff,
): VisualSubstanceValidation {
  const sections = handoff.sections ?? [];
  const substantive = sections.filter(
    (s) => (s.body?.trim().length ?? 0) >= 24 && !/^warning:/i.test(s.title),
  );
  const titleOnly =
    substantive.length === 0 &&
    sections.every((s) => !(s.body?.trim()) || s.body.trim().length < 24);
  const outlineOnly =
    !titleOnly &&
    substantive.every(
      (s) =>
        s.body.trim().split(/\n/).length <= 1 && s.body.trim().length < 80,
    ) &&
    substantive.length > 0 &&
    substantive.every((s) => s.body.trim().length < 60);
  const warningAsPrimary =
    sections.length > 0 &&
    sections.every(
      (s) =>
        /warning|research needed|insufficient/i.test(s.title) ||
        /warning|research needed/i.test(s.body),
    );
  const dayLike = sections.filter(
    (s) =>
      s.itemType === "timeline_item" ||
      /day\s*\d+/i.test(s.title) ||
      s.groupId === "day",
  );
  const looksLikeFiveDay =
    /five.?day|5.?day|content plan|social/i.test(
      `${handoff.title} ${handoff.purpose}`,
    ) || dayLike.length >= 4;
  const fiveDayGroupsOk = looksLikeFiveDay
    ? dayLike.length >= 5 ||
      (handoff.groups?.length ?? 0) >= 5 ||
      (handoff.timelines?.[0]?.itemIds.length ?? 0) >= 5
    : null;

  const protectedIds = new Set(handoff.protectedItemIds ?? []);
  const userEditedRepresented =
    protectedIds.size === 0 ||
    sections.some((s) => s.userEdited || protectedIds.has(s.id));

  const sequencePreserved =
    (handoff.sequences?.length ?? 0) > 0 ||
    (handoff.timelines?.length ?? 0) > 0 ||
    sections.length >= 2;

  const failures: string[] = [];
  if (titleOnly) failures.push("Title-only payload rejected.");
  if (outlineOnly) failures.push("Outline-only payload rejected.");
  if (warningAsPrimary) failures.push("Warnings cannot be primary objects.");
  if (substantive.length < 2) {
    failures.push("Need at least two substantive objects.");
  }
  if (!sequencePreserved) failures.push("Required sequence not preserved.");
  if (!userEditedRepresented) {
    failures.push("User-edited content is missing from the visual handoff.");
  }
  if (fiveDayGroupsOk === false) {
    failures.push(
      "Five-day plan must include five distinct day groups or sequence objects.",
    );
  }

  return {
    valid: failures.length === 0,
    substantiveObjectCount: substantive.length,
    sequencePreserved,
    titleOnly,
    outlineOnly,
    warningAsPrimary,
    userEditedRepresented,
    fiveDayGroupsOk,
    failures,
  };
}

export function inferInitialVisualRepresentation(
  handoff: CreationWorkspaceVisualHandoff,
): string {
  const dayCount =
    handoff.timelines?.[0]?.itemIds.length ||
    handoff.groups?.filter((g) => /day/i.test(g.label)).length ||
    handoff.sections.filter((s) => s.itemType === "timeline_item").length;
  if (dayCount >= 3) return "campaign_sequence_timeline";
  if (handoff.processSteps.length >= 3) return "process_flow";
  if (handoff.decisionCandidates.length >= 2) return "options_comparison";
  if (/program|mentoring|journey/i.test(`${handoff.title} ${handoff.purpose}`)) {
    return "participant_journey";
  }
  if (/handbook|policy|role/i.test(`${handoff.title} ${handoff.purpose}`)) {
    return "section_hierarchy";
  }
  if (/strateg|risk|initiative/i.test(`${handoff.title} ${handoff.purpose}`)) {
    return "objective_initiative_map";
  }
  return "section_hierarchy";
}

function serializeHandoffContent(handoff: CreationWorkspaceVisualHandoff): string {
  const ordered = [...handoff.sections].sort((a, b) => a.order - b.order);
  return ordered
    .map((s, i) => {
      const prefix =
        s.itemType === "timeline_item"
          ? `Day ${i + 1}`
          : s.itemType === "process_step"
            ? `${i + 1}.`
            : "##";
      return `${prefix} ${s.title}\n${s.body}`;
    })
    .join("\n\n");
}

function tweakPlanForRepresentation(
  plan: VisualThinkingExperiencePlan,
  representation: string,
): VisualThinkingExperiencePlan {
  // Prefer deliverables whose generated blocks qualify for Thinking Workspace
  // entry (numbered_step / checklist_item / paragraph), not title-only shells.
  if (representation === "campaign_sequence_timeline") {
    return {
      ...plan,
      researchStage: "not_at_all",
      primaryDeliverable: "step_by_step_guide",
      supportingDeliverables: ["timeline", "checklist"],
      status: "ready_to_generate",
    };
  }
  if (representation === "process_flow") {
    return {
      ...plan,
      researchStage: "not_at_all",
      primaryDeliverable: "step_by_step_guide",
      supportingDeliverables: ["checklist"],
      status: "ready_to_generate",
    };
  }
  if (representation === "options_comparison") {
    return {
      ...plan,
      researchStage: "not_at_all",
      primaryDeliverable: "comparison",
      supportingDeliverables: ["decision_criteria"],
      status: "ready_to_generate",
    };
  }
  return {
    ...plan,
    researchStage: "not_at_all",
    primaryDeliverable: plan.primaryDeliverable || "step_by_step_guide",
    status: "ready_to_generate",
  };
}

export function projectVisualHandoffToWorkspace(
  handoff: CreationWorkspaceVisualHandoff,
): {
  thinkingWorkspace: ThinkingWorkspaceState;
  generationBundle: VisualThinkingGenerationBundle;
  presentationPlan: VisualThinkingPresentationPlan;
  initialRepresentation: string;
} {
  const attached = serializeHandoffContent(handoff);
  const representation = inferInitialVisualRepresentation(handoff);
  const seedText = `${handoff.title}. ${handoff.intendedCognitivePurpose || handoff.purpose}\n\n${attached}`;

  let request = createVisualThinkingRequest({});
  request = applyRequestText(request, seedText);
  const understanding = interpretVisualThinkingUnderstanding(request);
  let plan = orchestrateVisualThinkingExperience(understanding);
  plan = applyExperiencePlanOverride(plan, { kind: "confirm" });
  plan = tweakPlanForRepresentation(plan, representation);

  const knowledge = prepareVisualThinkingKnowledge({
    request,
    understanding,
    experiencePlan: plan,
    attachedStructuredContent: attached,
  });
  const ctx = knowledgeHandoffToGenerationContext(knowledge.handoff, {
    requestId: request.id,
    understandingId: understanding.id,
    rawRequest: request.rawRequest,
    userFacingGoal: understanding.userFacingGoal,
    successDefinition: understanding.successDefinition,
  });
  const generationBundle = startGenerationFromConfirmedPlan(plan, {
    requestId: ctx.requestId,
    understandingId: ctx.understandingId,
    rawRequest: ctx.rawRequest,
    userFacingGoal: ctx.userFacingGoal,
    successDefinition: ctx.successDefinition,
    suppliedContent: attached,
  });
  const presentationPlan = planVisualThinkingPresentation({
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
  });
  const thinkingWorkspace = createThinkingWorkspace({
    understanding,
    experiencePlan: plan,
    knowledgePackage: knowledge.package,
    generationBundle,
    presentationPlan,
  });
  if (!thinkingWorkspace) {
    throw new Error("Visual projection produced an empty workspace.");
  }

  // Persist so VT panel mounts populated
  clearThinkingWorkspace();
  clearGenerationBundle();
  clearKnowledgeBundle();
  clearPresentationPlan();
  saveVisualThinkingRequestDraft(request);
  saveKnowledgeBundle(knowledge);
  saveGenerationBundle(generationBundle);
  savePresentationPlan(presentationPlan);
  saveThinkingWorkspace(thinkingWorkspace);

  return {
    thinkingWorkspace,
    generationBundle,
    presentationPlan,
    initialRepresentation: representation,
  };
}

export function consumeCreationWorkspaceVisualHandoff(input?: {
  handoff?: CreationWorkspaceVisualHandoff | null;
}): ConsumeVisualHandoffResult {
  const raw = input?.handoff ?? peekVisualHandoff();
  const validated = validateVisualHandoff(raw);
  if (!validated.ok) {
    return {
      ok: false,
      reason: validated.reason,
      stage: "validate_visual",
      handoff: (raw as CreationWorkspaceVisualHandoff) ?? null,
    };
  }
  const handoff = validated.handoff;

  if (!isHandoffReusable(handoff.id)) {
    return {
      ok: false,
      reason: "Visual Thinking handoff was already consumed or superseded.",
      stage: "registry_guard",
      handoff,
    };
  }

  const substance = validateVisualSubstance(handoff);
  if (!substance.valid) {
    markHandoffFailed(handoff.id, "visual_substance", "retry_visual_projection");
    storeVisualHandoff(handoff);
    return {
      ok: false,
      reason: substance.failures.join(" "),
      stage: "visual_substance",
      handoff,
      validation: substance,
    };
  }

  markHandoffOpening(handoff.id);
  try {
    const projected = projectVisualHandoffToWorkspace(handoff);
    markHandoffConsumed(handoff.id, projected.thinkingWorkspace.id);
    clearVisualHandoff();
    return {
      ok: true,
      handoff,
      ...projected,
    };
  } catch (err) {
    markHandoffFailed(handoff.id, "visual_projection", "retry_visual_projection");
    storeVisualHandoff(handoff);
    return {
      ok: false,
      reason:
        err instanceof Error
          ? err.message
          : "Visual projection failed.",
      stage: "visual_projection",
      handoff,
      validation: substance,
    };
  }
}
