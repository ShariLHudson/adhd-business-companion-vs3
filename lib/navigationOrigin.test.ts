/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearNavigationOrigin,
  clearNavigationOriginForTests,
  consumeNavigationOrigin,
  defaultProfileReturnLabel,
  getNavigationOrigin,
  setNavigationOrigin,
} from "@/lib/navigationOrigin";

describe("navigationOrigin", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    clearNavigationOriginForTests();
  });

  it("stores origin context when leaving Profile for a destination", () => {
    const ctx = setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      originTab: "personal",
      originSection: "preferences",
      originStep: "intro",
      originScrollY: 240,
      openedDestination: "settings",
    });

    expect(ctx.returnLabel).toBe("Return to My Profile");
    expect(getNavigationOrigin()).toMatchObject({
      originRoute: "profile-personal",
      originTab: "personal",
      originSection: "preferences",
      originStep: "intro",
      originScrollY: 240,
      openedDestination: "settings",
    });
  });

  it("exposes context-matched return labels", () => {
    expect(defaultProfileReturnLabel("profile-personal")).toBe(
      "Return to My Profile",
    );
    expect(defaultProfileReturnLabel("my-business-estate")).toBe(
      "Return to My Business Estate",
    );
    expect(defaultProfileReturnLabel("profile-personal", true)).toBe(
      "Continue Profile Setup",
    );
  });

  it("nested destination replaces with one clear origin (no infinite stack)", () => {
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      openedDestination: "my-business-estate",
    });
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "my-business-estate",
      openedDestination: "people-i-help",
    });

    const origin = getNavigationOrigin();
    expect(origin?.originRoute).toBe("my-business-estate");
    expect(origin?.openedDestination).toBe("people-i-help");
  });

  it("consume clears after successful return", () => {
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      openedDestination: "settings",
    });
    const consumed = consumeNavigationOrigin();
    expect(consumed?.originRoute).toBe("profile-personal");
    expect(getNavigationOrigin()).toBeNull();
  });

  it("Welcome Home / explicit clear removes stale return context", () => {
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      openedDestination: "settings",
    });
    clearNavigationOrigin();
    expect(getNavigationOrigin()).toBeNull();
  });

  it("stale origin context expires safely", () => {
    const now = Date.now();
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      openedDestination: "settings",
    });
    const raw = sessionStorage.getItem("spark:navigation-origin:v1");
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    parsed.expiresAt = new Date(now - 1000).toISOString();
    sessionStorage.setItem("spark:navigation-origin:v1", JSON.stringify(parsed));

    expect(getNavigationOrigin(now)).toBeNull();
  });

  it("canonicalizes legacy profile overlay to my-business-estate", () => {
    const ctx = setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile" as unknown as "my-business-estate",
      openedDestination: "people-i-help",
    });
    expect(ctx.originRoute).toBe("my-business-estate");
  });
});
