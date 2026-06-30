export type {
  HumanConversationViolation,
  HumanConversationEnforcementResult,
} from "./enforceHumanConversation";

export {
  HUMAN_CONVERSATION_FORBIDDEN_OPENERS,
  HUMAN_CONVERSATION_FORBIDDEN_PHRASES,
  HUMAN_CONVERSATION_FORBIDDEN_OPENER_LABELS,
  FORBIDDEN_SYSTEM_TRANSITION_PATTERNS,
  FORBIDDEN_SYSTEM_TRANSITION_LABELS,
  detectForbiddenHumanConversationOpener,
  containsForbiddenHumanConversationPhrase,
  containsForbiddenSystemTransitionPhrase,
  extractLeadingSentence,
} from "./forbiddenPatterns";

export {
  CURIOSITY_OPENERS,
  GENTLE_CURIOSITY_OPENERS,
  HUMAN_DRIFT_MARKERS,
  pickCuriosityOpener,
  intelligenceVoiceHint,
} from "./curiosityIntelligence";

export {
  CONVERSATION_HIERARCHY,
  CONVERSATION_HIERARCHY_PROMPT,
  CURIOSITY_OVER_INTERROGATION,
  MEMORY_FOR_RELATIONSHIP,
  PATTERN_INTELLIGENCE_VOICE,
  RELATIONSHIP_INTELLIGENCE_VOICE,
} from "./conversationHierarchy";

export {
  HUMAN_CONVERSATION_TWELVE_TESTS,
  evaluateHumanConversationTwelveTests,
  type HumanConversationTestId,
  type TwelveTestResult,
  type TwelveTestEvaluation,
} from "./twelveTests";

export {
  HUMAN_CONVERSATION_BENCHMARKS,
  type HumanConversationBenchmark,
} from "./benchmarkConversations";

export {
  HUMAN_CONVERSATION_PRINCIPLE,
  HUMAN_CONVERSATION_PROMPT_BLOCK,
  SUNROOM_TEST,
  humanConversationHintForChat,
} from "./humanConversationPrompt";

export {
  CONTEXT_BEFORE_CONTENT_PRINCIPLE,
  CONTEXT_BEFORE_CONTENT_PROMPT,
  COMPANION_PRESENCE_LINES,
  featureExplanationHintForChat,
  contextBeforeContentHintForChat,
} from "./contextBeforeContent";

export {
  WORKSPACE_TRANSITION_THINKING_LINES,
  workspaceTransitionThinkingLine,
  buildWorkspaceOpeningTransition,
  buildWorkspaceOpenedTransition,
  buildActionTransitionAck,
  buildAffirmativeWorkspaceTransition,
  type ActionTransitionContext,
  type ActionTransitionPhase,
} from "./actionTransition";

export {
  detectHumanConversationViolation,
  enforceHumanConversation,
  scrubForbiddenBodyPhrases,
  containsRewriteableHumanConversationIssues,
} from "./enforceHumanConversation";

export {
  SPARK_HUMAN_VOICE_PRINCIPLE,
  SPARK_HUMAN_VOICE_PROMPT_BLOCK,
  SPARK_HUMAN_VOICE_FINAL_CHECK,
  SPARK_HUMAN_VOICE_SCORECARD_QUESTION,
  SPARK_AI_VOICE_FORBIDDEN_LABELS,
  detectAiVoiceIssues,
  containsAiVoiceIssue,
  memberRequestedStructuredOutput,
  scrubAiVoiceFormatting,
  scrubAiVoicePhrases,
  type AiVoiceIssue,
} from "./sparkHumanVoice";
