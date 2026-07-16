import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const panelSource = readFileSync(
  join(process.cwd(), "components/companion/SupportStylePanel.tsx"),
  "utf8",
);
const settingsSource = readFileSync(
  join(process.cwd(), "components/companion/SettingsPanel.tsx"),
  "utf8",
);

describe("Support Style explanation UI", () => {
  it("explains what it is, why it helps, and how it differs from Conversation Style", () => {
    expect(panelSource).toContain("Everyone needs support differently");
    expect(panelSource).toContain("Why This Helps");
    expect(panelSource).toContain("Separate from Conversation Style");
    expect(panelSource).toContain("See an Example");
    expect(panelSource).toContain("Create My Own Support Style");
    expect(panelSource).toContain("Use This Style Most of the Time");
    expect(panelSource).toContain("I’ll support you this way from now on");
  });

  it("is wired into Settings and does not use vague one-line copy only", () => {
    expect(settingsSource).toContain("SupportStylePanel");
    expect(settingsSource).toContain('data-testid="settings-support-style"');
    expect(settingsSource).not.toContain("How support feels.");
  });
});
