/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CompactBoardDirectorSelector } from "@/components/companion/board/CompactBoardDirectorSelector";
import { THOMAS_ELLISON_DIRECTOR_ID } from "@/lib/board";

describe("CompactBoardDirectorSelector selection appearance", () => {
  it("marks selected Directors with data-selected and a check badge", () => {
    const html = renderToStaticMarkup(
      <CompactBoardDirectorSelector
        selectedIds={[THOMAS_ELLISON_DIRECTOR_ID]}
        onChange={() => {}}
      />,
    );
    expect(html).toContain(
      `data-testid="compact-director-row-${THOMAS_ELLISON_DIRECTOR_ID}"`,
    );
    expect(html).toMatch(
      new RegExp(
        `data-testid="compact-director-row-${THOMAS_ELLISON_DIRECTOR_ID}"[^>]*data-selected="true"`,
      ),
    );
    expect(html).toContain("selection-check");
    expect(html).toContain("✓");
    expect(html).toContain('data-selected="false"');
  });

  it("exposes Select All and Clear Selection in Customize mode", () => {
    const html = renderToStaticMarkup(
      <CompactBoardDirectorSelector
        mode="customize"
        selectedIds={[]}
        onChange={() => {}}
      />,
    );
    expect(html).toContain('data-testid="compact-select-all"');
    expect(html).toContain('data-testid="compact-clear-selection"');
    expect(html).toContain("Use Recommended Directors");
    expect(html).toContain('data-testid="compact-selection-more"');
    expect(html).not.toContain("Select Core Board");
  });

  it("recommended mode shows Use Recommended and Customize without Core Board", () => {
    const html = renderToStaticMarkup(
      <CompactBoardDirectorSelector
        mode="recommended"
        decisionText="Should I hire an assistant?"
        selectedIds={[THOMAS_ELLISON_DIRECTOR_ID]}
        onChange={() => {}}
      />,
    );
    expect(html).toContain("Use Recommended Directors");
    expect(html).toContain("Customize");
    expect(html).toContain("especially well suited");
    expect(html).not.toContain("Select Core Board");
    expect(html).not.toContain('data-testid="compact-select-core"');
  });
});
