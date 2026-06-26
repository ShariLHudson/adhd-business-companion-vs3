import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isDirectorStudioDemoMode,
  showDirectorStudio,
} from "./directorStudio";

describe("showDirectorStudio", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is off by default", () => {
    expect(showDirectorStudio(null, null)).toBe(false);
    expect(showDirectorStudio("0", null)).toBe(false);
    expect(showDirectorStudio(undefined, undefined)).toBe(false);
  });

  it("enables with demo=1 or studio=1 in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(showDirectorStudio(null, "1")).toBe(true);
    expect(showDirectorStudio("1", null)).toBe(true);
    expect(isDirectorStudioDemoMode("true")).toBe(true);
  });

  it("stays off in production even with studio param", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(showDirectorStudio("1")).toBe(false);
    expect(showDirectorStudio(null, "1")).toBe(false);
  });
});
