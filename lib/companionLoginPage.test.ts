import { describe, expect, it } from "vitest";
import {
  COMPANION_LOGIN_BACKGROUND,
  COMPANION_LOGIN_FORGOT_PASSWORD_LABEL,
  COMPANION_LOGIN_LOGO,
  COMPANION_LOGIN_OPENING_MESSAGE,
  COMPANION_LOGIN_PRIVACY_LINE,
  companionLoginHeadline,
  companionLoginSubtext,
} from "./companionLoginPage";

describe("companion login page", () => {
  it("uses login welcome background asset", () => {
    expect(COMPANION_LOGIN_BACKGROUND).toMatch(/login-welcome-background\.png\?v=/);
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
