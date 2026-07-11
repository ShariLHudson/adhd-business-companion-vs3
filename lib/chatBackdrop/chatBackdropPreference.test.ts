import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  CHAT_BACKDROP_OPTIONS,
  DEFAULT_CLEAR_MY_MIND_BACKDROP_ID,
  getChatBackdropId,
  getChatBackdropImageUrl,
  getClearMyMindBackdropImageUrl,
  getRoomBackdropImageUrl,
  getRoomBackdropOverrideId,
  getStoredChatBackdropId,
  setChatBackdropId,
  setClearMyMindBackdropId,
  setRoomBackdropOverride,
} from "@/lib/chatBackdrop";
import { CLEAR_MY_MIND_SUNROOM_BG } from "@/lib/clearMyMind/conservatory";

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

describe("chatBackdropPreference", () => {
  beforeEach(() => {
    installLocalStorageMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults Clear My Mind to sunroom photograph", () => {
    expect(getClearMyMindBackdropImageUrl()).toBe(CLEAR_MY_MIND_SUNROOM_BG);
    expect(DEFAULT_CLEAR_MY_MIND_BACKDROP_ID).toBe("sunroom");
  });

  it("leaves everyday chat photo unset until member chooses", () => {
    expect(getStoredChatBackdropId()).toBeNull();
    expect(getChatBackdropImageUrl()).toBeNull();
  });

  it("stores chat backdrop without affecting clear-my-mind default", () => {
    setChatBackdropId("library");
    expect(getChatBackdropImageUrl()).toContain("library");
    expect(getClearMyMindBackdropImageUrl()).toBe(CLEAR_MY_MIND_SUNROOM_BG);
  });

  it("allows greenhouse behind Clear My Mind when chosen", () => {
    setClearMyMindBackdropId("greenhouse");
    expect(getClearMyMindBackdropImageUrl()).toContain("greenhouse-background");
  });

  it("ignores clear-my-mind ids that are chat-only", () => {
    setClearMyMindBackdropId("library");
    expect(getClearMyMindBackdropImageUrl()).toBe(CLEAR_MY_MIND_SUNROOM_BG);
  });

  it("stores per-room environment overrides independently", () => {
    setRoomBackdropOverride("journal", "library");
    expect(getRoomBackdropOverrideId("journal")).toBe("library");
    expect(getRoomBackdropImageUrl("journal")).toContain("library");
    setRoomBackdropOverride("stables", "greenhouse");
    expect(getRoomBackdropImageUrl("journal")).toContain("library");
    expect(getRoomBackdropImageUrl("stables")).toContain("greenhouse-background");
  });

  it("omits backgrounds without working assets from the picker list", () => {
    const ids = CHAT_BACKDROP_OPTIONS.map((option) => option.id);
    expect(ids).not.toContain("music-room");
    expect(ids).not.toContain("living-room-twilight");
  });

  it("maps every backdrop option to an on-disk image asset", () => {
    const publicDir = path.join(process.cwd(), "public");
    for (const option of CHAT_BACKDROP_OPTIONS) {
      const pathname = decodeURIComponent(option.imageUrl.split("?")[0]!);
      const relative = pathname.startsWith("/") ? pathname.slice(1) : pathname;
      const filePath = path.join(publicDir, ...relative.split("/"));
      expect(fs.existsSync(filePath), `${option.id} → ${relative}`).toBe(true);
    }
  });

  it("falls back when a removed backdrop id is still stored", () => {
    const store = installLocalStorageMock();
    store.set("spark.chatBackdropId.v1", "music-room");
    expect(getChatBackdropId()).toBe("welcome-home");
    expect(getChatBackdropImageUrl()).toBeNull();
    store.set("spark.roomBackdropOverride.v1", JSON.stringify({ journal: "living-room-twilight" }));
    expect(getRoomBackdropOverrideId("journal")).toBeNull();
    expect(getRoomBackdropImageUrl("journal")).toBeNull();
  });
});
