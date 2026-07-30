import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveEstateRoomBackgroundImage } from "./estateRoomBackground";
import { resolveCanonicalPlaceBackground } from "./estatePlaceMedia";
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

describe("Coffee House canonical artwork resolution", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Canonical Coffee House artwork = public/backgrounds/coffee-house-background.png
  // (committed at 731b86c0, blob 6b242042). Exact-match assertions guard against the
  // substring trap where the deleted "room-coffee-house-background.png" 404 path also
  // contains "coffee-house-background".
  const CANONICAL_COFFEE_BG = "/backgrounds/coffee-house-background.png";

  it("resolves the Coffee House immersive room background to the dedicated canonical plate", () => {
    const url = resolveEstateRoomBackgroundImage("coffee-house");
    expect(url).toBe(CANONICAL_COFFEE_BG);
    // not the borrowed Tea Room, and not the deleted room-prefixed 404 path
    expect(url).not.toContain("tea-room-background");
    expect(url).not.toContain("room-coffee-house-background");
  });

  it("resolves Coffee House via the manifest-first place-media source to its dedicated plate", () => {
    const url = resolveCanonicalPlaceBackground("coffee-house");
    expect(url).toBe(CANONICAL_COFFEE_BG);
    expect(url).not.toContain("tea-room-background");
  });

  it("leaves the Tea Room on its own background (no cross-room regression)", () => {
    const teaRoomImage = resolveEstateRoomBackgroundImage("tea-room");
    expect(teaRoomImage).toContain("tea-room-background");
    expect(teaRoomImage).not.toContain("coffee-house-background");

    const teaRoomMedia = resolveCanonicalPlaceBackground("tea-room");
    expect(teaRoomMedia).toContain("tea-room-background");
    expect(teaRoomMedia).not.toContain("coffee-house-background");
  });
});
