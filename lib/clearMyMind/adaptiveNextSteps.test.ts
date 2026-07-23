import { describe, expect, it } from "vitest";
import { buildAdaptiveNextSteps } from "@/lib/clearMyMind/adaptiveNextSteps";
import { recommendAttentionItem } from "@/lib/clearMyMind/attentionRecommend";
import type { BrainDumpEntry } from "@/lib/companionStore";

function entry(text: string, id = text): BrainDumpEntry {
  return {
    id,
    text,
    originalText: text,
    createdAt: new Date().toISOString(),
  };
}

describe("adaptive Clear My Mind next steps", () => {
  it("does not offer grouping for one thought", () => {
    const model = buildAdaptiveNextSteps([entry("pay rent")]);
    expect(model.kind).toBe("one");
    expect(model.primary.map((p) => p.id)).toEqual([
      "make-next-step",
      "keep-adding",
      "save-for-later",
    ]);
    expect(model.primary.some((p) => p.id.includes("organize"))).toBe(false);
  });

  it("keeps two unrelated thoughts without forcing categories", () => {
    const model = buildAdaptiveNextSteps([
      entry("buy groceries"),
      entry("learn guitar"),
    ]);
    expect(model.kind).toBe("two-unrelated");
    expect(model.primary.map((p) => p.id)).toContain("help-me-choose");
  });

  it("offers Review 5 / Organize / Park Everything for mixed lists of five+", () => {
    const model = buildAdaptiveNextSteps([
      entry("pay rent"),
      entry("call dentist"),
      entry("plan vacation someday"),
      entry("respond to client emails"),
      entry("buy groceries"),
      entry("plan mom's birthday"),
    ]);
    expect(model.kind).toBe("large-list");
    expect(model.primary.map((p) => p.id)).toContain("review-batch");
    expect(model.primary.map((p) => p.id)).toContain("park-everything");
  });

  it("recommends a time-sensitive item with a reason", () => {
    const rec = recommendAttentionItem([
      entry("buy groceries", "a"),
      entry("pay rent", "b"),
      entry("plan mom's birthday", "c"),
    ]);
    expect(rec.hasRecommendation).toBe(true);
    expect(rec.text).toBe("pay rent");
    expect(rec.reason).toMatch(/pay rent/);
  });

  it("can admit nothing clearly stands out", () => {
    const rec = recommendAttentionItem([
      entry("ponder clouds", "a"),
      entry("maybe later", "b"),
    ]);
    expect(rec.hasRecommendation).toBe(false);
    expect(rec.reason).toMatch(/Nothing clearly stands out/i);
  });
});
