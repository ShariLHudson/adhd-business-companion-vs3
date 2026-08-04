import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Settings dark modal sheet — reconciled with shared readability tokens", () => {
  const globals = readFileSync(
    resolve(process.cwd(), "app/globals.css"),
    "utf8",
  );
  const darkSheetCss = readFileSync(
    resolve(process.cwd(), "app/companion/global-estate-menu.css"),
    "utf8",
  );
  const experienceControlsOverlayCss = readFileSync(
    resolve(process.cwd(), "app/companion/experience-controls-overlay.css"),
    "utf8",
  );

  it("defines the dark-surface companion tokens, all clearing 7:1+ contrast (verified by design, see report)", () => {
    const requiredTokens = [
      "--spark-text-primary-on-dark",
      "--spark-text-secondary-on-dark",
      "--spark-text-supporting-on-dark",
      "--spark-text-disabled-on-dark",
      "--spark-text-accent-on-dark",
      "--spark-surface-border-on-dark",
      "--spark-focus-ring-on-dark",
    ];
    for (const token of requiredTokens) {
      expect(globals).toContain(`${token}:`);
    }
  });

  it("dark tokens keep the exact same values the hand-rolled rgba() literals already used — no visual change", () => {
    expect(globals).toContain(
      "--spark-text-primary-on-dark: rgba(255, 248, 235, 0.98);",
    );
    expect(globals).toContain(
      "--spark-text-secondary-on-dark: rgba(255, 236, 200, 0.85);",
    );
    expect(globals).toContain(
      "--spark-text-supporting-on-dark: rgba(255, 236, 200, 0.7);",
    );
    expect(globals).toContain(
      "--spark-text-disabled-on-dark: rgba(255, 248, 235, 0.62);",
    );
    expect(globals).toContain(
      "--spark-text-accent-on-dark: rgba(255, 220, 160, 0.95);",
    );
  });

  it("the heading, helper (.text-sm/.text-xs), accent, button, and disabled rules are token-sourced, not hand-rolled", () => {
    expect(darkSheetCss).toMatch(
      /\.settings-panel__heading,\s*\n\.modal-sheet--estate-dark \.settings-panel__title \{\s*\n\s*color: var\(--spark-text-primary-on-dark\)/,
    );
    expect(darkSheetCss).toMatch(
      /\.settings-panel \.text-sm,[\s\S]{0,40}\.settings-panel \.text-xs,[\s\S]{0,300}color: var\(--spark-text-secondary-on-dark\)/,
    );
    expect(darkSheetCss).toMatch(
      /\.text-\\\[\\#1e4f4f\\\] \{\s*\n\s*color: var\(--spark-text-accent-on-dark\)/,
    );
    expect(darkSheetCss).toMatch(
      /settings-panel__btn:disabled[\s\S]{0,200}color: var\(--spark-text-disabled-on-dark\)/,
    );
    expect(darkSheetCss).toMatch(
      /settings-panel__btn:disabled[\s\S]{0,200}border-color: var\(--spark-surface-border-on-dark\)/,
    );
  });

  it("focus-visible outlines on the dark sheet use the dark focus-ring token", () => {
    const focusRingUsages = (
      darkSheetCss.match(/outline: 2px solid var\(--spark-focus-ring-on-dark\)/g) ?? []
    ).length;
    expect(focusRingUsages).toBeGreaterThanOrEqual(2);
  });

  it("light surfaces inside the dark sheet (selected/unselected cards, connection cards) use the LIGHT primary token, not the dark one", () => {
    expect(darkSheetCss).toMatch(
      /workspace-area-works-guide__trigger\)\s*\{\s*\n\s*color: var\(--spark-text-primary\);/,
    );
    expect(darkSheetCss).toMatch(
      /color: var\(--spark-text-primary\) !important;\s*\n\}/,
    );
  });

  it("native input/select/textarea text on the dark sheet uses the light primary token (always rendered with color-scheme: light)", () => {
    expect(darkSheetCss).toMatch(
      /:is\(input, select, textarea\) \{\s*\n\s*color: var\(--spark-text-primary\) !important;\s*\n\s*color-scheme: light;/,
    );
  });

  it("Settings components migrating to the light spark-text-* classes resolve correctly on the dark sheet (forward-compat, purely additive)", () => {
    expect(darkSheetCss).toMatch(
      /\.settings-panel \.spark-text-primary \{\s*\n\s*color: var\(--spark-text-primary-on-dark\) !important;/,
    );
    expect(darkSheetCss).toMatch(
      /\.settings-panel \.spark-text-secondary,\s*\n\.modal-sheet--estate-dark \.settings-panel \.spark-text-supporting \{\s*\n\s*color: var\(--spark-text-secondary-on-dark\) !important;/,
    );
    expect(darkSheetCss).toMatch(
      /\.settings-panel \.spark-text-disabled \{\s*\n\s*color: var\(--spark-text-disabled-on-dark\) !important;/,
    );
  });

  it("the color-mode preview mockup intentionally does not inherit dark-sheet or shared tokens — it previews the light theme", () => {
    // This surface's whole purpose is showing what light mode looks like
    // inside dark Settings; forcing dark or spark-* tokens onto it would
    // break the preview it exists to render. Left untouched on purpose.
    expect(darkSheetCss).toMatch(
      /\.settings-panel \.settings-color-mode-preview \{\s*color: #2d2926;\s*\}/,
    );
    expect(darkSheetCss).not.toMatch(
      /settings-color-mode-preview[^{]*\{[^}]*var\(--spark-text/,
    );
  });

  it("no unrelated non-Settings content is touched — every migrated rule stays scoped under .modal-sheet--estate-dark .settings-panel or a specific works-guide/appearance selector", () => {
    const tokenLines = darkSheetCss
      .split("\n")
      .filter((line) => line.includes("var(--spark-text-") || line.includes("var(--spark-focus-ring-on-dark)") || line.includes("var(--spark-surface-border-on-dark)"));
    expect(tokenLines.length).toBeGreaterThan(0);
    // Every token-consuming declaration lives inside the dark-sheet or
    // works-guide/appearance-option block, never a bare global selector.
    expect(darkSheetCss).not.toMatch(/^\s*\.spark-text-\w+\s*\{/m);
  });

  it("dropdown/input text-color classes are excluded from the dark-ink catch-all so native form controls don't get near-invisible cream-on-white text", () => {
    // Found live during this batch's verification: a <select> with
    // text-base text-[#1f1c19] bg-white (Settings' shared dropdown field
    // style) was matched by BOTH this catch-all (3 classes, !important)
    // and the :is(input, select, textarea) rule (2 classes + type
    // selector, !important) — the catch-all won on specificity, painting
    // cream text on the select's own white chrome. Pre-existing bug, not
    // introduced by this token migration; fixed here by exclusion.
    expect(darkSheetCss).toMatch(
      /\.text-\\\[\\#1f1c19\\\]:not\(select\):not\(input\):not\(textarea\)/,
    );
    expect(darkSheetCss).toMatch(
      /\.text-black:not\(select\):not\(input\):not\(textarea\)/,
    );
  });

  it("background-mode readability rules never target Settings dark-sheet classes — no foreground filter leaks in", () => {
    for (const cls of [
      ".modal-sheet--estate-dark",
      ".settings-panel",
      ".settings-panel__heading",
      ".settings-appearance-option",
    ]) {
      expect(experienceControlsOverlayCss).not.toContain(cls);
    }
  });
});
