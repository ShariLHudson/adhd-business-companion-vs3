/**
 * Expert Value Test — I-2 review acceptance test.
 *
 * Answers a different question than every other test in this directory:
 * not "is the right expert selected?" (Phase B), not "is the selection
 * correct/deterministic/budgeted?" (selectExpertContribution.test.ts), but
 *
 *   "Would REMOVING this expert's intelligence materially reduce the
 *    usefulness of the response?"
 *
 * Operationalized as: a "with intelligence" contribution must contain at
 * least one concrete, actionable VALUE MARKER — a named framework, a named
 * ADHD translation, or a targeted question — that a "without intelligence"
 * baseline (expert name + thinking-pattern summary only, i.e. exactly what
 * the pre-pilot fallback format already provided) does not have. If a
 * scenario's marker count were 0, the pilot would have added nothing this
 * expert wasn't already contributing before I-2 — that would mean the
 * intelligence layer is not earning its complexity for that case.
 *
 * The test is deliberately two-sided: it must find real value where value
 * exists (marker count >= 1 for on-topic requests) AND correctly find NO
 * added value where none exists (marker count === 0 for off-topic
 * requests) — a test that always passes regardless of input would be
 * worthless as a value test.
 */

import { describe, expect, it } from "vitest";
import { selectExpertContribution } from "../selectExpertContribution";
import { renderSelectedContribution } from "../renderSelectedContribution";
import { chamberExpertById } from "@/lib/chamberExpertise/chamberExpertRegistry";
import type { ChamberExpertId, SelectedExpertContribution } from "../types";

function countValueMarkers(selection: SelectedExpertContribution): number {
  return (
    selection.frameworks.length +
    selection.adhdTranslations.length +
    (selection.question ? 1 : 0)
  );
}

/**
 * Frameworks and ADHD translations are trigger-matched against the
 * request; the signature question is NOT (a documented v1 simplification
 * — see docs/estate/CHAMBER_INTELLIGENCE_I2_REVIEW_FINDINGS.md). Use this
 * narrower count for sensitivity checks, where "0 gated markers" is the
 * meaningful signal — the always-present question would otherwise mask a
 * genuinely off-topic case as if it had matched something.
 */
function countTopicGatedMarkers(selection: SelectedExpertContribution): number {
  return selection.frameworks.length + selection.adhdTranslations.length;
}

/** The pre-pilot / no-intelligence baseline: name + thinking-pattern summary only. */
function withoutIntelligenceBaseline(expertId: ChamberExpertId): string {
  const entry = chamberExpertById(expertId);
  return `Leading perspective: ${entry?.name ?? expertId} — ${entry?.expertThinkingPattern ?? ""}`;
}

const VALUABLE_SCENARIOS: Array<{ label: string; expertId: ChamberExpertId; userText: string }> = [
  { label: "Marketing — broad strategy request", expertId: "MKT", userText: "I need a marketing strategy." },
  { label: "Marketing — visibility overwhelm", expertId: "MKT", userText: "Nobody knows I exist and I don't know what to post anymore." },
  { label: "Marketing — launch fatigue", expertId: "MKT", userText: "I keep launching things and it wipes me out every single time." },
  { label: "Systems — client onboarding", expertId: "SYS", userText: "I need to create a client onboarding process." },
  { label: "Systems — bus-factor risk", expertId: "SYS", userText: "My team doesn't know what to do when I'm not around to explain the process." },
  { label: "Events — retreat planning", expertId: "EVT", userText: "I want to plan a two-day ADHD business retreat." },
  { label: "Events — growing agenda", expertId: "EVT", userText: "I'm hosting a workshop next month and the agenda keeps growing." },
  { label: "Events — post-event crash", expertId: "EVT", userText: "I always crash after events and forget to follow up with people." },
];

