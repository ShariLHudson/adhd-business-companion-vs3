import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveEstateRoomBackgroundImage } from "./estateRoomBackground";
import { setRoomBackdropOverride } from "@/lib/chatBackdrop";

function installLocalStorageMock() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
  vi.stubGlobal("window", {
    localStorage,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  return store;
}

describe("resolveEstateRoomBackgroundImage with member overrides", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers member-chosen environment over registry default", () => {
    setRoomBackdropOverride("reading-nook", "tea-room");
    const url = resolveEstateRoomBackgroundImage("reading-nook");
    expect(url).toContain("tea-room-background");
  });

  it("prefers member override over explicit room plate fallback", () => {
    setRoomBackdropOverride("coffee-house", "library");
    const url = resolveEstateRoomBackgroundImage("coffee-house");
    expect(url).toContain("library");
  });

  it("keeps Journal Gazebo on the canonical desk plate even with a sunroom override", () => {
    setRoomBackdropOverride("journal", "sunroom");
    const url = resolveEstateRoomBackgroundImage("journal");
    expect(url).toContain("journal-desk-background");
    expect(url).not.toContain("sunroom");
  });
});
