/**
 * Member-facing replies — warm, no architecture jargon.
 */

import type { AnywhereOriginDecision, DuplicateRiskAssessment } from "./types";

export function replyForDecision(input: {
  decision: AnywhereOriginDecision;
  duplicateRisk: DuplicateRiskAssessment;
  blueprintTitle?: string | null;
  projectTitle?: string | null;
  talkOnly?: boolean;
  awaitingApproval?: boolean;
}): string {
  if (input.talkOnly) {
    return "We can talk this through first, or build it together whenever you’re ready.";
  }

  if (input.awaitingApproval) {
    return "I have a suggestion ready — nothing changes until you approve it.";
  }

  switch (input.decision) {
    case "continue_existing":
      return input.duplicateRisk.candidateTitle
        ? `I found the work you were already shaping${
            input.duplicateRisk.candidateTitle.startsWith("work-")
              ? ""
              : ` — ${input.duplicateRisk.candidateTitle}`
          }. We can continue from here.`
        : "I found the work you were already shaping. We can continue from here.";
    case "connect_existing":
      return input.projectTitle
        ? `This looks connected to ${input.projectTitle}. Would you like to connect this rather than create another copy?`
        : "This looks connected to something you’re already building. Would you like to connect this rather than create another copy?";
    case "create_new":
      return input.blueprintTitle
        ? `I found a Blueprint that fits — ${input.blueprintTitle}. We can begin from there.`
        : "This may deserve its own plan. We can begin whenever you’re ready.";
    case "clarify":
      return "I want to make sure we open the right thing — continue what you started, or begin something new?";
    case "conversation_support_only":
      return "We can stay right here and think it through. No need to open a plan unless you want one.";
    case "awaiting_approval":
      return "I have a suggestion ready — nothing changes until you approve it.";
    default:
      return "I’m with you — tell me what would help most.";
  }
}
