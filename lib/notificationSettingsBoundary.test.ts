import { describe, expect, it } from "vitest";
import { resolveAppFeatureNavTarget } from "./appFeatureNavigation";
import { isNotificationSettingsRequest } from "./notificationSettingsBoundary";

describe("notificationSettingsBoundary P0.33", () => {
  it("routes notification settings to settings only", () => {
    expect(isNotificationSettingsRequest("Open notification settings")).toBe(true);
    expect(isNotificationSettingsRequest("Change reminder sound")).toBe(true);
    expect(resolveAppFeatureNavTarget("notification preferences")?.section).toBe(
      "notifications",
    );
  });

  it("does not route reminder creation to settings", () => {
    expect(isNotificationSettingsRequest("Remind me to drink water")).toBe(false);
    expect(isNotificationSettingsRequest("Notify me every day at 2pm")).toBe(
      false,
    );
    expect(resolveAppFeatureNavTarget("Create a reminder for 10am")).toBeNull();
    expect(resolveAppFeatureNavTarget("I need a reminder to drink water")).toBeNull();
  });
});
