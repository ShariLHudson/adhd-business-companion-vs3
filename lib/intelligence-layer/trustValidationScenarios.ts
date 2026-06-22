/**
 * Sprint 2C-4 — Synthetic trust validation scenarios (observe-only).
 */

import { evaluateCompanionTurn } from "@/lib/companionGovernor";
import type { CompanionGovernorInput } from "@/lib/companionGovernor";
import type {
  EcosystemSnapshot,
  EcosystemSuppression,
} from "@/lib/ecosystem-intelligence/types";
import { resolveIntent } from "@/lib/intentStabilizer";
import {
  getToolSuggestionAnalytics,
  trackToolSuggestionAccepted,
} from "@/lib/toolSuggestionAnalytics";
import type { WorkspaceOpenSnapshot } from "@/lib/workspaceExecution";

import {
  initCompanionSession,
  resetCompanionSessionForTests,
} from "./companionSession";
import {
  PROFILE_LEARNING_FLAG_KEYS,
  TRUST_INSPECTOR_FLAG_KEYS,
} from "./featureFlags";
import {
  observeEcosystemSuppressions,
  resetGovernorTrustDedupeForTests,
} from "./governorTrustSignals";
import {
  getIntelligenceProfile,
  saveIntelligenceProfile,
} from "./profileStore";
import { getIntelligenceSignalStore } from "./signalStore";
import { resetTrustDiagnosticsForTests, getTrustCollectionDiagnostics } from "./trustDiagnostics";
import { resetTrustAuditLogForTests } from "./trustEvolutionAudit";
import { recordTrustEvidence } from "./trustSignals";
import type { RecordTrustEvidenceResult } from "./trustSignals";

export type TrustScenarioResult = {
  name: string;
  pass: boolean;
  signalRecorded: boolean;
  evolved: boolean;
  reason?: string;
  traitDeltas?: unknown[];
  notes?: string[];
};

const EMPTY_WORKSPACE: WorkspaceOpenSnapshot = {
  panel: null,
  activeSection: "home",
  revealSeq: 0,
};

function governorInput(text: string): CompanionGovernorInput {
  return {
    userText: text,
    lastAssistantText: "",
    workspacePanel: null,
    workspaceSnap: EMPTY_WORKSPACE,
    resolvedIntent: resolveIntent(text),
  };
}

function minimalEcosystemSnapshot(
  suppressions: EcosystemSuppression[],
): EcosystemSnapshot {
  return {
    userState: {
      health: "healthy",
      summary: "validation",
      cognitiveLoadLevel: null,
      activationState: null,
      recoveryLevel: null,
      userHealthStatus: null,
    },
    founderState: {
      health: "healthy",
      summary: "validation",
      businessHealth: null,
      chiefAssessment: null,
      topRisk: null,
      topOpportunity: null,
    },
    topSignal: "calm_presence",
    activeIntelligenceLayers: [],
    recommendedSurface: "none",
    priorityReason: "trust-validation-scenario",
    suppressions,
    suggestedTone: "calm",
    avoidGuidance: [],
    createdAt: new Date().toISOString(),
  };
}

function resetScenarioEnvironment(): void {
  if (typeof window === "undefined") return;
  resetCompanionSessionForTests();
  resetTrustDiagnosticsForTests();
  resetGovernorTrustDedupeForTests();
  resetTrustAuditLogForTests();
  localStorage.removeItem("companion-intelligence-signals-v1");
  localStorage.removeItem("companion-intelligence-profile-v1");
  localStorage.removeItem("companion-tool-suggestion-analytics-v1");
  localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
  localStorage.removeItem(TRUST_INSPECTOR_FLAG_KEYS.trustInspector);
  saveIntelligenceProfile(
    structuredClone(getIntelligenceProfile()),
  );
  initCompanionSession(new Date("2026-06-22T14:00:00.000Z"));
}

function setProfileLearning(on: boolean): void {
  if (on) {
    localStorage.setItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning, "1");
  } else {
    localStorage.removeItem(PROFILE_LEARNING_FLAG_KEYS.profileLearning);
  }
}

function trustSignalCount(): number {
  return getIntelligenceSignalStore().signals.filter((s) => s.domain === "trust")
    .length;
}

function lastTrustResult(
  results: RecordTrustEvidenceResult[],
): RecordTrustEvidenceResult | null {
  return results.length > 0 ? results[results.length - 1]! : null;
}

function traitSnapshot(): Record<string, unknown> {
  return structuredClone(getIntelligenceProfile().relationship.trust);
}

function buildResult(
  name: string,
  opts: {
    pass: boolean;
    signalRecorded: boolean;
    evolved: boolean;
    reason?: string;
    traitDeltas?: unknown[];
    notes?: string[];
  },
): TrustScenarioResult {
  return { name, ...opts };
}

