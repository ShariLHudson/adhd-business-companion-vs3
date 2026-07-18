/**
 * Package 209 — Human Conversation Validator contracts.
 * Scores and findings are internal only — never user-facing.
 */

export type HumanConversationFailureCode =
  | "HCV_TOPIC_DRIFT"
  | "HCV_BACKGROUND_REPLACED_TOPIC"
  | "HCV_TOPIC_ANCHOR_MISSING"
  | "HCV_USER_CORRECTION_IGNORED"
  | "HCV_REJECTED_INTERPRETATION_REUSED"
  | "HCV_AI_LIKE_LANGUAGE"
  | "HCV_ABSTRACT_COACHING_LANGUAGE"
  | "HCV_UNNATURAL_FORMALITY"
  | "HCV_TEMPLATE_SHELL_DETECTED"
  | "HCV_NOT_PLAIN_LANGUAGE"
  | "HCV_GENERIC_RESPONSE"
  | "HCV_MISSING_TOPIC_REFERENCE"
  | "HCV_EMPTY_ACKNOWLEDGEMENT"
  | "HCV_COPYABLE_ANYWHERE_RESPONSE"
  | "HCV_LATEST_TURN_IGNORED"
  | "HCV_CONVERSATION_RESTARTED"
  | "HCV_QUESTION_ALREADY_ANSWERED"
  | "HCV_PHASE_MISMATCH"
  | "HCV_FAILED_REPAIR_CONTINUITY"
  | "HCV_NOT_SHARI_VOICE"
  | "HCV_CLINICAL_TONE"
  | "HCV_CORPORATE_TONE"
  | "HCV_SCRIPTED_TONE"
  | "HCV_OVERCOACHED_TONE"
  | "HCV_PRESCRIPTIVE_TONE"
  | "HCV_GENERIC_QUESTION"
  | "HCV_STACKED_QUESTIONS"
  | "HCV_REPEATED_QUESTION"
  | "HCV_LEADING_QUESTION"
  | "HCV_UNSUPPORTED_EMOTIONAL_QUESTION"
  | "HCV_QUESTION_DOES_NOT_ADVANCE"
  | "HCV_INTERROGATION_RHYTHM"
  | "HCV_QUESTION_EVERY_TURN"
  | "HCV_MISSING_USEFUL_OBSERVATION"
  | "HCV_POOR_CONVERSATION_RHYTHM"
  | "HCV_REPEATED_SENTENCE_PATTERN"
  | "HCV_REPEATED_OPENING"
  | "HCV_REPEATED_CLOSING"
  | "HCV_TEMPLATE_OVERUSE"
  | "HCV_LOW_LANGUAGE_VARIETY"
  | "HCV_HIDDEN_MEANING_INVENTED"
  | "HCV_UNSUPPORTED_INTERPRETATION"
  | "HCV_EMOTIONAL_OVERREACH"
  | "HCV_USER_MEANING_REPLACED"
  | "HCV_UNCLEAR_REFERENT"
  | "HCV_MALFORMED_TOPIC_PHRASE"
  | "HCV_DENSE_PARAGRAPH"
  | "HCV_EXCESSIVE_LENGTH"
  | "HCV_INCOMPLETE_SENTENCE"
  | "HCV_CONFUSING_WORDING"
  | "HCV_ROLE_MISMATCH";

export type ValidationFinding = {
  dimension: string;
  code: HumanConversationFailureCode;
  detail: string;
  critical: boolean;
};

export type HumanConversationValidationResult = {
  passed: boolean;
  overallScore: number;
  criticalFailure: boolean;
  failureCodes: HumanConversationFailureCode[];
  findings: ValidationFinding[];
  regenerationInstructions: string[];
  safeFallbackRequired: boolean;
  /** Dimension scores out of max — internal only */
  dimensionScores: {
    topicFidelity: number;
    naturalLanguage: number;
    specificity: number;
    continuity: number;
    shariVoice: number;
    questionQuality: number;
    rhythmVariety: number;
    interpretation: number;
    clarity: number;
  };
};

export type HcvMessage = {
  role: "user" | "assistant";
  content: string;
};

export type HcvValidateInput = {
  draftText: string;
  userText: string;
  messages: readonly HcvMessage[];
  topicAnchor?: string | null;
  currentFocus?: string | null;
  conversationMode?: string | null;
  conversationPhase?: string | null;
  userCorrections?: readonly string[];
  rejectedInterpretations?: readonly string[];
  conversationalMove?: string | null;
  activeRole?: string | null;
  repairActive?: boolean;
  experienceId?: string | null;
};
