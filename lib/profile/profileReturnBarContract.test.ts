/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearNavigationOriginForTests,
  getNavigationOrigin,
  setNavigationOrigin,
} from "@/lib/navigationOrigin";

describe("ProfileReturnBar contract", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    clearNavigationOriginForTests();
  });

  it("return bar component exposes visible control + keyboard-safe button", () => {
    const source = readFileSync(
      join(__dirname, "../../components/companion/ProfileReturnBar.tsx"),
      "utf8",
    );
    expect(source).toContain('data-testid="profile-return-bar"');
    expect(source).toContain('data-testid="profile-return-button"');
    expect(source).toContain("onReturn(origin)");
    expect(source).toContain("currentDestination === origin.originRoute");
  });

  it("origin store supplies restore fields for tab/section/step/scroll", () => {
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      originTab: "personal",
      originSection: "preferences",
      originStep: "setup-1",
      originScrollY: 180,
      openedDestination: "settings",
    });
    expect(getNavigationOrigin()).toMatchObject({
      originTab: "personal",
      originSection: "preferences",
      originStep: "setup-1",
      originScrollY: 180,
    });
  });
});
