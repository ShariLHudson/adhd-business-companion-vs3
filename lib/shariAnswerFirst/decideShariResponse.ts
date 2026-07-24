/**
 * Answer-first response decision — ordinary help before routing.
 */

import { newCreationWorkspaceId } from "@/lib/creationWorkspace/ids";
import { conversationModeFromHelpMode } from "./conversationModes";
import { classifyQuestionVersusAction } from "./questionVersusAction";
import type {
  ShariAnswerDepth,
  ShariAnswerStructure,
  ShariCapabilityOfferKind,
  ShariPrimaryHelpMode,
  ShariResponseDecision,
} from "./types";

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function inferDepth(text: string): ShariAnswerDepth {
  const t = text.toLowerCase();
  if (
    /\b(?:step by step|in detail|walk me through|everything i need|complete|from beginning|teach me|i have never|comprehensive)\b/.test(
      t,
    )
  ) {
    return "comprehensive";
  }
  if (/\b(?:detailed|thorough|full)\b/.test(t)) return "detailed";
  if (/\b(?:quickly|just tell me|briefly|in a nutshell|short version)\b/.test(t)) {
    return "brief";
  }
  if (/\b(?:what is|what's|define)\b/.test(t) && t.length < 60) return "brief";
  return "standard";
}

function inferHelpMode(
  text: string,
  qva: ReturnType<typeof classifyQuestionVersusAction>,
): {
  primary: ShariPrimaryHelpMode;
  secondary: ShariPrimaryHelpMode[];
  structure: ShariAnswerStructure;
} {
  const t = text.toLowerCase();

  if (qva.kind === "explicit_navigation") {
    return {
      primary: "explicit_navigation",
      secondary: [],
      structure: "prose",
    };
  }
  if (qva.kind === "explicit_creation") {
    return {
      primary: "formal_creation",
      secondary: ["direct_answer"],
      structure: "mixed",
    };
  }
  if (qva.kind === "explicit_project") {
    return {
      primary: "project_execution",
      secondary: [],
      structure: "checklist",
    };
  }
  if (qva.kind === "explicit_research") {
    return {
      primary: "research",
      secondary: ["how_to_guidance"],
      structure: "mixed",
    };
  }
  if (qva.kind === "explicit_visual") {
    return {
      primary: "visual_exploration",
      secondary: ["direct_answer"],
      structure: "mixed",
    };
  }

  if (
    /\b(?:i keep putting off|i'?m stuck|talk (?:this|it) through|why can'?t i|afraid to|feeling overwhelmed(?:\s+about)?|i feel overwhelmed|do not know where to start|don'?t know where to start)\b/.test(
      t,
    )
  ) {
    return {
      primary: "reflective_thinking",
      secondary: ["advice"],
      structure: "reflective",
    };
  }

  if (
    /\b(?:won'?t|will not|not working|isn'?t working|doesn'?t work|can'?t get|broken|error|fail(?:ing|ed)?)\b/.test(
      t,
    ) ||
    /\bqr code\b/.test(t)
  ) {
    return {
      primary: "troubleshooting",
      secondary: ["how_to_guidance"],
      structure: "troubleshoot_sequence",
    };
  }

  if (
    /\b(?:should i|is it worth|do you think|would you|am i better off|hire or|launch now or)\b/.test(
      t,
    )
  ) {
    return {
      primary: "advice",
      secondary: ["comparison"],
      structure: "prose",
    };
  }

  if (
    /\b(?:compare|versus|vs\.?|or a |better for|difference between)\b/.test(t)
  ) {
    return {
      primary: "comparison",
      secondary: ["advice"],
      structure: "comparison",
    };
  }

  if (
    /\b(?:give me ideas|brainstorm|ways i could|options for|ideas for|suggest (?:some|a few))\b/.test(
      t,
    )
  ) {
    return {
      primary: "brainstorming",
      secondary: ["simple_planning"],
      structure: "options",
    };
  }

  if (
    /\b(?:plan my|help me plan|what (?:do|should) i (?:do|work on)|three-step|before friday|prepare for tomorrow|what to work on first)\b/.test(
      t,
    )
  ) {
    return {
      primary: "simple_planning",
      secondary: ["how_to_guidance"],
      structure: "checklist",
    };
  }

  if (
    /\b(?:how do i|how to|how can i|how would i|how should i|walk me through|step by step)\b/.test(
      t,
    ) ||
    qva.kind === "question_about_creation" ||
    qva.kind === "question_about_projects" ||
    qva.kind === "question_about_research"
  ) {
    return {
      primary: "how_to_guidance",
      secondary: ["explanation"],
      structure: "numbered_steps",
    };
  }

  if (/\b(?:what is|what are|explain|tell me about|define|why)\b/.test(t)) {
    return {
      primary: "explanation",
      secondary: ["direct_answer"],
      structure: "prose",
    };
  }

  return {
    primary: "direct_answer",
    secondary: [],
    structure: "prose",
  };
}

function currentResearchRequired(text: string, mode: ShariPrimaryHelpMode): boolean {
  if (mode === "research") return true;
  const t = text.toLowerCase();
  if (
    /\b(?:right now|current|currently|active|today|this week|latest|live)\b/.test(
      t,
    ) &&
    /\b(?:find|research|look up|which|recommend|best|groups|events|tools|communities|statistics?|algorithm)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (
    /\bbest active\b/.test(t) ||
    /\bactive (?:facebook )?groups\b/.test(t) ||
    /\bcurrent (?:competitors|events|fees|prices|statistics?)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(?:price|law|regulation|statistic|schedule|availability|who is|contact)\b/.test(
      t,
    ) &&
    /\b(?:current|today|202[4-9]|right now)\b/.test(t)
  ) {
    return true;
  }
  return false;
}

function inferOffer(
  mode: ShariPrimaryHelpMode,
  text: string,
): ShariCapabilityOfferKind {
  const t = text.toLowerCase();
  if (mode === "explicit_navigation" || mode === "formal_creation") return "none";
  if (mode === "research") return "none";
  if (mode === "reflective_thinking") return "none";
  if (mode === "troubleshooting") return "none";
  if (/\bbooth|vendor table|packing\b/.test(t)) return "turn_into_checklist";
  if (/\bfacebook groups?|search phrases\b/.test(t)) return "continue_in_chat";
  if (/\bstrategic plan\b/.test(t) && mode === "how_to_guidance") {
    return "build_strategy";
  }
  if (/\bpodcast|launch|webinar\b/.test(t) && mode === "how_to_guidance") {
    return "turn_into_project";
  }
  if (mode === "brainstorming" && /\bcampaign|content\b/.test(t)) {
    return "create_from_answer";
  }
  if (mode === "how_to_guidance" || mode === "simple_planning") {
    return "continue_in_chat";
  }
  if (mode === "advice") return "none";
  return "none";
}

/**
 * Decide how Shari should respond. Prefer direct conversational help.
 */
export function decideShariResponse(rawRequest: string): ShariResponseDecision {
  const normalizedRequest = normalize(rawRequest);
  const qva = classifyQuestionVersusAction(normalizedRequest);
  const { primary, secondary, structure } = inferHelpMode(
    normalizedRequest,
    qva,
  );
  const answerDepth = inferDepth(normalizedRequest);
  const researchNeeded = currentResearchRequired(normalizedRequest, primary);

  const explicitNavigationRequested = qva.kind === "explicit_navigation";
  const explicitCreationRequested = qva.kind === "explicit_creation";
  const explicitResearchRequested = qva.kind === "explicit_research";
  const explicitProjectRequested = qva.kind === "explicit_project";
  const explicitDestinationRequested =
    explicitNavigationRequested ||
    explicitCreationRequested ||
    explicitProjectRequested ||
    qva.kind === "explicit_visual";

  const conversationalModes = new Set<ShariPrimaryHelpMode>([
    "direct_answer",
    "explanation",
    "how_to_guidance",
    "advice",
    "comparison",
    "brainstorming",
    "reflective_thinking",
    "troubleshooting",
    "simple_planning",
    "simple_creation",
  ]);

  const directAnswerPossible =
    conversationalModes.has(primary) ||
    primary === "research" ||
    qva.kind.startsWith("question_about");

  // Answer in chat unless this turn is an explicit create/project/nav/visual command.
  // Current-research turns still get stable guidance in chat (honest about limits).
  const directAnswerRequired =
    directAnswerPossible &&
    !explicitNavigationRequested &&
    !explicitCreationRequested &&
    !explicitProjectRequested &&
    primary !== "formal_creation" &&
    primary !== "project_execution" &&
    primary !== "explicit_navigation" &&
    !(primary === "visual_exploration" && qva.kind === "explicit_visual");

  // Routing allowed for explicit destination/create/project/visual commands.
  // Current-research needs are handled in chat (honest status + tools) — do not
  // auto-open Research Library before answering. Soft keyword matches must not
  // route before answering.
  const routingAllowed =
    explicitDestinationRequested ||
    primary === "formal_creation" ||
    primary === "project_execution" ||
    (primary === "visual_exploration" && qva.kind === "explicit_visual");

  const reasons = [
    ...qva.reasons,
    `mode:${primary}`,
    directAnswerRequired ? "answer_first" : "may_route",
    researchNeeded ? "current_research_may_apply" : "stable_guidance_ok",
  ];

  const optionalCapabilityOffer: ShariCapabilityOfferKind = directAnswerRequired
    ? inferOffer(primary, normalizedRequest)
    : "none";

  return {
    id: newCreationWorkspaceId("srd"),
    rawRequest: rawRequest,
    normalizedRequest,
    primaryHelpMode: primary,
    secondaryHelpModes: secondary,
    conversationMode: conversationModeFromHelpMode(primary),
    directAnswerPossible,
    directAnswerRequired,
    currentResearchRequired: researchNeeded,
    userContextRequired:
      primary === "advice" ||
      primary === "simple_planning" ||
      /\bmy (?:business|audience|offer|event)\b/i.test(normalizedRequest),
    consequentialDecision: primary === "advice",
    explicitDestinationRequested,
    explicitCreationRequested,
    explicitResearchRequested,
    explicitProjectRequested,
    explicitNavigationRequested,
    answerDepth,
    answerStructure: structure,
    followUpApproach:
      primary === "reflective_thinking"
        ? "one_question"
        : optionalCapabilityOffer !== "none"
          ? "offer_capability"
          : "continue_topic",
    optionalCapabilityOffer,
    automaticContinuation: false,
    routingAllowed,
    confidence: explicitDestinationRequested ? 0.95 : directAnswerRequired ? 0.88 : 0.7,
    reasons,
  };
}

/** True when route-before-answer intercepts must be suppressed. */
export function shouldSuppressRouteBeforeAnswer(
  decision: ShariResponseDecision,
): boolean {
  return decision.directAnswerRequired && !decision.routingAllowed;
}

/** True when Create / Projects / Research immediate opens must wait. */
export function shouldBlockImmediateExperienceOpen(
  decision: ShariResponseDecision,
): boolean {
  if (decision.explicitCreationRequested) return false;
  if (decision.explicitProjectRequested) return false;
  if (decision.explicitNavigationRequested) return false;
  return decision.directAnswerRequired;
}
