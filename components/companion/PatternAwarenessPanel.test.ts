import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const panelSource = readFileSync(
  join(process.cwd(), "components/companion/PatternAwarenessPanel.tsx"),
  "utf8",
);
const settingsSource = readFileSync(
  join(process.cwd(), "components/companion/SettingsPanel.tsx"),
  "utf8",
);
const profileSource = readFileSync(
  join(process.cwd(), "components/companion/MyProfilePanel.tsx"),
  "utf8",
);

describe("Pattern Awareness explanation UI", () => {
  it("explains what it is, why it helps, control, and saving behavior", () => {
    expect(panelSource).toContain("Pattern Awareness helps Spark notice");
    expect(panelSource).toContain("Why This Can Help");
    expect(panelSource).toContain("You Stay in Control");
    expect(panelSource).toContain("You choose what to keep");
    expect(panelSource).toContain("Notice New Patterns");
    expect(panelSource).toContain("Use My Saved Patterns");
    expect(panelSource).toContain("+ Add a Pattern I Already Know");
    expect(panelSource).toContain("What Spark may notice");
  });

  it("avoids technical profiling language", () => {
    expect(panelSource).not.toMatch(/Behavioral model|Predictive learning|User inference|Automated profiling/i);
  });

  it("is reachable from Settings and My Profile", () => {
    expect(settingsSource).toContain("PatternAwarenessPanel");
    expect(settingsSource).toContain('id: "pattern"');
    expect(profileSource).toContain('onOpenSettings?.("pattern")');
    expect(profileSource).toContain("Pattern Awareness");
  });

  it("offers save controls without auto-save language", () => {
    expect(panelSource).toContain("Save This Pattern");
    expect(panelSource).toContain("never silent");
    expect(panelSource).not.toMatch(/Pattern detected|Behavior recorded|Profile updated/i);
  });
});
