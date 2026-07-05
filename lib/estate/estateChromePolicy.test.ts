import { describe, expect, it } from "vitest";
import {
  isEstateHomeChatSection,
  isEstatePlaceChromeActive,
  resolveEstateChromePolicy,
} from "./estateChromePolicy";

describe("Estate chrome policy — returning /companion user regression", () => {
  it("hides application chrome on home chat even when a workspace panel is open", () => {
    expect(
      isEstatePlaceChromeActive({
        activeSection: "home",
        welcomeHomePrimary: false,
        estateImmersiveActive: false,
        overlay: null,
      }),
    ).toBe(true);
  });

  it("hides application chrome for welcome-home primary", () => {
    expect(
      isEstatePlaceChromeActive({
        activeSection: "home",
        welcomeHomePrimary: true,
        overlay: null,
      }),
    ).toBe(true);
  });

  it("shows application chrome during sign-in overlay on home", () => {
    expect(
      isEstateHomeChatSection({
        activeSection: "home",
        overlay: "signin",
      }),
    ).toBe(false);

    expect(
      resolveEstateChromePolicy({
        activeSection: "home",
        overlay: "signin",
      }).hideApplicationChrome,
    ).toBe(false);
  });

  it("resolveEstateChromePolicy hides sidebar/topbar tabs on home chat", () => {
    const policy = resolveEstateChromePolicy({
      activeSection: "home",
      overlay: null,
    });
    expect(policy.hideApplicationChrome).toBe(true);
    expect(policy.showSubtleEstateMenu).toBe(true);
    expect(policy.showGuidebook).toBe(true);
  });

  it("legacy application chrome remains available during sign-in only on home", () => {
    expect(
      resolveEstateChromePolicy({
        activeSection: "home",
        overlay: "signin",
      }).hideApplicationChrome,
    ).toBe(false);
  });
});
