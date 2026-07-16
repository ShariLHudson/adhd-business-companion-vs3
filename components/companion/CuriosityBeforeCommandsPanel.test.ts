import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const panel = readFileSync(
  join(process.cwd(), "components/companion/CuriosityBeforeCommandsPanel.tsx"),
  "utf8",
);
const settings = readFileSync(
  join(process.cwd(), "components/companion/SettingsPanel.tsx"),
  "utf8",
);

describe("Curiosity Before Commands Settings UI", () => {
  it("explains the pattern and offers preference choices", () => {
    expect(panel).toContain("Curiosity Before Commands");
    expect(panel).toContain("CURIOSITY_MODE_OPTIONS");
    expect(panel).toContain("data-testid={`curiosity-mode-${option.id}`}");
    expect(panel).toContain("See an example");
    expect(panel).toContain("Urgent / direct stays plain");
    expect(panel).not.toMatch(/guaranteed dopamine/i);
  });

  it("is reachable from Settings", () => {
    expect(settings).toContain('id: "curiosity"');
    expect(settings).toContain("CuriosityBeforeCommandsPanel");
  });
});
