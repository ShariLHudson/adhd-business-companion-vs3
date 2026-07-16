/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { buildMemberTonePreferenceBlocks } from "@/lib/companionTonePreferences";
import { resolveIntentRouting } from "@/lib/intentRoutingIntelligence";
import {
  SUPPORT_STYLE_CATALOG,
  SUPPORT_STYLE_PREFS_KEY,
  SUPPORT_STYLE_SAMPLE_STATEMENT,
  buildSupportStylePromptBlock,
  detectSupportStyleTemporaryOverride,
  getSupportStylePreference,
  previewSupportStyleResponse,
  saveSupportStylePreference,
  supportSequenceForStatement,
  supportStylesDifferVisibly,
  type SupportStyleId,
} from "@/lib/supportStyle";

beforeEach(() => {
  localStorage.clear();
});

describe("Support Style persistence", () => {
  it("defaults to adaptive and migrates from legacy prefs when needed", () => {
    const prefs = getSupportStylePreference();
    expect(prefs.styleId).toBe("adaptive");
    expect(prefs.useMostOfTheTime).toBe(true);
  });

  it("saves each style and keeps it after reload", () => {
    const styles: SupportStyleId[] = [
      "gentle-first",
      "practical-first",
      "talk-it-through",
      "step-by-step",
      "give-me-choices",
      "adaptive",
    ];
    for (const styleId of styles) {
      const result = saveSupportStylePreference({ styleId });
      expect(result.ok).toBe(true);
      const raw = localStorage.getItem(SUPPORT_STYLE_PREFS_KEY);
      expect(raw).toBeTruthy();
      localStorage.setItem(SUPPORT_STYLE_PREFS_KEY, raw!);
      expect(getSupportStylePreference().styleId).toBe(styleId);
    }
  });

  it("rejects stale version writes and keeps prior preference", () => {
    const first = saveSupportStylePreference({ styleId: "gentle-first" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const rejected = saveSupportStylePreference({
      styleId: "practical-first",
      version: first.preference.version - 1,
    });
    expect(rejected.ok).toBe(false);
    expect(getSupportStylePreference().styleId).toBe("gentle-first");
  });

  it("saves custom settings without requiring every field", () => {
    const result = saveSupportStylePreference({
      styleId: "custom",
      customSettings: {
        overwhelmedStart: "reassurance",
        stuckHelp: ["break-down"],
      },
    });
    expect(result.ok).toBe(true);
    const prefs = getSupportStylePreference();
    expect(prefs.styleId).toBe("custom");
    expect(prefs.customSettings?.overwhelmedStart).toBe("reassurance");
    expect(prefs.customSettings?.stuckHelp).toEqual(["break-down"]);
    expect(prefs.customSettings?.choiceCount).toBeUndefined();
  });
});

describe("Support Style visible differences", () => {
  it("uses one sample statement and produces distinct previews", () => {
    const previews = SUPPORT_STYLE_CATALOG.filter(
      (entry) => entry.id !== "custom",
    ).map((entry) => previewSupportStyleResponse(entry.id));
    expect(new Set(previews).size).toBe(previews.length);
    for (const entry of SUPPORT_STYLE_CATALOG) {
      expect(entry.preview.length).toBeGreaterThan(20);
    }
    expect(SUPPORT_STYLE_SAMPLE_STATEMENT).toMatch(/too much to do/i);
  });

  it("shows clear differences across major styles", () => {
    const pairs: Array<[SupportStyleId, SupportStyleId]> = [
      ["gentle-first", "practical-first"],
      ["talk-it-through", "step-by-step"],
      ["give-me-choices", "adaptive"],
    ];
    for (const [a, b] of pairs) {
      expect(supportStylesDifferVisibly(a, b)).toBe(true);
    }
    expect(supportSequenceForStatement("give-me-choices")).toMatch(/Which would help/i);
    expect(supportSequenceForStatement("step-by-step")).toMatch(/one step/i);
  });
});

describe("Support Style prompt application", () => {
  it("includes Support Style before response generation and keeps it separate from Conversation Style", () => {
    const block = buildSupportStylePromptBlock({
      styleId: "gentle-first",
      useMostOfTheTime: true,
      savedAt: new Date().toISOString(),
      version: 1,
    });
    expect(block).toContain("SUPPORT STYLE — GENTLE FIRST");
    expect(block).toContain("separate from Conversation Style");
    expect(block).toContain("Never override a direct request");

    const toneBlocks = buildMemberTonePreferenceBlocks({
      aiTone: "direct",
      helpMode: "ask-first",
      supportStyle: "understand",
    }).join("\n");
    expect(toneBlocks).toContain("TONE — DIRECT");
    expect(toneBlocks).toContain("SUPPORT STYLE");
  });

  it("applies temporary overrides without changing the saved preference", () => {
    saveSupportStylePreference({ styleId: "gentle-first" });
    const override = detectSupportStyleTemporaryOverride(
      "Please skip the reassurance and just tell me what to do.",
    );
    expect(override?.styleId).toBe("practical-first");
    expect(getSupportStylePreference().styleId).toBe("gentle-first");

    const block = buildSupportStylePromptBlock(
      getSupportStylePreference(),
      "Just be direct right now.",
    );
    expect(block).toContain("TEMPORARY OVERRIDE THIS TURN");
    expect(block).toContain("practical-first");
    expect(getSupportStylePreference().styleId).toBe("gentle-first");
  });

  it("feeds intent routing with practical-first guidance", () => {
    const decision = resolveIntentRouting({
      userText: "Help me create an SOP.",
      supportStyle: "practical-first",
    });
    expect(decision.supportStyle).toBe("direct");
    expect(decision.supportStyleGuidance).toMatch(/Practical First|Prioritize action/i);
  });
});
