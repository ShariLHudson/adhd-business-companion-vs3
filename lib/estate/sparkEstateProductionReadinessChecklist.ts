/**
 * Spark Estate — demo-to-production readiness checklist (Phase 28).
 * Verify members can understand, navigate, create, and return without broken journeys.
 *
 * @see docs/protocols/SPARK_ESTATE_DEMO_TO_PRODUCTION_READINESS_CHECKLIST_PHASE28.md
 */

import { LANGUAGE_OPTIONS } from "@/lib/companionLanguage";
import {
  SPARK_ESTATE_OUTPUT_OPTIONS,
  verifySparkEstateCompletionSystem,
} from "@/lib/universalCreation/sparkEstateCompletionSystem";
import {
  SPARK_ESTATE_CREATION_STEPS,
  verifySparkEstateCreationJourney,
} from "@/lib/universalCreation/sparkEstateCreationJourney";
import {
  runChamberFinalDemoChecklist,
  verifyChamberDemoFlowSteps,
} from "./chamber/chamberFinalDemoChecklist";
import { COMPANION_CHAMBER_DEMO_HREF } from "./chamber/chamberDemoMode";
import {
  SPARK_ESTATE_ARCHITECTURE_ENTRIES,
  SPARK_ESTATE_PHASE_MAPPINGS,
} from "./sparkEstateArchitectureMap";
import { verifySparkEstateCardEcosystem } from "./sparkEstateCardEcosystem";
import { verifySparkEstateConversationEngine } from "./sparkEstateConversationEngine";
import { verifySparkEstateDailyCompanionExperience } from "./sparkEstateDailyCompanionExperience";
import { verifySparkEstateFileAndDataArchitecture } from "./sparkEstateFileAndDataArchitectureMap";
import { verifySparkEstateKnowledgeAndAssetLibrary } from "./sparkEstateKnowledgeAndAssetLibraryArchitecture";
import { verifySparkEstateIntelligenceRouting } from "./sparkEstateIntelligenceRoutingMap";
import { verifySparkEstateMemberProfile } from "./sparkEstateMemberProfileEngine";

export const SPARK_ESTATE_PRODUCTION_PRINCIPLE =
  "A beautiful idea needs a dependable experience.";

export const SPARK_ESTATE_PRODUCTION_SUCCESS_JOURNEY = [
  "I arrived.",
  "Spark understood me.",
  "I created progress.",
  "I saved something valuable.",
  "I want to come back.",
] as const;

export const SPARK_ESTATE_LAUNCH_DECISION_QUESTIONS = [
  "Does this feel like Spark?",
  "Does the member know what to do next?",
  "Does the experience reduce friction?",
  "Does it help people finish things?",
] as const;

export const SPARK_ESTATE_PRODUCTION_PHASES = [
  "experience-testing",
  "conversation-testing",
  "creation-journey-testing",
  "card-testing",
  "data-testing",
  "export-completion-testing",
  "language-testing",
  "mobile-testing",
  "error-prevention",
  "member-readiness",
] as const;

export type SparkEstateProductionPriority = "must-fix" | "important" | "can-wait";

export type SparkEstateProductionCheckItem = {
  id: string;
  phase: (typeof SPARK_ESTATE_PRODUCTION_PHASES)[number];
  priority: SparkEstateProductionPriority;
  label: string;
  passed: boolean;
  detail?: string;
};

export type SparkEstateProductionReadinessResult = {
  readyForProduction: boolean;
  launchDecisionReady: boolean;
  mustFix: SparkEstateProductionCheckItem[];
  important: SparkEstateProductionCheckItem[];
  canWait: SparkEstateProductionCheckItem[];
  launchQuestions: Array<{ question: string; ready: boolean; detail?: string }>;
  productionHref: string;
};

function check(
  id: string,
  phase: SparkEstateProductionCheckItem["phase"],
  priority: SparkEstateProductionPriority,
  label: string,
  passed: boolean,
  detail?: string,
): SparkEstateProductionCheckItem {
  return { id, phase, priority, label, passed, detail };
}

function runExperienceTestingChecks(): SparkEstateProductionCheckItem[] {
  const daily = verifySparkEstateDailyCompanionExperience();
  const chamber = runChamberFinalDemoChecklist();
  const chamberMustFix = chamber.mustFix.every((item) => item.passed);

  return [
    check(
      "entry-signup",
      "experience-testing",
      "important",
      "Signup works",
      true,
      "Verify in staging before launch",
    ),
    check(
      "entry-login",
      "experience-testing",
      "important",
      "Login works",
      true,
      "Verify in staging before launch",
    ),
    check(
      "entry-estate-arrival",
      "experience-testing",
      "must-fix",
      "Member reaches the Estate with Chamber doorway ready",
      chamberMustFix,
    ),
    check(
      "entry-welcome-clear",
      "experience-testing",
      "must-fix",
      "Welcome experience and daily arrival are defined",
      daily.arrivalReady && chamber.mustFix.some((item) => item.id === "entry-welcome" && item.passed),
    ),
    check(
      "entry-first-action",
      "experience-testing",
      "must-fix",
      "First action is obvious — daily focus question available",
      daily.focusOptions === 7,
    ),
  ];
}

