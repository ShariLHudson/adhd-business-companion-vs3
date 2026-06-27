/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";
import { CompanionLoginBackground } from "./CompanionLoginBackground";

describe("CompanionLoginBackground", () => {
  let container: HTMLDivElement;
  let root: Root;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
  });

  function render() {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<CompanionLoginBackground />);
    });
  }

  function scene() {
    return container.querySelector("[data-testid='companion-login-scene']");
  }

  it("renders the static shari-login background", () => {
    render();
    expect(scene()).toBeTruthy();
    const img = container.querySelector(
      ".companion-login-scene__base",
    ) as HTMLImageElement | null;
    expect(img?.getAttribute("src")).toBe(COMPANION_LOGIN_BACKGROUND);
    expect(container.querySelector(".companion-login-scene__soften")).toBeTruthy();
  });

  it("does not render motion or adaptive layers", () => {
    render();
    expect(
      container.querySelector(".companion-login-scene__motion-swing"),
    ).toBeNull();
    expect(
      container.querySelector(".companion-login-scene__lighting"),
    ).toBeNull();
    expect(
      container.querySelector(".companion-login-scene__processing-glow"),
    ).toBeNull();
    expect(
      container.querySelector(".companion-login-scene__atmosphere"),
    ).toBeNull();
  });

  it("keeps the scene behind the login card stacking context", () => {
    render();
    expect(scene()?.classList.contains("-z-10")).toBe(true);
  });
});
