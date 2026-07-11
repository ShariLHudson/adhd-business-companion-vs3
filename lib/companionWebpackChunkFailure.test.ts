// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  isCompanionWebpackChunkFailure,
  reloadOnceForStaleCompanionChunk,
  clearCompanionChunkReloadGuard,
} from "./companionWebpackChunkFailure";

describe("companionWebpackChunkFailure", () => {
  it("detects webpack script error Events", () => {
    const event = new Event("error");
    expect(isCompanionWebpackChunkFailure(event)).toBe(true);
  });

  it("detects ChunkLoadError", () => {
    const error = new Error("Loading chunk 123 failed");
    error.name = "ChunkLoadError";
    expect(isCompanionWebpackChunkFailure(error)).toBe(true);
  });

  it("reloads only once per session guard", () => {
    const original = window.location.reload;
    const reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });

    try {
      clearCompanionChunkReloadGuard();
      expect(reloadOnceForStaleCompanionChunk()).toBe(true);
      expect(reload).toHaveBeenCalledTimes(1);
      expect(reloadOnceForStaleCompanionChunk()).toBe(false);
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      clearCompanionChunkReloadGuard();
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...window.location, reload: original },
      });
    }
  });
});
