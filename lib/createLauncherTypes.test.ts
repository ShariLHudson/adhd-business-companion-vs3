import { describe, expect, it } from "vitest";
import {
  resolveCreateLauncherType,
  CREATE_LAUNCHER_TYPE_OPTIONS,
} from "./createLauncherTypes";
import { OTHER_OPTION } from "./createTypePickers";

describe("createLauncherTypes", () => {
  it("lists the companion-first create options", () => {
    expect(CREATE_LAUNCHER_TYPE_OPTIONS).toContain("Email");
    expect(CREATE_LAUNCHER_TYPE_OPTIONS).toContain("Workshop");
    expect(CREATE_LAUNCHER_TYPE_OPTIONS.at(-1)).toBe(OTHER_OPTION);
  });

  it("maps social media post to catalog social post", () => {
    expect(resolveCreateLauncherType("Social Media Post").catalogLabel).toBe(
      "Social Post",
    );
  });

  it("passes through catalog-aligned labels", () => {
    expect(resolveCreateLauncherType("Blog Post").catalogLabel).toBe("Blog Post");
  });

  it("maps custom display to other option", () => {
    expect(resolveCreateLauncherType("Custom").catalogLabel).toBe(OTHER_OPTION);
  });
});
