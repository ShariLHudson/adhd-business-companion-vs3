import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetAdaptiveCompanionExplicitPrefsForTests,
  __resetAdaptiveSessionOverrideForTests,
  detectAdaptiveConversationalOverride,
  limitVisibleChoices,
  patchAdaptiveCompanionExplicitPrefs,
  resolveAdaptivePresentation,
  setAdaptiveSessionOverride,
  toAdaptivePresentationContext,
} from "@/lib/adaptiveCompanionIntelligence";

describe("Adaptive Companion Intelligence", () => {
  beforeEach(() => {
    __resetAdaptiveCompanionExplicitPrefsForTests();
    __resetAdaptiveSessionOverrideForTests();
  });

  it("resolves defaults with full detail always available", () => {
    const resolved = resolveAdaptivePresentation({
      destinationHint: "strategy_chamber",
    });
    expect(resolved.fullDetailAvailable).toBe(true);
    expect(resolved.summaryFirst).toBe(true);
    expect(resolved.maxVisibleChoices).toBeGreaterThanOrEqual(1);
    expect(resolved.maxVisibleChoices).toBeLessThanOrEqual(3);
    expect(resolved.sources.length).toBeGreaterThan(0);
  });

  it("honors explicit summary-first and choice-load prefs", () => {
    patchAdaptiveCompanionExplicitPrefs({
      summaryFirst: false,
      choiceLoad: "one",
      paragraphLength: "standard",
    });
    const resolved = resolveAdaptivePresentation();
    expect(resolved.summaryFirst).toBe(false);
    expect(resolved.maxVisibleChoices).toBe(1);
    expect(resolved.shortParagraphs).toBe(false);
  });

  it("applies session override without writing permanent prefs", () => {
    patchAdaptiveCompanionExplicitPrefs({ choiceLoad: "three" });
    setAdaptiveSessionOverride({ choiceLoad: "one", summaryFirst: false });
    const resolved = resolveAdaptivePresentation();
    expect(resolved.maxVisibleChoices).toBe(1);
    expect(resolved.summaryFirst).toBe(false);
  });

  it("lets conversational full-detail override summary-first for this turn", () => {
    patchAdaptiveCompanionExplicitPrefs({ summaryFirst: true });
    const resolved = resolveAdaptivePresentation({
      conversationalText: "Give me the full detail please",
    });
    expect(resolved.summaryFirst).toBe(false);
    expect(resolved.resumeDepth).toBe("detailed");
    expect(
      detectAdaptiveConversationalOverride("Give me the full detail")?.forceFullDetail,
    ).toBe(true);
  });

  it("limits visible choices and reports hidden count", () => {
    patchAdaptiveCompanionExplicitPrefs({ choiceLoad: "two" });
    const resolved = resolveAdaptivePresentation();
    const { visible, hiddenCount } = limitVisibleChoices(
      ["a", "b", "c", "d"],
      resolved,
    );
    expect(visible).toEqual(["a", "b"]);
    expect(hiddenCount).toBe(2);
    expect(resolved.showMoreOptionsControl).toBe(true);
  });

  it("builds compact handoff presentation context", () => {
    const ctx = toAdaptivePresentationContext(resolveAdaptivePresentation());
    expect(ctx).toHaveProperty("summaryFirst");
    expect(ctx).toHaveProperty("maxVisibleChoices");
    expect(ctx).not.toHaveProperty("sources");
  });
});
