import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../..");

describe("profile return context wiring", () => {
  it("CompanionPageClient captures origin, restores on return, clears on Welcome Home", () => {
    const source = readFileSync(
      join(root, "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain("captureProfileLeaveOrigin");
    expect(source).toContain("returnToProfileOrigin");
    expect(source).toContain("closeSettingsOverlay");
    expect(source).toContain("onReturnToProfileOrigin={returnToProfileOrigin}");
    expect(source).toMatch(/returnToWelcomeHomeLobby[\s\S]*clearNavigationOrigin/);
    expect(source).toContain('captureProfileLeaveOrigin("settings")');
    expect(source).toContain('captureProfileLeaveOrigin("people-i-help")');
  });

  it("ProfileDestinationHost mounts the return bar", () => {
    const source = readFileSync(
      join(root, "components/companion/ProfileDestinationHost.tsx"),
      "utf8",
    );
    expect(source).toContain("ProfileReturnBar");
    expect(source).toContain("onReturnToProfileOrigin");
  });

  it("My Profile persists draft across leave", () => {
    const source = readFileSync(
      join(root, "components/companion/MyProfilePanel.tsx"),
      "utf8",
    );
    expect(source).toContain("saveProfilePersonalDraft");
    expect(source).toContain("loadProfilePersonalDraft");
    expect(source).toContain("clearProfilePersonalDraft");
  });
});