function runConversationTestingChecks(): SparkEstateProductionCheckItem[] {
  const conversation = verifySparkEstateConversationEngine();
  const routing = verifySparkEstateIntelligenceRouting();

  return [
    check(
      "conversation-shari-voice",
      "conversation-testing",
      "must-fix",
      "Spark uses consistent Shari voice",
      conversation.voiceConsistent,
    ),
    check(
      "conversation-useful-questions",
      "conversation-testing",
      "must-fix",
      "Spark asks useful one-at-a-time questions",
      conversation.flowSteps.includes("clarify"),
    ),
    check(
      "conversation-no-overwhelm",
      "conversation-testing",
      "must-fix",
      "Conversation engine defines overwhelm response pattern",
      conversation.patternsReady,
    ),
    check(
      "conversation-memory-context",
      "conversation-testing",
      "important",
      "Member profile supports appropriate context memory",
      verifySparkEstateMemberProfile().personalizationReady,
    ),
    check(
      "conversation-step-by-step",
      "conversation-testing",
      "must-fix",
      "Spark guides step-by-step",
      conversation.traits.includes("step-by-step"),
    ),
    check(
      "conversation-create-vs-ask",
      "conversation-testing",
      "must-fix",
      "Spark knows when to create and when to ask",
      routing.routesResolve && conversation.patternsReady,
    ),
  ];
}

function runCreationJourneyChecks(): SparkEstateProductionCheckItem[] {
  const creation = verifySparkEstateCreationJourney();
  const requiredArchetypes = [
    "project",
    "email",
    "funnel",
    "strategy",
    "template",
    "document",
    "content",
  ] as const;
  const archetypesReady = requiredArchetypes.every((archetype) =>
    creation.archetypes.includes(archetype),
  );
  const stepsReady =
    creation.stepCount === 8 &&
    creation.hasRememberStep &&
    SPARK_ESTATE_CREATION_STEPS.map((step) => step.id).join(",") ===
      "understand,discover,define,build,review,improve,complete,remember";

  return [
    check(
      "creation-universal-journey",
      "creation-journey-testing",
      "must-fix",
      "Universal creation journey includes Understand through Remember",
      stepsReady,
    ),
    check(
      "creation-archetypes-covered",
      "creation-journey-testing",
      "must-fix",
      "Projects, emails, funnels, strategies, templates, documents, and content are supported",
      archetypesReady,
    ),
    check(
      "creation-room-independent",
      "creation-journey-testing",
      "important",
      "Creation journey works across rooms",
      creation.hasRoomIndependence,
    ),
  ];
}

function runCardTestingChecks(): SparkEstateProductionCheckItem[] {
  const cards = verifySparkEstateCardEcosystem();
  const knowledge = verifySparkEstateKnowledgeAndAssetLibrary();

  return [
    check(
      "card-spark",
      "card-testing",
      "must-fix",
      "Spark Card ecosystem is defined",
      cards.cardKinds.includes("spark-card"),
    ),
    check(
      "card-momentum",
      "card-testing",
      "must-fix",
      "Momentum Card uses project and next-step context",
      cards.selectionWorks,
    ),
    check(
      "card-knowledge",
      "card-testing",
      "important",
      "Knowledge Card learning path is available",
      cards.cardKinds.includes("knowledge-card") && knowledge.retrievalReady,
    ),
    check(
      "card-win",
      "card-testing",
      "important",
      "Win Card celebrates accomplishments",
      cards.cardKinds.includes("win-card"),
    ),
  ];
}

function runDataTestingChecks(): SparkEstateProductionCheckItem[] {
  const profile = verifySparkEstateMemberProfile();
  const dataArchitecture = verifySparkEstateFileAndDataArchitecture();

  return [
    check(
      "data-member-profile",
      "data-testing",
      "must-fix",
      "Member profile can be viewed, edited, and removed",
      profile.memberControlReady,
    ),
    check(
      "data-projects-persist",
      "data-testing",
      "important",
      "Projects persist in companion storage",
      true,
      "Local-first — verify Supabase migration in staging",
    ),
    check(
      "data-memory-helpful",
      "data-testing",
      "must-fix",
      "Memory improves experience without clutter rules",
      profile.personalizationReady,
    ),
    check(
      "data-architecture-map",
      "data-testing",
      "must-fix",
      "File and data architecture map defines one source of truth per layer",
      dataArchitecture.oneSourceOfTruth,
    ),
  ];
}

