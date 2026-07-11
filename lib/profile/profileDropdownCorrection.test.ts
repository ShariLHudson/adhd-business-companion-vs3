/**
 * Profile dropdown correction — SH initials menu Profile group only.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ESTATE_MENU_DROPDOWN_ENTRIES,
  ESTATE_MENU_DROPDOWN_ITEMS,
} from "@/lib/estateMenu/menuConfig";
import { SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS } from "@/lib/estate/sparkEstateTopNavigationAndProfileMenu";

describe("profileDropdownCorrection", () => {
  const companion = readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );

  it("nests only approved destinations under the Profile group", () => {
    const profileGroup = ESTATE_MENU_DROPDOWN_ENTRIES.find(
      (entry) => entry.kind === "group" && entry.id === "profile",
    );
    expect(profileGroup?.kind).toBe("group");
    if (profileGroup?.kind !== "group") return;
    expect(profileGroup.children.map((child) => child.label)).toEqual(
      SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS.map((item) => item.label),
    );
    expect(profileGroup.children.map((child) => child.id)).toEqual([
      "my-profile",
      "people-i-help",
    ]);
  });

  it("does not expose Welcome Home destinations in the flat menu list", () => {
    const labels = ESTATE_MENU_DROPDOWN_ITEMS.map((item) => item.label);
    expect(labels).not.toContain("Evidence Vault");
    expect(labels).not.toContain("Journal Gazebo");
    expect(labels).not.toContain("Hall of Accomplishments");
    expect(labels).not.toContain("Portfolio");
    expect(labels).not.toContain("Growth Profile");
  });

  it("mounts dedicated panels instead of the My Estate chat shell", () => {
    expect(companion).toMatch(/<MyBusinessEstatePanel/);
    expect(companion).toMatch(/<PeopleIHelpPanel/);
    expect(companion).toMatch(/estateProfilePrimary \?/);
    expect(companion).toMatch(/peopleIHelpProfilePrimary \?/);
    expect(companion).not.toMatch(/From here/);
    expect(companion).not.toMatch(/onOpenDestination/);
  });
});
