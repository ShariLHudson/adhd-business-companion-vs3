/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";
import { HomesteadSceneProvider } from "@/lib/homesteadScene";
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
      root.render(
        <HomesteadSceneProvider>
          <CompanionLoginBackground />
        </HomesteadSceneProvider>,
      );
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

  it("applies shared homestead scene layers and attributes", () => {
    render();
    const el = scene();
    expect(el?.getAttribute("data-homestead-scene")).toBe("");
    expect(el?.getAttribute("data-homestead-period")).toBeTruthy();
    expect(el?.getAttribute("data-time-of-day")).toBeTruthy();
    expect(el?.getAttribute("data-season")).toBeTruthy();
    expect(el?.getAttribute("data-weather")).toBeTruthy();
    expect(
      container.querySelector(".companion-welcome-scene__sunlight"),
    ).toBeTruthy();
    expect(
      container.querySelector(".companion-welcome-scene__porch-glow"),
    ).toBeTruthy();
  });

  it("keeps the scene behind the login card stacking context", () => {
    render();
    expect(scene()?.classList.contains("-z-10")).toBe(true);
  });
});
