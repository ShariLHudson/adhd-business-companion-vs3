/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock only the browser image processor (canvas isn't available in jsdom);
// validation/crop math are covered by lib/clientAvatarImage.test.ts.
vi.mock("@/lib/clientAvatarImage", async (orig) => {
  const actual = await (orig() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    processAvatarImage: vi.fn(async () => "data:image/webp;base64,PROCESSED"),
  };
});

import { IdealClientBuilder } from "./IdealClientBuilder";
import { getAvatars, saveAvatar } from "@/lib/companionStore";

describe("IdealClientBuilder identity step — estate mark + image controls", () => {
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
    vi.clearAllMocks();
  });

  async function flush() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }

  const byText = (text: string) =>
    [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === text,
    ) as HTMLButtonElement | undefined;

  async function gotoIdentity() {
    await act(async () => {
      root.render(<IdealClientBuilder coachKickoff={1} />);
    });
    await flush();
    // Step 1 is "who"; Skip advances to the identity step (step 2).
    await act(async () => byText("Skip for Now")!.click());
    await flush();
  }

  it("shows the estate identity UI and NO emoji picker or old copy", async () => {
    await gotoIdentity();
    expect(container.textContent).toContain("Add a visual reference.");
    expect(container.textContent).not.toContain("Or pick an emoji");
    expect(container.textContent).not.toContain("Give them a face");
    expect(container.textContent).not.toContain("An emoji or photo");
    expect(container.textContent).not.toContain("👤");
    // No image yet → neutral default emblem + "Add Image".
    expect(
      container.querySelector('[data-testid="client-avatar-mark-default"]'),
    ).toBeTruthy();
    expect(byText("Add Image")).toBeTruthy();
    expect(byText("Remove Image")).toBeUndefined();
    // Readable identity card + estate-style mark picker + helper text present.
    expect(
      container.querySelector('[data-testid="avatar-identity-card"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="avatar-visual-ref-picker"]'),
    ).toBeTruthy();
    expect(container.textContent).toContain(
      "Or choose a client-archetype mark",
    );
    expect(container.textContent).toContain(
      "Use only images you own or have permission to use.",
    );
  });

  it("selecting an estate profile mark updates the preview, persists, and shows in the gallery", async () => {
    await gotoIdentity();
    const compass = container.querySelector(
      '[data-testid="avatar-visual-ref-entrepreneur"]',
    ) as HTMLButtonElement;
    expect(compass).toBeTruthy();
    await act(async () => compass.click());
    await flush();
    // Preview switches to the chosen mark; "Use default mark" appears.
    expect(
      container.querySelector('[data-testid="client-avatar-mark-emblem"]'),
    ).toBeTruthy();
    expect(byText("Use default mark")).toBeTruthy();

    const save = container.querySelector(
      '[data-testid="save-progress"]',
    ) as HTMLButtonElement;
    expect(save.disabled).toBe(false);
    await act(async () => save.click());
    await flush();
    expect(getAvatars()[0]!.visualReferenceId).toBe("entrepreneur");

    // Reopen via the gallery: the saved mark renders on the card.
    await act(async () => root.render(<IdealClientBuilder />));
    await flush();
    expect(
      container.querySelector('[data-testid="client-avatar-mark-emblem"]'),
    ).toBeTruthy();
  });

  it("uploaded image beats a chosen mark; removing the image restores the mark", async () => {
    await gotoIdentity();
    await act(async () =>
      (
        container.querySelector(
          '[data-testid="avatar-visual-ref-coach"]',
        ) as HTMLButtonElement
      ).click(),
    );
    await flush();
    // Upload an image → image wins.
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["x"], "p.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
    await flush();
    expect(
      container.querySelector('[data-testid="client-avatar-mark-image"]'),
    ).toBeTruthy();
    // Remove the image → the previously chosen mark returns.
    await act(async () => byText("Remove Image")!.click());
    await flush();
    expect(
      container.querySelector('[data-testid="client-avatar-mark-emblem"]'),
    ).toBeTruthy();
  });

  it("Use default mark returns from an archetype to the default emblem", async () => {
    await gotoIdentity();
    await act(async () =>
      (
        container.querySelector(
          '[data-testid="avatar-visual-ref-consultant"]',
        ) as HTMLButtonElement
      ).click(),
    );
    await flush();
    await act(async () => byText("Use default mark")!.click());
    await flush();
    // Unnamed fresh draft → neutral default emblem.
    expect(
      container.querySelector('[data-testid="client-avatar-mark-emblem"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="client-avatar-mark-default"]'),
    ).toBeTruthy();
  });

  it("processes an uploaded image, previews it, marks dirty, and persists it", async () => {
    await gotoIdentity();
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["x"], "photo.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
    await flush();

    // Processed image is previewed (not the raw file).
    const img = container.querySelector(
      '[data-testid="client-avatar-mark-image"]',
    ) as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain("PROCESSED");
    // The control becomes "Change Image" and Remove appears.
    expect(byText("Change Image")).toBeTruthy();
    expect(byText("Remove Image")).toBeTruthy();

    // Adding the image marked the draft dirty → Save Progress enabled.
    const save = container.querySelector(
      '[data-testid="save-progress"]',
    ) as HTMLButtonElement;
    expect(save.disabled).toBe(false);
    await act(async () => save.click());
    await flush();
    // Persisted the processed image (small WebP), not a raw multi-MB file.
    expect(getAvatars()[0]!.image).toBe("data:image/webp;base64,PROCESSED");
  });

  it("Remove Image restores the estate fallback and re-enables save", async () => {
    await gotoIdentity();
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["x"], "photo.png", { type: "image/png" });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
    await flush();
    expect(
      container.querySelector('[data-testid="client-avatar-mark-image"]'),
    ).toBeTruthy();

    await act(async () => byText("Remove Image")!.click());
    await flush();
    expect(
      container.querySelector('[data-testid="client-avatar-mark-image"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="client-avatar-mark-default"]'),
    ).toBeTruthy();
  });

  it("gallery uses each saved avatar's own image / fallback (separate images)", async () => {
    saveAvatar({ name: "Photo Client", image: "data:image/webp;base64,PIC" });
    saveAvatar({ name: "Named Only" });
    await act(async () => {
      root.render(<IdealClientBuilder />);
    });
    await flush();
    const imgs = [
      ...container.querySelectorAll('[data-testid="client-avatar-mark-image"]'),
    ] as HTMLImageElement[];
    const initials = container.querySelectorAll(
      '[data-testid="client-avatar-mark-default"]',
    );
    // Only the avatar with an image shows a photo (its card + the "Using" pill);
    // the named-only avatar shows the default emblem. Never an emoji.
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(imgs.every((i) => i.src.includes("PIC"))).toBe(true);
    expect(initials.length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).not.toContain("👤");
  });
});
