/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessBasicsFlow } from "./BusinessBasicsFlow";
import {
  readIdentityField,
  saveBusinessBasicsAnswer,
} from "@/lib/profile/businessEstateRedesign";
import { saveBusinessEstateSection } from "@/lib/profile/businessEstateProfile";

describe("BusinessBasicsFlow", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("shows only one question at a time with styled card and primary continue", () => {
    act(() => {
      root.render(
        <BusinessBasicsFlow
          onExitToEntrance={vi.fn()}
          onFinished={vi.fn()}
        />,
      );
    });
    const flow = container.querySelector('[data-testid="be-basics-flow"]');
    expect(flow).toBeTruthy();
    expect(flow?.className).toMatch(/be-basics--card/);
    expect(
      container.querySelector('[data-testid="be-basics-prompt"]')?.textContent,
    ).toMatch(/name of your business/i);
    expect(
      container.querySelector('[data-testid="be-basics-value"]')?.textContent,
    ).toMatch(/greet you and your business by name/i);
    expect(
      container
        .querySelector('[data-testid="be-basics-save-continue"]')
        ?.className,
    ).toMatch(/be-btn--primary/);
    const skip = container.querySelector('[data-testid="be-basics-skip"]');
    expect(skip?.className).toMatch(/be-basics__skip-link/);
    expect(skip?.tagName).toBe("BUTTON");
    expect(container.textContent).toMatch(/Skipping is fine/i);
    expect(container.textContent).not.toMatch(
      /Where would you say your business is right now/i,
    );
  });

  it("autosaves typed answers without waiting for Save and Continue", async () => {
    vi.useFakeTimers();
    act(() => {
      root.render(
        <BusinessBasicsFlow
          onExitToEntrance={vi.fn()}
          onFinished={vi.fn()}
        />,
      );
    });
    const input = container.querySelector<HTMLInputElement>(
      '[data-testid="be-basics-input"]',
    );
    expect(input).toBeTruthy();
    act(() => {
      if (!input) return;
      const native = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      );
      native?.set?.call(input, "Autosave Co");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(readIdentityField("businessName")).toBe("");
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(readIdentityField("businessName")).toBe("Autosave Co");
    vi.useRealTimers();
  });

  it("saves answers and advances, then shows pause after two questions", () => {
    act(() => {
      root.render(
        <BusinessBasicsFlow
          onExitToEntrance={vi.fn()}
          onFinished={vi.fn()}
        />,
      );
    });

    const input = container.querySelector<HTMLInputElement>(
      '[data-testid="be-basics-input"]',
    );
    expect(input).toBeTruthy();
    act(() => {
      if (!input) return;
      const native = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      );
      native?.set?.call(input, "Harbor Co");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[data-testid="be-basics-save-continue"]',
        )
        ?.click();
    });
    expect(readIdentityField("businessName")).toBe("Harbor Co");
    expect(
      container.querySelector('[data-testid="be-basics-prompt"]')?.textContent,
    ).toMatch(/describe your business/i);

    const textarea = container.querySelector<HTMLTextAreaElement>(
      '[data-testid="be-basics-input"]',
    );
    act(() => {
      if (!textarea) return;
      const native = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      );
      native?.set?.call(textarea, "Helps founders feel clear.");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>(
          '[data-testid="be-basics-save-continue"]',
        )
        ?.click();
    });
    expect(readIdentityField("shortDescription")).toBe(
      "Helps founders feel clear.",
    );
    expect(
      container.querySelector('[data-testid="be-session-pause"]'),
    ).toBeTruthy();
  });

  it("shows welcome back and resumes without restarting when progress exists", () => {
    saveBusinessBasicsAnswer("businessName", "Keep Me");
    saveBusinessBasicsAnswer("shortDescription", "Saved description");

    act(() => {
      root.render(
        <BusinessBasicsFlow
          onExitToEntrance={vi.fn()}
          onFinished={vi.fn()}
        />,
      );
    });

    expect(
      container.querySelector('[data-testid="be-basics-welcome-back"]'),
    ).toBeTruthy();
    expect(container.textContent).toMatch(/2 of 3/i);

    act(() => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="be-basics-continue"]')
        ?.click();
    });
    expect(
      container.querySelector('[data-testid="be-basics-prompt"]')?.textContent,
    ).toMatch(/Where would you say your business is right now/i);
  });

  it("skip does not erase prior answers", () => {
    saveBusinessEstateSection("identity", {
      businessName: "Keep Me",
      shortDescription: "Original description",
    });

    act(() => {
      root.render(
        <BusinessBasicsFlow
          onExitToEntrance={vi.fn()}
          onFinished={vi.fn()}
        />,
      );
    });

    act(() => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="be-basics-continue"]')
        ?.click();
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="be-basics-skip"]')
        ?.click();
    });
    expect(readIdentityField("businessName")).toBe("Keep Me");
    expect(readIdentityField("shortDescription")).toBe("Original description");
  });

  it("local help stays on the question and does not open general chat", () => {
    act(() => {
      root.render(
        <BusinessBasicsFlow
          onExitToEntrance={vi.fn()}
          onFinished={vi.fn()}
        />,
      );
    });
    act(() => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="be-basics-help"]')
        ?.click();
    });
    expect(
      container.querySelector('[data-testid="be-local-help"]'),
    ).toBeTruthy();
    expect(container.textContent).toMatch(/Help Me Answer This Question|Identity Office/i);
    expect(container.textContent).not.toMatch(/Need Another Perspective/i);
    expect(
      container.querySelector('[data-testid="talk-this-through"]'),
    ).toBeNull();
  });
});
