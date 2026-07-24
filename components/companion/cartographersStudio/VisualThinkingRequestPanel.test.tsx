/**
 * Visual Thinking Studio opening experience — panel smoke tests.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VisualThinkingRequestPanel } from "./VisualThinkingRequestPanel";
import { clearVisualThinkingRequestDraft } from "@/lib/cartographersStudio/visualThinkingRequest";
import { CARTOGRAPHERS_STUDIO_BACKGROUND } from "@/lib/cartographersStudio/media";

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
    expect(
      container.querySelector(
        "[data-testid='visual-thinking-request-continue']",
      ),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='visual-thinking-open-previous']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='visual-thinking-create-own']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='visual-thinking-research-build']"),
    ).toBeTruthy();
  });

  it("continues from ordinary language into recommendation preview", () => {
    act(() => {
      root.render(
        <VisualThinkingRequestPanel onOpenPreviousWork={() => undefined} />,
      );
    });
    const input = container.querySelector(
      "[data-testid='visual-thinking-request-input']",
    ) as HTMLTextAreaElement;
    const continueBtn = container.querySelector(
      "[data-testid='visual-thinking-request-continue']",
    ) as HTMLButtonElement;

    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(
        input,
        "Show me how to create a Loom video. I need every step.",
      );
      input.dispatchEvent(new Event("input", { bubbles: true }));
      continueBtn.click();
    });

    const preview = container.querySelector(
      "[data-testid='visual-thinking-recommendation-preview']",
    );
    expect(preview).toBeTruthy();
    const summary = container.querySelector(
      "[data-testid='visual-thinking-recommendation-summary']",
    );
    expect(summary?.textContent ?? "").toMatch(/step-by-step/i);
  });

  it("opens distinct Create My Own Visual and Research paths", () => {
    const onPrev = vi.fn();
    act(() => {
      root.render(<VisualThinkingRequestPanel onOpenPreviousWork={onPrev} />);
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='visual-thinking-create-own']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container
        .querySelector("[data-testid='visual-thinking-request-panel']")
        ?.getAttribute("data-vts-phase"),
    ).toBe("user_led");

    act(() => {
      root.unmount();
    });
    clearVisualThinkingRequestDraft();
    root = createRoot(container);
    act(() => {
      root.render(<VisualThinkingRequestPanel onOpenPreviousWork={onPrev} />);
    });
    act(() => {
      (
        container.querySelector(
          "[data-testid='visual-thinking-research-build']",
        ) as HTMLButtonElement
      ).click();
    });
    expect(
      container
        .querySelector("[data-testid='visual-thinking-request-panel']")
        ?.getAttribute("data-vts-phase"),
    ).toBe("research_intake");
  });
});
