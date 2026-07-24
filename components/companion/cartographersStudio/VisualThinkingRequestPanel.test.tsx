/**
 * Visual Thinking Studio opening + understanding preview tests.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VisualThinkingRequestPanel } from "./VisualThinkingRequestPanel";
import { __resetAdaptiveCompanionExplicitPrefsForTests } from "@/lib/adaptiveCompanionIntelligence";
import { clearVisualThinkingRequestDraft } from "@/lib/cartographersStudio/visualThinkingRequest";
import { clearGenerationBundle } from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import { clearKnowledgeBundle } from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import { clearPresentationPlan } from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import { CARTOGRAPHERS_STUDIO_BACKGROUND } from "@/lib/cartographersStudio/media";

function setTextarea(container: HTMLElement, testId: string, value: string) {
  const input = container.querySelector(
    `[data-testid='${testId}']`,
  ) as HTMLTextAreaElement;
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return input;
}

function click(container: HTMLElement, testId: string) {
  (
    container.querySelector(`[data-testid='${testId}']`) as HTMLButtonElement
  ).click();
}

describe("VisualThinkingRequestPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearPresentationPlan();
    __resetAdaptiveCompanionExplicitPrefsForTests();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    clearVisualThinkingRequestDraft();
    clearKnowledgeBundle();
    clearGenerationBundle();
    clearPresentationPlan();
    __resetAdaptiveCompanionExplicitPrefsForTests();
  });

  it("opens with request-first copy and Cartography background marker", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    const panel = container.querySelector(
      "[data-testid='visual-thinking-request-panel']",
    );
    expect(panel?.getAttribute("data-vts-background")).toBe(
      CARTOGRAPHERS_STUDIO_BACKGROUND,
    );
    expect(container.querySelector("h1")?.textContent).toBe(
      "Visual Thinking Studio",
    );
    expect(
      container.querySelector("[data-testid='visual-thinking-request-input']"),
    ).toBeTruthy();
  });

  it("preview explains interpreted goal and one primary result", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "Show me how to create a Loom video. I need every step.",
      );
      click(container, "visual-thinking-request-continue");
    });

    const goal = container.querySelector(
      "[data-testid='visual-thinking-interpreted-goal']",
    );
    expect(goal?.textContent ?? "").toMatch(/Loom/i);
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-primary-experience']",
      )?.textContent ?? "",
    ).toMatch(/Guided Learning/i);
    const summary = container.querySelector(
      "[data-testid='visual-thinking-recommendation-summary']",
    );
    expect(summary?.textContent ?? "").toMatch(/step-by-step/i);
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-supporting-outputs']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='visual-thinking-research-note']")
        ?.textContent ?? "",
    ).toMatch(/verify|current/i);
    const html = container.innerHTML;
    expect(html).not.toMatch(/learn_how|cognitiveTasks|primaryGoal/);
  });

  it("honors no-map and allows removing supporting + build myself", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "Research this and give me a detailed report. I do not want a map.",
      );
      click(container, "visual-thinking-request-continue");
    });
    expect(
      container.querySelector("[data-testid='visual-thinking-no-map-honored']"),
    ).toBeTruthy();
    expect(container.innerHTML).not.toMatch(/relationship map|editable visual map/i);

    act(() => {
      click(container, "visual-thinking-build-myself");
    });
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-user-led-path']",
      )?.textContent ??
        container.querySelector(
          "[data-testid='visual-thinking-creation-mode-note']",
        )?.textContent ??
        "",
    ).toMatch(/yourself|will not generate|User-led/i);
  });

  it("lets the user correct the interpretation", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "Show me how to create a Loom video. I need every step.",
      );
      click(container, "visual-thinking-request-continue");
    });
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-recommendation-preview']",
      ),
    ).toBeTruthy();
    act(() => {
      click(container, "visual-thinking-correct-goal");
    });
    expect(
      container.querySelector("[data-testid='visual-thinking-correction-box']"),
    ).toBeTruthy();
    act(() => {
      setTextarea(
        container,
        "visual-thinking-correction-input",
        "This is actually for training my team.",
      );
      click(container, "visual-thinking-correction-submit");
    });
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-interpreted-goal']",
      )?.textContent ?? "",
    ).toMatch(/staff|train|teach/i);
  });

  it("knowledge prep begins after confirmation; generation after continue", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "Turn these steps into a detailed SOP: 1. Greet 2. Collect 3. Confirm",
      );
      click(container, "visual-thinking-request-continue");
    });
    const depthBtn = container.querySelector(
      "[data-testid='visual-thinking-depth-guided']",
    ) as HTMLButtonElement | null;
    if (depthBtn) {
      act(() => {
        depthBtn.click();
      });
    }
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-recommendation-preview']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-knowledge-status']",
      ),
    ).toBeFalsy();
    act(() => {
      click(container, "visual-thinking-confirm-yes");
    });
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-knowledge-status']",
      ),
    ).toBeTruthy();
    expect(container.innerHTML).not.toMatch(
      /knowledgePlanId|VisualThinkingKnowledgePackage/,
    );
    const begin =
      (container.querySelector(
        "[data-testid='visual-thinking-begin-generation']",
      ) as HTMLButtonElement | null) ||
      (container.querySelector(
        "[data-testid='visual-thinking-begin-safe-outline']",
      ) as HTMLButtonElement | null);
    expect(begin).toBeTruthy();
    act(() => {
      begin!.click();
    });
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-review-deliverable']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-presentation-title']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-show-differently']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='visual-thinking-density']"),
    ).toBeTruthy();
    expect(container.innerHTML).not.toMatch(
      /VisualThinkingPresentationPlan|recommendedPresentation/,
    );
    act(() => {
      click(container, "visual-thinking-show-differently");
    });
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-presentation-alternates']",
      ),
    ).toBeTruthy();
  });

  it("opens distinct Create My Own Visual and Research paths", () => {
    const onPrev = vi.fn();
    act(() => {
      root.render(<VisualThinkingRequestPanel onOpenPreviousWork={onPrev} />);
    });
    act(() => {
      click(container, "visual-thinking-create-own");
    });
    expect(
      container
        .querySelector("[data-testid='visual-thinking-request-panel']")
        ?.getAttribute("data-vts-phase"),
    ).toBe("user_led");
  });
});
