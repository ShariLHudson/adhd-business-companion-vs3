/**
 * Architecture boundary tests — Universal Work Engine ownership.
 * @vitest-environment node
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it, beforeEach } from "vitest";
import {
  APPROVED_DURABLE_TABLE,
  UnknownWorkTypeError,
  allocateCanonicalWorkId,
  clearWorkTypePackageRegistryForTests,
  coalesceWorkflowWorkId,
  ensureEventPlanWorkTypeRegistered,
  getWorkTypePackage,
  linkWorkRelationship,
  requireWorkTypePackage,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
  resetWorkTasksForTests,
  resetResearchAttachmentsForTests,
  resolveCanonicalWorkId,
  createResearchRecord,
  submitResearchForReview,
  approveResearch,
  applyApprovedResearch,
  syncEventTasksIntoUniversalWork,
  listWorkTasks,
  cartographyRefsForWork,
} from "../index";

const ROOT = process.cwd();

function walkTsFiles(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git" || name === "dist") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkTsFiles(full, out);
    else if (/\.(ts|tsx|mjs)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name))
      out.push(full);
  }
  return out;
}

function readRel(pathFromRoot: string): string {
  return readFileSync(join(ROOT, pathFromRoot), "utf8");
}

describe("Universal Work Engine — architecture boundaries", () => {
  beforeEach(() => {
    resetWorkIdentityStoreForTests();
    resetWorkRelationshipsForTests();
    resetWorkTasksForTests();
    resetResearchAttachmentsForTests();
    clearWorkTypePackageRegistryForTests();
    ensureEventPlanWorkTypeRegistered();
  });

  it("Universal Work Engine core does not import Event Intelligence packages", () => {
    const uweFiles = walkTsFiles(join(ROOT, "lib/universalWorkEngine")).filter(
      (f) => !f.includes(`${join("packages", "eventPlan")}`),
    );
    const forbidden = [
      "@/lib/eventsIntelligence",
      'from "../eventsIntelligence',
      'from "../../eventsIntelligence',
      "@/lib/eventCreationWorkspace",
    ];
    for (const file of uweFiles) {
      const src = readFileSync(file, "utf8");
      for (const needle of forbidden) {
        expect(src.includes(needle), `${relative(ROOT, file)} imports Event`).toBe(
          false,
        );
      }
    }
  });

  it("Event package registers through UWE and does not mint Work IDs", () => {
    const eventPackage = readRel(
      "lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType.ts",
    );
    expect(eventPackage).toMatch(/registerWorkTypePackage/);
    expect(eventPackage).not.toMatch(/allocateCanonicalWorkId/);
    expect(eventPackage).not.toMatch(/newEventId|evt-\$\{/);
    expect(getWorkTypePackage("event_plan")?.workTypeId).toBe("event_plan");
  });

  it("forbidden packages do not call durable repository / table directly", () => {
    const forbiddenRoots = [
      "lib/universalWorkEngine/packages",
      "lib/eventsIntelligence",
      "lib/eventCreationWorkspace",
      "lib/createAssets",
      "lib/research",
    ];
    const needles = [
      `from("${APPROVED_DURABLE_TABLE}")`,
      `from('${APPROVED_DURABLE_TABLE}')`,
      "creationDurable/repository",
      "upsertAuthoritativeCreation",
    ];
    for (const root of forbiddenRoots) {
      const files = walkTsFiles(join(ROOT, root));
      for (const file of files) {
        const src = readFileSync(file, "utf8");
        for (const needle of needles) {
          expect(
            src.includes(needle),
            `${relative(ROOT, file)} must not access durable storage (${needle})`,
          ).toBe(false);
        }
      }
    }
  });

  it("unknown Work Types fail visibly (no silent fallthrough)", () => {
    expect(() => requireWorkTypePackage("marketing_plan")).toThrow(
      UnknownWorkTypeError,
    );
    expect(() => requireWorkTypePackage("sop")).toThrow(UnknownWorkTypeError);
    // Bootstrap may use transitional templates for unregistered labels;
    // the registry itself never silently accepts unknown IDs.
    expect(() => requireWorkTypePackage("marketing_plan")).toThrow(
      UnknownWorkTypeError,
    );
  });

  it("Work Type packages and Event intelligence do not mint competing Work ID prefixes", () => {
    const eventPackage = readRel(
      "lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType.ts",
    );
    const guide = readRel("lib/eventsIntelligence/guideEventPlanning.ts");
    expect(guide).toMatch(/allocateCanonicalWorkId/);
    expect(guide).not.toMatch(/`evt-\$\{/);
    expect(eventPackage).not.toMatch(/allocateCanonicalWorkId/);
  });

  it("one canonical Work ID survives create → alias → research → cartography → tasks", () => {
    const workId = allocateCanonicalWorkId({
      origin: "event",
      workTypeId: "event_plan",
    });
    resolveCanonicalWorkId("create-session-link", { aliasOf: workId });
    resolveCanonicalWorkId("cw-project-link", { aliasOf: workId });

    syncEventTasksIntoUniversalWork({
      workId,
      tasks: [
        {
          id: "t1",
          title: "Confirm venue",
          done: false,
          sectionId: "venue",
        },
      ],
      milestones: [{ id: "m1", title: "Open registration", done: false }],
    });
    expect(listWorkTasks(workId)[0]?.title).toBe("Confirm venue");

    const research = createResearchRecord({
      target: { kind: "work", workId },
      researchQuestion: "What venues fit 40 people?",
      researchMode: "venue_scan",
      originatingExperience: "create",
      findings: "Three options",
      proposedActions: ["Shortlist Garden Hall"],
    });
    submitResearchForReview(research.id);
    approveResearch(research.id);
    const applied = applyApprovedResearch(research.id, [
      "Noted Garden Hall shortlist — member applies in Focus",
    ]);
    expect(applied.approvalStatus).toBe("applied");

    linkWorkRelationship({
      fromWorkId: workId,
      toRef: { kind: "cartography_node", id: "node-venue-map" },
      relationship: "visualizes",
    });
    const refs = cartographyRefsForWork("create-session-link");
    expect(refs.workId).toBe(workId);
    expect(refs.nodeRefs.some((n) => n.id === workId)).toBe(true);

    expect(coalesceWorkflowWorkId({ sessionId: "create-session-link" })).toBe(
      workId,
    );
    expect(resolveCanonicalWorkId("cw-project-link")).toBe(workId);
  });

  it("existing evt- Event id remains accessible as canonical (no orphan)", () => {
    const id = resolveCanonicalWorkId("evt-legacy-certified", {
      workTypeId: "event_plan",
    });
    expect(id).toBe("evt-legacy-certified");
    expect(requireWorkTypePackage("event_plan").displayName).toBe("Event Plan");
  });
});
