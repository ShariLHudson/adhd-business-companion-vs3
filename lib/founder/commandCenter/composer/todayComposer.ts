import type { MorningExperience } from "../types";
import { ExecutiveConciergeService } from "@/lib/founder/concierge/services/conciergeService";
import { getFlameMorningMessage } from "@/lib/founder/flame/services/flameService";
import type { ExecutiveDesk } from "../types";

export function composeMorningExperience(desk: ExecutiveDesk): MorningExperience {
  const flameMessage = getFlameMorningMessage();
  const conciergeGreeting = ExecutiveConciergeService.getMorningGreeting();
  const greetingText =
    typeof flameMessage === "string"
      ? flameMessage
      : (flameMessage?.text ?? conciergeGreeting);
  const oppCount = desk.topOpportunities.length;

  return {
    greeting: greetingText.startsWith("Good") ? greetingText : `Good morning, Shari. ${greetingText}`,
    officePrepared: "Your office is prepared.",
    missionLine: `Today's mission: ${desk.todaysMission.name} — ${desk.todaysMission.summary}`,
    decisionLine: desk.recommendedDecision
      ? `One decision deserves attention: ${desk.recommendedDecision.headline}`
      : "No urgent decision on the desk today.",
    opportunityLine:
      oppCount > 0
        ? `${oppCount} opportunit${oppCount === 1 ? "y is" : "ies are"} worth reviewing when you have a moment.`
        : "No new opportunities need attention today.",
    calmClose: "Everything else can wait.",
  };
}
