/**
 * Quick feel-pass across Work Types for one-primary-decision writing UX (098 addendum).
 * @vitest-environment node
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import { openWorkshopMapSection } from "@/lib/workTypeSchema/openWorkshopMapSection";
import { resolveFocusForCreationDestination } from "@/lib/currentFocus/resolveCanonicalFocus";

const TYPES = [
  "Email Campaign",
  "SOP",
  "Strategic Plan",
  "Event Plan",
  "Marketing Campaign",
] as const;

function read(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("098 feel-pass — writing UX across Work Types", () => {
  it("shared Current Focus keeps one primary Save; help and work actions disclosed", () => {
    const focusSrc = read("components/companion/CurrentFocusInteraction.tsx");
    const panelSrc = read("components/companion/CreateEstateWorkingPanel.tsx");

    expect(focusSrc).toContain('data-primary-action="save-section"');
    expect(focusSrc).toContain("Save this section");
    expect(focusSrc).toContain("You&apos;re writing this section");
    expect(focusSrc).toContain("current-focus-need-a-hand");
    expect(focusSrc).toContain("Need a hand?");

    // Assistance buttons exist only inside the disclosure branch (after Need a hand).
    const assistIdx = focusSrc.indexOf("current-focus-need-a-hand");
    const ideasIdx = focusSrc.indexOf("current-focus-ideas");
    expect(assistIdx).toBeGreaterThan(-1);
    expect(ideasIdx).toBeGreaterThan(assistIdx);

    expect(panelSrc).toContain("section-when-ready");
    expect(panelSrc).toContain("When you");
    expect(panelSrc).toContain("complete-it-now");
    expect(panelSrc).toContain("section-complete-for-now");

    // Work-level actions are inside the details block, not a peer button row with Save.
    const whenReadyIdx = panelSrc.indexOf("section-when-ready");
    const completeIdx = panelSrc.indexOf("complete-it-now");
    expect(completeIdx).toBeGreaterThan(whenReadyIdx);
  });

  it.each(TYPES)(
    "%s — bootstrap, mid-section open, Focus agrees with map",
    (label) => {
      let wf = {
        ...initializeWorkspaceV2Workflow(label),
        sessionId: `feel-${label.toLowerCase().replace(/\s+/g, "-")}`,
      };
      const sections = wf.templateSections ?? [];
      expect(sections.length).toBeGreaterThanOrEqual(2);

      const firstId = wf.activeSectionId;
      expect(firstId).toBeTruthy();
      expect(firstId).toBe(sections[0]!.id);

      const mid = sections[Math.min(1, sections.length - 1)]!;
      wf = openWorkshopMapSection(wf, mid.id);
      expect(wf.activeSectionId).toBe(mid.id);

      const focus = resolveFocusForCreationDestination(wf);
      expect(focus?.sectionId).toBe(mid.id);
      expect(focus?.title).toBe(mid.label);
      expect(focus?.focusId).toBe(`section:${mid.id}`);
      expect(focus?.savedContent ?? "").toBe(
        wf.sectionContent?.[mid.id] ?? "",
      );

      // Same writing surface for every Work Type — no type-specific button wall.
      expect(wf.workspaceCurrentFocus?.sectionId).toBe(mid.id);
    },
  );

  it("prints a readable map summary for the feel-pass review", () => {
    const lines: string[] = [];
    for (const label of TYPES) {
      const wf = initializeWorkspaceV2Workflow(label);
      const names = (wf.templateSections ?? []).map((s) => s.label);
      lines.push(
        `${label}: ${names.length} sections → ${names.slice(0, 5).join(" · ")}${names.length > 5 ? " · …" : ""}`,
      );
    }
    // Visible in vitest output when run with --reporter=verbose
    expect(lines.join("\n")).toMatch(/Marketing Campaign/);
    expect(lines.join("\n")).toMatch(/Event Plan/);
    // eslint-disable-next-line no-console
    console.log("\nFeel-pass maps:\n" + lines.join("\n") + "\n");
  });
});
