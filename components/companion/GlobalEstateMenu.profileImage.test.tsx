/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlobalEstateMenu } from "./GlobalEstateMenu";
import { savePrefs } from "@/lib/companionStore";

describe("GlobalEstateMenu — top-right profile image", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.localStorage.clear();
  });

  const trigger = () =>
    container.querySelector(
      '[data-testid="global-estate-menu-trigger"]',
    ) as HTMLButtonElement;

  it("renders the uploaded profile image with meaningful alt text", () => {
    savePrefs({ name: "Sam Rivera", profileImage: "data:image/webp;base64,PIC" });
    act(() => root.render(<GlobalEstateMenu onAction={vi.fn()} />));
    const img = trigger().querySelector("img") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain("PIC");
    expect(img.getAttribute("alt")).toBe("Sam Rivera profile image");
  });

  it("falls back to initials when no image is set, and the menu still opens", () => {
    savePrefs({ name: "Sam Rivera", profileImage: "" });
    act(() => root.render(<GlobalEstateMenu onAction={vi.fn()} />));
    // No image → initials fallback (not an <img>).
    expect(trigger().querySelector("img")).toBeNull();
    expect(container.textContent).toContain("SR");
    // Existing profile-menu behavior still works: clicking opens the menu.
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    act(() => trigger().click());
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector('[role="menu"]')).toBeTruthy();
  });
});
