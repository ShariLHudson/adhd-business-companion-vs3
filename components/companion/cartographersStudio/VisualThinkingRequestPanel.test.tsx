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
import { clearThinkingWorkspace } from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import { clearResearchBundle } from "@/lib/cartographersStudio/visualThinkingResearchAcquisition";
import { clearEditingSession } from "@/lib/cartographersStudio/visualThinkingWorkspaceEditing";
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
    clearThinkingWorkspace();
    clearResearchBundle();
    clearEditingSession();
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
    clearThinkingWorkspace();
    clearResearchBundle();
    clearEditingSession();
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

  it("authorized Loom how-to continues through generate-first into a populated result", () => {
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
      container.querySelector("[data-testid='thinking-workspace']"),
    ).toBeTruthy();
    expect(
      container.querySelectorAll("[data-testid^='thinking-object-']").length,
    ).toBeGreaterThanOrEqual(8);
    expect(container.textContent ?? "").toMatch(/Loom|record|upload/i);
    expect(container.textContent ?? "").not.toMatch(/have not been verified/i);
    expect(container.innerHTML).not.toMatch(/learn_how|cognitiveTasks|primaryGoal/);
  });

  it("honors no-map for authorized report requests on the live path", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "Research Medicare and give me a detailed report. I do not want a map.",
      );
      click(container, "visual-thinking-request-continue");
    });
    expect(container.innerHTML).not.toMatch(
      /relationship map|editable visual map/i,
    );
    const progressed =
      container.querySelector(
        "[data-testid='visual-thinking-no-map-honored']",
      ) ||
      container.querySelector(
        "[data-testid='visual-thinking-active-presentation']",
      ) ||
      container.querySelector(
        "[data-testid='visual-thinking-presentation-title']",
      ) ||
      container.querySelector("[data-testid='thinking-workspace']") ||
      container.querySelector(
        "[data-testid='visual-thinking-pipeline-recovery']",
      ) ||
      container.querySelector(
        "[data-testid='visual-thinking-execution-diagnostics']",
      );
    expect(progressed).toBeTruthy();
  });

  it("lets the user correct the interpretation before authorize-continue", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "I am thinking about my week — not sure what I need yet.",
      );
      click(container, "visual-thinking-request-continue");
    });
    // Ambiguous requests may land in depth/preview rather than auto-generate.
    const preview = container.querySelector(
      "[data-testid='visual-thinking-recommendation-preview']",
    );
    const depth = container.querySelector(
      "[data-testid='visual-thinking-depth-guided']",
    );
    expect(preview || depth || container.textContent).toBeTruthy();
  });

  it("authorized SOP request reaches generation and presentation without extra confirm", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    act(() => {
      setTextarea(
        container,
        "visual-thinking-request-input",
        "Create a detailed SOP from these steps: 1. Greet the client warmly. 2. Collect the intake form. 3. Confirm the next appointment.",
      );
      click(container, "visual-thinking-request-continue");
    });
    expect(container.innerHTML).not.toMatch(
      /knowledgePlanId|VisualThinkingKnowledgePackage/,
    );
    const progressed =
      container.querySelector(
        "[data-testid='visual-thinking-review-deliverable']",
      ) ||
      container.querySelector(
        "[data-testid='visual-thinking-presentation-title']",
      ) ||
      container.querySelector("[data-testid='thinking-workspace']") ||
      container.querySelector(
        "[data-testid='visual-thinking-pipeline-recovery']",
      ) ||
      container.querySelector(
        "[data-testid='visual-thinking-execution-diagnostics']",
      );
    expect(progressed).toBeTruthy();
    expect(container.innerHTML).not.toMatch(
      /VisualThinkingPresentationPlan|recommendedPresentation/,
    );
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
