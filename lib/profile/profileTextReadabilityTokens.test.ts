import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("My Profile text tokens — reconciled with shared Spark readability tokens", () => {
  const globals = readFileSync(
    resolve(process.cwd(), "app/globals.css"),
    "utf8",
  );
  const profileCss = readFileSync(
    resolve(process.cwd(), "app/companion/my-profile-panel.css"),
    "utf8",
  );
  const settingsSelectedCss = readFileSync(
    resolve(process.cwd(), "app/companion/global-estate-menu.css"),
    "utf8",
  );
  const experienceControlsOverlayCss = readFileSync(
    resolve(process.cwd(), "app/companion/experience-controls-overlay.css"),
    "utf8",
  );
  const estateWorkspaceCss = readFileSync(
    resolve(process.cwd(), "app/companion/estate-workspace.css"),
    "utf8",
  );

  it("defines a light-mode accent token, completing the pair with the existing dark-mode accent", () => {
    expect(globals).toContain("--spark-text-accent: #1e4f4f;");
    expect(globals).toContain("--spark-text-accent-on-dark:");
    expect(globals).toMatch(
      /\.spark-text-accent \{\s*color: var\(--spark-text-accent\);\s*\}/,
    );
  });

  it("removes all four duplicate --profile-text-* definitions — no remaining consumers", () => {
    for (const token of [
      "--profile-text-primary",
      "--profile-text-secondary",
      "--profile-text-heading",
      "--profile-text-muted",
    ]) {
      expect(profileCss).not.toContain(token);
    }
  });

  it("keeps the profile-specific surface/button tokens untouched — out of this batch's text-only scope", () => {
    expect(profileCss).toContain("--profile-surface: rgba(255, 252, 247, 0.96);");
    expect(profileCss).toContain("--profile-border: rgba(46, 46, 46, 0.18);");
    expect(profileCss).toContain("--profile-input-bg: #fffdf9;");
    expect(profileCss).toContain("--profile-button-fill: #0f6f7c;");
    expect(profileCss).toContain("--profile-button-fill-text: #fffdf9;");
  });

  it("primary role (body text, field values, avatar fallback wrapper) resolves through spark-text-primary", () => {
    const usages = (profileCss.match(/color: var\(--spark-text-primary\)/g) ?? [])
      .length;
    expect(usages).toBeGreaterThanOrEqual(5);
  });

  it("secondary role (lead paragraph, field labels, section descriptions) resolves through spark-text-secondary", () => {
    const usages = (
      profileCss.match(/color: var\(--spark-text-secondary\)/g) ?? []
    ).length;
    expect(usages).toBeGreaterThanOrEqual(4);
    expect(profileCss).toMatch(
      /\.my-profile-panel__lead \{[\s\S]*?color: var\(--spark-text-secondary\)/,
    );
  });

  it("supporting role (image-help text and input placeholders) resolves through spark-text-supporting, not the old higher-contrast muted grey", () => {
    expect(profileCss).toMatch(
      /\.my-profile-panel__image-help \{[\s\S]*?color: var\(--spark-text-supporting\)/,
    );
    expect(profileCss).toMatch(
      /::placeholder \{\s*color: var\(--spark-text-supporting\)/,
    );
  });

  it("heading/accent role (headings, avatar initials, focus outlines, hover accents) resolves through the new spark-text-accent token, matching the app's one established teal instead of its own slightly different shade", () => {
    const usages = (profileCss.match(/var\(--spark-text-accent\)/g) ?? [])
      .length;
    // Title, kicker override, back button (rest + focus), avatar +
    // initials, image-btn hover/focus, field focus outline + border,
    // primary button focus, saved message, section-title, link hover +
    // focus — comfortably double digits.
    expect(usages).toBeGreaterThanOrEqual(10);
  });

  it("the old heading-derived hover-border rgba is updated to match the new accent hue instead of clashing with it", () => {
    expect(profileCss).not.toContain("rgba(15, 111, 124");
    expect(profileCss).toContain("rgba(30, 79, 79, 0.45)");
  });

  it("disabled buttons remain distinct via existing opacity dimming — unchanged by this batch, still readable (not near-invisible)", () => {
    expect(profileCss).toMatch(
      /:disabled \{\s*opacity: 0\.55;\s*cursor: not-allowed;\s*\}/,
    );
  });

  it("unrelated Settings/Estate surfaces are unaffected — this batch touched only my-profile-panel.css and the token definitions", () => {
    expect(settingsSelectedCss).not.toContain("--profile-text");
    expect(estateWorkspaceCss).not.toContain("--profile-text");
    expect(experienceControlsOverlayCss).not.toContain("my-profile");
    expect(experienceControlsOverlayCss).not.toContain(".spark-text-accent");
  });
});
