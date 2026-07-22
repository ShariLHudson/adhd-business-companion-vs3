/**
 * Start New Project Routing Fix — regression lock.
 *
 * "New Project" / "Start New Project" / "Start Something New" must open the
 * Project setup flow in Projects / Project Homes — never Create. Create
 * remains for creating content; a Create → Project handoff stays
 * intentional-only (untouched by this fix).
 *
 * @see docs/project-homes/STARTNEW_PROJECT_ROUTING_FIX_REPORT.md
 * @vitest-environment node
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveIntentFirstRoute } from "@/lib/estateBrain/routeIntentFirstNavigation";
import { resolveEstateIntelligenceImmediateAction } from "@/lib/estateBrain/routeEstateIntelligence";
import { resolveExperienceFromBrain, searchEstateBrain } from "@/lib/estateBrain/search";
import { resolveEstateExperienceFromIntent } from "@/lib/estateExperiences/intentToExperience";

function readSource(rel: string): string {
  // Normalize CRLF -> LF so string/line-based assertions below are stable
  // regardless of the checkout's line-ending configuration (this repo's
  // CompanionPageClient.tsx is stored with CRLF endings on Windows).
  return readFileSync(resolve(process.cwd(), rel), "utf8").replace(/\r\n/g, "\n");
}

describe("Start New Project Routing Fix — CompanionPageClient wiring", () => {
  it("does not wire the Project Homes mount's onStartSomethingNew to Create", () => {
    const client = readSource("app/companion/CompanionPageClient.tsx");
    // Anchor on the JSX conditional mount (`{activeSection === "project-homes" && (`),
    // not just any occurrence of the bare comparison (e.g. a `const ... =` above it).
    const mountStart = client.indexOf('activeSection === "project-homes" && (');
    expect(mountStart).toBeGreaterThan(-1);
    const mountEnd = client.indexOf("</EstateRoomErrorBoundary>", mountStart);
    const mountSource = client.slice(mountStart, mountEnd);
    expect(mountSource).toContain("<ProjectHomesPrototypePanel");
    expect(mountSource).not.toContain("onStartSomethingNew");
    expect(mountSource).not.toContain("beginForceNewCreationFromUi");
  });

  it("keeps Create's own entrance wired to Create (unaffected, opposite direction)", () => {
    const client = readSource("app/companion/CompanionPageClient.tsx");
    const mountStart = client.indexOf('activeSection === "create" && !createEstateWorkingActive');
    expect(mountStart).toBeGreaterThan(-1);
    const mountEnd = client.indexOf("/>", mountStart);
    const mountSource = client.slice(mountStart, mountEnd);
    expect(mountSource).toContain(
      'onStartSomethingNew={() => beginForceNewCreationFromUi("create")}',
    );
  });

  it("routes the 'start a new project' chat command to the Project setup flow, never Create", () => {
    const client = readSource("app/companion/CompanionPageClient.tsx");
    const fnStart = client.indexOf("function completeImmediateCreateProjectOpen");
    const fnEnd = client.indexOf("\n  }\n", fnStart);
    const fnSource = client.slice(fnStart, fnEnd);
    expect(fnSource).toContain('openProjectHomesPrototypeCore("create-purpose")');
    expect(fnSource).not.toContain("openCreateEstateCore");
  });
});

describe("Start New Project Routing Fix — Estate Brain / Intent-First routing", () => {
  const NEW_PROJECT_PHRASES = [
    "new project",
    "start a new project",
    "create a new project",
    "help me start a new project",
  ];

  it.each(NEW_PROJECT_PHRASES)(
    "'%s' resolves to Momentum/Projects as the best Estate Brain match, never Create",
    (phrase) => {
      const result = searchEstateBrain(phrase);
      expect(result.best?.entry.experienceId).toBe("momentum");
    },
  );

  it.each(NEW_PROJECT_PHRASES)(
    "'%s' resolves to Momentum via resolveExperienceFromBrain",
    (phrase) => {
      expect(resolveExperienceFromBrain(phrase)).toBe("momentum");
    },
  );

  it.each(NEW_PROJECT_PHRASES)(
    "'%s' resolves to Momentum via resolveEstateExperienceFromIntent",
    (phrase) => {
      expect(resolveEstateExperienceFromIntent(phrase)).toBe("momentum");
    },
  );

  it("Intent-First Navigation routes new-project intent to Momentum/Project Homes", () => {
    const route = resolveIntentFirstRoute("start a new project");
    expect(route?.category).toBe("momentum");
    expect(route?.experienceId).toBe("momentum");
    expect(route?.spaceId).toBe("goals-projects");
    expect(route?.toolId).toBe("projects");
  });

  it("Estate Intelligence immediate action opens the Project setup flow, never Create", () => {
    const action = resolveEstateIntelligenceImmediateAction("start a new project");
    expect(action?.kind).toBe("create-project");
    expect(action?.route.category).toBe("momentum");
    expect(action?.route.experienceId).toBe("momentum");
  });
});
