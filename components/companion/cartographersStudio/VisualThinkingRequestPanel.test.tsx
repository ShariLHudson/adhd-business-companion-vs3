/**
 * Visual Thinking Studio opening + understanding preview tests.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VisualThinkingRequestPanel } from "./VisualThinkingRequestPanel";
import { clearVisualThinkingRequestDraft } from "@/lib/cartographersStudio/visualThinkingRequest";
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
