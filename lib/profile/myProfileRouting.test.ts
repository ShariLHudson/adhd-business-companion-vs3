/**
 * Contract: SH → My Profile must open profile-personal, never Business Estate.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  profileDestinationForMenuAction,
  resolveProfileDestinationNavigation,
} from "@/lib/profile/profileDestination";
import { ESTATE_MENU_DROPDOWN_ENTRIES } from "@/lib/estateMenu/menuConfig";

describe("My Profile routing contract", () => {
  const companion = readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );
  const host = readFileSync(
    resolve(process.cwd(), "components/companion/ProfileDestinationHost.tsx"),
    "utf8",
  );
  const panel = readFileSync(
    resolve(process.cwd(), "components/companion/MyProfilePanel.tsx"),
    "utf8",
  );

  it("menu lists My Profile as my-profile sibling of business estate", () => {
    const group = ESTATE_MENU_DROPDOWN_ENTRIES.find(
      (entry) => entry.kind === "group" && entry.id === "my-spark-estate",
    );
    expect(group?.kind).toBe("group");
    if (group?.kind !== "group") return;
    expect(group.children.map((child) => child.id)).toEqual([
      "my-business-estate",
      "people-i-help",
      "my-profile",
    ]);
  });

  it("maps my-profile action only to profile-personal", () => {
    expect(profileDestinationForMenuAction("my-profile")).toBe(
      "profile-personal",
    );
    expect(
      resolveProfileDestinationNavigation("profile-personal").destinationId,
    ).toBe("profile-personal");
    expect(
      resolveProfileDestinationNavigation("profile-personal").destinationId,
    ).not.toBe("my-business-estate");
  });

  it("CompanionPageClient routes My Spark Estate actions through explicit mapper", () => {
    expect(companion).toContain("profileDestinationForMenuAction(actionId)");
    expect(companion).toContain('setOverlay("profile-personal")');
    expect(companion).toContain('setOverlay("my-business-estate")');
    expect(companion).toMatch(
      /case \"profile-personal-overlay\":\s*setOverlay\(\"profile-personal\"\)/,
    );
    expect(companion).toMatch(
      /case \"my-business-estate-overlay\":\s*setOverlay\(\"my-business-estate\"\)/,
    );
    // No silent default setOverlay("profile") after the personal/business cases
    expect(companion).not.toMatch(
      /case \"profile-personal-overlay\"[\s\S]{0,200}?setOverlay\(\"profile\"\);/,
    );
  });

  it("host mounts MyProfilePanel for profile-personal only", () => {
    expect(host).toContain('canonical === "profile-personal"');
    expect(host).toContain("MyProfilePanel");
    expect(host).toContain('canonical === "my-business-estate"');
    expect(host).toContain("MyBusinessEstatePanel");
    expect(host).not.toContain('destination === "profile"');
  });

  it("My Profile panel is not the Business Estate room shell", () => {
    expect(panel).toContain('data-testid="my-profile-destination"');
    expect(panel).toContain("My Profile");
    expect(panel).not.toContain("MyBusinessEstateRoomShell");
    expect(panel).not.toContain("my-business-estate-room");
    expect(panel).not.toContain("my-business-estate-panel");
    expect(panel).not.toContain("MyBusinessEstatePanel");
  });
});

