/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getProjectItems,
  getProjects,
} from "@/lib/companionStore";
import {
  SAMPLE_PROJECT_HOMES,
  SAMPLE_PROJECTS_GALLERY_NOTE,
  addNoteToHome,
  addSectionToHome,
  addTaskToHome,
  archiveProjectHome,
  deleteProjectHome,
  duplicateProjectHome,
  isSampleProjectHome,
  renameProjectHome,
  visibleGalleryHomes,
  type ProjectHomeRecord,
} from "@/lib/projectHomes";

const PROJECTS_KEY = "companion-projects-v1";
const PROJECT_ITEMS_KEY = "companion-project-items-v1";

function memberHome(overrides: Partial<ProjectHomeRecord> = {}): ProjectHomeRecord {
  return {
    id: "ph-member-1",
    name: "Member Project",
    purpose: "Ship something calm",
    projectHomeId: "writing-room",
    status: "in-motion",
    currentFocus: "First draft",
    lastWorkedAt: "2026-07-14T12:00:00.000Z",
    nextSuggestedStep: "Write one paragraph",
    isSample: false,
    ...overrides,
  };
}

describe("projectHomes usability", () => {
  beforeEach(() => {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(PROJECT_ITEMS_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(PROJECT_ITEMS_KEY);
  });

  it("labels every sample project and keeps gallery note copy", () => {
    expect(SAMPLE_PROJECTS_GALLERY_NOTE).toContain(
      "Sample projects are examples to help you explore",
    );
    for (const sample of SAMPLE_PROJECT_HOMES) {
      expect(isSampleProjectHome(sample)).toBe(true);
      expect(sample.isSample).toBe(true);
    }
  });

  it("renames, duplicates, archives, and hides archived from gallery", () => {
    const homes = [memberHome()];
    const renamed = renameProjectHome(homes, "ph-member-1", "Renamed Home");
    expect(renamed[0]?.name).toBe("Renamed Home");

    const { homes: withCopy, duplicate } = duplicateProjectHome(
      renamed,
      "ph-member-1",
    );
    expect(duplicate?.id).not.toBe("ph-member-1");
    expect(duplicate?.isSample).toBe(false);
    expect(withCopy).toHaveLength(2);

    const archived = archiveProjectHome(withCopy, "ph-member-1");
    expect(archived.find((h) => h.id === "ph-member-1")?.archived).toBe(true);
    expect(visibleGalleryHomes(archived).map((h) => h.id)).not.toContain(
      "ph-member-1",
    );
  });

  it("blocks deleting sample projects and deletes member projects", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const blocked = deleteProjectHome([sample], sample.id, {
      syncCompanionStore: false,
    });
    expect(blocked.blockedAsSample).toBe(true);
    expect(blocked.homes).toHaveLength(1);

    const member = memberHome();
    const removed = deleteProjectHome([member, sample], member.id, {
      syncCompanionStore: false,
    });
    expect(removed.blockedAsSample).toBe(false);
    expect(removed.removed?.id).toBe(member.id);
    expect(removed.homes.map((h) => h.id)).toEqual([sample.id]);
  });

  it("creates companion project on Add Section / Task / Note without changing storage key", () => {
    expect(PROJECTS_KEY).toBe("companion-projects-v1");
    let home = memberHome();
    const section = addSectionToHome(home, "Outline");
    home = section.home;
    expect(home.companionProjectId).toBeTruthy();
    expect(getProjects().some((p) => p.id === home.companionProjectId)).toBe(
      true,
    );
    expect(
      getProjectItems(home.companionProjectId).some(
        (i) => i.kind === "section" && i.title === "Outline",
      ),
    ).toBe(true);

    const task = addTaskToHome(home, "Draft intro");
    home = task.home;
    expect(
      getProjectItems(home.companionProjectId).some(
        (i) => i.kind === "task" && i.title === "Draft intro",
      ),
    ).toBe(true);

    home = addNoteToHome(home, "Keep the tone gentle");
    const stored = getProjects().find((p) => p.id === home.companionProjectId);
    expect(stored?.notes).toContain("Keep the tone gentle");
    expect(localStorage.getItem(PROJECTS_KEY)).toBeTruthy();
  });

  it("strengthens project-homes frost readability styles", () => {
    const cssPath = join(
      process.cwd(),
      "app/companion/project-homes.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain(
      ".project-homes-workspace.estate-workspace.companion-workspace-frosted",
    );
    expect(css).toMatch(
      /background:\s*rgba\(255,\s*252,\s*245,\s*0\.9\)/,
    );
    expect(css).toContain(".project-home-card:focus-visible");
    expect(css).toContain(".project-home-card__open");
    expect(css).toContain(".project-homes-connected__item--preparing");
    expect(css).toContain(".project-homes-connected__coming-soon");
    // Section labels are darker than the prior faded #9a8f82
    expect(css).toContain("color: #3d3832");
  });

  it("Connected Places copy does not route to old workspaces", () => {
    const sectionPath = join(
      process.cwd(),
      "components/companion/projectHomes/ConnectedPlacesSection.tsx",
    );
    const source = readFileSync(sectionPath, "utf8");
    expect(source).toContain(
      "Coming soon — this connection is being prepared.",
    );
    expect(source).not.toContain("onPlacePress");
    expect(source).not.toContain("onClick");
    expect(source).toContain('aria-disabled="true"');
  });
});
