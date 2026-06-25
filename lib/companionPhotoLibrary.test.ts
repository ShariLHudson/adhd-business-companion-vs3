import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  pickWorkspaceEntryPhoto,
  type CompanionPresenceWorkspace,
} from "./companionPhotoLibrary";
import { ASSETS } from "./companionUi";

describe("companionPhotoLibrary workspace entry", () => {
  const mem = new Map<string, string>();

  beforeEach(() => {
    mem.clear();
    vi.stubGlobal("window", {});
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    });
  });

  it("rotates deterministically to the next image on re-entry", () => {
    const pool = [
      "/shari.jpg",
      "/images/shari/shari-1.jpg",
      "/images/shari/shari-2.jpg",
    ];
    const workspace: CompanionPresenceWorkspace = "clear-my-mind";

    const first = pickWorkspaceEntryPhoto(workspace, pool);
    const second = pickWorkspaceEntryPhoto("my-thoughts", pool);
    const third = pickWorkspaceEntryPhoto(workspace, pool);

    expect(first.src).toBe("/shari.jpg");
    expect(second.src).toBe("/images/shari/shari-1.jpg");
    expect(third.src).toBe("/images/shari/shari-2.jpg");
    expect(second.reason).toContain("workspace-entry-rotate");
  });

  it("reports fallback when only one image exists", () => {
    const result = pickWorkspaceEntryPhoto("my-thoughts", [ASSETS.profile]);
    expect(result.src).toBe(ASSETS.profile);
    expect(result.fallbackOnly).toBe(true);
    expect(result.reason).toBe("only-one-image-available");
  });
});
