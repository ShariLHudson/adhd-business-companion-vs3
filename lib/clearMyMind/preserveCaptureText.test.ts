/**
 * @vitest-environment jsdom
 *
 * Non-negotiable: Clear My Mind must preserve the member's exact wording
 * through parse → save → reload → display (trim-only normalization).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { splitCaptureInput } from "@/lib/clearMyMindCapture";
import {
  detectThoughtSplitProposal,
  normalizeSplitSegments,
} from "@/lib/clearMyMindThoughtSplitter";
import {
  addBrainDumps,
  getBrainDumps,
} from "@/lib/companionStore";
import { buildThemeSummary } from "@/lib/brainDumpClusterModel";

const SIX_ITEMS =
  "buy groceries, plan mom's birthday, email Kerry, finish proposal, order supplies, schedule appointment";

const EXPECTED = [
  "buy groceries",
  "plan mom's birthday",
  "email Kerry",
  "finish proposal",
  "order supplies",
  "schedule appointment",
] as const;

describe("Clear My Mind text integrity", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves exact characters for comma-separated input", () => {
    const parts = splitCaptureInput(SIX_ITEMS);
    expect(parts).toEqual([...EXPECTED]);
    for (let i = 0; i < EXPECTED.length; i++) {
      expect(parts[i]).toBe(EXPECTED[i]);
    }
  });

  it("preserves apostrophes, hyphens, numbers, emojis, and accents", () => {
    const raw =
      "plan mom's birthday\nre-send email\nbuy 2 gifts 🎁\nrésumé polish";
    const parts = splitCaptureInput(raw);
    expect(parts).toEqual([
      "plan mom's birthday",
      "re-send email",
      "buy 2 gifts 🎁",
      "résumé polish",
    ]);
  });

  it("does not mutate text when the smart splitter runs", () => {
    const proposal = detectThoughtSplitProposal(
      "buy groceries plan mom's birthday email Kerry",
    );
    if (proposal) {
      expect(proposal.segments.join(" ")).toContain("buy groceries");
      expect(proposal.segments.join(" ")).toContain("mom's birthday");
      expect(proposal.segments.some((s) => s.includes("bu groceries"))).toBe(
        false,
      );
      expect(proposal.segments.some((s) => s.includes("birhday"))).toBe(false);
    }
    const preserved = normalizeSplitSegments([...EXPECTED]);
    expect(preserved).toEqual([...EXPECTED]);
  });

  it("round-trips exact text through save and reload", () => {
    const parts = splitCaptureInput(SIX_ITEMS);
    addBrainDumps(parts);
    const stored = getBrainDumps();
    expect(new Set(stored.map((e) => e.text))).toEqual(new Set(parts));
    expect(new Set(stored.map((e) => e.originalText))).toEqual(new Set(parts));
    for (const expected of EXPECTED) {
      expect(stored.some((e) => e.text === expected)).toBe(true);
      expect(stored.some((e) => e.originalText === expected)).toBe(true);
    }
  });

  it("keeps originalText when classification metadata updates", async () => {
    const { updateBrainDump } = await import("@/lib/companionStore");
    addBrainDumps(["plan mom's birthday"]);
    const id = getBrainDumps()[0]!.id;
    updateBrainDump(id, { category: "Family", topic: "Family" });
    const entry = getBrainDumps().find((e) => e.id === id)!;
    expect(entry.text).toBe("plan mom's birthday");
    expect(entry.originalText).toBe("plan mom's birthday");
  });

  it("never surfaces Other as a theme label", () => {
    const counts = new Map<string, number>([
      ["Other", 5],
      ["Miscellaneous", 4],
    ]);
    const theme = buildThemeSummary(counts);
    expect(theme.hasMeaningfulTheme).toBe(false);
    expect(theme.explanation).not.toMatch(/\bOther\b/i);
    expect(theme.explanation).not.toContain("**");
  });

  it("uses plain language for a meaningful theme", () => {
    const counts = new Map<string, number>([
      ["Family", 4],
      ["Admin", 1],
    ]);
    const theme = buildThemeSummary(counts);
    expect(theme.hasMeaningfulTheme).toBe(true);
    expect(theme.explanation).not.toContain("**");
    expect(theme.label).toBe("Family");
  });
});
