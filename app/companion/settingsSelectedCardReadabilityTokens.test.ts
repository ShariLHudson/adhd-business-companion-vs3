import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Settings selectable cards — strengthened selected-state tokens", () => {
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
  const settingsPanel = readFileSync(
    resolve(process.cwd(), "components/companion/SettingsPanel.tsx"),
    "utf8",
  );
  const defaultPreferencePicker = readFileSync(
    resolve(
      process.cwd(),
      "components/companion/settings/defaults/DefaultPreferencePicker.tsx",
    ),
    "utf8",
  );
  const supportStylePanel = readFileSync(
    resolve(process.cwd(), "components/companion/SupportStylePanel.tsx"),
    "utf8",
  );
  const visualColorModePicker = readFileSync(
    resolve(process.cwd(), "components/companion/VisualColorModePicker.tsx"),
    "utf8",
  );

  it("defines strengthened dark-tier selected-surface tokens", () => {
    expect(globals).toContain(
      "--spark-surface-selected-bg-on-dark: rgba(201, 164, 108, 0.16);",
    );
    expect(globals).toContain(
      "--spark-surface-selected-border-on-dark: rgba(201, 164, 108, 0.7);",
    );
  });

  it("provides matching utility classes for the dark-tier selected surface and its focus ring", () => {
    expect(globals).toMatch(
      /\.spark-surface-selected-on-dark \{\s*background: var\(--spark-surface-selected-bg-on-dark\);\s*border-color: var\(--spark-surface-selected-border-on-dark\);\s*\}/,
    );
    expect(globals).toContain(".spark-focus-ring-on-dark:focus-visible {");
  });

  it("SettingsPanel's shared card (Planning, Celebrations, and the two toggle cards) uses the selected token, not the old faint teal tint", () => {
    expect(settingsPanel).not.toContain("border-[#1e4f4f] bg-[#1e4f4f]/[0.06]");
    const selectedUsages = (
      settingsPanel.match(/"spark-surface-selected"/g) ?? []
    ).length;
    expect(selectedUsages).toBeGreaterThanOrEqual(4);
  });

  it("SettingsPanel's shared CARD constant gives every card usage a visible keyboard focus ring", () => {
    expect(settingsPanel).toMatch(
      /const CARD =\s*\n\s*"spark-focus-ring w-full rounded-2xl border bg-white\/90/,
    );
  });

  it("DefaultPreferencePicker's selected option uses the shared token and focus-ring class instead of one-off outline utilities", () => {
    expect(defaultPreferencePicker).toContain(
      'spark-surface-selected text-[#1f1c19]"',
    );
    expect(defaultPreferencePicker).toMatch(/spark-focus-ring w-full rounded-lg/);
    // The main selectable option button no longer hand-rolls a focus outline
    // (the "connect to use" button is a separate, out-of-scope control that
    // still uses its own outline utilities — only this option button and
    // its dedicated CARD/CARD-equivalent classes were migrated).
    expect(defaultPreferencePicker).toMatch(
      /className=\{`spark-focus-ring w-full rounded-lg border px-3 py-2\.5 text-left text-sm font-semibold \$\{/,
    );
  });

  it("SupportStylePanel's list cards AND its previously checkmark-only Custom card both use the selected token", () => {
    expect(supportStylePanel).not.toContain("border-[#1e4f4f] bg-[#1e4f4f]/[0.06]");
    const selectedUsages = (
      supportStylePanel.match(/"spark-surface-selected"/g) ?? []
    ).length;
    // One for the list-card ternary, one for the Custom card ternary.
    expect(selectedUsages).toBeGreaterThanOrEqual(2);
    expect(supportStylePanel).toMatch(/spark-focus-ring w-full text-left/);
    expect(supportStylePanel).toMatch(
      /spark-focus-ring flex w-full items-center justify-between text-left/,
    );
  });

  it("VisualColorModePicker's dark selected card uses the dark-tier token and gains a focus ring it previously had none of", () => {
    expect(visualColorModePicker).not.toContain(
      "border-[rgba(201,164,108,0.55)] bg-[rgba(201,164,108,0.1)]",
    );
    expect(visualColorModePicker).toContain('"spark-surface-selected-on-dark"');
    expect(visualColorModePicker).toMatch(
      /settings-appearance-option spark-focus-ring-on-dark/,
    );
  });

  it("the checkmark is kept in every migrated component — selected state is never conveyed by color/token alone", () => {
    expect(settingsPanel).toContain("active && <span className=\"text-[#1e4f4f]\">✓</span>");
    expect(defaultPreferencePicker).toContain('aria-hidden="true"');
    expect(defaultPreferencePicker).toContain("✓");
    expect(supportStylePanel).toContain("✓");
    expect(visualColorModePicker).toContain("✓");
  });

  it("the dark-sheet's light-surface detection recognizes the new spark-surface-selected class, so selected-card text stays dark/readable instead of falling back to cream-on-light", () => {
    const usages = (darkSheetCss.match(/\.spark-surface-selected\b/g) ?? [])
      .length;
    // Self-referential + descendant-surface + descendant-text variants.
    expect(usages).toBe(3);
  });

  it("unrelated Settings surfaces are unaffected — the color-mode preview and dark-sheet heading/button rules are untouched", () => {
    expect(darkSheetCss).toContain(".settings-color-mode-preview {");
    expect(darkSheetCss).toContain(
      ".modal-sheet--estate-dark .settings-panel__heading,",
    );
  });

  it("background-mode readability rules never target the new selected-card classes — no foreground filter leaks in", () => {
    for (const cls of [
      ".spark-surface-selected",
      ".spark-surface-selected-on-dark",
      ".spark-focus-ring-on-dark",
    ]) {
      expect(experienceControlsOverlayCss).not.toContain(cls);
    }
  });
});
