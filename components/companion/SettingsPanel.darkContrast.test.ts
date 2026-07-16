/**
 * Dark Settings sheet — cream text tokens must beat Tailwind ink utilities
 * so Sign-in & Security (and the rest of Settings) stay WCAG-readable.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SETTINGS_CSS = path.join(
  process.cwd(),
  "app/companion/global-estate-menu.css",
);
const SETTINGS_PANEL = path.join(
  process.cwd(),
  "components/companion/SettingsPanel.tsx",
);

const PRIMARY = String.raw`rgba\(\s*255\s*,\s*248\s*,\s*235\s*,\s*0\.98\s*\)`;
const SECONDARY = String.raw`rgba\(\s*255\s*,\s*236\s*,\s*200\s*,\s*0\.85\s*\)`;
const FOCUS = String.raw`rgba\(\s*255\s*,\s*236\s*,\s*200\s*,\s*0\.85\s*\)`;
const DISABLED = String.raw`rgba\(\s*255\s*,\s*248\s*,\s*235\s*,\s*0\.62\s*\)`;

describe("Settings — dark sheet text contrast", () => {
  it("maps breadcrumb, headings, and helpers to Estate light text tokens", () => {
    const css = readFileSync(SETTINGS_CSS, "utf8");

    expect(css).toMatch(
      new RegExp(
        String.raw`\.modal-sheet--estate-dark\s+\.settings-panel__back[\s\S]*?color:\s*${PRIMARY}`,
      ),
    );
    expect(css).toMatch(
      new RegExp(
        String.raw`\.modal-sheet--estate-dark\s+\.settings-panel__heading[\s\S]*?color:\s*${PRIMARY}`,
      ),
    );
    expect(css).toMatch(
      new RegExp(
        String.raw`\.modal-sheet--estate-dark\s+\.settings-panel__subheading[\s\S]*?color:\s*${SECONDARY}`,
      ),
    );
    expect(css).toMatch(
      new RegExp(
        String.raw`\.text-\\\[\\#6b635a\\\][\s\S]*?color:\s*${SECONDARY}`,
      ),
    );
    expect(css).toContain(".text-\\[\\#3d3630\\]");
    expect(css).toContain(".text-\\[\\#9a8f82\\]");
    expect(css).toContain(".text-black");
  });

  it("styles Sign-in / Log out ghost buttons for dark readability + focus", () => {
    const css = readFileSync(SETTINGS_CSS, "utf8");
    const panel = readFileSync(SETTINGS_PANEL, "utf8");

    expect(panel).toContain("settings-panel__btn settings-panel__btn--primary");
    expect(panel).toContain(
      "settings-panel__btn settings-panel__btn--secondary",
    );
    expect(panel).toMatch(/Log out/);

    expect(css).toMatch(
      new RegExp(
        String.raw`\.settings-panel__btn[\s\S]*?color:\s*${PRIMARY}`,
      ),
    );
    expect(css).toMatch(
      new RegExp(
        String.raw`\.settings-panel__btn:focus-visible[\s\S]*?outline:\s*2px\s+solid\s+${FOCUS}`,
      ),
    );
    expect(css).toMatch(
      new RegExp(
        String.raw`button:disabled[\s\S]*?color:\s*${DISABLED}`,
      ),
    );
  });

  it("keeps light cream cards black so nested helpers stay readable", () => {
    const css = readFileSync(SETTINGS_CSS, "utf8");
    expect(css).toContain(".bg-\\[\\#f7f3ec\\]");
    expect(css).toContain(".bg-\\[\\#faf7f2\\]");
    expect(css).toMatch(/color:\s*#000000\s*!important/);
  });
});
