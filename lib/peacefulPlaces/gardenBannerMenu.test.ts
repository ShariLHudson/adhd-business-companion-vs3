import { describe, expect, it } from "vitest";
import { gardenBannerMenuFor } from "./gardenBannerMenu";

describe("gardenBannerMenu", () => {
  it("curates focus tools and music room", () => {
    const menu = gardenBannerMenuFor("focus");
    expect(menu.map((item) => item.label)).toEqual([
      "First Step Finder",
      "Priority Sort",
      "Break It Down",
      "Music Room",
    ]);
    expect(menu[3]).toMatchObject({ kind: "soundscape", soundscapeId: "deep-focus-piano" });
  });

  it("curates slow down restoration destinations", () => {
    const menu = gardenBannerMenuFor("calming");
    expect(menu.map((item) => item.label)).toEqual([
      "Pause & Reset",
      "Breathe",
      "Quiet Moment",
    ]);
    expect(menu[1]).toMatchObject({ kind: "section", section: "breathe" });
  });

  it("places nature escape on recharge", () => {
    const menu = gardenBannerMenuFor("energize");
    expect(menu.map((item) => item.label)).toEqual([
      "Nature Escape",
      "Sunshine Break",
      "Energy Reset",
    ]);
    expect(menu[0]).toMatchObject({ kind: "soundscape", soundscapeId: "nature-escape" });
  });

  it("curates unwind evening destinations", () => {
    const menu = gardenBannerMenuFor("unwind");
    expect(menu.map((item) => item.label)).toEqual([
      "Bedroom Window",
      "Evening Hearth",
      "Woodland Path",
      "Moonlit Shore",
    ]);
  });

  it("uses my peaceful places copy on my places banner", () => {
    const menu = gardenBannerMenuFor("my-places");
    expect(menu.map((item) => item.label)).toEqual([
      "My Peaceful Places",
      "Add a New Place",
      "Manage My Places",
    ]);
  });
});
