import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  COMPANION_LOGIN_BACKGROUND,
  COMPANION_LOGIN_BACKGROUND_PATH,
} from "@/lib/companionLoginPage";
import { WELCOME_HOME_LOGIN_BACKGROUND } from "@/lib/estate/welcomeHomeGuidebookAssets";
import { resolveWelcomeHomeHeroImageUrl } from "@/lib/welcomeHome/resolveWelcomeHomeHeroImageUrl";
import {
  WELCOME_HOME_BACKGROUND,
  WELCOME_ROOM_ASSET,
} from "@/lib/welcomeRoom/types";

describe("login vs Welcome Home background separation", () => {
  it("login uses welcome-to-spark-estate-background.PNG", () => {
    expect(COMPANION_LOGIN_BACKGROUND_PATH).toBe(
      "/backgrounds/welcome-to-spark-estate-background.PNG",
    );
    expect(WELCOME_HOME_LOGIN_BACKGROUND).toBe(COMPANION_LOGIN_BACKGROUND_PATH);
    expect(COMPANION_LOGIN_BACKGROUND.startsWith(COMPANION_LOGIN_BACKGROUND_PATH)).toBe(
      true,
    );
    expect(
      existsSync(
        path.join(
          process.cwd(),
          "public/backgrounds/welcome-to-spark-estate-background.PNG",
        ),
      ),
    ).toBe(true);
  });

  it("Welcome Home uses welcome-home-background.png", () => {
    expect(WELCOME_HOME_BACKGROUND).toMatch(
      /\/backgrounds\/welcome-home-background\.png\?v=/,
    );
    expect(WELCOME_ROOM_ASSET).toBe(WELCOME_HOME_BACKGROUND);
    expect(resolveWelcomeHomeHeroImageUrl()).toContain(
      "welcome-home-background.png",
    );
    expect(
      existsSync(
        path.join(process.cwd(), "public/backgrounds/welcome-home-background.png"),
      ),
    ).toBe(true);
  });

  it("does not cross-assign the two experiences", () => {
    expect(COMPANION_LOGIN_BACKGROUND).not.toMatch(/welcome-home-background\.png/);
    expect(WELCOME_HOME_BACKGROUND).not.toMatch(
      /welcome-to-spark-estate-background/i,
    );
    expect(COMPANION_LOGIN_BACKGROUND_PATH).not.toBe(
      "/backgrounds/welcome-home-background.png",
    );
  });
});
