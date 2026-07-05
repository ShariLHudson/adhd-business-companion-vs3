/**
 * Mixed 19-question audit — estate routing + companion intent (one-off QA).
 * Run: npx tsx scripts/mixed-audit-19.ts
 */

import { evaluateCompanionBehaviorCase } from "../lib/companionBehaviorAudit";
import type { CompanionBehaviorAuditCase } from "../lib/companionBehaviorAudit";
import { goToPlace } from "../lib/estate/goToPlace";
import {
  resolveEstateRoutingDecision,
  routingDecisionToPlaceResolution,
} from "../lib/estate/estateRoutingRegistry";
import { resolveEstatePlace, shouldNavigateFromResolution } from "../lib/estate/resolveEstatePlace";
import { getEstateGuideSpreadForPlaceId } from "../data/estateGuideSpreads";

type MixedAuditQuestion = {
  id: string;
  type:
    | "estate_nav"
    | "estate_ambiguous"
    | "estate_presence"
    | "estate_guide"
    | "learn"
    | "plan"
    | "organize"
    | "focus"
    | "decide"
    | "create"
    | "relationship"
    | "conversation"
    | "yes_continuation"
    | "strategy";
  input: string;
  /** For companion cases */
  companionCase?: CompanionBehaviorAuditCase;
  /** Estate expectations */
  expectKind?: "navigate" | "suggest" | "presence" | "none";
  expectPlaceId?: string;
  expectSubspaceId?: string;
  expectGoToPlace?: boolean;
  expectGuideSpread?: boolean;
  context?: { currentPlaceId?: string };
};