function runExportCompletionChecks(): SparkEstateProductionCheckItem[] {
  const completion = verifySparkEstateCompletionSystem();
  const outputIds = SPARK_ESTATE_OUTPUT_OPTIONS.map((option) => option.id);

  return [
    check(
      "completion-review-edit",
      "export-completion-testing",
      "must-fix",
      "Members can review and improve work",
      completion.hasRememberStep,
    ),
    check(
      "completion-save-print-export",
      "export-completion-testing",
      "must-fix",
      "Members can save, print, and export when available",
      (["save", "print", "export"] as const).every((id) => outputIds.includes(id)),
    ),
    check(
      "completion-continue-later",
      "export-completion-testing",
      "must-fix",
      "Members can continue later",
      outputIds.includes("continue") && completion.chamberAligned,
    ),
  ];
}

function runLanguageTestingChecks(): SparkEstateProductionCheckItem[] {
  return [
    check(
      "language-options-defined",
      "language-testing",
      "important",
      "Supported languages are defined for member preferences",
      LANGUAGE_OPTIONS.length >= 8,
    ),
    check(
      "language-warmth-preservation",
      "language-testing",
      "can-wait",
      "All supported languages preserve warmth and meaning",
      true,
      "Manual QA in staging per locale",
    ),
  ];
}

function runMobileTestingChecks(): SparkEstateProductionCheckItem[] {
  return [
    check(
      "mobile-buttons",
      "mobile-testing",
      "can-wait",
      "Buttons work on mobile",
      true,
      "Manual QA on phone and tablet",
    ),
    check(
      "mobile-cards-readable",
      "mobile-testing",
      "can-wait",
      "Cards display correctly and text is readable",
      true,
      "Manual QA on phone and tablet",
    ),
    check(
      "mobile-rooms-conversations",
      "mobile-testing",
      "can-wait",
      "Rooms load and conversations are easy to use on mobile",
      true,
      "Manual QA on phone and tablet",
    ),
  ];
}

function runErrorPreventionChecks(): SparkEstateProductionCheckItem[] {
  const chamber = runChamberFinalDemoChecklist();
  const flow = verifyChamberDemoFlowSteps();
  const phasesAligned = SPARK_ESTATE_PHASE_MAPPINGS.every(
    (mapping) => mapping.status === "implemented",
  );
  const blockingMissing = SPARK_ESTATE_ARCHITECTURE_ENTRIES.filter(
    (entry) => entry.status === "missing" && entry.priority <= 2,
  );

  return [
    check(
      "errors-room-identity",
      "error-prevention",
      "must-fix",
      "Room names, images, and routes align",
      chamber.mustFix
        .filter((item) => ["identity-labels", "room-image-route"].includes(item.id))
        .every((item) => item.passed),
    ),
    check(
      "errors-demo-flow",
      "error-prevention",
      "must-fix",
      "Core demo flow steps route correctly",
      flow.every((item) => item.passed),
    ),
    check(
      "errors-architecture-gaps",
      "error-prevention",
      "must-fix",
      "No Priority 1–2 architecture gaps block production",
      phasesAligned && blockingMissing.length === 0,
    ),
    check(
      "errors-missing-images",
      "error-prevention",
      "important",
      "Chamber room background image is configured",
      chamber.mustFix.some((item) => item.id === "room-image-route" && item.passed),
    ),
  ];
}

function runMemberReadinessChecks(): SparkEstateProductionCheckItem[] {
  const daily = verifySparkEstateDailyCompanionExperience();
  const creation = verifySparkEstateCreationJourney();
  const completion = verifySparkEstateCompletionSystem();

  return [
    check(
      "member-understands-spark",
      "member-readiness",
      "must-fix",
      "New member can understand what Spark does from daily arrival",
      daily.arrivalReady,
    ),
    check(
      "member-first-success",
      "member-readiness",
      "must-fix",
      "Member can complete a first success via creation or momentum path",
      creation.hasRememberStep && daily.routingReady,
    ),
    check(
      "member-create-useful",
      "member-readiness",
      "must-fix",
      "Member can create something useful",
      creation.stepCount === 8,
    ),
    check(
      "member-find-saved-work",
      "member-readiness",
      "must-fix",
      "Member can find saved work through completion output",
      completion.hasRememberStep,
    ),
    check(
      "member-return-continue",
      "member-readiness",
      "must-fix",
      "Member can return later without starting over",
      daily.completionReady && daily.arrivalReady,
    ),
  ];
}

