/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildProfileReturnBreadcrumb,
  clearNavigationOrigin,
  clearNavigationOriginForTests,
  consumeNavigationOrigin,
  defaultProfileReturnLabel,
  getNavigationOrigin,
  labelForOpenedDestination,
  patchNavigationOriginOpenedDestination,
  setNavigationOrigin,
  SETTINGS_SAVED_MESSAGE,
} from "@/lib/navigationOrigin";
import { NAVIGATION_STACK_STORAGE_KEY } from "@/lib/navigationContext";

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
      originAccordion: "prefs-block",
      editingFieldId: "profile-name",
      openedDestination: "settings",
      openedSettingsSection: "pattern",
      breadcrumbParent: "Preferences",
    });

    expect(ctx.returnLabel).toBe("Back to My Profile");
    expect(getNavigationOrigin()).toMatchObject({
      originRoute: "profile-personal",
      originTab: "personal",
      originSection: "preferences",
      originStep: "intro",
      originScrollY: 240,
      originAccordion: "prefs-block",
      editingFieldId: "profile-name",
      openedDestination: "settings",
      openedSettingsSection: "pattern",
      openedDestinationLabel: "Pattern Awareness",
    });
  });

  it("exposes context-matched return labels", () => {
    expect(defaultProfileReturnLabel("profile-personal")).toBe(
      "Back to My Profile",
    );
    expect(defaultProfileReturnLabel("my-business-estate")).toBe(
      "Return to My Business Estate",
    );
    expect(defaultProfileReturnLabel("profile-personal", true)).toBe(
      "Continue Profile Setup",
    );
  });

  it("builds breadcrumb My Profile › Preferences › Pattern Awareness", () => {
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      originSection: "preferences",
      breadcrumbParent: "Preferences",
      openedDestination: "settings",
      openedSettingsSection: "pattern",
    });
    const crumbs = buildProfileReturnBreadcrumb(getNavigationOrigin()!);
    expect(crumbs.map((c) => c.label)).toEqual([
      "My Profile",
      "Preferences",
      "Pattern Awareness",
    ]);
    // Universal standard: origin + parent crumbs are clickable; current surface is not.
    expect(crumbs[0]?.clickable).toBe(true);
    expect(crumbs[1]?.clickable).toBe(true);
    expect(crumbs[2]?.clickable).toBe(false);
  });

  it("labels Notifications and Accessibility destinations", () => {
    expect(labelForOpenedDestination("settings", "notifications")).toBe(
      "Notifications",
    );
    expect(labelForOpenedDestination("experience-controls")).toBe(
      "Accessibility & display",
    );
  });

  it("sequential destination patches keep Profile restore fields", () => {
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      originScrollY: 120,
      originSection: "preferences",
      openedDestination: "settings",
      openedSettingsSection: "pattern",
    });
    const patched = patchNavigationOriginOpenedDestination({
      openedDestination: "settings",
      openedSettingsSection: "notifications",
    });
    expect(patched?.originScrollY).toBe(120);
    expect(patched?.originSection).toBe("preferences");
    expect(patched?.openedDestinationLabel).toBe("Notifications");
  });

  it("saving settings message constant does not imply navigation", () => {
    expect(SETTINGS_SAVED_MESSAGE).toBe("Settings saved");
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

  it("browser refresh does not corrupt navigation state", () => {
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      originScrollY: 88,
      openedDestination: "settings",
      openedSettingsSection: "pattern",
    });
    const raw = sessionStorage.getItem(NAVIGATION_STACK_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const restored = getNavigationOrigin();
    expect(restored?.originScrollY).toBe(88);
    expect(restored?.openedDestinationLabel).toBe("Pattern Awareness");
    const stack = JSON.parse(raw!);
    expect(stack.frames[0]?.destinationId).toBe("profile-personal");
  });

  it("stale origin context expires safely", () => {
    const now = Date.now();
    setNavigationOrigin({
      originDestination: "profile",
      originRoute: "profile-personal",
      openedDestination: "settings",
    });
    const raw = sessionStorage.getItem(NAVIGATION_STACK_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    parsed.frames[0].expiresAt = new Date(now - 1000).toISOString();
    sessionStorage.setItem(NAVIGATION_STACK_STORAGE_KEY, JSON.stringify(parsed));

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