const QUESTIONS: MixedAuditQuestion[] = [
  {
    id: "E01",
    type: "estate_nav",
    input: "take me to the Possibility House",
    expectKind: "navigate",
    expectPlaceId: "house-possibility-outside",
    expectGoToPlace: true,
    expectGuideSpread: true,
  },
  {
    id: "E02",
    type: "estate_nav",
    input: "show me the Discovery Chest",
    expectKind: "navigate",
    expectPlaceId: "house-possibility-outside",
    expectSubspaceId: "house-possibility-discovery-chest",
    expectGoToPlace: true,
    expectGuideSpread: true,
  },
  {
    id: "E03",
    type: "estate_nav",
    input: "open the Cabinet of Chapters",
    expectKind: "navigate",
    expectPlaceId: "house-possibility-outside",
    expectSubspaceId: "house-possibility-cabinet-of-chapters",
    expectGoToPlace: true,
    expectGuideSpread: true,
  },
  {
    id: "E04",
    type: "estate_nav",
    input: "take me to the Possibility Studio",
    expectKind: "navigate",
    expectPlaceId: "house-possibility-outside",
    expectSubspaceId: "house-possibility-studio",
    expectGoToPlace: true,
    expectGuideSpread: true,
  },
  {
    id: "E05",
    type: "estate_nav",
    input: "visit the treehouse observatory",
    expectKind: "navigate",
    expectPlaceId: "house-possibility-outside",
    expectSubspaceId: "house-possibility-observatory",
    expectGoToPlace: true,
    expectGuideSpread: true,
  },
  {
    id: "E06",
    type: "estate_ambiguous",
    input: "take me to the telescope",
    expectKind: "suggest",
  },
  {
    id: "E07",
    type: "estate_ambiguous",
    input: "reading nook",
    expectKind: "suggest",
  },
  {
    id: "E08",
    type: "estate_presence",
    input: "hide chat and let me sit here",
    expectKind: "presence",
  },
  {
    id: "E09",
    type: "estate_nav",
    input: "take me to the Legacy Room",
    expectKind: "navigate",
    expectPlaceId: "house-possibility-outside",
    expectSubspaceId: "house-possibility-legacy-room",
    expectGoToPlace: true,
    expectGuideSpread: true,
  },
  {
    id: "E10",
    type: "estate_guide",
    input: "tell me about Possibility House",
    expectKind: "none",
  },
  {
    id: "C01",
    type: "learn",
    input: "What is a sales funnel?",
    companionCase: {
      id: "mixed-learn-funnel",
      category: "learn",
      userInput: "What is a sales funnel?",
      expectedIntent: "learn",
      expectedRoute: "conversation",
      expectedFeature: "Learn",
      expectedSuppressionFlags: { relationship: true, learnFastPath: true },
    },
  },
  {
    id: "C02",
    type: "plan",
    input: "I'm overwhelmed and not sure where to start today.",
    companionCase: {
      id: "mixed-plan-overwhelmed",
      category: "plan",
      userInput: "I'm overwhelmed and not sure where to start today.",
      expectedIntent: "plan",
      expectedRoute: "feature_offer",
      expectedFeature: "Plan My Day",
      expectedSuppressionFlags: { relationship: true },
      maxQuestionsInTurn: 3,
    },
  },
  {
    id: "C03",
    type: "organize",
    input: "I have too many ideas.",
    companionCase: {
      id: "mixed-organize-ideas",
      category: "organize",
      userInput: "I have too many ideas.",
      expectedIntent: "organize",
      expectedRoute: ["feature_offer", "conversation"],
      expectedFeature: "Clear My Mind",
      expectedSuppressionFlags: { relationship: true },
    },
  },
  {
    id: "C04",
    type: "focus",
    input: "I need to focus.",
    companionCase: {
      id: "mixed-focus",
      category: "focus",
      userInput: "I need to focus.",
      expectedIntent: "focus",
      expectedRoute: "focus_support",
      expectedSuppressionFlags: { relationship: true },
    },
  },
  {
    id: "C05",
    type: "decide",
    input: "Should I take offer A or offer B?",
    companionCase: {
      id: "mixed-decide",
      category: "decide",
      userInput: "Should I take offer A or offer B?",
      expectedIntent: "decide",
      expectedRoute: ["feature_offer", "conversation"],
      expectedFeature: "Decision Compass",
      expectedSuppressionFlags: { relationship: true },
    },
  },
  {
    id: "C06",
    type: "create",
    input: "Write a follow-up email sequence.",
    companionCase: {
      id: "mixed-create-email",
      category: "create",
      userInput: "Write a follow-up email sequence.",
      expectedIntent: ["create", "execute"],
      expectedRoute: ["feature_offer", "direct_action", "execute_inline"],
      expectedFeature: "content-generator",
      expectedSuppressionFlags: { relationship: true },
    },
  },
  {
    id: "C07",
    type: "relationship",
    input: "Why do I get stuck before I finish?",
    companionCase: {
      id: "mixed-relationship-stuck",
      category: "relationship",
      userInput: "Why do I get stuck before I finish?",
      expectedIntent: "understand",
      expectedRoute: "conversation",
      expectedSuppressionFlags: { relationship: false },
    },
  },
  {
    id: "C08",
    type: "yes_continuation",
    input: "yes (after calm music offer)",
    companionCase: {
      id: "mixed-yes-calm",
      category: "yes_continuation",
      setupUserInput: "I need calm music while I work.",
      userInput: "yes",
      expectedIntent: "continuation",
      expectedRoute: "continuation",
      expectedFeature: "focus-audio",
      expectedSuppressionFlags: { relationship: true },
    },
  },
  {
    id: "C09",
    type: "strategy",
    input: "I keep putting off my sales calls",
    companionCase: {
      id: "mixed-strategy-sales",
      category: "strategy",
      userInput: "I keep putting off my sales calls",
      expectedIntent: ["strategy", "focus"],
      expectedRoute: "strategy",
      expectedFeature: "Strategy Intelligence",
      expectedSuppressionFlags: { relationship: true },
    },
  },
];

type RowResult = {
  id: string;
  type: string;
  input: string;
  pass: boolean;
  summary: string;
  details: string[];
};

