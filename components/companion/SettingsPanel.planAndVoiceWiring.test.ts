/**
 * Plan & Voice must not short-circuit server entitlement verification.
 * PlanAndVoiceSection's `plan` prop is a test-only override — passing it
 * from SettingsPanel in production skips the real server refresh
 * (refreshVoicePlanEntitlementFromServer), meaning a member's paid Voice
 * plan could never be confirmed. See PlanAndVoiceSection.tsx:69-94.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SETTINGS_PANEL = path.join(
  process.cwd(),
  "components/companion/SettingsPanel.tsx",
);

describe("SettingsPanel — Plan & Voice entitlement wiring", () => {
  it("renders PlanAndVoiceSection without a plan prop override, so the server refresh can run", () => {
    const source = readFileSync(SETTINGS_PANEL, "utf8");
    const match = source.match(/<PlanAndVoiceSection\b[^/]*\/>/);
    expect(match).toBeTruthy();
    expect(match?.[0]).not.toMatch(/\bplan=/);
  });
});
