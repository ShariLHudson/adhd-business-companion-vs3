/**
 * 101 — UI smoke: Business Pulse progressive disclosure + review prompt.
 * @vitest-environment jsdom
 */

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { BusinessPulsePanel } from "./BusinessPulsePanel";
import { RecognitionReviewPrompt } from "./RecognitionReviewPrompt";
import {
  resetProgressRecognitionAdaptersForTests,
  resetRecognitionPreferencesForTests,
  type RecognitionCandidate,
} from "@/lib/progressRecognition";

describe("101 progress recognition UI", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    resetProgressRecognitionAdaptersForTests();
    resetRecognitionPreferencesForTests();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
  });

  it("Business Pulse shows primary statement without forcing detail panels open", () => {
    act(() => {
      root.render(
        <BusinessPulsePanel
          model={{
            primaryStatement: "Everything is moving steadily.",
            meaningfulChanges: ["One meaningful win this stretch."],
            workInMotionCount: 1,
            recentWinCount: 1,
            recentAccomplishmentCount: 0,
            recentEvidenceCount: 0,
            nextHelpfulStep: "Continue the Work that feels most alive today.",
            disclosure: {
              seeWhatMovedForward: ["Win: Clarified offer"],
              seeConnections: [],
              reviewWinsAndAccomplishments: ["Clarified offer"],
            },
          }}
        />,
      );
    });
    expect(
      container.querySelector("[data-testid='pulse-primary']")?.textContent,
    ).toMatch(/moving steadily/);
    expect(container.querySelector("[data-testid='pulse-detail-moved']")).toBe(
      null,
    );
    const btn = container.querySelector(
      "[data-testid='pulse-see-moved']",
    ) as HTMLButtonElement;
    act(() => {
      btn.click();
    });
    expect(
      container.querySelector("[data-testid='pulse-detail-moved']"),
    ).toBeTruthy();
  });

  it("recognition review offers save/celebrate/decline", () => {
    const candidate: RecognitionCandidate = {
      candidateId: "cand-1",
      kind: "win",
      title: "Audience section",
      explanation: "Meaningful momentum",
      sourceType: "section",
      sourceId: "s1",
      significanceScore: 40,
      factors: ["meaningful_section"],
      detectedAt: "2026-07-21T10:00:00.000Z",
    };
    act(() => {
      root.render(<RecognitionReviewPrompt candidate={candidate} />);
    });
    expect(
      container.querySelector("[data-testid='review-choice-save_win']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='review-choice-not_this_time']"),
    ).toBeTruthy();
  });
});