function auditEstate(q: MixedAuditQuestion): RowResult {
  const details: string[] = [];
  let pass = true;

  const decision = resolveEstateRoutingDecision(q.input, q.context);
  details.push(`routing: kind=${decision.kind} place=${decision.placeId ?? "—"} subspace=${decision.subspaceId ?? "—"}`);

  if (q.expectKind && decision.kind !== q.expectKind) {
    pass = false;
    details.push(`expected kind ${q.expectKind}, got ${decision.kind}`);
  }
  if (q.expectPlaceId && decision.placeId !== q.expectPlaceId) {
    pass = false;
    details.push(`expected place ${q.expectPlaceId}, got ${decision.placeId ?? "none"}`);
  }
  if (q.expectSubspaceId && decision.subspaceId !== q.expectSubspaceId) {
    pass = false;
    details.push(`expected subspace ${q.expectSubspaceId}, got ${decision.subspaceId ?? "none"}`);
  }

  if (decision.kind === "navigate" && q.expectGoToPlace) {
    const resolution = routingDecisionToPlaceResolution(decision);
    const placeResolution = resolveEstatePlace(q.input, q.context);
    details.push(`resolveEstatePlace navigates=${shouldNavigateFromResolution(placeResolution)} id=${placeResolution.placeId ?? "—"}`);

    const outcome = goToPlace({
      placeId: resolution.placeId!,
      userIntent: q.input,
    });
    if (!outcome.ok) {
      pass = false;
      details.push(`goToPlace FAILED: ${outcome.message}`);
    } else {
      details.push(`goToPlace OK → ${outcome.placeId}${outcome.directVisit.subspaceId ? ` / ${outcome.directVisit.subspaceId}` : ""}`);
    }

    const guidePlaceId = resolution.placeId;
    if (guidePlaceId && q.expectGuideSpread !== undefined) {
      const spread = getEstateGuideSpreadForPlaceId(guidePlaceId);
      const hasGuide = Boolean(spread);
      details.push(`guide spread for ${guidePlaceId}: ${hasGuide ? spread!.id : "MISSING"}`);
      if (q.expectGuideSpread && !hasGuide) {
        pass = false;
        details.push("expected guide spread — not found");
      }
    }
  }

  if (q.type === "estate_guide") {
    const resolution = resolveEstatePlace(q.input);
    const navigates = shouldNavigateFromResolution(resolution);
    details.push(`resolveEstatePlace navigates=${navigates}`);
    if (navigates) {
      pass = false;
      details.push("guide-style question incorrectly triggered navigation");
    } else {
      details.push("no auto-navigation (guide must be opened via object/conversation — not wired from phrase alone)");
    }
  }

  return {
    id: q.id,
    type: q.type,
    input: q.input,
    pass,
    summary: pass ? "PASS" : "FAIL",
    details,
  };
}

function auditCompanion(q: MixedAuditQuestion): RowResult {
  if (!q.companionCase) {
    return {
      id: q.id,
      type: q.type,
      input: q.input,
      pass: false,
      summary: "FAIL",
      details: ["missing companionCase"],
    };
  }
  const result = evaluateCompanionBehaviorCase(q.companionCase);
  const details = [
    `intent=${result.actualIntent} route=${result.actualRoute} feature=${result.actualFeature ?? "none"}`,
    ...result.failureReasons,
  ];
  return {
    id: q.id,
    type: q.type,
    input: q.input,
    pass: result.pass,
    summary: result.pass ? "PASS" : "FAIL",
    details,
  };
}

function main() {
  const results = QUESTIONS.map((q) =>
    q.companionCase ? auditCompanion(q) : auditEstate(q),
  );
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;

  console.log("\n=== Mixed 19-Question Audit ===\n");
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed} | Pass rate: ${Math.round((passed / results.length) * 100)}%\n`);

  for (const r of results) {
    const icon = r.pass ? "✓" : "✗";
    console.log(`${icon} [${r.id}] ${r.type} — ${r.summary}`);
    console.log(`   "${r.input}"`);
    for (const d of r.details) console.log(`   · ${d}`);
    console.log("");
  }

  console.log("—— Failure themes ——");
  const failTypes = new Map<string, number>();
  for (const r of results.filter((x) => !x.pass)) {
    failTypes.set(r.type, (failTypes.get(r.type) ?? 0) + 1);
  }
  for (const [type, count] of [...failTypes.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
}

main();