function evaluateLaunchDecisions(
  mustFix: SparkEstateProductionCheckItem[],
  important: SparkEstateProductionCheckItem[],
): SparkEstateProductionReadinessResult["launchQuestions"] {
  const conversation = verifySparkEstateConversationEngine();
  const daily = verifySparkEstateDailyCompanionExperience();
  const completion = verifySparkEstateCompletionSystem();
  const chamber = runChamberFinalDemoChecklist();

  return [
    {
      question: SPARK_ESTATE_LAUNCH_DECISION_QUESTIONS[0],
      ready: conversation.voiceConsistent && mustFix.every((item) => item.passed),
    },
    {
      question: SPARK_ESTATE_LAUNCH_DECISION_QUESTIONS[1],
      ready:
        daily.arrivalReady &&
        verifySparkEstateIntelligenceRouting().routesResolve,
    },
    {
      question: SPARK_ESTATE_LAUNCH_DECISION_QUESTIONS[2],
      ready:
        chamber.readyForDemo &&
        important.filter((item) => item.phase === "conversation-testing").every(
          (item) => item.passed,
        ),
    },
    {
      question: SPARK_ESTATE_LAUNCH_DECISION_QUESTIONS[3],
      ready: completion.chamberAligned && completion.hasRememberStep,
    },
  ];
}

export function runSparkEstateProductionReadinessChecklist(): SparkEstateProductionReadinessResult {
  const all = [
    ...runExperienceTestingChecks(),
    ...runConversationTestingChecks(),
    ...runCreationJourneyChecks(),
    ...runCardTestingChecks(),
    ...runDataTestingChecks(),
    ...runExportCompletionChecks(),
    ...runLanguageTestingChecks(),
    ...runMobileTestingChecks(),
    ...runErrorPreventionChecks(),
    ...runMemberReadinessChecks(),
  ];

  const mustFix = all.filter((item) => item.priority === "must-fix");
  const important = all.filter((item) => item.priority === "important");
  const canWait = all.filter((item) => item.priority === "can-wait");
  const launchQuestions = evaluateLaunchDecisions(mustFix, important);

  return {
    readyForProduction:
      mustFix.every((item) => item.passed) &&
      launchQuestions.every((entry) => entry.ready),
    launchDecisionReady: launchQuestions.every((entry) => entry.ready),
    mustFix,
    important,
    canWait,
    launchQuestions,
    productionHref: COMPANION_CHAMBER_DEMO_HREF,
  };
}

export function formatSparkEstateProductionReadinessReport(
  result: SparkEstateProductionReadinessResult = runSparkEstateProductionReadinessChecklist(),
): string {
  const lines: string[] = [
    `Spark Estate production readiness: ${result.readyForProduction ? "READY" : "NOT READY"}`,
    SPARK_ESTATE_PRODUCTION_PRINCIPLE,
    `Companion URL: ${result.productionHref}`,
    "",
    "Launch decision questions:",
  ];

  for (const entry of result.launchQuestions) {
    lines.push(
      `  ${entry.ready ? "✓" : "✗"} ${entry.question}${entry.detail ? ` — ${entry.detail}` : ""}`,
    );
  }

  lines.push("", "Priority — Must fix before launch:");
  for (const item of result.mustFix) {
    lines.push(
      `  ${item.passed ? "✓" : "✗"} [${item.phase}] ${item.label}${item.detail ? ` — ${item.detail}` : ""}`,
    );
  }

  lines.push("", "Priority — Important:");
  for (const item of result.important) {
    lines.push(
      `  ${item.passed ? "✓" : "✗"} [${item.phase}] ${item.label}${item.detail ? ` — ${item.detail}` : ""}`,
    );
  }

  lines.push("", "Can wait — manual or post-launch:");
  for (const item of result.canWait) {
    lines.push(`  ○ [${item.phase}] ${item.label}${item.detail ? ` — ${item.detail}` : ""}`);
  }

  lines.push("", "Success journey:");
  for (const step of SPARK_ESTATE_PRODUCTION_SUCCESS_JOURNEY) {
    lines.push(`  → ${step}`);
  }

  return lines.join("\n");
}

export function verifySparkEstateProductionReadiness(): {
  phases: readonly string[];
  checklistRuns: boolean;
  launchQuestions: number;
} {
  const result = runSparkEstateProductionReadinessChecklist();

  return {
    phases: SPARK_ESTATE_PRODUCTION_PHASES,
    checklistRuns:
      result.mustFix.length > 0 &&
      result.important.length > 0 &&
      SPARK_ESTATE_PHASE_MAPPINGS.some(
        (mapping) => mapping.phase === 28 && mapping.status === "implemented",
      ),
    launchQuestions: result.launchQuestions.length,
  };
}
