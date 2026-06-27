/**
 * Human Conversation — twelve constitutional tests.
 * Silently evaluate every response before it reaches the user.
 */

import {
  containsForbiddenHumanConversationPhrase,
  detectForbiddenHumanConversationOpener,
} from "./forbiddenPatterns";

export const HUMAN_CONVERSATION_TWELVE_TESTS = [
  { id: "meant_not_typed", label: "Did I answer what they actually meant?" },
  { id: "use_known_context", label: "Did I use what I already know?" },
  { id: "notice_pattern", label: "Did I notice the pattern naturally?" },
  { id: "reduce_shame", label: "Did I reduce shame?" },
  { id: "self_understanding", label: "Did I help them understand themselves?" },
  { id: "elevate_experience", label: "Did I elevate their life experience?" },
  { id: "brevity", label: "Am I talking too much?" },
  { id: "earn_next_question", label: "Did I earn the next question?" },
  { id: "shari_voice", label: "Does this sound like Shari?" },
  { id: "one_voice", label: "Did multiple intelligences become one voice?" },
  { id: "no_generic_adhd", label: "Did I avoid generic ADHD advice?" },
  { id: "tomorrow_insight", label: "Will this still matter tomorrow?" },
] as const;

export type HumanConversationTestId =
  (typeof HUMAN_CONVERSATION_TWELVE_TESTS)[number]["id"];

export type TwelveTestResult = {
  id: HumanConversationTestId;
  label: string;
  passed: boolean;
  reason?: string;
};

export type TwelveTestEvaluation = {
  results: TwelveTestResult[];
  score: number;
  maxScore: number;
  passed: boolean;
  rewriteRecommended: boolean;
};

