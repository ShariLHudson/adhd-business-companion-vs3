/**
 * Package 208 — Shari Natural Conversation & Topic Discipline Standard.
 * Mandatory for conversational experiences.
 */

export {
  GENERIC_TEMPLATE_PATTERNS,
  containsGenericConversationTemplate,
  failsHumanLanguageTest,
} from "./genericTemplateBan";

export {
  isBackgroundElaboration,
  extractRejectedSubject,
  detectsTopicSubjectRejection,
  recoverPreferredTopicFromHistory,
  responseCentersOnRejectedBackground,
} from "./topicDiscipline";

export {
  buildNaturalTopicReturn,
  passesFriendTest,
} from "./naturalVoice";

export {
  certifyNaturalConversation,
  type NaturalConversationFailure,
  type NaturalConversationResult,
} from "./certify";
