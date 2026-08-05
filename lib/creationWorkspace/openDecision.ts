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
  /**
   * ADR-013 (2026-08-05, founder-approved) — when the request originated
   * from Create Begin ("create"), apply the narrowed boundary below:
   * default to Create, Creation Workspace only for explicit
   * coordinated-work signals. ADR-013 scoped itself to the Begin-time
   * routing default only, so every other caller (chat, research library,
   * "creation_workspace" default) keeps the prior broader catch-all
   * unchanged — see exploratoryCreateRouting.test.ts, which locks in that
   * chat-originated genuine execution intent still opens Creation
   * Workspace regardless of this ADR.
   */
  sourceExperience?: string | null;
}): CreationWorkspaceOpenDecision {
  const u = input.understanding;
  const t = u.normalizedRequest.toLowerCase();
  const isCreateBeginBoundary = input.sourceExperience === "create";

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
    // Uncertainty-about-what-to-make language ("best way", "figure out",
    // "not sure what", "organize this") is not a coordination signal, so
    // ADR-013's Begin boundary excludes it — that belongs to Start With
    // Guidance, not this gate. Every other caller keeps it, unchanged.
    (!isCreateBeginBoundary &&
      /\b(best way|figure out|not sure what|organize this)\b/.test(t))
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

  // ADR-013 (2026-08-05, founder-approved) — for Create Begin specifically,
  // stop here: default to Create rather than falling through to the
  // catch-all below. Every single-artifact request (Checklist, SOP,
  // Report, Proposal, Guide, Email, Blog, Social Post, etc.) lands in
  // Create → Current Focus unless one of the coordinated-work signals
  // above already matched. See the 2026-08-05 architectural audit for the
  // full trace of why the old unqualified catch-all made this qualifier
  // list's actual behavioral effect nothing beyond an internal telemetry
  // string.
  if (
    !isCreateBeginBoundary &&
    (u.primaryIntent === "create" || u.creationFamily !== "unknown")
  ) {
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
