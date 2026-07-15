import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  COMPANION_LOGIN_BACKGROUND,
  COMPANION_LOGIN_BACKGROUND_PATH,
  COMPANION_LOGIN_FORGOT_PASSWORD_LABEL,
  COMPANION_LOGIN_LOGO,
  COMPANION_LOGIN_OPENING_MESSAGE,
  COMPANION_LOGIN_PRIVACY_LINE,
  companionLoginHeadline,
  companionLoginSubtext,
} from "./companionLoginPage";
import { WELCOME_HOME_BACKGROUND } from "@/lib/welcomeRoom/types";

describe("companion login page", () => {
  it("uses Welcome to Spark Estate login background with uppercase PNG", () => {
    expect(COMPANION_LOGIN_BACKGROUND_PATH).toBe(
      "/backgrounds/welcome-to-spark-estate-background.PNG",
    );
    expect(COMPANION_LOGIN_BACKGROUND).toMatch(
      /\/backgrounds\/welcome-to-spark-estate-background\.PNG\?v=/,
    );
    expect(COMPANION_LOGIN_BACKGROUND).not.toMatch(/welcome-home-background/i);
    expect(COMPANION_LOGIN_BACKGROUND).not.toMatch(/welcome-home-front-door/i);
  });

  it("ships welcome-to-spark-estate-background.PNG file", () => {
    expect(
      fs.existsSync(
        path.join(
          process.cwd(),
          "public/backgrounds/welcome-to-spark-estate-background.PNG",
        ),
      ),
    ).toBe(true);
  });

  it("keeps login background separate from Welcome Home lobby art", () => {
    expect(WELCOME_HOME_BACKGROUND).toMatch(/welcome-home-background\.png/);
    expect(COMPANION_LOGIN_BACKGROUND).not.toContain(
      "welcome-home-background.png",
    );
  });

  it("uses official transparent brand logo", () => {
    expect(COMPANION_LOGIN_LOGO).toMatch(/ssc-logo-no-background\.jpg$/);
  });

  it("shows first-time welcome copy without relationship assumptions", () => {
    expect(companionLoginHeadline("first")).toBe("Welcome.");
    expect(companionLoginSubtext("first")).toBe("I'm glad you're here.");
    expect(companionLoginSubtext("first")).not.toMatch(/pick up|continue|left off/i);
  });

  it("shows returning welcome copy with history only when appropriate", () => {
    expect(companionLoginHeadline("returning")).toBe("Welcome back.");
    expect(companionLoginSubtext("returning", true)).toMatch(
      /continue where we left off/i,
    );
    expect(companionLoginSubtext("returning", false)).toBe(
      "It's nice to see you again.",
    );
  });

  it("includes privacy reassurance", () => {
    expect(COMPANION_LOGIN_PRIVACY_LINE).toMatch(/privacy/i);
  });

  it("includes slow-loading transition copy options", () => {
    expect(COMPANION_LOGIN_OPENING_MESSAGE).toMatch(/opening your space/i);
  });

  it("uses universal forgot password label", () => {
    expect(COMPANION_LOGIN_FORGOT_PASSWORD_LABEL).toBe("Forgot password?");
  });
});
