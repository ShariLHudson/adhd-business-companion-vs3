/**
 * Validate that a chat answer is substantive — not routing, echo, or empty help.
 */

import type { ShariAnswerSubstanceValidation, ShariResponseDecision } from "./types";

const DESTINATION_MENU_RE =
  /\b(?:would you like to|choose one of|select (?:a|an|one)|open (?:create|projects|research|visual thinking|strategic)|i can (?:open|take you to)|here are (?:a few )?(?:places|destinations|workspaces))\b/i;

const ROUTE_BEFORE_ANSWER_RE =
  /\b(?:let'?s (?:open|head to|go to)|i'?ll open|opening (?:the )?(?:create|projects|research)|take you to)\b/i;

const WARNING_ONLY_RE =
  /\b(?:research (?:is )?(?:unavailable|not available)|i can'?t (?:help|answer)|please (?:use|open) (?:the )?(?:library|workspace))\b/i;

const GENERIC_RE =
  /\b(?:great question|that'?s a great|i'?m happy to help|let me know how i can help)\b/i;

const PROFILING_BEFORE_ANSWER_RE =
  /\b(?:tell me (?:a bit )?about your (?:business|audience|offer)|what do you do and who|did i hear that right|to help you better, can you tell me)\b/i;

export function validateShariAnswerSubstance(input: {
  decision: ShariResponseDecision;
  answer: string;
  priorContext?: string | null;
}): ShariAnswerSubstanceValidation {
  const answer = input.answer.trim();
  const request = input.decision.normalizedRequest;
  const failures: string[] = [];
  const repairInstructions: string[] = [];

  const requestEchoDetected =
    answer.length < 120 &&
    request.length > 10 &&
    answer.toLowerCase().includes(request.toLowerCase().slice(0, 40)) &&
    !/\b(?:here'?s how|start by|first|you can|consider)\b/i.test(answer);

  const destinationMenuOnlyDetected =
    DESTINATION_MENU_RE.test(answer) &&
    answer.split(/\n/).filter((l) => l.trim().length > 20).length < 3;

  const routeBeforeAnswerDetected =
    ROUTE_BEFORE_ANSWER_RE.test(answer.slice(0, 280)) &&
    !/\b(?:here'?s|first|start with|you(?:'ll| will) want)\b/i.test(
      answer.slice(0, 400),
    );

  const warningOnlyDetected =
    WARNING_ONLY_RE.test(answer) && answer.length < 220;

  const genericResponseDetected =
    GENERIC_RE.test(answer) && answer.length < 160;

  const profilingBeforeAnswerDetected =
    PROFILING_BEFORE_ANSWER_RE.test(answer) &&
    !/\b(?:here'?s how|start by|first[,:]|step\s*1|you(?:'ll| will) want)\b/i.test(
      answer,
    );

  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const minWords =
    input.decision.answerDepth === "brief"
      ? 25
      : input.decision.answerDepth === "comprehensive"
        ? 120
        : input.decision.primaryHelpMode === "how_to_guidance"
          ? 55
          : 40;

  const providesUsefulInformation = wordCount >= minWords;
  const directlyAddressesRequest =
    !requestEchoDetected &&
    !destinationMenuOnlyDetected &&
    !routeBeforeAnswerDetected &&
    !profilingBeforeAnswerDetected &&
    answer.length > 40;

  const requestedDepthSatisfied =
    input.decision.answerDepth === "brief"
      ? wordCount >= 20
      : input.decision.answerDepth === "comprehensive"
        ? wordCount >= 100
        : wordCount >= minWords;

  const actionableWhenAppropriate =
    input.decision.primaryHelpMode === "how_to_guidance" ||
    input.decision.primaryHelpMode === "troubleshooting" ||
    input.decision.primaryHelpMode === "simple_planning"
      ? /\b(?:first|then|next|step|start|check|try|do)\b/i.test(answer)
      : true;

  if (requestEchoDetected) {
    failures.push("request_echo");
    repairInstructions.push("Answer the question with practical substance.");
  }
  if (destinationMenuOnlyDetected) {
    failures.push("destination_menu_only");
    repairInstructions.push(
      "Provide the direct answer before any destination offer.",
    );
  }
  if (routeBeforeAnswerDetected) {
    failures.push("route_before_answer");
    repairInstructions.push("Remove routing language; answer first.");
  }
  if (warningOnlyDetected) {
    failures.push("warning_only");
    repairInstructions.push(
      "Give stable general guidance even when current research is limited.",
    );
  }
  if (genericResponseDetected) {
    failures.push("generic_response");
    repairInstructions.push("Replace filler with concrete help.");
  }
  if (profilingBeforeAnswerDetected) {
    failures.push("profiling_before_answer");
    repairInstructions.push(
      "Answer the how-to or advice request first; ask for business details only after helping.",
    );
  }
  if (!providesUsefulInformation) {
    failures.push("thin_answer");
    repairInstructions.push(
      `Expand to at least ~${minWords} words of useful guidance.`,
    );
  }
  if (!requestedDepthSatisfied) {
    failures.push("depth_unmet");
    repairInstructions.push("Match the requested depth.");
  }
  if (!actionableWhenAppropriate) {
    failures.push("not_actionable");
    repairInstructions.push("Include concrete actions or checks.");
  }

  const valid = failures.length === 0 && directlyAddressesRequest;

  return {
    valid,
    directlyAddressesRequest,
    providesUsefulInformation,
    requestedDepthSatisfied,
    explicitQualifiersPreserved: true,
    actionableWhenAppropriate,
    contextUsed: Boolean(input.priorContext?.trim()),
    uncertaintyHandled:
      !input.decision.currentResearchRequired ||
      /\b(?:may|might|current|verify|check|as of)\b/i.test(answer),
    requestEchoDetected,
    destinationMenuOnlyDetected,
    routeBeforeAnswerDetected,
    warningOnlyDetected,
    genericResponseDetected,
    failures,
    repairInstructions,
  };
}
