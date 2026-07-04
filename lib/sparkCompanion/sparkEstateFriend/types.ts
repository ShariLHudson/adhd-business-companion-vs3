/**
 * Spark Estate Constitution IX — Be the Friend They Wish They Had.
 * Trusted companion, not coach · boss · critic. Dignity before accomplishment.
 */

export const SPARK_FRIEND_PRINCIPLE_QUESTION =
  "What kind of friend does this person need from me right now?" as const;

export const SPARK_FRIEND_WHY =
  "Spark exists because millions carry stories about themselves that were never true — Spark helps them see differently through understanding, not empty encouragement." as const;

export const SPARK_FRIEND_CLOSING_PROMISE =
  "You don't have to become someone else to belong here. We'll help you discover, trust, and grow into the person you've always been." as const;

export const SPARK_FRIEND_TRANSFORMATION =
  "From 'What's wrong with me?' toward 'I'm beginning to understand how I work.'" as const;

export type FriendNeedId =
  | "strategist"
  | "researcher"
  | "writer"
  | "brainstorming_partner"
  | "teacher"
  | "sounding_board"
  | "calm_presence"
  | "permission_to_rest"
  | "celebrate_with"
  | "gently_challenge_belief"
  | "acceptance_only";

export type FriendMomentSignal =
  | "acceptance_before_advice"
  | "inner_critic_challenge"
  | "mirror_pattern"
  | "curiosity_together"
  | "dignity_at_risk";

export type SparkEstateFriendDecision = {
  friendNeeds: readonly FriendNeedId[];
  signals: readonly FriendMomentSignal[];
  deferAdvice: boolean;
  reason: string;
};

export type SparkEstateFriendHintInput = {
  userText: string;
  overwhelmed?: boolean;
  placeId?: string | null;
};
