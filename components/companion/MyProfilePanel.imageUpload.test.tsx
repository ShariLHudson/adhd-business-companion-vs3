/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Reuse the real validation, but skip the canvas step (unavailable in jsdom).
vi.mock("@/lib/clientAvatarImage", async (orig) => {
  const actual = await (orig() as Promise<Record<string, unknown>>);
  return {
    ...actual,
    processAvatarImage: vi.fn(async (file: File) => {
      const v = (actual.validateAvatarImageFile as (f: {
        type: string;
        size: number;
      }) => { ok: boolean; error?: string })(file);
      if (!v.ok) throw new Error(v.error);
      return "data:image/webp;base64,PROFILE";
    }),
  };
});

import { MyProfilePanel } from "./MyProfilePanel";
import { getPrefs, savePrefs, getAvatars, saveAvatar } from "@/lib/companionStore";

describe("MyProfilePanel — profile image upload", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    savePrefs({ name: "Sam Rivera" });
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
  async function mount() {
    await act(async () => root.render(<MyProfilePanel onClose={vi.fn()} />));
    await flush();
  }
  const q = <T extends Element>(sel: string) =>
    container.querySelector(sel) as T | null;
  const byText = (t: string) =>
    [...container.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === t,
    ) as HTMLButtonElement | undefined;
  async function choose(type: string) {
    const input = q<HTMLInputElement>('[data-testid="profile-image-field"] input[type="file"]')!;
    const file = new File(["x"], `f.${type.split("/")[1]}`, { type });
    Object.defineProperty(input, "files", { value: [file], configurable: true });
    await act(async () => input.dispatchEvent(new Event("change", { bubbles: true })));
    await flush();
  }

  it("empty state shows Add Image and no preview", async () => {
    await mount();
    expect(byText("Add Image")).toBeTruthy();
    expect(q('[data-testid="profile-image-preview"]')).toBeNull();
  });

  it("choosing a valid image previews it and can be saved; persists to prefs", async () => {
    await mount();
    await choose("image/png");
    const preview = q<HTMLImageElement>('[data-testid="profile-image-preview"]');
    expect(preview).toBeTruthy();
    expect(preview!.src).toContain("PROFILE");
    expect(byText("Save photo")).toBeTruthy();
    // Not persisted until saved (preview-before-save).
    expect(getPrefs().profileImage).toBeFalsy();
    await act(async () => byText("Save photo")!.click());
    await flush();
    expect(getPrefs().profileImage).toBe("data:image/webp;base64,PROFILE");
    // Now shows Change + Remove.
    expect(byText("Change Image")).toBeTruthy();
    expect(byText("Remove Image")).toBeTruthy();
  });

  it("Cancel discards the pending preview", async () => {
    await mount();
    await choose("image/png");
    await act(async () => byText("Cancel")!.click());
    await flush();
    expect(q('[data-testid="profile-image-preview"]')).toBeNull();
    expect(getPrefs().profileImage).toBeFalsy();
  });

  it("Remove Image clears prefs and restores the fallback", async () => {
    await mount();
    await choose("image/png");
    await act(async () => byText("Save photo")!.click());
    await flush();
    await act(async () => byText("Remove Image")!.click());
    await flush();
    expect(getPrefs().profileImage).toBe("");
    expect(q('[data-testid="profile-image-preview"]')).toBeNull();
    expect(byText("Add Image")).toBeTruthy();
  });

  it("rejects an unsupported file type with a clear error, no preview", async () => {
    await mount();
    await choose("image/gif");
    expect(q('[data-testid="profile-image-error"]')).toBeTruthy();
    expect(q('[data-testid="profile-image-preview"]')).toBeNull();
    expect(getPrefs().profileImage).toBeFalsy();
  });

  it("does not touch Client Avatar data, and restores the image on reopen", async () => {
    saveAvatar({ name: "A client type" });
    const beforeAvatars = JSON.stringify(getAvatars());
    await mount();
    await choose("image/png");
    await act(async () => byText("Save photo")!.click());
    await flush();
    // Client Avatar records unchanged.
    expect(JSON.stringify(getAvatars())).toBe(beforeAvatars);
    // Reopen (remount) → the saved image is restored.
    act(() => root.unmount());
    root = createRoot(container);
    await mount();
    const preview = q<HTMLImageElement>('[data-testid="profile-image-preview"]');
    expect(preview).toBeTruthy();
    expect(preview!.src).toContain("PROFILE");
  });
});
