/**
 * Companion Decision Intelligence — "What would be most helpful right now?"
 */

import { loadConversationSession } from "@/lib/conversationSession";
import type { ConversationGoal } from "@/lib/conversationStabilization/goalClassifier";
import type { EstateCapability } from "@/lib/conversationStabilization/capabilityTypes";
import type {
  CompanionDecisionGuidance,
  CompanionDecisionInput,
  MemberNeedType,
} from "./types";

const FATIGUE_RE =
  /\b(?:for hours|all day|so tired|exhausted|burnt? out|fried|drained|been working)\b/i;

const VENT_RE =
  /\b(?:just need to vent|need to talk|listen|hear me out|rough day|hard day)\b/i;

const GOAL_LABEL: Record<string, string> = {
  continue_session: "continue what we started",
  explicit_navigation: "go somewhere on the Estate",
  capture: "capture a thought",
  create: "create something together",
  research: "research this properly",
  retrieve: "find something we already have",
  plan_strategy: "think through a plan",
  decision_support: "decide with clarity",
  help_how_to: "understand how something works",
  discovery_estate: "discover what Spark offers",
  general_conversation: "talk it through",
};

function inferNeedType(
  goal: ConversationGoal,
  userText: string,
  overwhelmed?: boolean,
): MemberNeedType {
  if (VENT_RE.test(userText) || (overwhelmed && !/\b(?:research|create|write)\b/i.test(userText))) {
    return "presence";
  }
  if (FATIGUE_RE.test(userText) || overwhelmed) {
    return "encouragement";
  }
  switch (goal) {
    case "explicit_navigation":
      return "navigation";
    case "research":
      return "research";
    case "retrieve":
    case "help_how_to":
      return "information";
    case "plan_strategy":
    case "decision_support":
      return "planning";
    case "create":
    case "capture":
      return "action";
    case "continue_session":
      return "action";
    default:
      return "information";
  }
}

function smallestNextStep(
  goal: ConversationGoal,
  needType: MemberNeedType,
  capability?: EstateCapability | null,
): string {
  if (capability === "navigation") {
    return "Navigate — one warm line, then go. No tour.";
  }
  if (capability === "room") {
    return "Describe the place from the Knowledge Base, then offer to take them if they want.";
  }
  if (capability === "research" || needType === "research") {
    return "Start researching together — one focused question, not a feature list.";
  }
  if (capability === "retrieval" || goal === "retrieve") {
    return "Search for what they asked — never suggest rooms first.";
  }
  if (capability === "capture" || goal === "capture") {
    return "Capture quietly — confirm it landed, nothing else.";
  }
  if (goal === "create" || capability === "create") {
    return "One create question — stay in the flow until they are ready for more.";
  }
  if (needType === "presence") {
    return "Listen first. One gentle line. No steps unless they ask.";
  }
  if (needType === "encouragement") {
    return "Acknowledge effort. One optional restorative invite — permission only.";
  }
  if (needType === "planning") {
    return "One planning question — not a framework dump.";
  }
  if (goal === "continue_session") {
    return "Pick up exactly where we left off — no restart, no recap lecture.";
  }
  return "One clear next step that matches what they meant.";
}

function maxChoicesFor(
  capability?: EstateCapability | null,
  needType?: MemberNeedType,
): number {
  if (capability === "navigation" || capability === "room") return 3;
  if (capability === "experience" || capability === "discovery") return 3;
  if (needType === "planning") return 3;
  return 1;
}

function continuityNote(): string | null {
  const spine = loadConversationSession();
  if (!spine) return null;

  if (spine.researchState?.status === "in_progress" && spine.researchState.query) {
    return `Research in progress: "${spine.researchState.query}" — continue, do not restart.`;
  }
  if (spine.activeArtifact?.title) {
    return `Active work: "${spine.activeArtifact.title}" — stay in this thread.`;
  }
  if (spine.activeArtifact?.itemType) {
    return `Active ${spine.activeArtifact.itemType} — continue naturally.`;
  }
  return null;
}

function formatDecisionHint(guidance: Omit<CompanionDecisionGuidance, "responseHint">): string {
  const lines = [
    "COMPANION DECISION (invisible — member never sees this):",
    `What they are trying to do: ${guidance.memberGoal}`,
    `Most helpful right now: ${guidance.smallestNextStep}`,
    `Need: ${guidance.needType}`,
    `One step only · max ${guidance.maxChoices} choice${guidance.maxChoices === 1 ? "" : "s"} · each choice needs a why`,
    "Never list features because they exist. Never market capabilities.",
    "Warm · calm · natural · one question max · no generic AI phrases",
  ];

  if (guidance.continuityNote) {
    lines.push(`Continuity: ${guidance.continuityNote}`);
  }
  if (!guidance.allowEstateInvite) {
    lines.push("No Estate room suggestions this turn — finish the current need first.");
  } else {
    lines.push(
      "Estate invite only if it genuinely supports them — permission first, never a command.",
    );
  }
  if (!guidance.allowDiscoveryInvite) {
    lines.push("No Discovery Key / Spark Cards / tours — current task comes first.");
  }
  if (guidance.progressiveGuidanceOnly) {
    lines.push(
      "Teach progressively: help with the task now; mention related tools only after breathing room.",
    );
  }

  return lines.join("\n");
}

export function evaluateCompanionDecision(
  input: CompanionDecisionInput,
): CompanionDecisionGuidance {
  const goal = input.goal;
  const needType = inferNeedType(goal, input.userText, input.overwhelmed);
  const sessionLocked = input.arbitration?.sessionLocked ?? false;
  const taskActive =
    sessionLocked ||
    goal === "research" ||
    goal === "create" ||
    goal === "retrieve" ||
    goal === "capture" ||
    goal === "continue_session";

  const memberGoal = GOAL_LABEL[goal] ?? GOAL_LABEL.general_conversation;
  const step = smallestNextStep(goal, needType, input.winningCapability);
  const maxChoices = maxChoicesFor(input.winningCapability, needType);

  const allowEstateInvite =
    !taskActive &&
    (needType === "encouragement" ||
      goal === "explicit_navigation" ||
      input.winningCapability === "navigation" ||
      input.winningCapability === "room" ||
      input.winningCapability === "experience");

  const allowDiscoveryInvite =
    !taskActive &&
    needType !== "research" &&
    needType !== "presence" &&
    goal !== "retrieve" &&
    goal !== "create";

  const core = {
    memberGoal,
    needType,
    smallestNextStep: step,
    maxChoices,
    oneQuestionOnly: true,
    allowEstateInvite,
    allowDiscoveryInvite,
    progressiveGuidanceOnly: taskActive,
    suppressFeatureDump: true,
    continuityNote: continuityNote(),
  };

  return {
    ...core,
    responseHint: formatDecisionHint(core),
  };
}

export function isCompanionDecisionIntelligenceEnabled(): boolean {
  if (typeof process === "undefined") return true;
  return process.env.NEXT_PUBLIC_COMPANION_DECISION_INTELLIGENCE !== "0";
}
