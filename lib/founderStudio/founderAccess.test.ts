import { describe, expect, it } from "vitest";
import {
  canAccessFounderStudio,
  getFounderAllowedEmails,
  isFounderAllowedEmail,
} from "./founderAccess";

describe("founderAccess", () => {
  it("allows configured founder emails", () => {
    expect(isFounderAllowedEmail("shari@visualsparkstudios.com")).toBe(true);
    expect(isFounderAllowedEmail("SHARI@visualsparkstudios.com")).toBe(true);
    expect(isFounderAllowedEmail("member@example.com")).toBe(false);
  });

  it("exposes a non-empty allowlist", () => {
    expect(getFounderAllowedEmails().length).toBeGreaterThan(0);
  });

  it("denies unknown emails in production mode", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    expect(canAccessFounderStudio("stranger@example.com")).toBe(false);
    process.env.NODE_ENV = prev;
  });
});
