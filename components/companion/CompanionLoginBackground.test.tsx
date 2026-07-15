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

  function render(fullExposure = true) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<CompanionLoginBackground fullExposure={fullExposure} />);
    });
  }

  function scene() {
    return container.querySelector("[data-testid='companion-login-scene']");
  }

  it("renders welcome-to-spark-estate with uniform full exposure", () => {
    render();
    expect(scene()).toBeTruthy();
    expect(scene()?.getAttribute("data-login-background")).toBe(
      "welcome-to-spark-estate",
    );
    expect(scene()?.classList.contains("companion-login-scene--full-exposure")).toBe(
      true,
    );
    const images = container.querySelectorAll(
      ".companion-login-scene__base",
    ) as NodeListOf<HTMLImageElement>;
    expect(images.length).toBe(1);
    expect(images[0]?.getAttribute("src")).toBe(COMPANION_LOGIN_BACKGROUND);
    expect(container.querySelector(".companion-login-scene__soften")).toBeFalsy();
    expect(
      container.querySelector(".companion-welcome-scene__sunlight"),
    ).toBeFalsy();
  });

  it("renders nothing when fullExposure is off", () => {
    render(false);
    expect(scene()).toBeFalsy();
  });

  it("keeps the scene inside the login page stacking context", () => {
    render();
    expect(scene()?.classList.contains("z-0")).toBe(true);
  });
});
