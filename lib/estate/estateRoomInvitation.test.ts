import { describe, expect, it } from "vitest";
import {
  estatePresenceGreeting,
  resolveEstateRoomInvitationSet,
  resolveEstateRoomInvitations,
} from "./estateRoomInvitation";

describe("estateRoomInvitation", () => {
  it("offers conservatory concierge suggestions with universal closers", () => {
    const set = resolveEstateRoomInvitationSet("conservatory");
    const labels = set.items.map((item) => item.label);
    expect(labels).toContain("Clear My Mind");
    expect(labels).toContain("Journal Gazebo");
    expect(labels).toContain("Peaceful Places");
    expect(labels).toContain("Talk with Shari");
    expect(labels).toContain("Visit Another Room");
    expect(labels).not.toContain("Just Talk with Shari");
    expect(set.primaryEndIndex).toBe(4);
    expect(set.items.length - set.primaryEndIndex).toBe(1);
    expect(labels.indexOf("Clear My Mind")).toBeLessThan(
      labels.indexOf("Talk with Shari"),
    );
  });

  it("caps primary suggestions at five including dynamic slots", () => {
    const items = resolveEstateRoomInvitations("momentum-institute");
    const primaryCount = items.filter(
      (i) => i.tier === "dynamic" || i.tier === "primary",
    ).length;
    expect(primaryCount).toBeLessThanOrEqual(5);
    expect(items.filter((i) => i.tier === "universal").length).toBe(3);
  });

  it("welcome home skips sit-here closer", () => {
    const labels = resolveEstateRoomInvitations("welcome-home").map(
      (i) => i.label,
    );
    expect(labels).toContain("Plan My Day");
    expect(labels).toContain("Just Chat with Shari");
    expect(labels).not.toContain("I'm Happy Just Being Here");
  });

  it("returns stable presence greetings", () => {
    expect(estatePresenceGreeting("conservatory")).toMatch(
      /glad|slow|accomplish|enjoy|moment/i,
    );
  });
});
