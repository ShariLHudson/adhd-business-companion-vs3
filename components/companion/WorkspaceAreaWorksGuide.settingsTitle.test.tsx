/**
 * Settings → How To Use Settings title must use the dark Settings heading token
 * (same white/cream as surrounding Settings text), not black.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const GUIDE = path.join(
  process.cwd(),
  "components/companion/WorkspaceAreaWorksGuide.tsx",
);
const SETTINGS_CSS = path.join(
  process.cwd(),
  "app/companion/global-estate-menu.css",
);

describe("Settings — How To Use Settings text color", () => {
  it("uses the Settings heading token class for the settings guide title", () => {
    const source = readFileSync(GUIDE, "utf8");
    const settingsTitle = source.match(
      /\? "workspace-area-works-guide__title settings-panel__heading[^"]*"/,
    )?.[0];
    const nonSettingsTitle = source.match(
      /: "workspace-area-works-guide__title min-w-0 flex-1 text-sm font-semibold text-\[#1f1c19\]"/,
    )?.[0];

    expect(settingsTitle).toBeTruthy();
    expect(settingsTitle).toContain("settings-panel__heading");
    expect(settingsTitle).not.toContain("text-[#1f1c19]");
    expect(settingsTitle).not.toContain("text-black");
    expect(nonSettingsTitle).toBeTruthy();

    // Avoid hover:bg-white/* — Settings [class*="bg-white"] forces black text.
    expect(source).not.toMatch(
      /\? "workspace-area-works-guide__trigger[^"]*hover:bg-white\//,
    );
  });

  it("dark Settings CSS maps the guide title to the heading cream/white token", () => {
    const css = readFileSync(SETTINGS_CSS, "utf8");

    expect(css).toMatch(
      /\.modal-sheet--estate-dark\s+\.settings-panel__heading[\s\S]*?color:\s*rgba\(255,\s*248,\s*235,\s*0\.98\)/,
    );
    expect(css).toMatch(
      /\.workspace-area-works-guide__title[\s\S]*?color:\s*rgba\(255,\s*248,\s*235,\s*0\.98\)/,
    );
    expect(css).toContain(
      ".workspace-area-works-guide__title.settings-panel__heading",
    );
  });
});
