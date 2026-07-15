import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getEstateGuideSpread } from "@/data/estateGuideSpreads";
import { COMPANION_LOGIN_BACKGROUND } from "@/lib/companionLoginPage";
import {
  WELCOME_HOME_GUIDEBOOK_PLATE,
  WELCOME_HOME_LOGIN_BACKGROUND,
} from "@/lib/estate/welcomeHomeGuidebookAssets";
import { expandEstateGuideToBookPages } from "@/lib/estate/estateGuidePages";

describe("welcome home guidebook vs login assets", () => {
  it("uses separate Guidebook and login paths", () => {
    expect(WELCOME_HOME_GUIDEBOOK_PLATE).toBe(
      "/Spark Estate Guidebook/welcome-home-front-door-guidebook.png",
    );
    expect(WELCOME_HOME_LOGIN_BACKGROUND).toBe(
      "/backgrounds/welcome-to-spark-estate-background.PNG",
    );
    expect(WELCOME_HOME_GUIDEBOOK_PLATE).not.toBe(WELCOME_HOME_LOGIN_BACKGROUND);
    expect(COMPANION_LOGIN_BACKGROUND).toContain(WELCOME_HOME_LOGIN_BACKGROUND);
    expect(COMPANION_LOGIN_BACKGROUND).not.toContain("guidebook");
    expect(COMPANION_LOGIN_BACKGROUND).not.toMatch(/welcome-home-background\.png/);
  });

  it("ships both files without sharing one blob", () => {
    const loginPath = path.join(
      process.cwd(),
      "public/backgrounds/welcome-to-spark-estate-background.PNG",
    );
    const guidePath = path.join(
      process.cwd(),
      "public/Spark Estate Guidebook/welcome-home-front-door-guidebook.png",
    );
    expect(fs.existsSync(loginPath)).toBe(true);
    expect(fs.existsSync(guidePath)).toBe(true);
    const login = fs.readFileSync(loginPath);
    const guide = fs.readFileSync(guidePath);
    expect(login.equals(guide)).toBe(false);
  });

  it("Welcome Home Guidebook spread uses the Guidebook plate and live title text", () => {
    const spread = getEstateGuideSpread("welcome-home");
    expect(spread).toBeDefined();
    expect(spread!.title).toBe("Welcome Home");
    expect(spread!.image).toBe(WELCOME_HOME_GUIDEBOOK_PLATE);
    expect(spread!.image).not.toBe(WELCOME_HOME_LOGIN_BACKGROUND);
    expect(spread!.image).not.toMatch(/welcome-home-background\.png/);

    const pages = expandEstateGuideToBookPages([spread!]);
    const photo = pages.find((page) => page.kind === "photo");
    expect(photo).toBeDefined();
    expect(photo!.spread.title).toBe("Welcome Home");
    // Title is page text once — not duplicated by a second title field.
    expect(photo!.spread.roomSubtitle ?? "").not.toMatch(/^Welcome Home$/i);
  });
});
