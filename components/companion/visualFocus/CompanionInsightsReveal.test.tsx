/**
 * Companion Insights — progressive disclosure contract.
 *
 * Intelligence must never scream on arrival: the panel starts as a calm
 * invite, reveals one insight at a time, and only shows the full nine-section
 * panel when the member explicitly asks for "all together".
 *
 * @vitest-environment jsdom
 */
import { useState } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  CompanionInsightsReveal,
  type CompanionInsightsPhase,
} from "./CompanionInsightsReveal";
import type { VisualFocusAnalysis } from "@/lib/visualFocus/types";

const analysis: VisualFocusAnalysis = {
  summary: "A map about growing the studio.",
  keyRelationships: ["Referrals depend on delivery quality"],
  patterns: ["You return to pricing"],
  risks: ["One client is most of revenue"],
  opportunities: ["A group offer scales your time"],
  recommendations: ["Sketch the group offer"],
  nextSteps: ["Message three past clients"],
  generatedAt: new Date().toISOString(),
};

/** Stateful harness mirroring the parent's phase/reveal wiring. */
function Harness() {
  const [phase, setPhase] = useState<CompanionInsightsPhase>("invite");
  const [count, setCount] = useState(1);
  return (
    <CompanionInsightsReveal
      analysis={analysis}
      phase={phase}
      revealCount={count}
      onYes={() => {
        setPhase("sequential");
        setCount(1);
      }}
      onNotYet={() => setPhase("teaser")}
      onShowInsights={() => {
        setPhase("sequential");
        setCount(1);
      }}
      onRevealNext={() => setCount((c) => c + 1)}
      onShowAll={() => setPhase("all")}
    />
  );
}

describe("CompanionInsightsReveal progressive disclosure", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const q = (id: string) =>
    container.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
  const click = (id: string) =>
    act(() => (q(id) as HTMLButtonElement | null)?.click());

  it("starts on the calm invite — not the full panel", () => {
    act(() => root.render(<Harness />));
    expect(q("companion-insights-invite")).toBeTruthy();
    expect(q("visual-focus-intelligence")).toBeNull();
    expect(q("companion-insights-sequence")).toBeNull();
  });

  it("'Not yet' collapses to a one-line teaser with a count", () => {
    act(() => root.render(<Harness />));
    click("companion-insights-not-yet");
    const teaser = q("companion-insights-teaser");
    expect(teaser).toBeTruthy();
    // 7 real insights in the analysis above.
    expect(teaser?.textContent).toContain("7 things");
    expect(q("companion-insights-show")).toBeTruthy();
  });

  it("reveals insights one at a time, then all together", () => {
    act(() => root.render(<Harness />));
    click("companion-insights-yes");

    const seq = q("companion-insights-sequence");
    expect(seq).toBeTruthy();
    // Only one insight card visible at first.
    expect(
      container.querySelectorAll('[data-testid^="companion-insight-card-"]'),
    ).toHaveLength(1);
    expect(seq?.textContent).toContain("1 of 7");

    click("companion-insights-next");
    expect(
      container.querySelectorAll('[data-testid^="companion-insight-card-"]'),
    ).toHaveLength(2);

    click("companion-insights-show-all");
    expect(q("visual-focus-intelligence")).toBeTruthy();
    expect(q("companion-insights-sequence")).toBeNull();
  });
});