const RESISTANCE_USER_RE =
  /\b(?:don't want to work|can't start|won't start|stuck|failure|feel like a failure|avoiding|won't|can't do|not motivated|lazy)\b/i;

const VULNERABLE_USER_RE =
  /\b(?:overwhelm|afraid|failure|stuck|wrong with me|always do this|won't start|can't start|behind)\b/i;

const PRODUCTIVITY_LEAD_RE =
  /^(?:.*\b(?:try|use|start with|break (?:it )?into|make a checklist|pomodoro|timer|smaller steps?)\b){1,2}/i;

const SHAME_PHRASE_RE =
  /\b(?:you should be able|you just need|if you would|why can't you|no excuses?|simply (?:just )?|just do it|you need to just)\b/i;

const MECHANICAL_MEMORY_RE =
  /\b(?:last (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|you said (?:on|last)|on \d{1,2}\/\d{1,2})\b/i;

const BLANK_SLATE_QUESTION_RE =
  /\b(?:tell me about your (?:business|work)|what do you do for work|describe your business|who is your audience)\b/i;

const MODULE_LEAKAGE_RE =
  /\b(?:memory intelligence|pattern intelligence|relationship intelligence|brain intelligence|conversation intelligence|the system detected|based on your profile data)\b/i;

const THERAPIST_VOICE_RE =
  /\b(?:i understand how you feel|i'm sorry you(?:'re| are)|what you(?:'re| are) experiencing is|that must be (?:so )?hard)\b/i;

const SHARI_VOICE_MARKERS_RE =
  /\b(?:i've(?:\s+been)?\s+notic|i wonder|i'm wondering|can i (?:share|tell|check)|something stands out|this feels familiar|i've seen this|can we get curious|you know what's interesting|what if|i'm here)\b/i;

const ELEVATION_MARKERS_RE =
  /\b(?:hope|clarity|lighter|understood|curious|wonder|relief|courage|perspective|peace|momentum|confidence|glad|together|if you want|when you're ready)\b|[?]/i;

const INSIGHT_MARKERS_RE =
  /\b(?:wonder|notice|pattern|familiar|curious|underneath|might be about|something else|protecting|tired|meaning)\b/i;

const GENERIC_ADHD_TOOL_RE =
  /\b(?:pomodoro|take a walk|make a checklist|break (?:it )?into smaller|smaller steps?|executive function)\b/i;

const PERSONAL_SECOND_PERSON_RE =
  /\b(?:you(?:'re| are)|your|for you|you tend|you often|you've mentioned)\b/i;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function leadingSentences(text: string, count: number): string {
  const parts = text.trim().match(/[^.!?]+[.!?]+/g) ?? [text];
  return parts.slice(0, count).join(" ").trim();
}

function bulletCount(text: string): number {
  const lines = text.split("\n");
  return lines.filter((l) => /^\s*(?:[-*•]|\d+\.)\s+/.test(l)).length;
}

function testMeantNotTyped(response: string, userText: string): TwelveTestResult {
  const id = "meant_not_typed" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[0].label;
  if (!RESISTANCE_USER_RE.test(userText)) {
    return { id, label, passed: true };
  }
  const lead = leadingSentences(response, 2);
  if (PRODUCTIVITY_LEAD_RE.test(lead) || GENERIC_ADHD_TOOL_RE.test(lead)) {
    return {
      id,
      label,
      passed: false,
      reason: "Resistance turn answered with productivity tactics before understanding",
    };
  }
  return { id, label, passed: true };
}

function testUseKnownContext(
  response: string,
  memoryConfidence?: "none" | "forming" | "sufficient",
): TwelveTestResult {
  const id = "use_known_context" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[1].label;
  if (memoryConfidence !== "sufficient") {
    return { id, label, passed: true };
  }
  if (BLANK_SLATE_QUESTION_RE.test(response)) {
    return {
      id,
      label,
      passed: false,
      reason: "Asked blank-slate questions despite sufficient relationship memory",
    };
  }
  return { id, label, passed: true };
}

function testNoticePattern(response: string): TwelveTestResult {
  const id = "notice_pattern" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[2].label;
  if (MECHANICAL_MEMORY_RE.test(response)) {
    return {
      id,
      label,
      passed: false,
      reason: "Mechanical date-stamped memory instead of natural pattern noticing",
    };
  }
  return { id, label, passed: true };
}

function testReduceShame(response: string): TwelveTestResult {
  const id = "reduce_shame" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[3].label;
  if (SHAME_PHRASE_RE.test(response)) {
    return {
      id,
      label,
      passed: false,
      reason: "Shame-implying language detected",
    };
  }
  return { id, label, passed: true };
}

function testSelfUnderstanding(response: string): TwelveTestResult {
  const id = "self_understanding" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[4].label;
  const genericHits = [
    containsForbiddenHumanConversationPhrase(response),
    /\bpeople with adhd\b/i.test(response),
    /\badhd (?:brains?|symptoms?)\b/i.test(response),
  ].filter(Boolean).length;
  if (genericHits >= 2 && !PERSONAL_SECOND_PERSON_RE.test(response)) {
    return {
      id,
      label,
      passed: false,
      reason: "Generic ADHD lecture without personal self-understanding",
    };
  }
  return { id, label, passed: true };
}

function testElevateExperience(response: string): TwelveTestResult {
  const id = "elevate_experience" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[5].label;
  if (ELEVATION_MARKERS_RE.test(response)) {
    return { id, label, passed: true };
  }
  if (bulletCount(response) >= 4) {
    return {
      id,
      label,
      passed: false,
      reason: "Information dump without warmth, curiosity, or elevation",
    };
  }
  return {
    id,
    label,
    passed: false,
    reason: "No detectable lift in hope, clarity, relief, or connection",
  };
}

function testBrevity(response: string, userText: string): TwelveTestResult {
  const id = "brevity" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[6].label;
  const words = wordCount(response);
  const emotional = VULNERABLE_USER_RE.test(userText);
  const limit = emotional ? 180 : 260;
  if (words > limit) {
    return {
      id,
      label,
      passed: false,
      reason: `Response too long (${words} words > ${limit})`,
    };
  }
  return { id, label, passed: true };
}

function testEarnNextQuestion(response: string, userText: string): TwelveTestResult {
  const id = "earn_next_question" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[7].label;
  if (!VULNERABLE_USER_RE.test(userText)) {
    return { id, label, passed: true };
  }
  const invites =
    /[?]/.test(response) ||
    /\b(?:if you want|when you're ready|can we|would you|what if|i wonder)\b/i.test(
      response,
    );
  if (!invites) {
    return {
      id,
      label,
      passed: false,
      reason: "Vulnerable turn closed without curiosity or invitation",
    };
  }
  return { id, label, passed: true };
}

function testShariVoice(response: string): TwelveTestResult {
  const id = "shari_voice" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[8].label;
  const forbiddenOpener = detectForbiddenHumanConversationOpener(response);
  if (forbiddenOpener || THERAPIST_VOICE_RE.test(response)) {
    return {
      id,
      label,
      passed: false,
      reason: "AI-default or therapist voice detected",
    };
  }
  if (!SHARI_VOICE_MARKERS_RE.test(response) && wordCount(response) > 40) {
    return {
      id,
      label,
      passed: false,
      reason: "Missing Shari relational voice markers",
    };
  }
  return { id, label, passed: true };
}

function testOneVoice(response: string): TwelveTestResult {
  const id = "one_voice" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[9].label;
  if (MODULE_LEAKAGE_RE.test(response)) {
    return {
      id,
      label,
      passed: false,
      reason: "Intelligence module leakage — not one companion voice",
    };
  }
  return { id, label, passed: true };
}

function testNoGenericAdhd(response: string, userText: string): TwelveTestResult {
  const id = "no_generic_adhd" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[10].label;
  const forbidden = containsForbiddenHumanConversationPhrase(response);
  if (forbidden) {
    return {
      id,
      label,
      passed: false,
      reason: `Generic ADHD advice phrase: ${forbidden}`,
    };
  }
  if (
    GENERIC_ADHD_TOOL_RE.test(response) &&
    !/\b(?:you asked|you mentioned|specifically|for this|right now)\b/i.test(
      `${response} ${userText}`,
    )
  ) {
    return {
      id,
      label,
      passed: false,
      reason: "Unjustified generic ADHD tool suggestion",
    };
  }
  return { id, label, passed: true };
}

function testTomorrowInsight(response: string, userText: string): TwelveTestResult {
  const id = "tomorrow_insight" as const;
  const label = HUMAN_CONVERSATION_TWELVE_TESTS[11].label;
  if (!VULNERABLE_USER_RE.test(userText)) {
    return { id, label, passed: true };
  }
  const imperatives = (response.match(/\b(?:try|do|use|start|make|set)\b/gi) ?? [])
    .length;
  if (imperatives >= 3 && !INSIGHT_MARKERS_RE.test(response)) {
    return {
      id,
      label,
      passed: false,
      reason: "Tactics without insight — unlikely to matter tomorrow",
    };
  }
  return { id, label, passed: true };
}

export function evaluateHumanConversationTwelveTests(input: {
  response: string;
  userText?: string;
  memoryConfidence?: "none" | "forming" | "sufficient";
}): TwelveTestEvaluation {
  const response = input.response.trim();
  const userText = input.userText?.trim() ?? "";

  const results: TwelveTestResult[] = [
    testMeantNotTyped(response, userText),
    testUseKnownContext(response, input.memoryConfidence),
    testNoticePattern(response),
    testReduceShame(response),
    testSelfUnderstanding(response),
    testElevateExperience(response),
    testBrevity(response, userText),
    testEarnNextQuestion(response, userText),
    testShariVoice(response),
    testOneVoice(response),
    testNoGenericAdhd(response, userText),
    testTomorrowInsight(response, userText),
  ];

  const score = results.filter((r) => r.passed).length;
  const maxScore = results.length;

  return {
    results,
    score,
    maxScore,
    passed: score === maxScore,
    rewriteRecommended: score < maxScore,
  };
}
