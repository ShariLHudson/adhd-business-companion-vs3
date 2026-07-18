/**
 * Package 211 — Conversation Implementation Checklist (living status).
 * Do not deploy until every release-blocking item is pass.
 */

export type ChecklistStatus = "pass" | "partial" | "fail" | "blocked";

export type ChecklistItem = {
  id: string;
  section: "repository" | "experiences" | "validation" | "testing" | "release";
  label: string;
  status: ChecklistStatus;
  evidence: string;
  releaseBlocking: boolean;
};

export const CONVERSATION_IMPLEMENTATION_CHECKLIST: readonly ChecklistItem[] = [
  // Repository
  {
    id: "repo-cie",
    section: "repository",
    label: "Shared engine implemented",
    status: "pass",
    evidence: "lib/conversationIntelligenceEngine/processTurn.ts",
    releaseBlocking: true,
  },
  {
    id: "repo-state",
    section: "repository",
    label: "Runtime state implemented",
    status: "pass",
    evidence: "lib/conversationIntelligenceEngine/state.ts + cieState on TIO",
    releaseBlocking: true,
  },
  {
    id: "repo-topic",
    section: "repository",
    label: "Topic Anchor active",
    status: "pass",
    evidence: "lib/topicContinuityAnchorIntelligence",
    releaseBlocking: true,
  },
  {
    id: "repo-focus",
    section: "repository",
    label: "Current Focus active",
    status: "pass",
    evidence: "ConversationRuntimeState.currentFocus + TCAI currentFocus",
    releaseBlocking: true,
  },
  {
    id: "repo-gold",
    section: "repository",
    label: "Gold Standard retrieval active",
    status: "pass",
    evidence: "CIE retrieval.ts + goldStandardConversationLibrary",
    releaseBlocking: true,
  },
  {
    id: "repo-hcv",
    section: "repository",
    label: "Human Conversation Validator active",
    status: "pass",
    evidence: "lib/humanConversationValidator + CIE processTurn gate",
    releaseBlocking: true,
  },
  {
    id: "repo-regen",
    section: "repository",
    label: "Regeneration active",
    status: "pass",
    evidence: "CIE repair + enforceHumanConversationGate",
    releaseBlocking: true,
  },
  // Experiences
  {
    id: "exp-tio",
    section: "experiences",
    label: "Talk It Out",
    status: "pass",
    evidence: "polishTalkItOutDelivery → processConversationTurn",
    releaseBlocking: true,
  },
  {
    id: "exp-shari",
    section: "experiences",
    label: "Shari",
    status: "fail",
    evidence: "companion-chat LLM bypasses CIE/HCV",
    releaseBlocking: true,
  },
  {
    id: "exp-chamber",
    section: "experiences",
    label: "Chamber",
    status: "fail",
    evidence: "persona path bypasses CIE/HCV",
    releaseBlocking: true,
  },
  {
    id: "exp-board",
    section: "experiences",
    label: "Board",
    status: "fail",
    evidence: "templated deliberation bypasses CIE/HCV",
    releaseBlocking: true,
  },
  {
    id: "exp-create",
    section: "experiences",
    label: "Create",
    status: "partial",
    evidence: "HCV wired; CIE not primary orchestrator",
    releaseBlocking: true,
  },
  {
    id: "exp-projects",
    section: "experiences",
    label: "Projects",
    status: "fail",
    evidence: "not on CIE/HCV",
    releaseBlocking: false,
  },
  // Validation
  {
    id: "val-topic",
    section: "validation",
    label: "Topic fidelity",
    status: "pass",
    evidence: "TCAI + HCV + package 208/209 tests",
    releaseBlocking: true,
  },
  {
    id: "val-voice",
    section: "validation",
    label: "Shari voice",
    status: "partial",
    evidence: "HCV voice dimensions; not platform-wide",
    releaseBlocking: true,
  },
  {
    id: "val-question",
    section: "validation",
    label: "Question quality",
    status: "pass",
    evidence: "TIO questionIntelligence + HCV",
    releaseBlocking: true,
  },
  {
    id: "val-correction",
    section: "validation",
    label: "User correction",
    status: "pass",
    evidence: "NHM + HCV correction codes + regressions",
    releaseBlocking: true,
  },
  {
    id: "val-template",
    section: "validation",
    label: "AI-template detection",
    status: "pass",
    evidence: "blockedPhraseRegistry + genericTemplateBan",
    releaseBlocking: true,
  },
  {
    id: "val-repetition",
    section: "validation",
    label: "Repetition detection",
    status: "partial",
    evidence: "HCV repeated opening/question; needs more platform coverage",
    releaseBlocking: false,
  },
  // Testing
  {
    id: "test-unit",
    section: "testing",
    label: "Unit",
    status: "pass",
    evidence: "cie/hcv/tio/tcai/gold unit suites",
    releaseBlocking: true,
  },
  {
    id: "test-multi",
    section: "testing",
    label: "Multi-turn",
    status: "pass",
    evidence: "208/209 hire→platform→correction transcripts",
    releaseBlocking: true,
  },
  {
    id: "test-auth",
    section: "testing",
    label: "Authenticated preview",
    status: "fail",
    evidence: "Preview loader blocked; smoke not signed off",
    releaseBlocking: true,
  },
  {
    id: "test-regression",
    section: "testing",
    label: "Regression transcripts",
    status: "pass",
    evidence: "permanentFailureRegressions + package208/209",
    releaseBlocking: true,
  },
  {
    id: "test-legacy",
    section: "testing",
    label: "No legacy prompt paths",
    status: "fail",
    evidence: "Ghost engines remain (Spark Core processConversationTurn, global LLM)",
    releaseBlocking: true,
  },
  // Release
  {
    id: "rel-deploy",
    section: "release",
    label: "Production deploy approved",
    status: "blocked",
    evidence: "Do not deploy until every release-blocking item is pass",
    releaseBlocking: true,
  },
];

export function checklistReleaseReady(): boolean {
  return CONVERSATION_IMPLEMENTATION_CHECKLIST.filter((i) => i.releaseBlocking).every(
    (i) => i.status === "pass",
  );
}

export function checklistSummary(): {
  pass: number;
  partial: number;
  fail: number;
  blocked: number;
  releaseReady: boolean;
} {
  const counts = { pass: 0, partial: 0, fail: 0, blocked: 0 };
  for (const i of CONVERSATION_IMPLEMENTATION_CHECKLIST) {
    counts[i.status] += 1;
  }
  return { ...counts, releaseReady: checklistReleaseReady() };
}
