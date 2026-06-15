import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveOpenAiApiKey } from "./resolveOpenAiApiKey";

describe("resolveOpenAiApiKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads OPENAI_API_KEY when set", () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key-12345678901234567890");
    expect(resolveOpenAiApiKey()).toBe("sk-test-key-12345678901234567890");
  });

  it("returns null when unset", () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(resolveOpenAiApiKey()).toBeNull();
  });
});
