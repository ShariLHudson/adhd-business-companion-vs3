/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ClientAvatarMark } from "./ClientAvatarMark";

describe("ClientAvatarMark (fallback order + accessibility)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  function render(props: React.ComponentProps<typeof ClientAvatarMark>) {
    act(() => root.render(<ClientAvatarMark {...props} />));
  }

  it("shows the uploaded image first, with meaningful name-based alt text", () => {
    render({ name: "Burned Out Coach", image: "data:image/webp;base64,AAAA", size: 48 });
    const img = container.querySelector(
      '[data-testid="client-avatar-mark-image"]',
    ) as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute("alt")).toBe("Burned Out Coach avatar image");
    // No fallback shown when an image exists.
    expect(
      container.querySelector('[data-testid="client-avatar-mark-initials"]'),
    ).toBeNull();
  });

  it("shows monogram initials when a named avatar has no image (fallback aria-hidden)", () => {
    render({ name: "Burned Out Coach", size: 48 });
    const initials = container.querySelector(
      '[data-testid="client-avatar-mark-initials"]',
    );
    expect(initials).toBeTruthy();
    expect(initials!.textContent).toBe("BC");
    expect(initials!.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows the estate silhouette for an unnamed avatar (no initials, no emoji)", () => {
    render({ name: "", size: 48 });
    const sil = container.querySelector(
      '[data-testid="client-avatar-mark-silhouette"]',
    );
    expect(sil).toBeTruthy();
    expect(sil!.querySelector("svg")).toBeTruthy();
    expect(sil!.getAttribute("aria-hidden")).toBe("true");
  });

  it("never renders an emoji as the identity (the component has no emoji input)", () => {
    // Even a legacy avatar that only had an emoji resolves by name → initials
    // (or silhouette). The emoji glyph can never appear.
    render({ name: "Anxious Founder", size: 48 });
    expect(container.textContent).not.toContain("👤");
    expect(container.textContent).toBe("AF");
  });
});
