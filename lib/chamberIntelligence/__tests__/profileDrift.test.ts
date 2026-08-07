/**
 * Profile Drift Detection — I-1/I-2.
 *
 * Markdown Expert Intelligence Profiles remain the human source of truth
 * (docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md §6). Runtime
 * modules under lib/chamberIntelligence/experts/ are a compiled digest of
 * that markdown, not an independent source. This test catches drift: if a
 * runtime framework name, ADHD "traditional" phrase, or signature question
 * text no longer appears in its matching markdown profile, the two have
 * silently diverged and someone edited one without the other.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MKT_INTELLIGENCE } from "../experts/MKT";
import { SYS_INTELLIGENCE } from "../experts/SYS";
import { EVT_INTELLIGENCE } from "../experts/EVT";
import type { ChamberExpertIntelligence } from "../types";

const REPO_ROOT = join(__dirname, "..", "..", "..");

function readProfileMarkdown(intelligence: ChamberExpertIntelligence): string {
  return readFileSync(join(REPO_ROOT, intelligence.profilePath), "utf8");
}

/**
 * Markdown profiles use typographic quotes/apostrophes/dashes; runtime
 * modules use plain ASCII. That's an encoding convention, not content
 * drift — normalize both sides before comparing so real drift (different
 * words) still fails loudly while this cosmetic difference doesn't.
 */
function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...");
}

function expectPresentInMarkdown(markdown: string, needle: string, context: string): void {
  expect(
    normalizeQuotes(markdown),
    `Expected to find "${needle}" (${context}) in the markdown profile — drift detected`,
  ).toContain(normalizeQuotes(needle));
}

describe.each([
  ["Marketing", MKT_INTELLIGENCE],
  ["Systems", SYS_INTELLIGENCE],
  ["Events", EVT_INTELLIGENCE],
])("profile drift — %s", (_label, intelligence) => {
  const markdown = readProfileMarkdown(intelligence);

  it("profile file exists and is readable", () => {
    expect(markdown.length).toBeGreaterThan(0);
  });

  it("every framework name in the runtime module appears in the markdown profile", () => {
    for (const fw of intelligence.frameworks) {
      expectPresentInMarkdown(markdown, fw.name, `framework ${fw.id}`);
    }
  });

  it("every framework's Spark explanation appears verbatim in the markdown profile", () => {
    for (const fw of intelligence.frameworks) {
      expectPresentInMarkdown(markdown, fw.sparkExplanation, `framework ${fw.id} sparkExplanation`);
    }
  });

  it("every ADHD translation's traditional phrase traces back to the markdown profile's §7 table", () => {
    for (const t of intelligence.adhdTranslations) {
      expectPresentInMarkdown(markdown.toLowerCase(), t.traditional.toLowerCase(), `translation ${t.id}`);
    }
  });

  it("every signature question appears in the markdown profile", () => {
    for (const q of intelligence.signatureQuestions) {
      expectPresentInMarkdown(markdown, q.text, `question ${q.id}`);
    }
  });

  it("the thinking pattern summary matches the profile's Expert Thinking Pattern line", () => {
    expectPresentInMarkdown(markdown, intelligence.thinkingPattern.summary, "thinking pattern summary");
  });
});
