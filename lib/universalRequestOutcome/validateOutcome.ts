import type {
  CreationPackage,
  OutcomeSubstanceValidation,
  UniversalRequestUnderstanding,
} from "./types";

/**
 * Validate generated package against the actual request (not nearest template).
 */
export function validateOutcomeSubstance(
  u: UniversalRequestUnderstanding,
  pkg: CreationPackage,
): OutcomeSubstanceValidation {
  const failureReasons: string[] = [];
  const daySections = pkg.sections.filter((s) => s.kind === "day");
  const stepSections = pkg.sections.filter((s) => s.kind === "step");
  const sectionCount = pkg.sections.filter(
    (s) => s.content.trim().split(/\s+/).length >= 8,
  ).length;

  const expectedDays =
    u.creationFamily === "content_plan" && u.requestedDuration?.unit === "day"
      ? u.requestedDuration.value
      : u.creationFamily === "content_plan"
        ? 5
        : null;

  if (expectedDays != null) {
    if (daySections.length < expectedDays) {
      failureReasons.push(
        `Expected ${expectedDays} day units; found ${daySections.length}.`,
      );
    }
    for (const day of daySections) {
      const c = day.content.toLowerCase();
      if (!/objective|topic|format|caption|call to action|visual/.test(c)) {
        failureReasons.push(`Day "${day.title}" lacks substantive fields.`);
      }
    }
    if (!pkg.sections.some((s) => /purpose|overall/i.test(s.title))) {
      failureReasons.push("Plan-level purpose missing.");
    }
  }

  if (u.qualifiers.stepByStep) {
    if (stepSections.length < 5) {
      failureReasons.push("Step-by-step guide lacks enough ordered steps.");
    }
    if (
      !pkg.sections.some((s) => /prepar/i.test(s.title)) &&
      !pkg.sections.some((s) => /completion|done|check/i.test(s.title))
    ) {
      failureReasons.push("Missing preparation or completion guidance.");
    }
  }

  const overNarrowedToSingleArtifact =
    Boolean(expectedDays && expectedDays >= 2) && daySections.length <= 1;

  if (overNarrowedToSingleArtifact) {
    failureReasons.push("Multi-day plan collapsed to a single artifact.");
  }

  if (sectionCount < 3) {
    failureReasons.push("Result is too thin to treat as substantive.");
  }

  return {
    passed: failureReasons.length === 0,
    failureReasons,
    dayCount: daySections.length,
    stepCount: stepSections.length,
    sectionCount,
    overNarrowedToSingleArtifact,
  };
}
