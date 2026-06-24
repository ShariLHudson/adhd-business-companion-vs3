import { afterEach, describe, expect, it, vi } from "vitest";
import { isRelationshipDebugUiEnabled } from "./RelationshipResponseDevBadge";

describe("RelationshipResponseDevBadge", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is disabled by default in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SHOW_RELATIONSHIP_DEBUG", undefined);
    expect(isRelationshipDebugUiEnabled()).toBe(false);
  });

  it("is disabled in production even when flag is set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SHOW_RELATIONSHIP_DEBUG", "true");
    expect(isRelationshipDebugUiEnabled()).toBe(false);
  });

  it("enables UI only when development and explicit flag are both true", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SHOW_RELATIONSHIP_DEBUG", "true");
    expect(isRelationshipDebugUiEnabled()).toBe(true);
  });
});
