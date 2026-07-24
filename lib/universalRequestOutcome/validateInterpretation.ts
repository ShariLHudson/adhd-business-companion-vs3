import type {
  RequestInterpretationValidation,
  UniversalRequestUnderstanding,
} from "./types";

/**
 * Validate that interpretation preserved explicit user qualifiers.
 */
export function validateRequestInterpretation(
  u: UniversalRequestUnderstanding,
): RequestInterpretationValidation {
  const raw = u.rawRequest.toLowerCase();
  const dropped: string[] = [];
  const contradictory: string[] = [];

  const durationMentioned =
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*[- ]?(day|days|week|weeks)\b/.test(
      raw,
    );
  if (durationMentioned && !u.qualifiers.durationPreserved) {
    dropped.push("duration");
  }

  const planMentioned = /\b(content plan|plan|calendar|campaign|series|sequence)\b/.test(
    raw,
  );
  const postOnly =
    u.createArtifactType === "Facebook Post" ||
    u.createArtifactType === "Social Post" ||
    u.createArtifactType === "LinkedIn Post";
  if (planMentioned && postOnly && !/\b(post|caption)\b/.test(raw.replace(/content plan|social media plan/g, ""))) {
    dropped.push("plan_intent");
    contradictory.push("plan_collapsed_to_single_post");
  }

  if (
    /\bfive[- ]day\b|\b5[- ]day\b/.test(raw) &&
    (u.requestedQuantity == null || u.requestedQuantity < 5)
  ) {
    dropped.push("five_day_quantity");
  }

  if (
    /\bstep[- ]by[- ]step|how (do|to)|teach me|walk me through\b/.test(raw) &&
    !u.qualifiers.stepByStep
  ) {
    dropped.push("step_by_step");
  }

  const overNarrowed =
    contradictory.includes("plan_collapsed_to_single_post") ||
    (durationMentioned && postOnly);

  const preservedDurations: string[] = [];
  if (u.requestedDuration) {
    preservedDurations.push(
      `${u.requestedDuration.value}_${u.requestedDuration.unit}`,
    );
  }
  const preservedQuantities: string[] = [];
  if (u.requestedQuantity != null) {
    preservedQuantities.push(String(u.requestedQuantity));
  }

  return {
    preservedActions: [u.primaryIntent, ...u.secondaryIntents],
    preservedQuantities,
    preservedDurations,
    preservedDeliverables: [u.primaryDeliverable, ...u.supportingDeliverables],
    preservedSubjects: u.creationFamily ? [u.creationFamily] : [],
    preservedAudience: u.intendedAudience ? [u.intendedAudience] : [],
    preservedChannels: u.intendedChannel ? [u.intendedChannel] : [],
    preservedConstraints: [
      ...u.knownConstraints,
      ...u.inferredConstraints,
    ],
    droppedQualifiers: dropped,
    contradictoryInferences: contradictory,
    overNarrowed,
    validationPassed: dropped.length === 0 && !overNarrowed,
  };
}

/**
 * Validate a proposed Create artifact label against understanding.
 * Rejects Social/Facebook Post for multi-day content plans.
 */
export function artifactTypePreservesUnderstanding(
  artifactType: string,
  u: UniversalRequestUnderstanding,
): boolean {
  const label = artifactType.trim().toLowerCase();
  const isPost =
    label === "facebook post" ||
    label === "social post" ||
    label === "linkedin post" ||
    label === "instagram post";
  if (u.qualifiers.planNotPost && isPost) return false;
  if (u.qualifiers.seriesPreserved && isPost) return false;
  if (
    u.creationFamily === "content_plan" &&
    isPost
  ) {
    return false;
  }
  return true;
}
