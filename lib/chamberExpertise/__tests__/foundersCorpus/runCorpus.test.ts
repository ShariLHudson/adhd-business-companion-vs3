/**
 * Founders Corpus — acceptance test harness.
 *
 * Runs the acceptance corpus (docs/estate/CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md
 * §6) against the CURRENT, LIVE, UNMODIFIED `resolveChamberExpertActivation`
 * (V1). This is deliberately measurement against the real function used in
 * production, not a mock — the same technique the I-2 review used to find
 * its two activation defects.
 *
 * Scoring bar (honest, V1-appropriate — see the spec §6.4):
 * - "clear"    → hard assertion: primary === expectedPrimary. A failure
 *                here is a real activation defect, not a corpus problem.
 * - "no-match" → hard assertion: primary === null.
 * - "contested" / "co-primary" → SOFT check only. V1 has no concept of
 *   either state yet (that's V2, still unimplemented) — asserting a V1
 *   behavior that doesn't exist yet would be dishonest. These entries
 *   assert only that activation doesn't crash and produces SOME primary
 *   (or legitimately none), and log the actual result plus the score gap
 *   between the top two candidates for future comparison once V2 ships.
 *   Whether the result happens to land on one of the documented candidate
 *   experts is reported, not enforced.
 */

import { describe, expect, it } from "vitest";
import { resolveChamberExpertActivation } from "../../resolveChamberExpertActivation";
import type { ChamberExpertId } from "../../types";
import type { IntentCategory } from "@/lib/intentRoutingIntelligence";
import type { EstateCapabilityCategory } from "@/lib/estateBrain/intelligenceTypes";

import mktCorpus from "./MKT.json";
import sysCorpus from "./SYS.json";
import evtCorpus from "./EVT.json";
import crossExpertCorpus from "./cross-expert.json";

type CorpusEntry = {
  text: string;
  expectedPrimary?: ChamberExpertId;
  expectedSupporting?: ChamberExpertId[];
  expectedCoPrimaryCandidates?: [ChamberExpertId, ChamberExpertId];
  expectedContestedCandidates?: [ChamberExpertId, ChamberExpertId];
  intentCategory?: IntentCategory;
  estateCategory?: EstateCapabilityCategory;
  classification: "clear" | "contested" | "co-primary" | "no-match";
  note: string;
  source: string;
};

const ALL_ENTRIES: CorpusEntry[] = [
  ...(mktCorpus as CorpusEntry[]),
  ...(sysCorpus as CorpusEntry[]),
  ...(evtCorpus as CorpusEntry[]),
  ...(crossExpertCorpus as CorpusEntry[]),
];

const CLEAR_ENTRIES = ALL_ENTRIES.filter((e) => e.classification === "clear");
const NO_MATCH_ENTRIES = ALL_ENTRIES.filter((e) => e.classification === "no-match");
const SOFT_ENTRIES = ALL_ENTRIES.filter(
  (e) => e.classification === "contested" || e.classification === "co-primary",
);

describe("Founders Corpus — 'clear' entries (hard assertion, regression-locked)", () => {
  it.each(CLEAR_ENTRIES)("$text", (entry) => {
    const result = resolveChamberExpertActivation({
      userText: entry.text,
      intentCategory: entry.intentCategory,
      estateCategory: entry.estateCategory,
    });

    expect(
      result.primary,
      `Expected primary "${entry.expectedPrimary}" but got "${result.primary}". ${entry.note}`,
    ).toBe(entry.expectedPrimary);

    if (entry.expectedSupporting) {
      for (const id of entry.expectedSupporting) {
        expect(result.supporting).toContain(id);
      }
    }
  });
});

describe.skipIf(NO_MATCH_ENTRIES.length === 0)("Founders Corpus — 'no-match' entries (hard assertion)", () => {
  it.each(NO_MATCH_ENTRIES)("$text", (entry) => {
    const result = resolveChamberExpertActivation({
      userText: entry.text,
      intentCategory: entry.intentCategory,
      estateCategory: entry.estateCategory,
    });
    expect(result.primary).toBeNull();
  });
});

describe("Founders Corpus — 'contested' / 'co-primary' entries (soft, informational)", () => {
  it.each(SOFT_ENTRIES)("$text", (entry) => {
    const result = resolveChamberExpertActivation({
      userText: entry.text,
      intentCategory: entry.intentCategory,
      estateCategory: entry.estateCategory,
    });

    // Only floor asserted: activation doesn't crash. It's legitimate for
    // V1 to return null here (see cross-expert.json's Events/Sales
    // co-primary entry note) — that's a documented, expected limitation,
    // not a test failure.
    expect(() => result).not.toThrow();

    const candidates = entry.expectedCoPrimaryCandidates ?? entry.expectedContestedCandidates ?? [];
    const landedOnCandidate = result.primary ? candidates.includes(result.primary) : false;

    const topTwo = [...result.signals]
      .filter((s) => s.signalGroupsMatched >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    const scoreGap = topTwo.length === 2 ? topTwo[0]!.score - topTwo[1]!.score : null;

    console.log(
      `[corpus:${entry.classification}] "${entry.text}"\n` +
        `  primary=${result.primary ?? "null"} confidence=${result.confidence} ` +
        `landedOnDocumentedCandidate=${landedOnCandidate} scoreGap=${scoreGap ?? "n/a"}`,
    );
  });
});

describe("Founders Corpus — baseline accuracy summary", () => {
  it("reports overall 'clear' accuracy for baseline tracking", () => {
    let correct = 0;
    for (const entry of CLEAR_ENTRIES) {
      const result = resolveChamberExpertActivation({
        userText: entry.text,
        intentCategory: entry.intentCategory,
        estateCategory: entry.estateCategory,
      });
      if (result.primary === entry.expectedPrimary) correct += 1;
    }
    const accuracy = correct / CLEAR_ENTRIES.length;
    console.log(
      `[corpus baseline] clear-entry accuracy: ${correct}/${CLEAR_ENTRIES.length} (${(accuracy * 100).toFixed(1)}%)`,
    );
    // This is a ratchet, not a fixed target — see the spec's growth plan.
    // Recorded here as a floor so a future registry change can't silently
    // regress accuracy without failing CI.
    expect(accuracy).toBeGreaterThanOrEqual(1.0);
  });
});
