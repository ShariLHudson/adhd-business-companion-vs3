/**
 * My Spark Estate dropdown — three sibling destinations.
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

  it("nests approved destinations under My Spark Estate", () => {
    const group = ESTATE_MENU_DROPDOWN_ENTRIES.find(
      (entry) => entry.kind === "group" && entry.id === "my-spark-estate",
    );
    expect(group?.kind).toBe("group");
    if (group?.kind !== "group") return;
    expect(group.children.map((child) => child.label)).toEqual(
      SPARK_ESTATE_PROFILE_MENU_PROFILE_ITEMS.map((item) => item.label),
    );
    expect(group.children.map((child) => child.id)).toEqual([
      "my-business-estate",
      "people-i-help",
      "my-profile",
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

  it("mounts dedicated panels through ProfileDestinationHost", () => {
    expect(companion).toMatch(/<ProfileDestinationHost/);
    expect(companion).toMatch(/isProfileDestinationOverlay\(overlay\)/);
    expect(companion).toContain("!profileDestinationActive");
    expect(companion).toContain("profileDestinationForMenuAction");
  });
});
