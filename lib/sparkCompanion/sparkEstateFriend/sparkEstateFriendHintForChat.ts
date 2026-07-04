import { evaluateSparkEstateFriend } from "./evaluateFriend";
import {
  roomFriendVoiceHintForPlace,
  SPARK_ACCEPTANCE_LINES,
  SPARK_CURIOSITY_TOGETHER,
  SPARK_ESTATE_FRIEND_PROMPT_BLOCK,
  SPARK_GENTLE_CHALLENGE_OPENING,
  SPARK_MIRROR_OPENING,
} from "./principles";
import {
  SPARK_FRIEND_PRINCIPLE_QUESTION,
  type SparkEstateFriendHintInput,
} from "./types";

const FRIEND_NEED_LABELS: Record<string, string> = {
  strategist: "strategist",
  researcher: "researcher",
  writer: "writer",
  brainstorming_partner: "brainstorming partner",
  teacher: "teacher",
  sounding_board: "sounding board",
  calm_presence: "calm presence",
  permission_to_rest: "permission to rest",
  celebrate_with: "someone to celebrate with",
  gently_challenge_belief: "gentle challenge of unfair belief",
  acceptance_only: "acceptance first — no advice yet",
};

export function sparkEstateFriendHintForChat(
  input: SparkEstateFriendHintInput,
): string {
  const decision = evaluateSparkEstateFriend({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });

  const lines = [
    "CONSTITUTION IX (be the friend — relationship before role):",
    `Friend Principle: "${SPARK_FRIEND_PRINCIPLE_QUESTION}"`,
    `Friend need this turn: ${decision.friendNeeds
      .slice(0, 3)
      .map((id) => FRIEND_NEED_LABELS[id] ?? id)
      .join(" · ")}`,
  ];

  if (decision.deferAdvice) {
    lines.push(
      "",
      "ACCEPT BEFORE ADVISE — this moment may not need advice.",
      `Consider: "${SPARK_ACCEPTANCE_LINES[2]}" or "${SPARK_ACCEPTANCE_LINES[0]}"`,
      "Safety before solutions. Offer advice only if they invite it.",
    );
  }

  if (decision.signals.includes("inner_critic_challenge")) {
    lines.push(
      "",
      "INNER CRITIC — gentle challenge, never argue:",
      `"${SPARK_GENTLE_CHALLENGE_OPENING}" then evidence + "${SPARK_CURIOSITY_TOGETHER}"`,
      "Invite a more complete story — never replace their voice.",
    );
  }

  if (decision.signals.includes("mirror_pattern")) {
    lines.push(
      "",
      `MIRROR (grounded only): "${SPARK_MIRROR_OPENING}" — specific, kind, from real history.`,
    );
  }

  if (decision.signals.includes("dignity_at_risk")) {
    lines.push(
      "",
      "DIGNITY — leave them with more dignity than they arrived. No shame · guilt · conditional belonging.",
      "They belong before they accomplish anything.",
    );
  }

  if (decision.signals.includes("curiosity_together")) {
    lines.push(
      "",
      "Do not explain them — explore together. Never 'You do this because…'",
    );
  }

  const placeId = input.placeId?.trim();
  if (placeId) {
    const roomHint = roomFriendVoiceHintForPlace(placeId);
    if (roomHint) lines.push("", roomHint);
  }

  return lines.join("\n");
}

export { SPARK_ESTATE_FRIEND_PROMPT_BLOCK };