type ScenarioExpectation = {
  signalRecorded: boolean;
  evolved: boolean;
  reason?: string;
  traitKey?: string;
  traitObservations?: number;
  category?: string;
  bucket?: string;
  extraChecks?: (notes: string[]) => boolean;
};

function evaluateScenario(
  name: string,
  pipelineResult: RecordTrustEvidenceResult | null,
  beforeTraits: Record<string, unknown>,
  expect: ScenarioExpectation,
  extraNotes: string[] = [],
): TrustScenarioResult {
  const notes = [...extraNotes];
  const signalRecorded = pipelineResult !== null && trustSignalCount() > 0;
  const evolved = pipelineResult?.decision.evolve ?? false;
  const reason = pipelineResult?.decision.reason;

  let pass = signalRecorded === expect.signalRecorded;
  pass = pass && evolved === expect.evolved;
  if (expect.reason !== undefined) {
    pass = pass && reason === expect.reason;
  }
  if (expect.category !== undefined) {
    pass =
      pass && pipelineResult?.signal.category === expect.category.replace("trust.", "");
  }
  if (expect.bucket !== undefined) {
    pass =
      pass &&
      pipelineResult?.signal.meta?.interventionBucket === expect.bucket;
  }
  if (expect.traitKey !== undefined) {
    const after = getIntelligenceProfile().relationship.trust[expect.traitKey];
    const before = beforeTraits[expect.traitKey] as { observations?: number } | undefined;
    const beforeObs = before?.observations ?? 0;
    const afterObs = after?.observations ?? 0;
    const changed = afterObs > beforeObs;
    pass = pass && changed;
    if (expect.traitObservations !== undefined) {
      pass = pass && afterObs === expect.traitObservations;
    }
    notes.push(
      `${expect.traitKey}: observations ${beforeObs} → ${afterObs}`,
    );
  }
  if (expect.extraChecks) {
    pass = pass && expect.extraChecks(notes);
  }

  const traitDeltas =
    evolved && expect.traitKey
      ? [
          {
            path: `relationship.trust.${expect.traitKey}`,
            before: beforeTraits[expect.traitKey] ?? null,
            after: getIntelligenceProfile().relationship.trust[expect.traitKey] ?? null,
          },
        ]
      : [];

  return buildResult(name, {
    pass,
    signalRecorded,
    evolved,
    reason,
    traitDeltas: traitDeltas.length > 0 ? traitDeltas : undefined,
    notes,
  });
}

