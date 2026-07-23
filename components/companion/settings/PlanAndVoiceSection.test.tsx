/**
 * @vitest-environment jsdom
 */
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlanAndVoiceSection } from "./PlanAndVoiceSection";
import { clearVoicePlanPaymentPending } from "@/lib/voicePlans/voicePlanEntitlement";
import { getPrefs, savePrefs } from "@/lib/companionStore";

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  clearVoicePlanPaymentPending();
  savePrefs({ plan: "essential" });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  vi.stubGlobal(
    "open",
    vi.fn(() => null),
  );
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
});

describe("PlanAndVoiceSection", () => {
  it("shows Essential Voice as included with no purchase link", () => {
    act(() => {
      root.render(<PlanAndVoiceSection plan="essential" />);
    });
    expect(
      container.querySelector("[data-testid='voice-plan-essential-status']")
        ?.textContent,
    ).toBe("Included with your plan");
    expect(
      container.querySelector("[data-testid='voice-plan-essential-current']")
        ?.textContent,
    ).toBe("Current Voice Plan");
    expect(
      container.querySelector("[data-testid='voice-plan-essential'] a"),
    ).toBeNull();
    expect(container.textContent).not.toMatch(/\$\d+/);
  });

  it("shows Voice Lite paid wording and exact payment link", () => {
    act(() => {
      root.render(<PlanAndVoiceSection plan="essential" />);
    });
    expect(
      container.querySelector("[data-testid='voice-plan-lite-status']")
        ?.textContent,
    ).toBe("Additional monthly subscription required");
    const lite = container.querySelector(
      "[data-testid='voice-plan-lite-choose']",
    ) as HTMLAnchorElement;
    expect(lite).toBeTruthy();
    expect(lite.getAttribute("href")).toBe(
      "https://link.fastpaydirect.com/payment-link/69ff6b3034d67b041e7e886e",
    );
    expect(lite.getAttribute("target")).toBe("_blank");
    expect(lite.getAttribute("rel")).toContain("noopener");
    expect(lite.getAttribute("aria-label")).toBe("Subscribe to Voice Lite");
  });

  it("shows Voice Pro paid wording and exact payment link", () => {
    act(() => {
      root.render(<PlanAndVoiceSection plan="essential" />);
    });
    expect(
      container.querySelector("[data-testid='voice-plan-pro-status']")
        ?.textContent,
    ).toBe("Additional monthly subscription required");
    const pro = container.querySelector(
      "[data-testid='voice-plan-pro-choose']",
    ) as HTMLAnchorElement;
    expect(pro.getAttribute("href")).toBe(
      "https://link.fastpaydirect.com/payment-link/69ff6b81c43a7488828c26be",
    );
    expect(pro.getAttribute("target")).toBe("_blank");
    expect(pro.getAttribute("rel")).toContain("noopener");
    expect(pro.getAttribute("aria-label")).toBe("Subscribe to Voice Pro");
  });

  it("does not change entitlement when payment link is clicked", () => {
    act(() => {
      root.render(<PlanAndVoiceSection plan="essential" />);
    });
    const before = getPrefs().plan;
    act(() => {
      (
        container.querySelector(
          "[data-testid='voice-plan-lite-choose']",
        ) as HTMLAnchorElement
      ).click();
    });
    expect(getPrefs().plan).toBe(before);
    expect(getPrefs().plan).toBe("essential");
    expect(window.open).toHaveBeenCalled();
    expect(
      container.querySelector("[data-testid='voice-plan-lite-pending']")
        ?.textContent,
    ).toMatch(/after payment is confirmed/i);
    expect(
      container.querySelector("[data-testid='voice-plan-lite-current']"),
    ).toBeNull();
  });

  it("marks Voice Lite as current and hides its purchase CTA", () => {
    act(() => {
      root.render(<PlanAndVoiceSection plan="voice-lite" />);
    });
    expect(
      container.querySelector("[data-testid='voice-plan-lite-current']")
        ?.textContent,
    ).toBe("Current Voice Plan");
    expect(
      container.querySelector("[data-testid='voice-plan-lite-choose']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='voice-plan-pro-choose']"),
    ).toBeTruthy();
  });

  it("marks Voice Pro as current and hides Voice Pro purchase CTA", () => {
    act(() => {
      root.render(<PlanAndVoiceSection plan="voice-pro" />);
    });
    expect(
      container.querySelector("[data-testid='voice-plan-pro-current']")
        ?.textContent,
    ).toBe("Current Voice Plan");
    expect(
      container.querySelector("[data-testid='voice-plan-pro-choose']"),
    ).toBeNull();
    expect(
      container.querySelector("[data-testid='voice-plan-lite-choose']"),
    ).toBeNull();
  });

  it("exposes keyboard-focusable subscribe controls", () => {
    act(() => {
      root.render(<PlanAndVoiceSection plan="essential" />);
    });
    const lite = container.querySelector(
      "[data-testid='voice-plan-lite-choose']",
    ) as HTMLAnchorElement;
    expect(lite.tagName).toBe("A");
    expect(lite.tabIndex).toBeGreaterThanOrEqual(0);
    lite.focus();
    expect(document.activeElement).toBe(lite);
  });
});
