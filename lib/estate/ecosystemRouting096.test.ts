/**
 * 096 — Ecosystem routing alignment contracts.
 * @vitest-environment node
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  LEGACY_DESTINATION_ALIASES,
  resolveAuthoritativeDestinationId,
} from "@/lib/estate/destinationAliases";
import { WELCOME_HOME_NAV_CATEGORIES } from "@/lib/estate/welcomeHomeNavigationStructure";
import { MASTER_FEATURE_REGISTRY } from "@/lib/conversationArchitecture/masterFeatureRegistry";
import { ESTATE_ENVIRONMENTS } from "@/lib/estateBrain/environmentRegistry";
import { ESTATE_CAPABILITIES } from "@/lib/estateBrain/capabilityRegistry";
import { ESTATE_BRAIN_ENTRIES } from "@/lib/estateBrain/knowledgeRegistry";
import { ESTATE_COACHING_PRESCRIPTIONS } from "@/lib/estateBrain/estateCoachingRegistry";
import { resolveIntentFirstRoute } from "@/lib/estateBrain/routeIntentFirstNavigation";

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("096 — destination aliases", () => {
  it("maps legacy ids to authoritative destinations", () => {
    expect(resolveAuthoritativeDestinationId("content-generator")).toBe("create");
    expect(resolveAuthoritativeDestinationId("goals-projects")).toBe("projects");
    expect(resolveAuthoritativeDestinationId("explore-estate")).toBe(
      "wander-the-grounds",
    );
    expect(resolveAuthoritativeDestinationId("estate-guidebook")).toBe(
      "spark-estate-guide",
    );
    expect(resolveAuthoritativeDestinationId("homestead")).toBe(
      "wander-the-grounds",
    );
    expect(LEGACY_DESTINATION_ALIASES["content-generator"]).toBe("create");
  });

  it("does not alias Chamber Creative Studio to Create", () => {
    expect(resolveAuthoritativeDestinationId("creative-studio")).toBe(
      "creative-studio",
    );
  });
});

describe("096 — Welcome Home catalog", () => {
  it("lists Create, Projects, Talk It Out, Wander, Guide", () => {
    const byId = Object.fromEntries(
      WELCOME_HOME_NAV_CATEGORIES.map((c) => [
        c.id,
        c.destinations.map((d) => d.id),
      ]),
    );
    expect(byId.build).toContain("create");
    expect(byId.build).toContain("projects");
    expect(byId["take-a-moment"]).toContain("talk-it-out");
    expect(byId["take-a-moment"]).toContain("parking-lot");
    expect(byId["take-a-moment"]).toContain("focus-library");
    expect(byId["take-a-moment"]).not.toContain("journal");
    expect(byId.reflection).toEqual(
      expect.arrayContaining([
        "journal",
        "evidence-vault",
        "hall-of-accomplishments",
      ]),
    );
    expect(byId["get-advice"]).toEqual(
      expect.arrayContaining([
        "chamber-of-momentum",
        "boardroom",
        "strategy-library",
      ]),
    );
    expect(byId["spark-estates"]).toEqual([
      "wander-the-grounds",
      "spark-estate-guide",
    ]);
  });
});

describe("096 — Projects Welcome opens ProjectsPanel", () => {
  it("CPC Welcome opener uses projects section, not project-homes", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain(
      'onOpenProjects={() => openStandaloneFocusSectionCore("projects")}',
    );
    expect(client).not.toMatch(
      /onOpenProjects=\{\(\) => openProjectHomesPrototypeCore\(\)\}/,
    );
    const universal = client.slice(
      client.indexOf('case "calendar":'),
      client.indexOf('case "journal":'),
    );
    expect(universal).toContain('case "projects":');
    expect(universal).toContain('openStandaloneFocusSectionCore("projects")');
    expect(universal).not.toContain("openProjectHomesPrototypeCore()");
  });

  it("master registry Welcome dest is projects", () => {
    const row = MASTER_FEATURE_REGISTRY.find((r) => r.id === "projects");
    expect(row?.welcomeHomeDestination).toBe("projects");
  });
});

describe("096 — Create Estate Brain + registry", () => {
  it("master registry Welcome dest is create", () => {
    const row = MASTER_FEATURE_REGISTRY.find((r) => r.id === "create");
    expect(row?.welcomeHomeDestination).toBe("create");
  });

  it("create environments primarySection is create", () => {
    const createStudio = ESTATE_ENVIRONMENTS.find((e) => e.id === "create-studio");
    const writing = ESTATE_ENVIRONMENTS.find((e) => e.id === "writing-room");
    expect(createStudio?.primarySection).toBe("create");
    expect(writing?.primarySection).toBe("create");
  });

  it("create capabilities toolId is create (visual stays visual-focus)", () => {
    const createCaps = ESTATE_CAPABILITIES.filter((c) =>
      c.id.startsWith("create."),
    );
    expect(createCaps.length).toBeGreaterThan(5);
    for (const cap of createCaps) {
      if (cap.id === "create.mindmap") {
        expect(cap.toolId).toBe("visual-focus");
      } else {
        expect(cap.toolId).toBe("create");
      }
    }
  });

  it("knowledge Create primarySection is create", () => {
    const create = ESTATE_BRAIN_ENTRIES.find((k) => k.id === "create");
    expect(create?.primarySection).toBe("create");
  });

  it("coaching create responses open create section", () => {
    const createOpens = Object.values(ESTATE_COACHING_PRESCRIPTIONS)
      .flat()
      .filter(
        (r) => r.id === "creative-create" || r.id === "growth-create",
      );
    expect(createOpens.length).toBe(2);
    for (const r of createOpens) {
      expect(r.openSection).toBe("create");
    }
  });

  it("intent-first SOP routes to toolId create", () => {
    const route = resolveIntentFirstRoute("Help me write an SOP");
    expect(route?.toolId).toBe("create");
  });

  it("Welcome Create opener calls openCreateEstateCore", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain(
      "onOpenCreateStudio={() => openCreateEstateCore()}",
    );
  });
});

describe("096 — Event Begin bind", () => {
  it("CPC binds Event Record synchronously in startFreshCreateFromEstate", () => {
    const client = read("app/companion/CompanionPageClient.tsx");
    expect(client).toContain("function bindEventRecord");
    expect(client).toContain("enterCreationFromCreate");
    expect(client).toContain("applyEventWorkspaceToCreateWorkflow");
    const bindAt = client.indexOf("function bindEventRecord");
    const startAt = client.indexOf("function startFreshCreateFromEstate");
    const endAt = client.indexOf("function resumeActiveWorkspaceEntry");
    expect(bindAt).toBeGreaterThan(0);
    expect(startAt).toBeGreaterThan(bindAt);
    expect(endAt).toBeGreaterThan(startAt);
    const estateOpen = client.slice(bindAt, endAt);
    expect(estateOpen).toContain("bindEventRecord(workflow");
    expect(estateOpen).not.toMatch(/bindEventRecord:[\s\S]{0,40}window\.setTimeout/);
    expect(estateOpen).not.toContain("openCreateWorkspace(");
  });
});

describe("096 — opener propagation (no silent hide)", () => {
  it("EstateTopRightChrome forwards every intended Welcome opener", () => {
    const chrome = read("components/companion/estate/EstateTopRightChrome.tsx");
    for (const prop of [
      "onOpenCreateStudio",
      "onOpenProjects",
      "onOpenTalkItOut",
      "onExploreSpark",
      "onOpenSparkEstateGuide",
      "onOpenJournal",
      "onOpenParkingLot",
      "onOpenEvidenceVault",
    ]) {
      expect(chrome).toContain(prop);
      // Forwarded into EstateRoomExperienceMenu props
      expect(chrome).toMatch(new RegExp(`${prop}=\\{${prop}\\}`));
    }
  });

  it("EstateRoomExperienceMenu maps destination ids to those openers", () => {
    const menu = read("components/companion/estate/EstateRoomExperienceMenu.tsx");
    expect(menu).toContain("create: onOpenCreateStudio");
    expect(menu).toContain("projects: onOpenProjects");
    expect(menu).toContain('"talk-it-out": onOpenTalkItOut');
    expect(menu).toContain('"wander-the-grounds": onExploreSpark');
    expect(menu).toContain('"spark-estate-guide": onOpenSparkEstateGuide');
    expect(menu).toContain("journal: onOpenJournal");
    expect(menu).toContain('"parking-lot": onOpenParkingLot');
    expect(menu).toContain('"evidence-vault": onOpenEvidenceVault');
    expect(menu).toContain("if (!action) return null");
  });
});

describe("096 — Parking Lot + Evidence Vault brain coverage", () => {
  it("registers parking-lot capability and knowledge", () => {
    expect(
      ESTATE_CAPABILITIES.some((c) => c.id === "restore.parking-lot"),
    ).toBe(true);
    expect(ESTATE_BRAIN_ENTRIES.some((k) => k.id === "parking-lot")).toBe(true);
  });

  it("registers evidence vault capability", () => {
    expect(
      ESTATE_CAPABILITIES.some((c) => c.id === "journal.evidence-vault"),
    ).toBe(true);
  });
});
