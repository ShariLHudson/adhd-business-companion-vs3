/**
 * Transcript calibration — sample conversations for tuning multi-turn detection.
 */

import type { ChatTurn } from "./companionIntelligence";
import type { CognitiveProtectionMode } from "./adhdNativeIntelligence";
import { analyzeAdhdNativeTurn } from "./adhdNativeIntelligence";
import {
  analyzeMultiTurnPatterns,
  type MultiTurnAdhdPattern,
  type MultiTurnPatternAnalysis,
  type PatternConfidence,
  shouldDeferRoutingForMultiTurn,
} from "./adhdMultiTurnPatterns";

export type TranscriptCalibrationCase = {
  id: string;
  label: string;
  turns: ChatTurn[];
  expectPattern: MultiTurnAdhdPattern | null;
  expectConfidence: PatternConfidence | null;
  expectDeferRouting: boolean;
  expectProtectionMode?: CognitiveProtectionMode;
  /** Last user message for single-turn checks. */
  lastUserMessage: string;
};

export const TRANSCRIPT_CALIBRATION_CASES: TranscriptCalibrationCase[] = [
  {
    id: "planning-addiction",
    label: "Planning addiction across turns",
    turns: [
      { role: "user", content: "I need to launch my newsletter" },
      { role: "assistant", content: "What's the first piece?" },
      { role: "user", content: "Maybe I should outline it better first" },
      { role: "assistant", content: "What would the outline include?" },
      { role: "user", content: "I need a system for organizing the sections" },
      { role: "assistant", content: "Tell me more." },
      { role: "user", content: "Let me make a checklist before I start writing" },
    ],
    lastUserMessage: "Let me make a checklist before I start writing",
    expectPattern: "planning_addiction",
    expectConfidence: "high",
    expectDeferRouting: true,
  },
  {
    id: "perfectionism-prep",
    label: "Perfectionism as preparation across turns",
    turns: [
      { role: "user", content: "I want to post about my coaching offer" },
      { role: "assistant", content: "What's holding you back?" },
      { role: "user", content: "It's not ready yet" },
      { role: "assistant", content: "What would ready look like?" },
      { role: "user", content: "I should research more examples first" },
      { role: "assistant", content: "What are you looking for?" },
      { role: "user", content: "I don't want it to sound wrong" },
    ],
    lastUserMessage: "I don't want it to sound wrong",
    expectPattern: "perfectionism_as_preparation",
    expectConfidence: "high",
    expectDeferRouting: true,
  },
  {
    id: "idea-explosion",
    label: "Idea explosion across turns",
    turns: [
      { role: "user", content: "I'm thinking about a group program" },
      { role: "assistant", content: "Tell me more." },
      { role: "user", content: "Or maybe a membership instead" },
      { role: "assistant", content: "What draws you to each?" },
      { role: "user", content: "What about a workshop series too?" },
      { role: "assistant", content: "Lots of directions." },
      { role: "user", content: "Can you give me more options to consider?" },
    ],
    lastUserMessage: "Can you give me more options to consider?",
    expectPattern: "idea_explosion",
    expectConfidence: "high",
    expectDeferRouting: true,
  },
  {
    id: "avoidance-productivity",
    label: "Avoidance disguised as productivity",
    turns: [
      { role: "user", content: "I need to record my sales video" },
      { role: "assistant", content: "What's the blocker?" },
      { role: "user", content: "First I should organize my files" },
      { role: "assistant", content: "Okay." },
      { role: "user", content: "Maybe I should clean my desk too" },
      { role: "assistant", content: "And the video?" },
      { role: "user", content: "I could fix my website branding first" },
    ],
    lastUserMessage: "I could fix my website branding first",
    expectPattern: "avoidance_as_productivity",
    expectConfidence: "high",
    expectDeferRouting: true,
  },
  {
    id: "overwhelm-volume",
    label: "Overwhelm from volume across turns",
    turns: [
      { role: "user", content: "There's too much going on" },
      { role: "assistant", content: "What's on the pile?" },
      { role: "user", content: "Everything feels scattered" },
      { role: "assistant", content: "Name a few." },
      { role: "user", content: "I can't keep up with all of it" },
      { role: "assistant", content: "That's a lot." },
      { role: "user", content: "So many things and my head is full" },
    ],
    lastUserMessage: "So many things and my head is full",
    expectPattern: "overwhelm_from_volume",
    expectConfidence: "high",
    expectDeferRouting: true,
  },
  {
    id: "confidence-collapse",
    label: "Confidence collapse across turns",
    turns: [
      { role: "user", content: "I'm trying to price my offer" },
      { role: "assistant", content: "What's hard about it?" },
      { role: "user", content: "I'm not good at this" },
      { role: "assistant", content: "What feels hardest?" },
      { role: "user", content: "Nobody will want this" },
      { role: "assistant", content: "That's a heavy thought." },
      { role: "user", content: "I don't know why I thought I could do this" },
    ],
    lastUserMessage: "I don't know why I thought I could do this",
    expectPattern: "confidence_collapse",
    expectConfidence: "high",
    expectDeferRouting: true,
  },
  {
    id: "momentum-state",
    label: "Momentum — protect, no pattern false positive",
    turns: [
      { role: "user", content: "I just finished the first draft" },
      { role: "assistant", content: "Nice — what's next?" },
      { role: "user", content: "I'm on a roll and moving forward" },
      { role: "assistant", content: "Keep going." },
      { role: "user", content: "I got it done and made progress today" },
    ],
    lastUserMessage: "I got it done and made progress today",
    expectPattern: null,
    expectConfidence: null,
    expectDeferRouting: false,
    expectProtectionMode: "momentum",
  },
  {
    id: "practical-request",
    label: "Clean practical request — no ADHD pattern",
    turns: [
      { role: "user", content: "Where do I change my notification settings?" },
      { role: "assistant", content: "Settings panel." },
      { role: "user", content: "How do I turn off email alerts?" },
    ],
    lastUserMessage: "How do I turn off email alerts?",
    expectPattern: null,
    expectConfidence: null,
    expectDeferRouting: false,
  },
];

