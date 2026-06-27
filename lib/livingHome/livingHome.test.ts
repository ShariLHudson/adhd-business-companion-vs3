import { describe, expect, it } from "vitest";
import { evaluateLivingHome } from "./evaluateLivingHome";
import { resolveLivingHomeLifeEvents } from "./lifeEvents";
import { livingHomeTimeProfileFromPeriod } from "./timeOfDay";
import { resolveLivingHomeSeason } from "./season";
import { LIVING_HOME_PERMANENT_ELEMENTS, LIVING_HOME_PRINCIPLE } from "./types";

describe("Living Home", () => {
  it("declares constitutional principle and permanent home elements", () => {
    expect(LIVING_HOME_PRINCIPLE).toMatch(/One Home/i);
    expect(LIVING_HOME_PERMANENT_ELEMENTS).toContain("Porch swing");
    expect(LIVING_HOME_PERMANENT_ELEMENTS).toContain(
      "Shari standing just inside the doorway",
    );
  });

  it("maps homestead golden hour to living home time profile", () => {
    expect(livingHomeTimeProfileFromPeriod("golden-hour")).toBe("golden-hour");
    expect(livingHomeTimeProfileFromPeriod("dawn")).toBe("early-morning");
  });

  it("uses hemisphere-aware seasons", () => {
    const julyUs = resolveLivingHomeSeason("US", new Date(2026, 6, 15));
    const julyAu = resolveLivingHomeSeason("AU", new Date(2026, 6, 15));
    expect(julyUs.season).toBe("summer");
    expect(julyAu.season).toBe("winter");
  });

  it("detects tasteful life events independently", () => {
    expect(resolveLivingHomeLifeEvents(new Date(2026, 11, 24))).toContain(
      "christmas",
    );
    expect(resolveLivingHomeLifeEvents(new Date(2026, 9, 31))).toContain(
      "halloween",
    );
  });

  it("evaluates modular layers for login surface", () => {
    const state = evaluateLivingHome({
      now: new Date(2026, 9, 15, 17, 30),
      surface: "login",
      region: "US",
    });
    expect(state.surface).toBe("login");
    expect(state.timeProfile).toBe("golden-hour");
    expect(state.season).toBe("autumn");
    expect(state.weather).toBe("sunny");
    expect(state.shariPresence.placement).toBe("inside-doorway");
    expect(state.cssVars["--lh-porch-light"]).toBeDefined();
    expect(state.dataAttributes["data-living-home-surface"]).toBe("login");
  });

  it("brightens doorway when openingDoor is true", () => {
    const calm = evaluateLivingHome({
      now: new Date(2026, 5, 10, 20, 0),
      openingDoor: false,
    });
    const opening = evaluateLivingHome({
      now: new Date(2026, 5, 10, 20, 0),
      openingDoor: true,
    });
    expect(Number(opening.cssVars["--lh-indoor-glow"])).toBeGreaterThan(
      Number(calm.cssVars["--lh-indoor-glow"]),
    );
    expect(opening.dataAttributes["data-living-home-opening"]).toBe("true");
  });

  it("disables motion when reducedMotion is requested", () => {
    const state = evaluateLivingHome({ reducedMotion: true });
    expect(state.motion.swing).toBe(false);
    expect(state.motion.strength).toBe(0);
    expect(state.dataAttributes["data-living-home-reduced-motion"]).toBe("true");
  });

  it("defaults weather to sunny until provider is wired", () => {
    const state = evaluateLivingHome({ weather: null });
    expect(state.weather).toBe("sunny");
  });
});
