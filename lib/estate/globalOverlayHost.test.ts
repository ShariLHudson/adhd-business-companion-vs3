import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("GlobalOverlayHost — Experience Controls", () => {
  const host = readFileSync(
    resolve(
      process.cwd(),
      "components/companion/estate/GlobalOverlayHost.tsx",
    ),
    "utf8",
  );
  const overlay = readFileSync(
    resolve(
      process.cwd(),
      "components/companion/estate/ExperienceControlsOverlay.tsx",
    ),
    "utf8",
  );
  const css = readFileSync(
    resolve(process.cwd(), "app/companion/experience-controls-overlay.css"),
    "utf8",
  );
  const companion = readFileSync(
    resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
    "utf8",
  );

  it("portals to document.body and imports overlay CSS", () => {
    expect(host).toContain("createPortal");
    expect(host).toContain("document.body");
    expect(host).toContain("experience-controls-overlay.css");
    expect(host).toContain("global-overlay-host");
    expect(host).toContain("data-testid={testId}");
  });

  it("does not portal Experience Controls from inside the panel itself", () => {
    expect(overlay).not.toContain("createPortal");
    expect(overlay).toContain("experience-controls-overlay.css");
    expect(overlay).toContain("Show Conversation");
    expect(overlay).toContain("Hide Conversation");
    expect(overlay).not.toMatch(/Chat [Oo]ff/);
  });

  it("uses a high fixed z-index outside page flow", () => {
    expect(css).toMatch(/\.global-overlay-host[\s\S]*?z-index:\s*100180/);
    expect(css).toMatch(/position:\s*fixed\s*!important/);
  });

  it("mounts Experience Controls through GlobalOverlayHost in CompanionPageClient", () => {
    expect(companion).toMatch(
      /<GlobalOverlayHost>[\s\S]*?<ExperienceControlsOverlay/,
    );
    expect(companion).toContain('actionId === "experience-controls"');
    expect(companion).toContain("setExperienceControlsOpen(true)");
  });
});
