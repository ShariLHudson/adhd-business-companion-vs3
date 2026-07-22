/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getProjectItems,
  getProjects,
  saveProject,
} from "@/lib/companionStore";
import {
  SAMPLE_PROJECT_HOMES,
  SAMPLE_PROJECTS_GALLERY_NOTE,
  activeConnectedPlaces,
  addNoteToHome,
  addSectionToHome,
  addTaskToHome,
  archiveProjectHome,
  classifyFreeTextEntries,
  comingLaterConnectedPlaces,
  createPersistedProjectHome,
  createPersistedProjectHomeWithResult,
  deleteProjectHome,
  duplicateProjectHome,
  generateNextStepSuggestion,
  generateNextStepSuggestions,
  isSampleProjectHome,
  loadMemberProjectHomesFromStore,
  mapProjectToHomeRecord,
  mergeMemberHomesWithStore,
  prototypeOpenQuestions,
  renameProjectHome,
  setProjectHomeNextStep,
  suggestNextStepsForHome,
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

  it("hydrates member Project Homes from companion-projects-v1 only", () => {
    expect(PROJECTS_KEY).toBe("companion-projects-v1");
    saveProject({
      name: "Stored Workshop",
      goal: "Fill the room",
      nextAction: "Write the outline",
      horizon: "now",
      status: "in-progress",
    });
    const homes = loadMemberProjectHomesFromStore();
    expect(homes).toHaveLength(1);
    expect(homes[0]?.name).toBe("Stored Workshop");
    expect(homes[0]?.purpose).toBe("Fill the room");
    expect(homes[0]?.companionProjectId).toBe(homes[0]?.id);
    expect(homes[0]?.isSample).toBe(false);
    expect(homes.every((h) => !isSampleProjectHome(h))).toBe(true);
    expect(localStorage.getItem(PROJECTS_KEY)).toBeTruthy();
  });

  it("maps store projects with defaults and never duplicates by companion id", () => {
    const list = saveProject({
      name: "Brand Refresh",
      goal: "Warm palette",
    });
    const project = list[0]!;
    const mapped = mapProjectToHomeRecord(project, {
      projectHomeId: "art-studio",
    });
    expect(mapped.projectHomeId).toBe("art-studio");
    expect(mapped.companionProjectId).toBe(project.id);

    const local = {
      ...mapped,
      id: "ph-local-temp",
      companionProjectId: project.id,
      projectHomeId: "art-studio" as const,
      archived: false,
    };
    const merged = mergeMemberHomesWithStore(
      [local],
      loadMemberProjectHomesFromStore(),
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.companionProjectId).toBe(project.id);
    expect(merged[0]?.projectHomeId).toBe("art-studio");
  });

  it("persists created Project Homes into companion-projects-v1", () => {
    const home = createPersistedProjectHome({
      name: "Quiet Chapter",
      purpose: "Finish chapter one",
      projectHomeId: "writing-room",
    });
    expect(home.companionProjectId).toBeTruthy();
    expect(getProjects().some((p) => p.id === home.companionProjectId)).toBe(
      true,
    );
    expect(loadMemberProjectHomesFromStore().map((h) => h.name)).toContain(
      "Quiet Chapter",
    );
    expect(localStorage.getItem(PROJECTS_KEY)).toContain("Quiet Chapter");
  });

  it("keeps samples separate from store-backed member homes", () => {
    saveProject({ name: "Real Member Work", goal: "Ship" });
    const members = loadMemberProjectHomesFromStore();
    expect(members.some((h) => h.name === "Real Member Work")).toBe(true);
    for (const sample of SAMPLE_PROJECT_HOMES) {
      expect(members.some((h) => h.id === sample.id)).toBe(false);
    }
  });

  it("renames, duplicates, archives, and hides archived from gallery", () => {
    const homes = [memberHome()];
    const renamed = renameProjectHome(homes, "ph-member-1", "Renamed Home", {
      syncCompanionStore: false,
    });
    expect(renamed[0]?.name).toBe("Renamed Home");

    const { homes: withCopy, duplicate } = duplicateProjectHome(
      renamed,
      "ph-member-1",
      { syncCompanionStore: false },
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
    const inboxTask = getProjectItems(home.companionProjectId!).find(
      (i) => i.kind === "task" && i.title === "Draft intro",
    );
    expect(inboxTask).toBeTruthy();
    expect(inboxTask?.parentId).toBeFalsy();

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
      /background:\s*rgba\(255,\s*252,\s*245,\s*0\.64\)/,
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
    // Boardroom is the one genuinely wired Connected Place — it may use
    // onClick, but only through the explicit onCallTheBoard hand-off, and
    // only once the caller provides both a project and the handler.
    expect(source).toContain("onCallTheBoard");
    expect(source).toContain('aria-disabled="true"');
    expect(source).toContain("Coming later:");
  });

  it("keeps Open Questions helper available without requiring it on the home", () => {
    const sample = SAMPLE_PROJECT_HOMES[0]!;
    const questions = prototypeOpenQuestions(sample);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]).toContain(sample.currentFocus);

    const detailPath = join(
      process.cwd(),
      "components/companion/projectHomes/ProjectHomeDetail.tsx",
    );
    const detail = readFileSync(detailPath, "utf8");
    expect(detail).toContain("Your Next Step");
    expect(detail).toContain("Current Focus");
    expect(detail).toContain('id="plan"');
    expect(detail).toContain('id="tools"');
    expect(detail).toContain('id="progress"');
    expect(detail).toContain('id="connections"');
    expect(detail).not.toContain("Open Questions");
    expect(detail).not.toContain("Next Suggested Step");
    expect(detail).not.toContain("prototypeOpenQuestions");
    expect(detail).not.toMatch(/saved-work|\/create\b/);
  });

  it("styles estate drawers for progressive disclosure", () => {
    const cssPath = join(
      process.cwd(),
      "app/companion/project-homes.css",
    );
    const css = readFileSync(cssPath, "utf8");
    expect(css).toContain(".project-homes-drawer");
    expect(css).toContain(".project-homes-drawer__toggle");
    expect(css).toContain(".project-homes-tool-item--preparing");
  });
});

