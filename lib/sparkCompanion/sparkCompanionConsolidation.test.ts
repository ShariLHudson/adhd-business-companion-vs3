import { describe, expect, it } from "vitest";
import { classifyPrimaryConversationTurn } from "@/lib/conversation/primaryTurnClassifier";
import { shariCompanionHintForChat } from "@/lib/conversation/shariCompanionEngine";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { resolveEstateDestination } from "@/lib/estate/estateDestinationResolver";
import {
  buildSparkCompanionHint,
  evaluateSparkDecisionEngine,
  mapDecisionToRuntimeAction,
  measureCompanionPromptLoad,
} from "@/lib/sparkCompanion";

describe("Spark V4 Decision Engine consolidation — golden paths", () => {
  it("Help me create an SOP → BUILD / CREATE, no emotional coaching", () => {
    const text = "Help me create an SOP for onboarding";
    const decision = evaluateSparkDecisionEngine({ userText: text });
    const runtime = mapDecisionToRuntimeAction({ userText: text, decision });

    expect(decision.intent).toBe("CREATE");
    expect(runtime.canonicalRole).toBe("BUILD");
    expect(runtime.suppressEmotionalCoaching).toBe(true);
    expect(runtime.runtimeMode).toBe("build");

    const hint = buildSparkCompanionHint({ userText: text });
    expect(hint).toContain("NO emotional coaching");
    expect(hint).not.toMatch(/SPARK ESTATE MANIFESTO/i);
    expect(hint?.split("\n\n").length).toBeLessThan(8);
  });

  it("I am overwhelmed → SUPPORT, no productivity push", () => {
    const text = "I am overwhelmed and can't start anything";
    const runtime = mapDecisionToRuntimeAction({
      userText: text,
      overwhelmed: true,
    });

    expect(runtime.primaryIntent).toBe("SUPPORT");
    expect(runtime.canonicalRole).toBe("SUPPORT");
    expect(runtime.suppressTaskLayer).toBe(true);

    const frictionless = resolveFrictionlessAction({
      userText: text,
      overwhelmed: true,
      primaryTurn: classifyPrimaryConversationTurn({ userText: text }),
    });
    expect(frictionless.sparkRuntime?.primaryIntent).toBe("SUPPORT");
    expect(frictionless.category).not.toBe("direct_action");
  });

  it("What visual models can you create? → EXPLORE / TEACH, no auto routing", () => {
    const text = "What visual models can you create?";
    const runtime = mapDecisionToRuntimeAction({ userText: text });

    expect(["EXPLORE", "LEARN"]).toContain(runtime.primaryIntent);
    expect(runtime.suppressDiscoveryAutoRoute).toBe(true);

    const frictionless = resolveFrictionlessAction({ userText: text });
    expect(frictionless.immediateEstatePlaceNavigate).toBeUndefined();
    expect(frictionless.category).not.toBe("direct_action");
    expect(["none", "estate_guide"]).toContain(frictionless.category);
  });

  it("I need a cup of coffee → implied need, offers choices", () => {
    const primary = classifyPrimaryConversationTurn({
      userText: "I need a cup of coffee",
    });
    expect(primary.type).toBe("IMPLIED_NEED");

    const frictionless = resolveFrictionlessAction({
      userText: "I need a cup of coffee",
      primaryTurn: primary,
    });
    expect(
      frictionless.category === "implied_need" ||
        frictionless.impliedNeedEvaluation != null,
    ).toBe(true);
  });

  it("garden → ambiguous navigation choices when multiple gardens exist", () => {
    const result = resolveEstateDestination({
      userText: "garden",
      destinationPhrase: "garden",
    });
    expect(result.kind).toBe("ambiguous_match");
    if (result.kind === "ambiguous_match") {
      expect(result.choices.length).toBeGreaterThanOrEqual(2);
      expect(result.choices.length).toBeLessThanOrEqual(4);
    }
  });

  it("I hope you're having a good day → relationship chat, no celebration", () => {
    const primary = classifyPrimaryConversationTurn({
      userText: "I hope you're having a good day",
    });
    expect(primary.type).toBe("RELATIONSHIP_CHAT");

    const frictionless = resolveFrictionlessAction({
      userText: "I hope you're having a good day",
      primaryTurn: primary,
    });
    expect(frictionless.category).toBe("none");
    expect(frictionless.localReply).toBeNull();
  });

  it("I can't focus → friction / landscape, small help options", () => {
    const text = "I can't focus today";
    const runtime = mapDecisionToRuntimeAction({ userText: text });

    expect(["friction_menu", "support", "ask_clarify", "stay_chat"]).toContain(
      runtime.runtimeMode,
    );

    const frictionless = resolveFrictionlessAction({ userText: text });
    expect(frictionless.sparkRuntime).toBeDefined();
  });
});

describe("Spark V4 token load", () => {
  it("per-turn hint is compact vs legacy stacking", () => {
    const text = "Help me write a marketing email";
    const hint = shariCompanionHintForChat({ userText: text }) ?? "";
    const metrics = measureCompanionPromptLoad({ userText: text });

    expect(hint.length).toBeLessThan(2500);
    expect(metrics.perTurnHintSections).toBeLessThan(15);
    expect(metrics.consolidatedBlockChars).toBeGreaterThan(0);
    expect(hint).not.toContain("SPARK ESTATE MANIFESTO");
    expect(hint).not.toContain("SPARK ESTATE PROMISES");
  });
});
