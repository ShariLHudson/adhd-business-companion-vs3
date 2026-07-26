/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ClientAvatarMark } from "./ClientAvatarMark";

describe("ClientAvatarMark (archetype priority + accessibility)", () => {
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

  it("shows an uploaded reference image first, with meaningful name-based alt", () => {
    render({ name: "Coach clients", image: "data:image/webp;base64,AAAA", size: 48 });
    const img = container.querySelector(
      '[data-testid="client-avatar-mark-image"]',
    ) as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute("alt")).toBe("Coach clients visual reference");
  });

  it("shows the chosen archetype emblem when there is no image (decorative)", () => {
    render({ name: "Coach clients", visualReferenceId: "coach", size: 48 });
    const emblem = container.querySelector(
      '[data-testid="client-avatar-mark-emblem"]',
    );
    expect(emblem).toBeTruthy();
    expect(emblem!.getAttribute("aria-hidden")).toBe("true");
    expect(emblem!.querySelector("svg")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });

  it("shows the neutral default dossier emblem when there is no image or archetype — even unnamed", () => {
    render({ name: "", size: 48 });
    const def = container.querySelector(
      '[data-testid="client-avatar-mark-default"]',
    );
    expect(def).toBeTruthy();
    expect(def!.querySelector("svg")).toBeTruthy();
    // Initials are NOT the default for a named-but-image-less avatar either.
    render({ name: "Some Named Type", size: 48 });
    expect(
      container.querySelector('[data-testid="client-avatar-mark-default"]'),
    ).toBeTruthy();
    expect(container.textContent).toBe("");
  });

  it("an uploaded image beats a chosen archetype emblem", () => {
    render({
      name: "Coach clients",
      visualReferenceId: "coach",
      image: "data:image/webp;base64,AAAA",
      size: 48,
    });
    expect(
      container.querySelector('[data-testid="client-avatar-mark-image"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="client-avatar-mark-emblem"]'),
    ).toBeNull();
  });

  it("never renders an emoji as the identity", () => {
    render({ name: "Anxious Founder", visualReferenceId: "entrepreneur", size: 48 });
    expect(container.textContent).not.toContain("👤");
  });
});
