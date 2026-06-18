import { describe, expect, it } from "vitest";

import {
  APP_FEATURE_UNSURE,
  appFeatureKnowledgeHintForChat,
  isAppHowToQuestion,
  matchAppFeatures,
  resolveAppFeatureKnowledge,
} from "./appFeatureKnowledge";

describe("appFeatureKnowledge — QA navigation", () => {
  it("How do I find the games? → Focus → Momentum Boosters → Momentum Games", () => {
    const text = "How do I find the games?";
    expect(isAppHowToQuestion(text)).toBe(true);

    const answer = resolveAppFeatureKnowledge(text);
    expect(answer).not.toBeNull();
    expect(answer!.navigation).toMatch(/Focus/i);
    expect(answer!.navigation).toMatch(/Momentum Boosters/i);
    expect(answer!.navigation).toMatch(/Momentum Games/i);
    expect(answer!.featureIds).toContain("momentum-games");

    const hint = appFeatureKnowledgeHintForChat(text)!;
    expect(hint).toMatch(/Momentum Games/i);
    expect(hint).toMatch(/Momentum Boosters/i);
    expect(hint).not.toMatch(/no games|don't have games|not built/i);
  });

  it("How do I use Strategies? → More → Strategies, ADHD or Business", () => {
    const text = "How do I use Strategies?";
    expect(isAppHowToQuestion(text)).toBe(true);

    const answer = resolveAppFeatureKnowledge(text);
    expect(answer).not.toBeNull();
    expect(answer!.navigation).toMatch(/More.*Strategies/i);
    expect(answer!.howTo).toMatch(/ADHD Strategies/i);
    expect(answer!.howTo).toMatch(/Business Strategies/i);

    const hint = appFeatureKnowledgeHintForChat(text)!;
    expect(hint).toMatch(/Strategies/i);
    expect(hint).toMatch(/ADHD/i);
  });

  it("How do I change colors? → Settings/Profile appearance, not unavailable", () => {
    const text = "How do I change the colors?";
    expect(isAppHowToQuestion(text)).toBe(true);

    const answer = resolveAppFeatureKnowledge(text);
    expect(answer).not.toBeNull();
    expect(answer!.navigation).toMatch(/Settings/i);
    expect(answer!.navigation).toMatch(/Appearance/i);
    expect(answer!.howTo).toMatch(/Adaptive Colors|Category Colors|Minimal/i);

    const hint = appFeatureKnowledgeHintForChat(text)!;
    expect(hint).toMatch(/Appearance/i);
    expect(hint).not.toMatch(/not (?:a |currently )?a feature|not available|can't change/i);
    expect(hint).not.toMatch(/no color/i);
  });

  it("follow-up 'Change the colors.' still resolves appearance", () => {
    const text = "Change the colors.";
    const answer = resolveAppFeatureKnowledge(text);
    expect(answer).not.toBeNull();
    expect(answer!.navigation).toMatch(/Appearance/i);
  });
});

describe("appFeatureKnowledge — guardrails", () => {
  it("does not invent features for unrelated chat", () => {
    expect(resolveAppFeatureKnowledge("I'm feeling overwhelmed today")).toBeNull();
    expect(appFeatureKnowledgeHintForChat("I'm feeling overwhelmed today")).toBeUndefined();
  });

  it("unsure fallback is defined for ambiguous how-to", () => {
    expect(APP_FEATURE_UNSURE).toContain("check the current app layout");
    const hint = appFeatureKnowledgeHintForChat("How do I use the app?");
    expect(hint).toBeTruthy();
  });

  it("matchAppFeatures prioritizes games entry over generic focus", () => {
    const matches = matchAppFeatures("where are the games");
    expect(matches[0]?.id).toBe("momentum-games");
  });

  it("How do I block out time? → Focus → Focus Tools → Block Out Time", () => {
    const text = "How do I block out time?";
    expect(isAppHowToQuestion(text)).toBe(true);

    const answer = resolveAppFeatureKnowledge(text);
    expect(answer).not.toBeNull();
    expect(answer!.navigation).toMatch(/Focus/i);
    expect(answer!.navigation).toMatch(/Focus Tools/i);
    expect(answer!.navigation).toMatch(/Block Out Time/i);
    expect(answer!.featureIds).toContain("time-block");
  });

  it("concept how-to is teaching, not app navigation", () => {
    expect(
      isAppHowToQuestion("Teach me what a sales funnel is and how to use it."),
    ).toBe(false);
    expect(isAppHowToQuestion("How do I use a sales funnel?")).toBe(false);
  });

  it("Templates how-to mentions device storage and Build with Shari consent", () => {
    const answer = resolveAppFeatureKnowledge("How do templates work?");
    expect(answer).not.toBeNull();
    expect(answer!.howTo).toMatch(/saved on this device/i);
    expect(answer!.howTo).toMatch(/Build with Shari/i);
    expect(answer!.howTo).toMatch(/until you agree/i);
    expect(answer!.howTo).toMatch(/Start from blank/i);
  });

  it("Projects how-to mentions More → Projects and time blocks", () => {
    const answer = resolveAppFeatureKnowledge("How do projects work?");
    expect(answer).not.toBeNull();
    expect(answer!.navigation).toMatch(/More.*Projects/i);
    expect(answer!.howTo).toMatch(/time blocks?/i);
  });
});