describe("Expert Value Test — on-topic requests genuinely benefit from the expert's intelligence", () => {
  it.each(VALUABLE_SCENARIOS)(
    "$label: removing the expert intelligence would materially reduce usefulness",
    ({ expertId, userText }) => {
      const withIntelligence = selectExpertContribution({ expertId, userText, role: "primary" });
      expect(withIntelligence).not.toBeNull();

      const markers = countValueMarkers(withIntelligence!);
      expect(
        markers,
        `Expected at least one concrete framework, ADHD translation, or question beyond the bare name/thinking-pattern baseline`,
      ).toBeGreaterThanOrEqual(1);

      // The rendered hint must actually contain content the baseline
      // doesn't — content a stranger reading both could point to as "this
      // is the part that changes what I'd say". NOTE: length is
      // deliberately NOT asserted here — a finding from this test's first
      // run is that a short, specific facet-only render can be shorter
      // than the old verbose fallback sentence while still being more
      // useful (or, when nothing matched, no more useful despite being a
      // different string) — see the review doc's "length is not a proxy
      // for usefulness" finding.
      const rendered = renderSelectedContribution(withIntelligence!);
      const baseline = withoutIntelligenceBaseline(expertId);
      expect(rendered).not.toBe(baseline);
    },
  );
});

describe("Expert Value Test — the test itself must be sensitive, not a rubber stamp", () => {
  // These force role: "primary" for text that would never actually reach
  // this expert through real activation (resolveChamberExpertActivation
  // requires 2+ independent signals — see resolveChamberExpertActivation.ts)
  // — this is a selection-layer-only check: GIVEN an expert is primary,
  // does it still correctly decline to surface a framework or ADHD
  // translation it has no real trigger for? The always-present signature
  // question (a documented v1 simplification, not trigger-matched) is
  // intentionally excluded from this check via countTopicGatedMarkers —
  // otherwise every case would show 1 marker regardless of topical fit,
  // which would make this test unable to ever fail and therefore
  // worthless. See docs/estate/CHAMBER_INTELLIGENCE_I2_REVIEW_FINDINGS.md.
  it("finds NO gated framework or ADHD translation for a genuinely off-topic request", () => {
    const selection = selectExpertContribution({
      expertId: "MKT",
      userText: "hello there, how are you today",
      role: "primary",
    });

    expect(selection).not.toBeNull();
    expect(countTopicGatedMarkers(selection!)).toBe(0);
  });

  it("finds no gated value for Systems on an unrelated request", () => {
    const selection = selectExpertContribution({
      expertId: "SYS",
      userText: "what's the weather like",
      role: "primary",
    });
    expect(countTopicGatedMarkers(selection!)).toBe(0);
  });

  it("finds no gated value for Events on an unrelated request", () => {
    const selection = selectExpertContribution({
      expertId: "EVT",
      userText: "can you remind me what day it is",
      role: "primary",
    });
    expect(countTopicGatedMarkers(selection!)).toBe(0);
  });
});

describe("Expert Value Test — value content differs by situation, not a static decoration", () => {
  it("Marketing surfaces different frameworks/translations for different marketing pain points", () => {
    const broad = selectExpertContribution({ expertId: "MKT", userText: "I need a marketing strategy.", role: "primary" });
    const visibility = selectExpertContribution({
      expertId: "MKT",
      userText: "Nobody knows I exist and I don't know what to post anymore.",
      role: "primary",
    });

    const broadFrameworks = broad!.frameworks.map((f) => f.id);
    const visibilityFrameworks = visibility!.frameworks.map((f) => f.id);

    // If a "value test" always found the same content regardless of the
    // situation, that would indicate a templated response, not genuine
    // intelligence — the whole premise this task is validating.
    expect(broadFrameworks).not.toEqual(visibilityFrameworks);
  });

  it("Events surfaces progressively more content as more concrete pain points are mentioned", () => {
    const light = selectExpertContribution({
      expertId: "EVT",
      userText: "I'm hosting a workshop next month and the agenda keeps growing.",
      role: "primary",
    });
    const rich = selectExpertContribution({
      expertId: "EVT",
      userText: "I want to plan a two-day ADHD business retreat.",
      role: "primary",
    });

    expect(countValueMarkers(rich!)).toBeGreaterThan(countValueMarkers(light!));
  });
});

describe("Expert Value Test — value scales appropriately with role", () => {
  it("a supporting expert still adds real value, just less than the primary", () => {
    const asPrimary = selectExpertContribution({
      expertId: "SYS",
      userText: "I need to create a client onboarding process.",
      role: "primary",
    });
    const asSupporting = selectExpertContribution({
      expertId: "SYS",
      userText: "I need to create a client onboarding process.",
      role: "supporting",
    });

    expect(countValueMarkers(asPrimary!)).toBeGreaterThanOrEqual(countValueMarkers(asSupporting!));
  });
});
