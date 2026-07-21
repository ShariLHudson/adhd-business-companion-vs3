/**
 * 101 — UI smoke: Business Pulse progressive disclosure + review prompt.
 * @vitest-environment jsdom
 */

import { describe, expect, it, beforeEach } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { BusinessPulsePanel } from "./BusinessPulsePanel";
import { RecognitionReviewPrompt } from "./RecognitionReviewPrompt";
import {
  resetProgressRecognitionAdaptersForTests,
  resetRecognitionPreferencesForTests,
  type RecognitionCandidate,
} from "@/lib/progressRecognition";

function render(node: React.ReactNode) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(node);
  });
  return {
    container: host,
    unmount: () => {
      act(() => root.unmount());
      host.remove();
    },
  };
}

describe("101 progress recognition UI", () => {
  beforeEach(() => {
    resetProgressRecognitionAdaptersForTests();
    resetRecognitionPreferencesForTests();
    document.body.innerHTML = "";
  });

  it("Business Pulse shows primary statement without forcing detail panels open", () => {
    const { container, unmount } = render(
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
    unmount();
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
    const { container, unmount } = render(
      <RecognitionReviewPrompt candidate={candidate} />,
    );
    expect(
      container.querySelector("[data-testid='review-choice-save_win']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='review-choice-not_this_time']"),
    ).toBeTruthy();
    unmount();
  });
});
