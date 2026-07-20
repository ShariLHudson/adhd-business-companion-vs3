/**
 * Events Intelligence — canonical knowledge retrieval path.
 * Source of truth: docs/visual-spark-studios/Events-Intelligence/
 * Authority: EVENT-001…022 > EVT short pack > implementation bundles.
 */

export const EVENTS_INTELLIGENCE_ROOT =
  "docs/visual-spark-studios/Events-Intelligence" as const;

/** Loaded at runtime design-time — these files define operating instructions. */
export const EVENTS_INTELLIGENCE_CANONICAL_FILES = [
  `${EVENTS_INTELLIGENCE_ROOT}/EVENT_LIBRARY_MANIFEST.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/EVENT-001_Identity.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/EVENT-002_Intelligence_DNA.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/EVENT-007_Application_Rules.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/EVENT-008_Collaboration_Rules.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/EVENT-016_Decision_Trees_Routing_Logic.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/README.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/01_foundation_architecture/EI-001_MASTER_FOUNDATION.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/01_foundation_architecture/EI-003_EVENT_LIFECYCLE_ARCHITECTURE.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/01_foundation_architecture/EI-005_RUNTIME_CONVERSATION_BEHAVIOR.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/01_foundation_architecture/EI-008_CROSS_MEMBER_CONTRACTS.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/01_foundation_architecture/EI-009_EVENT_STATE_MODEL.json`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/01_foundation_architecture/EI-011_REPOSITORY_IMPLEMENTATION.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/03_planning_operations/EI-T201_MASTER_EVENT_PLAN_TEMPLATE.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/07_adhd_conversation_intelligence/EI-K602_EVENT_CONVERSATION_ROUTING.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/07_adhd_conversation_intelligence/EI-K603_SHARI_EVENT_VOICE.md`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/07_adhd_conversation_intelligence/EI-W601_GUIDE_EVENT_PLANNING.json`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/08_runtime_models_state_architecture/EI-S701_EVENT_RUNTIME_SCHEMA.json`,
  `${EVENTS_INTELLIGENCE_ROOT}/bundles/10_final_integration_production_handoff/EI-K901_MASTER_INTEGRATION_ARCHITECTURE.md`,
] as const;

/**
 * Retrieval path for a planning turn (EI-011 loading order + conversation routing).
 * Runtime does not dump the library — it selects the phase slice.
 */
export function eventsIntelligenceRetrievalPath(input: {
  phase: string;
  domainHint?: string | null;
}): string[] {
  const base = [
    `${EVENTS_INTELLIGENCE_ROOT}/EVENT_LIBRARY_MANIFEST.md`,
    `${EVENTS_INTELLIGENCE_ROOT}/bundles/01_foundation_architecture/EI-005_RUNTIME_CONVERSATION_BEHAVIOR.md`,
    `${EVENTS_INTELLIGENCE_ROOT}/bundles/01_foundation_architecture/EI-003_EVENT_LIFECYCLE_ARCHITECTURE.md`,
    `${EVENTS_INTELLIGENCE_ROOT}/bundles/07_adhd_conversation_intelligence/EI-W601_GUIDE_EVENT_PLANNING.json`,
    `${EVENTS_INTELLIGENCE_ROOT}/bundles/07_adhd_conversation_intelligence/EI-K603_SHARI_EVENT_VOICE.md`,
  ];
  const phase = input.phase.toLowerCase();
  if (phase === "discovery" || phase === "viability" || phase === "strategy") {
    base.push(
      `${EVENTS_INTELLIGENCE_ROOT}/bundles/02_strategy_experience/EI-K102_EVENT_PURPOSE_OUTCOME_ARCHITECTURE.md`,
      `${EVENTS_INTELLIGENCE_ROOT}/bundles/02_strategy_experience/EI-K104_EVENT_FORMAT_DECISION_INTELLIGENCE.md`,
    );
  }
  if (phase === "planning" || phase === "preparation") {
    base.push(
      `${EVENTS_INTELLIGENCE_ROOT}/bundles/03_planning_operations/EI-T201_MASTER_EVENT_PLAN_TEMPLATE.md`,
      `${EVENTS_INTELLIGENCE_ROOT}/bundles/03_planning_operations/EI-K201_MASTER_EVENT_PLANNING_ARCHITECTURE.md`,
    );
  }
  if (input.domainHint === "speakers" || input.domainHint === "sponsors") {
    base.push(
      `${EVENTS_INTELLIGENCE_ROOT}/bundles/04_speakers_sponsors_registration_promotion`,
    );
  }
  if (input.domainHint === "technology" || input.domainHint === "safety") {
    base.push(
      `${EVENTS_INTELLIGENCE_ROOT}/bundles/05_technology_production_risk_event_day`,
    );
  }
  if (phase === "follow-up" || phase === "debrief") {
    base.push(
      `${EVENTS_INTELLIGENCE_ROOT}/bundles/06_follow_up_measurement_archive/EI-K501_POST_EVENT_FOLLOW_UP.md`,
    );
  }
  return base;
}

export const EVENTS_INTELLIGENCE_MEMBER_ID = "events" as const;
