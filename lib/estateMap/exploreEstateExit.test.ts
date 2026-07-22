/**
 * Explore Estate exit — members must reach Welcome Home or rooms without
 * the map trapping them.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MAP = path.join(
  process.cwd(),
  "components/estateMap/EstateMapFullScreen.tsx",
);

function readMap(): string {
  return readFileSync(MAP, "utf8");
}

describe("EstateMapFullScreen exit affordances", () => {
  it("exposes Return to Estate and does not fold-close after card select", () => {
    const source = readMap();
    expect(source).toContain("onReturnToEstate");
    expect(source).toContain('data-testid="explore-estate-return-home"');
    expect(source).toContain("Return to Estate");
    expect(source).toContain('data-testid="explore-estate-fold"');

    const selectStart = source.indexOf("const handleSelect = useCallback");
    expect(selectStart).toBeGreaterThan(-1);
    const selectSlice = source.slice(selectStart, selectStart + 900);
    expect(selectSlice).toContain("onSelectLocation");
    expect(selectSlice).toContain("Do not call onClose/leaveExplore");
    expect(selectSlice).not.toMatch(/onClose\(\)/);
    expect(selectSlice).not.toMatch(/leaveExplore\(\)/);
  });

  it("Fold map and Escape use leaveExplore (Return to Estate when wired)", () => {
    const source = readMap();
    expect(source).toContain("const leaveExplore = useCallback");
    expect(source).toContain("leaveExplore()");
    expect(source).toMatch(/onClick=\{leaveExplore\}/);
  });
});