describe("Next-Step Intelligence", () => {
  beforeEach(() => {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(PROJECT_ITEMS_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(PROJECT_ITEMS_KEY);
  });

  it("classifies setup pieces as facts, not next steps", () => {
    const { facts, constraints, questions } = classifyFreeTextEntries([
      "Date: mid-September, one Saturday morning",
      "Budget: no more than $500 for the venue",
      "Who is coming to this?",
    ]);
    expect(facts).toContain("Date: mid-September, one Saturday morning");
    expect(constraints).toContain(
      "Budget: no more than $500 for the venue",
    );
    expect(questions).toContain("Who is coming to this?");
  });

  it("never suggests a next step that restates a known fact verbatim", () => {
    const suggestion = generateNextStepSuggestion({
      projectId: "p1",
      projectType: "event",
      title: "Fall Workshop",
      knownFacts: [
        "Audience: local small business owners",
        "Date: mid-September, one Saturday morning",
      ],
      constraints: [],
      completedTasks: [],
      openTasks: [],
      milestones: [],
      unresolvedQuestions: [],
    });
    expect(suggestion.title).not.toBe(
      "Date: mid-September, one Saturday morning",
    );
    expect(suggestion.title).not.toBe("Audience: local small business owners");
    expect(suggestion.title.toLowerCase()).not.toContain("mid-september");
    // A vague date should produce a concrete, actionable refinement.
    expect(suggestion.title.toLowerCase()).toContain("saturday");
    expect(suggestion.confidence).toBeGreaterThan(0);
  });

  it("creating a Project Home from setup pieces keeps Current Focus and Your Next Step distinct", () => {
    const result = createPersistedProjectHomeWithResult({
      name: "Fall Workshop",
      purpose: "Host a small business workshop this fall",
      projectHomeId: "study-hall",
      pieces: [
        "Date: mid-September, one Saturday morning",
        "Audience: local small business owners",
      ],
    });
    expect(result.persisted).toBe(true);
    const home = result.home!;
    expect(home.currentFocus).toBeTruthy();
    expect(home.nextSuggestedStep).toBeTruthy();
    expect(home.currentFocus).not.toBe(home.nextSuggestedStep);
    // Neither field is a verbatim copy of a setup fact.
    expect(home.currentFocus).not.toBe(
      "Date: mid-September, one Saturday morning",
    );
    expect(home.nextSuggestedStep).not.toBe(
      "Date: mid-September, one Saturday morning",
    );
    expect(home.nextSuggestedStep).not.toBe(
      "Audience: local small business owners",
    );
  });

  it("Suggest Next Step generates real alternatives instead of echoing the current step", () => {
    const home = createPersistedProjectHomeWithResult({
      name: "Fall Workshop",
      purpose: "Host a small business workshop this fall",
      projectHomeId: "study-hall",
      pieces: ["Date: mid-September, one Saturday morning"],
    }).home!;

    const suggestions = suggestNextStepsForHome(home, { count: 3 });
    expect(suggestions.length).toBeGreaterThan(0);
    for (const suggestion of suggestions) {
      expect(suggestion.title).not.toBe(home.nextSuggestedStep);
      expect(suggestion.title.trim().length).toBeGreaterThan(0);
    }
    // Alternatives (when present) are genuinely different from each other.
    const titles = suggestions.map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("accepting a suggested next step persists it distinctly from Current Focus", () => {
    const home = createPersistedProjectHomeWithResult({
      name: "Fall Workshop",
      purpose: "Host a small business workshop this fall",
      projectHomeId: "study-hall",
      pieces: ["Date: mid-September, one Saturday morning"],
    }).home!;

    const [suggestion] = suggestNextStepsForHome(home, { count: 1 });
    expect(suggestion).toBeTruthy();
    const updated = setProjectHomeNextStep(home, suggestion!);
    expect(updated.nextSuggestedStep).toBe(suggestion!.title);
    expect(updated.currentFocus).toBe(home.currentFocus);
    const stored = getProjects().find((p) => p.id === home.companionProjectId);
    expect(stored?.nextStepSuggestion).toBe(suggestion!.title);
    expect(stored?.nextAction).toBe(home.currentFocus);
  });

  it("generateNextStepSuggestions never repeats the same title twice", () => {
    const suggestions = generateNextStepSuggestions(
      {
        projectId: "p2",
        projectType: "general",
        title: "Untitled",
        knownFacts: [],
        constraints: [],
        completedTasks: [],
        openTasks: [],
        milestones: [],
        unresolvedQuestions: [],
      },
      { count: 3 },
    );
    const titles = suggestions.map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("Connected Places: only active destinations are eligible for buttons; the rest stay demoted", () => {
    const active = activeConnectedPlaces("study-hall");
    const comingLater = comingLaterConnectedPlaces("study-hall");
    expect(active.every((p) => p.status === "active")).toBe(true);
    expect(comingLater.every((p) => p.status === "comingLater")).toBe(true);
    expect(active.some((p) => p.id === "boardroom")).toBe(true);
    // Non-wired destinations must never appear in the active list.
    for (const place of comingLater) {
      expect(active.some((p) => p.id === place.id)).toBe(false);
    }
  });
});