export type TranscriptCalibrationResult = {
  id: string;
  label: string;
  passed: boolean;
  multiTurn: MultiTurnPatternAnalysis;
  detectedPattern: MultiTurnAdhdPattern | null;
  detectedConfidence: PatternConfidence | null;
  deferBrainDump: boolean;
  protectionMode: CognitiveProtectionMode;
  failures: string[];
};

export function evaluateTranscriptCase(
  testCase: TranscriptCalibrationCase,
): TranscriptCalibrationResult {
  const multiTurn = analyzeMultiTurnPatterns({ messages: testCase.turns });
  const single = analyzeAdhdNativeTurn({
    text: testCase.lastUserMessage,
    messages: testCase.turns,
    emotionalState: "unclear",
    obstacle: null,
  });

  const detectedPattern = multiTurn.primary?.pattern ?? null;
  const detectedConfidence = multiTurn.primary?.confidence ?? null;
  const deferBrainDump = shouldDeferRoutingForMultiTurn(multiTurn, "brain_dump");
  const failures: string[] = [];

  if (testCase.expectPattern !== detectedPattern) {
    failures.push(
      `pattern: expected ${testCase.expectPattern}, got ${detectedPattern}`,
    );
  }
  if (testCase.expectConfidence !== detectedConfidence) {
    failures.push(
      `confidence: expected ${testCase.expectConfidence}, got ${detectedConfidence}`,
    );
  }
  if (testCase.expectDeferRouting && !deferBrainDump && !multiTurn.primary?.routing.stayInConversation) {
    failures.push("expected routing deferral but none detected");
  }
  if (!testCase.expectDeferRouting && multiTurn.primary?.routing.stayInConversation) {
    failures.push("unexpected stayInConversation routing");
  }
  if (
    testCase.expectProtectionMode &&
    single.protectionMode !== testCase.expectProtectionMode
  ) {
    failures.push(
      `protection: expected ${testCase.expectProtectionMode}, got ${single.protectionMode}`,
    );
  }

  return {
    id: testCase.id,
    label: testCase.label,
    passed: failures.length === 0,
    multiTurn,
    detectedPattern,
    detectedConfidence,
    deferBrainDump,
    protectionMode: single.protectionMode,
    failures,
  };
}

export function runTranscriptCalibration(): {
  passed: number;
  failed: number;
  results: TranscriptCalibrationResult[];
} {
  const results = TRANSCRIPT_CALIBRATION_CASES.map(evaluateTranscriptCase);
  const passed = results.filter((r) => r.passed).length;
  return { passed, failed: results.length - passed, results };
}