/** Run all synthetic trust validation scenarios through the real pipeline. */
export function runTrustValidationScenarios(): TrustScenarioResult[] {
  if (typeof window === "undefined") {
    return [
      buildResult("environment", {
        pass: false,
        signalRecorded: false,
        evolved: false,
        notes: ["SSR — scenarios require browser localStorage"],
      }),
    ];
  }

  const results: TrustScenarioResult[] = [];

  // 1. Offer Rendered
  resetScenarioEnvironment();
  const before1 = traitSnapshot();
  const r1 = recordTrustEvidence({
    category: "trust.offer_rendered",
    offerKey: "breathe",
    source: "trust-validation:offer-rendered",
  });
  results.push(
    evaluateScenario("offer rendered", r1, before1, {
      signalRecorded: true,
      evolved: false,
      reason: "render_only_signal",
      category: "trust.offer_rendered",
    }),
  );

  // 2. Suggestion Accepted — Learning OFF
  resetScenarioEnvironment();
  setProfileLearning(false);
  const before2 = traitSnapshot();
  const r2 = recordTrustEvidence({
    category: "trust.suggestion_accepted",
    offerKey: "clear-mind",
    source: "trust-validation:accepted-off",
  });
  results.push(
    evaluateScenario("suggestion accepted (learning OFF)", r2, before2, {
      signalRecorded: true,
      evolved: false,
      reason: "profile_learning_disabled",
      category: "trust.suggestion_accepted",
    }),
  );

  // 3. Suggestion Accepted — Learning ON
  resetScenarioEnvironment();
  setProfileLearning(true);
  const before3 = traitSnapshot();
  const r3 = recordTrustEvidence({
    category: "trust.suggestion_accepted",
    offerKey: "clear-mind",
    source: "trust-validation:accepted-on",
  });
  results.push(
    evaluateScenario("suggestion accepted (learning ON)", r3, before3, {
      signalRecorded: true,
      evolved: true,
      reason: "evolved",
      category: "trust.suggestion_accepted",
      bucket: "clear_mind",
      traitKey: "responds_to_suggestions",
      traitObservations: 1,
    }),
  );

  // 4. Suggestion Dismissed — Learning ON
  resetScenarioEnvironment();
  setProfileLearning(true);
  const before4 = traitSnapshot();
  const r4 = recordTrustEvidence({
    category: "trust.suggestion_dismissed",
    offerKey: "get-unstuck",
    source: "trust-validation:dismissed-on",
  });
  results.push(
    evaluateScenario("suggestion dismissed (learning ON)", r4, before4, {
      signalRecorded: true,
      evolved: true,
      reason: "evolved",
      category: "trust.suggestion_dismissed",
      bucket: "momentum_prompt",
      traitKey: "disengages_from_nagging",
      traitObservations: 1,
    }),
  );

  // 5. Unknown Bucket
  resetScenarioEnvironment();
  setProfileLearning(true);
  const before5 = traitSnapshot();
  const r5 = recordTrustEvidence({
    category: "trust.suggestion_accepted",
    offerKey: "not-a-real-bucket",
    source: "trust-validation:unknown-bucket",
  });
  results.push(
    evaluateScenario("unknown bucket", r5, before5, {
      signalRecorded: true,
      evolved: false,
      reason: "unknown_intervention_bucket",
      category: "trust.suggestion_accepted",
    }),
  );

  // 6. System Suppression
  resetScenarioEnvironment();
  setProfileLearning(true);
  const before6 = traitSnapshot();
  const suppressionResults = observeEcosystemSuppressions(
    minimalEcosystemSnapshot(["momentum_offer"]),
  );
  const r6 = lastTrustResult(suppressionResults);
  results.push(
    evaluateScenario("system suppression", r6, before6, {
      signalRecorded: true,
      evolved: false,
      reason: "system_causation",
      category: "trust.offer_suppressed",
    }),
  );

  // 7. System Block
  resetScenarioEnvironment();
  setProfileLearning(true);
  const before7 = traitSnapshot();
  const input7 = governorInput("I feel completely overwhelmed and panicking");
  const surface7 = evaluateCompanionTurn(input7);
  const blockedSignal = getIntelligenceSignalStore().signals.find(
    (s) => s.domain === "trust" && s.category === "offer_blocked",
  );
  const blockDecision = getTrustCollectionDiagnostics().lastDecisions.find(
    (d) => d.signalId === blockedSignal?.id,
  );
  const r7: RecordTrustEvidenceResult | null =
    blockedSignal && blockDecision
      ? {
          signal: blockedSignal,
          attribution: null,
          decision: blockDecision,
          busMirrored: false,
        }
      : null;
  results.push(
    evaluateScenario("system block", r7, before7, {
      signalRecorded: true,
      evolved: false,
      reason: "system_causation",
      category: "trust.offer_blocked",
      extraChecks: (notes) => {
        notes.push(`suppressCards=${String(surface7.suppressCards)}`);
        return surface7.suppressCards === true;
      },
    }),
  );

  // 8. Tool Suggestion Hook
  resetScenarioEnvironment();
  setProfileLearning(false);
  const before8 = traitSnapshot();
  const analyticsBefore = getToolSuggestionAnalytics().accepted.breathe;
  trackToolSuggestionAccepted("breathe");
  const analyticsAfter = getToolSuggestionAnalytics().accepted.breathe;
  const toolSignals = getIntelligenceSignalStore().signals.filter(
    (s) => s.domain === "trust" && s.source === "tool-suggestion:accepted:breathe",
  );
  const toolSignal = toolSignals[0];
  const lastDecision = getTrustCollectionDiagnostics().lastDecisions.at(-1);
  const respondsObs =
    getIntelligenceProfile().relationship.trust.responds_to_suggestions
      ?.observations ?? 0;
  const respondsBefore =
    (before8.responds_to_suggestions as { observations?: number } | undefined)
      ?.observations ?? 0;
  const pass8 =
    toolSignal !== undefined &&
    toolSignal.meta?.interventionBucket === "breathing" &&
    analyticsAfter === analyticsBefore + 1 &&
    lastDecision?.evolve === false &&
    lastDecision?.reason === "profile_learning_disabled" &&
    respondsObs === respondsBefore;
  results.push(
    buildResult("tool suggestion hook", {
      pass: pass8,
      signalRecorded: toolSignal !== undefined,
      evolved: lastDecision?.evolve ?? false,
      reason: lastDecision?.reason,
      notes: [
        `analytics accepted.breathe: ${analyticsBefore} → ${analyticsAfter}`,
        `bucket=${String(toolSignal?.meta?.interventionBucket)}`,
        "profile learning OFF — no evolution expected",
      ],
    }),
  );

  return results;
}
