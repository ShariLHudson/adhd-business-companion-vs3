import { describe, expect, it } from "vitest";
import {
  CompanionLatencyProfiler,
  auditPromptBlocks,
  buildCompanionQaLatencyReport,
  COMPANION_QA_LATENCY_CASES,
  isDeepReflectionRequest,
  resolveCompanionResponseRoute,
  type ResponseRouteClass,
} from "./companionLatencyProfiler";
import { resolveFrictionlessAction, isFrictionlessAffirmation } from "./frictionlessActionLayer";
import { resolveIntentRouting } from "./intentRoutingIntelligence";

function routeFor(
  userText: string,
  opts?: { isYesContinuation?: boolean; hasPendingFrictionless?: boolean },
) {
  const routing = resolveIntentRouting({ userText });
  const frictionless = resolveFrictionlessAction({
    userText,
    currentTurn: 2,
    lastAssistantText:
      opts?.hasPendingFrictionless
        ? "I can open Focus Audio for calming music. Want me to open it?"
        : "",
  });
  return resolveCompanionResponseRoute({
    userText,
    routing,
    frictionless,
    isYesContinuation: opts?.isYesContinuation ?? isFrictionlessAffirmation(userText),
    hasPendingFrictionless: opts?.hasPendingFrictionless,
  });
}

const QA_CASES: Array<{
  label: string;
  userText: string;
  expectedRoute: ResponseRouteClass;
  opts?: { isYesContinuation?: boolean; hasPendingFrictionless?: boolean };
}> = [
  {
    label: "greeting — hi",
    userText: "hi",
    expectedRoute: "instant",
  },
  {
    userText: "What is a sales funnel?",
    expectedRoute: "fast",
  },
  {
    label: "create — email",
    userText: "I need to write an email",
    expectedRoute: "instant",
  },
  {
    label: "yes after Create offer",
    userText: "yes",
    expectedRoute: "instant",
    opts: { isYesContinuation: true, hasPendingFrictionless: true },
  },
  {
    label: "calming music local offer",
    userText: "I would like calming music",
    expectedRoute: "instant",
  },
  {
    label: "yes after Focus Audio offer",
    userText: "yes",
    expectedRoute: "instant",
    opts: {
      isYesContinuation: true,
      hasPendingFrictionless: true,
    },
  },
  {
    label: "deep — starting but not finishing",
    userText: "Why do I keep starting but not finishing?",
    expectedRoute: "deep",
  },
  {
    label: "deep — patterns",
    userText: "What patterns have you noticed about me?",
    expectedRoute: "deep",
  },
];

describe("companionLatencyProfiler", () => {
  it.each(QA_CASES)(
    "QA $label → $expectedRoute path",
    ({ userText, expectedRoute, opts }) => {
      const profile = routeFor(userText, opts);
      expect(profile.routeClass).toBe(expectedRoute);
      if (expectedRoute === "deep") {
        expect(profile.skipHeavyLayers).toBe(false);
        expect(profile.skipLayers.phaseObservers).toBe(false);
      } else {
        expect(profile.skipHeavyLayers).toBe(true);
        expect(profile.skipLayers.phaseObservers).toBe(true);
      }
    },
  );

  it("skips heavy layers on fast learn path", () => {
    const profile = routeFor("What is a sales funnel?");
    expect(profile.skipLayers.adhdOS).toBe(true);
    expect(profile.skipLayers.wisdom).toBe(true);
    expect(profile.skipLayers.ecosystem).toBe(true);
    expect(profile.skipLayers.responseContract).toBe(true);
    expect(profile.budgetMs).toBe(1500);
  });

  it("instant route uses 500ms budget", () => {
    const profile = routeFor("I would like calming music");
    expect(profile.routeClass).toBe("instant");
    expect(profile.budgetMs).toBe(500);
    expect(profile.useLocalReplyOnly).toBe(true);
  });

  it("detects deep reflection phrasing", () => {
    expect(isDeepReflectionRequest("Why do I keep starting but not finishing?")).toBe(
      true,
    );
    expect(isDeepReflectionRequest("What is a sales funnel?")).toBe(false);
  });

  it("audits prompt blocks", () => {
    const audit = auditPromptBlocks({
      blocks: [
        { name: "intent", text: "learn hint" },
        { name: "relationship", text: null },
        { name: "wisdom", text: "long wisdom block" },
      ],
      skippedBlockNames: ["relationship"],
    });
    expect(audit.blockCount).toBe(2);
    expect(audit.activeBlocks).toEqual(["intent", "wisdom"]);
    expect(audit.skippedBlocks).toEqual(["relationship"]);
    expect(audit.finalPromptLength).toBe("learn hint".length + "long wisdom block".length);
  });

  it("QA report covers fast vs deep split", () => {
    const rows = buildCompanionQaLatencyReport(COMPANION_QA_LATENCY_CASES);
    expect(rows).toHaveLength(7);
    const deep = rows.filter((r) =>
      r.userText.includes("patterns") || r.userText.includes("starting but not finishing"),
    );
    expect(deep.every((r) => r.routeClass === "deep")).toBe(true);
    const fast = rows.filter((r) => r.routeClass !== "deep");
    expect(fast.every((r) => r.skipHeavyLayers)).toBe(true);
  });
});
