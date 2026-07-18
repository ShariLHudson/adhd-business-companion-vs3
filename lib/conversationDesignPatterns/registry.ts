/**
 * Package 207 — Pattern registry for shared conversational quality.
 */

import type { CdpPatternId, ConversationDesignPattern } from "./types";

export const CONVERSATION_DESIGN_PATTERNS: readonly ConversationDesignPattern[] =
  [
    {
      id: "CDP-GROUNDED-OPENING",
      name: "Grounded Opening",
      owner: "platform",
      version: "1.0",
      applicableExperiences: ["talk-it-out", "shari", "chamber", "board"],
      whenToUse: "First response after the user names a topic",
      whenNotToUse: "After correction, clarification, or mid-thread focus shifts",
      requiredInputs: ["userText", "literalTopic"],
      expectedOutputShape: "Topic recognition + one grounded question",
      prohibitedLanguage: [
        "quieter question underneath",
        "that seems important",
        "tell me more",
      ],
      requiredValidators: ["grounded_acknowledgement", "no_hidden_meaning"],
      example: "What is making you consider hiring one now?",
      certificationStatus: "certified",
    },
    {
      id: "CDP-CLARIFY-REQUEST",
      name: "Clarify the Request",
      owner: "platform",
      version: "1.0",
      applicableExperiences: ["shari", "talk-it-out", "create", "projects"],
      whenToUse: "Intended help is unclear",
      whenNotToUse: "User already stated a clear reflective or action intent",
      requiredInputs: ["userText"],
      expectedOutputShape: "One concise clarification question",
      prohibitedLanguage: ["Here are some options", "Choose a category"],
      requiredValidators: ["one_question"],
      example: "Are you wanting to think this through, or take a practical step?",
      certificationStatus: "certified",
    },
    {
      id: "CDP-ACKNOWLEDGE-ADVANCE",
      name: "Acknowledge and Advance",
      owner: "platform",
      version: "1.0",
      applicableExperiences: ["talk-it-out", "shari", "chamber", "board"],
      whenToUse: "User shared concrete meaning; conversation should move",
      whenNotToUse: "User only vented and asked not to problem-solve",
      requiredInputs: ["userText", "topicAnchor"],
      expectedOutputShape: "Grounded recognition + forward move",
      prohibitedLanguage: ["I hear you", "That makes sense."],
      requiredValidators: ["grounded_acknowledgement"],
      example:
        "The risk of paying without measurable results is clearer. What result would justify the cost?",
      certificationStatus: "certified",
    },
    {
      id: "CDP-DIRECT-ANSWER",
      name: "Direct Answer",
      owner: "platform",
      version: "1.0",
      applicableExperiences: ["shari", "chamber", "create", "projects"],
      whenToUse: "User asked a direct factual or task question",
      whenNotToUse: "User asked to think something through",
      requiredInputs: ["userText"],
      expectedOutputShape: "Answer first, optional brief follow-up",
      prohibitedLanguage: ["What matters most"],
      requiredValidators: ["mode_match"],
      example: "A marketing assistant often handles content, posting, and follow-up.",
      certificationStatus: "certified",
    },
    {
      id: "CDP-REFLECTIVE-EXPLORE",
      name: "Reflective Exploration",
      owner: "platform",
      version: "1.0",
      applicableExperiences: ["talk-it-out", "shari"],
      whenToUse: "User wants to think without being told what to do",
      whenNotToUse: "Explicit create/plan/navigate request",
      requiredInputs: ["topicAnchor", "conversationPhase"],
      expectedOutputShape: "One reflective move; no advice takeover",
      prohibitedLanguage: ["you should hire", "the answer is"],
      requiredValidators: ["question_intelligence", "no_hidden_meaning"],
      example: "What part still feels hardest to judge?",
      certificationStatus: "certified",
    },
    {
      id: "CDP-REPAIR-PLAINLY",
      name: "Explain and Repair",
      owner: "platform",
      version: "1.0",
      applicableExperiences: [
        "talk-it-out",
        "shari",
        "chamber",
        "board",
        "create",
      ],
      whenToUse: "User asks what Shari meant or is confused",
      whenNotToUse: "No confusion signal",
      requiredInputs: ["previousAssistantText", "topicAnchor"],
      expectedOutputShape: "Own wording + plain explanation + topic return",
      prohibitedLanguage: ["something around does", "Take your time with that."],
      requiredValidators: ["topic_continuity", "clarification_repair"],
      example:
        "I did not explain that clearly. You are deciding whether hiring help makes sense. What is making you consider it now?",
      certificationStatus: "certified",
    },
    {
      id: "CDP-ACCEPT-CORRECTION",
      name: "Accept Correction",
      owner: "platform",
      version: "1.0",
      applicableExperiences: [
        "talk-it-out",
        "shari",
        "chamber",
        "board",
        "create",
      ],
      whenToUse: "User rejects an interpretation",
      whenNotToUse: "No correction present",
      requiredInputs: ["userText", "topicAnchor"],
      expectedOutputShape: "Accept + return to literal topic",
      prohibitedLanguage: [
        "quieter question underneath",
        "Take your time.",
        "Let's stay with",
        "What part feels most useful",
      ],
      requiredValidators: ["no_hidden_meaning", "correction_compliance"],
      example:
        "You're right — I was looking at the wrong thing. You're wondering whether hiring help makes sense. What is making you consider it now?",
      certificationStatus: "certified",
    },
    {
      id: "CDP-SEPARATE-CONCERNS",
      name: "Separate Concerns",
      owner: "platform",
      version: "1.0",
      applicableExperiences: ["talk-it-out", "shari", "board", "chamber"],
      whenToUse: "User mixed two related uncertainties",
      whenNotToUse: "Only one concern is present",
      requiredInputs: ["userText", "topicAnchor"],
      expectedOutputShape: "Name both concerns + one choice question",
      prohibitedLanguage: ["what this is really about"],
      requiredValidators: ["question_intelligence"],
      example:
        "Cost and trust may be separate. Which one is making the decision harder?",
      certificationStatus: "certified",
    },
    {
      id: "CDP-SUMMARIZE-CLARITY",
      name: "Summarize Emerging Clarity",
      owner: "platform",
      version: "1.0",
      applicableExperiences: ["talk-it-out", "shari", "board"],
      whenToUse: "Enough grounded facts exist to name clarity",
      whenNotToUse: "Early turns with little known yet",
      requiredInputs: ["topicAnchor", "knownFacts"],
      expectedOutputShape: "Topic + clearer + unresolved",
      prohibitedLanguage: ["Great job", "Is there anything else?"],
      requiredValidators: ["grounded_summary"],
      example:
        "You want help with visibility. The unclear part is what results would justify the cost.",
      certificationStatus: "certified",
    },
    {
      id: "CDP-TRANSITION-PERMISSION",
      name: "Transition With Permission",
      owner: "platform",
      version: "1.0",
      applicableExperiences: [
        "talk-it-out",
        "shari",
        "create",
        "projects",
        "chamber",
      ],
      whenToUse: "Next need is practical and user signaled readiness",
      whenNotToUse: "Reflective work still unfinished; no user ask",
      requiredInputs: ["userIntent"],
      expectedOutputShape: "Offer only; never auto-launch",
      prohibitedLanguage: ["Opening the", "You should visit"],
      requiredValidators: ["no_forced_redirect"],
      example:
        "It sounds like you now want a hiring plan. We can do that next when you are ready.",
      certificationStatus: "certified",
    },
    {
      id: "CDP-NATURAL-COMPLETION",
      name: "Natural Completion",
      owner: "platform",
      version: "1.0",
      applicableExperiences: ["talk-it-out", "shari"],
      whenToUse: "User clear, done, or asks to stop",
      whenNotToUse: "Conversation still mid-exploration",
      requiredInputs: ["summary"],
      expectedOutputShape: "Grounded close + optional continuation",
      prohibitedLanguage: [
        "Would you like more help?",
        "I am here if you need me.",
      ],
      requiredValidators: ["natural_completion"],
      example:
        "You do not have to settle it today. You have identified what information is missing.",
      certificationStatus: "certified",
    },
  ] as const;

export function getConversationDesignPattern(
  id: CdpPatternId,
): ConversationDesignPattern | undefined {
  return CONVERSATION_DESIGN_PATTERNS.find((p) => p.id === id);
}

export function selectConversationDesignPattern(input: {
  experienceId: string;
  priorityEvent?: string;
  mode?: string;
  completion?: boolean;
  wantsTransition?: boolean;
}): CdpPatternId {
  if (input.priorityEvent === "direct_correction") {
    return "CDP-ACCEPT-CORRECTION";
  }
  if (input.priorityEvent === "clarification_request") {
    return "CDP-REPAIR-PLAINLY";
  }
  if (input.completion) return "CDP-NATURAL-COMPLETION";
  if (input.wantsTransition) return "CDP-TRANSITION-PERMISSION";
  if (input.mode === "direct_answer") return "CDP-DIRECT-ANSWER";
  if (input.experienceId === "talk-it-out") return "CDP-REFLECTIVE-EXPLORE";
  return "CDP-ACKNOWLEDGE-ADVANCE";
}
