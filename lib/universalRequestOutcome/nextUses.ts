import type {
  CreationPackage,
  UniversalRequestUnderstanding,
} from "./types";

/**
 * Contextual next-use actions after a substantive result exists.
 * Never force destination choice before the result.
 */
export function resolveContextualNextUses(
  u: UniversalRequestUnderstanding,
  pkg: CreationPackage,
): string[] {
  const uses: string[] = ["Keep Working Here"];

  if (
    u.creationFamily === "content_plan" ||
    u.creationFamily === "handbook" ||
    u.creationFamily === "guide" ||
    u.creationFamily === "step_by_step_instructions" ||
    u.creationFamily === "program" ||
    u.creationFamily === "report"
  ) {
    uses.unshift("Continue in Create");
  }

  if (
    u.creationFamily === "content_plan" ||
    u.creationFamily === "campaign" ||
    u.creationFamily === "step_by_step_instructions" ||
    u.creationFamily === "program" ||
    u.requiresExecutionPlanning ||
    u.primaryIntent === "project"
  ) {
    uses.push("Turn Into a Project");
  }

  if (
    u.requiresVisualRepresentation ||
    u.creationFamily === "step_by_step_instructions" ||
    u.creationFamily === "process" ||
    u.creationFamily === "content_plan"
  ) {
    uses.push("Open in Visual Thinking Studio");
  }

  if (u.requiresStrategicContext || u.creationFamily === "campaign") {
    uses.push("Add to Strategic Planning");
  }

  if (u.requiresResearch || pkg.researchCollectionIds.length > 0) {
    uses.push("Save as Research");
  }

  uses.push("Ask a Chamber Member");

  // Dedupe preserve order
  const seen = new Set<string>();
  return uses.filter((u0) => {
    if (seen.has(u0)) return false;
    seen.add(u0);
    return true;
  });
}

export type ProjectProposalDraft = {
  title: string;
  phases: Array<{ name: string; milestones: string[]; tasks: string[] }>;
  dependencies: string[];
  decisions: string[];
  risks: string[];
  requiresReviewBeforeCreate: true;
};

/**
 * Infer a Project Proposal from a Creation Package — never silent task creation.
 */
export function buildProjectProposalFromPackage(
  u: UniversalRequestUnderstanding,
  pkg: CreationPackage,
): ProjectProposalDraft {
  if (u.creationFamily === "content_plan") {
    return {
      title: `Execute: ${pkg.title}`,
      phases: [
        {
          name: "Prepare",
          milestones: ["Brand voice confirmed", "Assets folder ready"],
          tasks: [
            "Confirm offer/audience",
            "Collect brand visuals",
            "Draft day-1 caption",
          ],
        },
        {
          name: "Produce",
          milestones: ["All five days drafted"],
          tasks: pkg.sections
            .filter((s) => s.kind === "day")
            .map((s) => `Produce ${s.title} assets and caption`),
        },
        {
          name: "Schedule & engage",
          milestones: ["Posts scheduled", "Engagement plan active"],
          tasks: [
            "Schedule posts",
            "Prepare reply prompts",
            "Track saves and clicks",
          ],
        },
      ],
      dependencies: ["Captions before scheduling", "Visuals before publish"],
      decisions: ["Primary platform emphasis", "Posting times"],
      risks: ["Inconsistent voice", "Missing CTA clarity"],
      requiresReviewBeforeCreate: true,
    };
  }

  if (u.qualifiers.stepByStep || u.creationFamily === "program") {
    return {
      title: `Implement: ${pkg.title}`,
      phases: [
        {
          name: "Setup",
          milestones: ["Prerequisites ready"],
          tasks: ["Gather tools", "Confirm owners"],
        },
        {
          name: "Execute steps",
          milestones: ["Core sequence complete"],
          tasks: pkg.sections
            .filter((s) => s.kind === "step")
            .slice(0, 8)
            .map((s) => s.title),
        },
        {
          name: "Review",
          milestones: ["Completion check passed"],
          tasks: ["Validate outcome", "Capture lessons"],
        },
      ],
      dependencies: ["Setup before execute"],
      decisions: ["Cadence", "Definition of done"],
      risks: ["Scope creep", "Skipped preparation"],
      requiresReviewBeforeCreate: true,
    };
  }

  return {
    title: `Project from: ${pkg.title}`,
    phases: [
      {
        name: "Clarify",
        milestones: ["Outcome confirmed"],
        tasks: ["Review package", "Confirm owners"],
      },
      {
        name: "Build",
        milestones: ["Draft complete"],
        tasks: ["Execute core work", "Review quality"],
      },
      {
        name: "Launch",
        milestones: ["Delivered"],
        tasks: ["Publish or hand off", "Capture follow-ups"],
      },
    ],
    dependencies: [],
    decisions: ["Priority order"],
    risks: ["Missing context"],
    requiresReviewBeforeCreate: true,
  };
}
