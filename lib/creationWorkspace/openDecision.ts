import type { UniversalRequestUnderstanding } from "@/lib/universalRequestOutcome";
import type { CreationWorkspaceOpenDecision } from "./types";

/**
 * Decide whether Creation Workspace should open, or bypass to a direct destination.
 * Available — not mandatory.
 */
export function decideCreationWorkspaceOpen(input: {
  understanding: UniversalRequestUnderstanding;
  hasSubstantivePackage: boolean;
  explicitDestination?:
    | "create"
    | "projects"
    | "visual_thinking"
    | "research"
    | null;
  userAskedToKeepWorking?: boolean;
  fromResearchUse?: boolean;
}): CreationWorkspaceOpenDecision {
  const u = input.understanding;
  const t = u.normalizedRequest.toLowerCase();

  if (!input.hasSubstantivePackage) {
    return {
      open: false,
      reason: "No substantive Creation Package yet.",
      bypassTo: u.primaryIntent === "research" ? "research" : "stay",
    };
  }

  if (input.explicitDestination === "projects") {
    return {
      open: false,
      reason: "User explicitly asked to build a Project.",
      bypassTo: "projects",
    };
  }

  if (
    input.explicitDestination === "visual_thinking" ||
    (/\b(show|see|map|visual)\b/.test(t) &&
      /\b(visual|map|diagram|timeline)\b/.test(t) &&
      !/\band\b/.test(t))
  ) {
    if (
      u.primaryIntent !== "create" &&
      u.creationFamily === "unknown" &&
      /\b(visual|map|diagram)\b/.test(t)
    ) {
      return {
        open: false,
        reason: "User explicitly asked for a visual result.",
        bypassTo: "visual_thinking",
      };
    }
  }

  if (
    u.primaryIntent === "research" &&
    !u.secondaryIntents.includes("create") &&
    !input.fromResearchUse &&
    !input.userAskedToKeepWorking
  ) {
    return {
      open: false,
      reason: "User asked only to continue researching.",
      bypassTo: "research",
    };
  }

  // Simple single artifact → Create directly
  const simpleEmail =
    /\b(thank[- ]?you email|short email|quick email|brief email)\b/.test(t) ||
    (u.createArtifactType === "Email" &&
      !u.requestedDuration &&
      !u.requestedQuantity &&
      !u.qualifiers.stepByStep &&
      u.creationFamily !== "communication_series");

  const simpleSingle =
    simpleEmail ||
    (u.createArtifactType != null &&
      /^(email|note|social post|facebook post|linkedin post)$/i.test(
        u.createArtifactType,
      ) &&
      !u.requestedDuration &&
      !(u.requestedQuantity && u.requestedQuantity > 1) &&
      !input.userAskedToKeepWorking &&
      !input.fromResearchUse);

  if (simpleSingle && input.explicitDestination !== "create") {
    // still allow bypass for simple
  }
  if (simpleSingle) {
    return {
      open: false,
      reason: "Simple single-item creation can open directly in Create.",
      bypassTo: "create",
    };
  }

  if (input.userAskedToKeepWorking || input.fromResearchUse) {
    return {
      open: true,
      reason: "User wants to develop or use research/creation further.",
    };
  }

  if (
    u.creationFamily === "content_plan" ||
    u.creationFamily === "handbook" ||
    u.creationFamily === "program" ||
    u.creationFamily === "curriculum" ||
    u.creationFamily === "campaign" ||
    u.qualifiers.stepByStep ||
    (u.requestedDuration?.value ?? 0) >= 2 ||
    (u.requestedQuantity ?? 0) >= 2 ||
    u.requiresExecutionPlanning ||
    /\b(best way|figure out|not sure what|organize this)\b/.test(t)
  ) {
    return {
      open: true,
      reason:
        "Coordinated or developing work benefits from Creation Workspace before destination choice.",
    };
  }

  if (input.explicitDestination === "create" && !simpleSingle) {
    // Clear Create destination with multi-part work → still workspace first when substantive package
    if (
      u.creationFamily === "document" ||
      u.creationFamily === "guide" ||
      u.creationFamily === "unknown"
    ) {
      return {
        open: true,
        reason: "Substantive document benefits from review before Create polish.",
      };
    }
  }

  if (u.primaryIntent === "create" || u.creationFamily !== "unknown") {
    return {
      open: true,
      reason: "Substantive Creation Package ready for development.",
    };
  }

  return {
    open: false,
    reason: "No clear need for intermediate workspace.",
    bypassTo: "stay",
  };
}
