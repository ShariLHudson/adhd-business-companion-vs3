/**
 * 113–115 — My Business Estate / My Profile open path + Profile dark text.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  isProfileDestinationOverlay,
  profileDestinationForMenuAction,
  resolveProfileDestinationNavigation,
} from "@/lib/profile/profileDestination";

function read(pathFromRoot: string): string {
  return readFileSync(resolve(process.cwd(), pathFromRoot), "utf8");
}

describe("profile destination open path (113)", () => {
  it("maps SH menu actions to independent destinations", () => {
    expect(profileDestinationForMenuAction("my-business-estate")).toBe(
      "my-business-estate",
    );
    expect(profileDestinationForMenuAction("my-profile")).toBe(
      "profile-personal",
    );
    expect(
      resolveProfileDestinationNavigation("my-business-estate").kind,
    ).toBe("my-business-estate-overlay");
    expect(
      resolveProfileDestinationNavigation("profile-personal").kind,
    ).toBe("profile-personal-overlay");
  });

  it("CompanionPageClient overlay union includes both SH destinations", () => {
    const companion = read("app/companion/CompanionPageClient.tsx");
    expect(companion).toContain('| "my-business-estate"');
    expect(companion).toContain('| "profile-personal"');
    expect(companion).toContain(
      "const profileDestinationActive = isProfileDestinationOverlay(overlay)",
    );
    expect(companion).toMatch(
      /overlay === "profile" \|\| overlay === "my-business-estate"/,
    );
  });

  it("menu closeAndRun runs action before close", () => {
    const menu = read("components/companion/GlobalEstateMenu.tsx");
    expect(menu).toContain("closeAndRun");
    expect(menu).toMatch(
      /onActionRef\.current\(actionId\);[\s\S]{0,40}?close\(\)/,
    );
  });

  it("ProfileDestinationHost mounts one panel per destination", () => {
    const host = read("components/companion/ProfileDestinationHost.tsx");
    expect(host).toContain('canonical === "profile-personal"');
    expect(host).toContain('canonical === "my-business-estate"');
    expect(host).toContain("MyProfilePanel");
    expect(host).toContain("MyBusinessEstatePanel");
    expect(isProfileDestinationOverlay("my-business-estate")).toBe(true);
    expect(isProfileDestinationOverlay("profile-personal")).toBe(true);
  });

  it("Business Estate room plate stays contained in the host", () => {
    const shell = read("components/companion/MyBusinessEstateRoomShell.tsx");
    const css = read("app/companion/my-business-estate.css");
    expect(shell).toContain('placement="absolute"');
    const cinematicBlock = css.match(
      /\.my-business-estate-room__cinematic\s*\{[^}]+\}/,
    )?.[0];
    expect(cinematicBlock).toBeTruthy();
    expect(cinematicBlock).toMatch(/position:\s*absolute/);
    expect(cinematicBlock).not.toMatch(/position:\s*fixed/);
  });
});

describe("My Profile dark text readability (113)", () => {
  const css = read("app/companion/my-profile-panel.css");

  it("owns dark profile text tokens", () => {
    expect(css).toContain("--profile-text-primary: #2e2e2e");
    expect(css).toContain("--profile-text-secondary: #454545");
    expect(css).toContain("--profile-text-heading: #0f6f7c");
    expect(css).toContain("--profile-text-muted: #5f5f5f");
  });

  it("does not force near-white text on profile surfaces", () => {
    expect(css).not.toContain("rgba(255, 250, 242");
    expect(css).not.toContain("color: inherit");
    expect(css).not.toMatch(/opacity:\s*0\.(7|8|85)/);
  });

  it("applies dark colors to labels, inputs, buttons, and helpers", () => {
    expect(css).toContain(".my-profile-panel__lead");
    expect(css).toContain(".my-profile-panel__field span");
    expect(css).toContain(".my-profile-panel__field input");
    expect(css).toContain("::placeholder");
    expect(css).toContain(".my-profile-panel__primary");
    expect(css).toContain(".my-profile-panel__link");
    expect(css).toContain(".my-profile-panel__section-title");
    expect(css).toMatch(
      /\.my-profile-panel__field span\s*\{[\s\S]*?color:\s*var\(--profile-text-secondary\)/,
    );
    expect(css).toMatch(
      /\.my-profile-panel__field input[\s\S]*?color:\s*var\(--profile-text-primary\)/,
    );
  });
});
