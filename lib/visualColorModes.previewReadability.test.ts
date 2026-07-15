import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DYNAMIC_MODE_SWATCHES } from "@/lib/visualColorModes";
import { SOFT_RAINBOW_SWATCHES } from "@/lib/companionThemeTokens";

describe("color settings preview readability", () => {
  it("keeps adaptive preview swatches aligned with live soft rainbow accents", () => {
    const previewColors = DYNAMIC_MODE_SWATCHES.map((s) => s.color);
    const liveColors = SOFT_RAINBOW_SWATCHES.map((s) => s.color);
    expect(previewColors).toEqual(liveColors);

    const previewTints = DYNAMIC_MODE_SWATCHES.map((s) => s.tint);
    const liveTints = SOFT_RAINBOW_SWATCHES.map((s) => s.tint);
    expect(previewTints).toEqual(liveTints);
  });

  it("protects the live preview from dark Settings cream-text overrides", () => {
    const css = readFileSync(
      join(process.cwd(), "app/companion/global-estate-menu.css"),
      "utf8",
    );
    expect(css).toContain(".settings-color-mode-preview");
    expect(css).toMatch(
      /\.settings-color-mode-preview[\s\S]*?color:\s*#2d2926\s*!important/,
    );
    expect(css).toContain(".settings-color-mode-preview__chip-label");
    expect(css).toContain(".settings-color-mode-preview__muted");
  });

  it("uses a dedicated preview shell class in the color mode picker", () => {
    const source = readFileSync(
      join(process.cwd(), "components/companion/VisualColorModePicker.tsx"),
      "utf8",
    );
    expect(source).toContain("settings-color-mode-preview");
    expect(source).toMatch(
      /This is an example of how Spark Estate will look using the selected color\s+mode/,
    );
    expect(source).toContain(
      "The preview updates instantly as you choose different options",
    );
    // Accent belongs on borders/chips — not on the primary title text.
    expect(source).not.toMatch(/style=\{\{\s*color:\s*active\.color/);
  });
});
