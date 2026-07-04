import { evaluateSharedExperience } from "./evaluateSharedExperience";
import { SHARED_EXPERIENCE_VOICE_RULES } from "./identityGuard";
import type { SharedExperienceBridge } from "./types";
import {
  SHARED_EXPERIENCE_GOVERNING_PRINCIPLE,
  SHARED_EXPERIENCE_HUMILITY_LINE,
} from "./types";

export type SharedExperienceHintInput = {
  userText: string;
  recentBridgeIds?: readonly string[];
  momentumLocked?: boolean;
};

function formatBridgeGuidance(bridge: SharedExperienceBridge): string {
  const offers = bridge.helpfulOffers.map((o) => `- ${o}`).join("\n");
  return [
    `CANON RELATE (adapt naturally — do not copy verbatim unless it fits): ${bridge.relate}`,
    `HUMILITY (required): ${bridge.humilityFrame}`,
    `WHAT HAS HELPED SHARI (offer as possibilities, not prescriptions):\n${offers}`,
    `INVITE (member chooses — one question): ${bridge.inviteQuestion}`,
  ].join("\n");
}

/**
 * Optional LLM hint when Judgment allows a brief shared experience.
 * Returns null on teach-only or non-struggle turns.
 */
export function sharedExperienceHintForChat(
  input: SharedExperienceHintInput,
): string | null {
  const decision = evaluateSharedExperience(input);
  if (!decision.allowed || !decision.bridge) return null;

  return [
    `AUTHENTIC SHARED EXPERIENCE (${SHARED_EXPERIENCE_GOVERNING_PRINCIPLE}):`,
    ...SHARED_EXPERIENCE_VOICE_RULES.map((r) => `- ${r}`),
    "",
    "Rhythm: acknowledge member → brief relate → what helped Shari → humility → invite choice.",
    `Example humility tone: "${SHARED_EXPERIENCE_HUMILITY_LINE}"`,
    "",
    formatBridgeGuidance(decision.bridge),
    "",
    "Member remains the focus. Do not continue Shari's story. Do not assume their experience matches yours.",
  ].join("\n");
}
