import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getChamberMemberById } from "../chamberMemberRegistry";
import { chamberMemberHintForChat } from "../chamberMemberPrompt";
import {
  getChamberKnowledgePack,
  listChamberKnowledgePacks,
  listWiredChamberKnowledgeMemberIds,
} from "./chamberKnowledgeRegistry";
import {
  CLIENT_RELATIONSHIPS_DOCS,
  CLIENT_RELATIONSHIPS_LIBRARY_VERSION,
  CLIENT_RELATIONSHIPS_RUNTIME_CONTRACT,
} from "./clientRelationshipsContracts";
import {
  KNOWLEDGE_MANAGEMENT_DOCS,
  KNOWLEDGE_MANAGEMENT_LIBRARY_VERSION,
  KNOWLEDGE_MANAGEMENT_RUNTIME_CONTRACT,
  knowledgeManagementRolesForHint,
  knowledgeManagementSelectPaths,
} from "./knowledgeManagementContracts";
import {
  chamberKnowledgeHintForChat,
  formatChamberKnowledgePromptBlock,
} from "./chamberKnowledgePromptBlock";
import {
  chamberKnowledgeShouldAugmentChat,
  loadChamberKnowledge,
} from "./loadChamberKnowledge";
import { loadChamberKnowledgeVerified } from "./verifyChamberKnowledgePaths";

describe("chamber knowledge registry", () => {
  it("registers every Chamber member exactly once", () => {
    const packs = listChamberKnowledgePacks();
    expect(packs).toHaveLength(24);
    const ids = new Set(packs.map((p) => p.memberId));
    expect(ids.size).toBe(24);
  });

  it("marks client-relationships as founder-approved and fully wired", () => {
    const pack = getChamberKnowledgePack("client-relationships");
    expect(pack).toBeDefined();
    expect(pack!.libraryStatus).toBe("founder-approved");
    expect(pack!.wiringStatus).toBe("fully");
    expect(pack!.docsRoot).toBe("docs/chamber-knowledge/client-relationships");
    expect(pack!.contract?.libraryVersion).toBe(
      CLIENT_RELATIONSHIPS_LIBRARY_VERSION,
    );
    expect(pack!.docs.length).toBe(CLIENT_RELATIONSHIPS_DOCS.length);
  });

  it("bridges events to eventsIntelligence without a parallel stack", () => {
    const pack = getChamberKnowledgePack("events");
    expect(pack?.wiringStatus).toBe("partially");
    expect(pack?.runtimeBridge).toBe("eventsIntelligence");
    expect(pack?.docs.length).toBeGreaterThan(5);
    expect(pack?.contract?.productionCompletionRules.join(" ")).toContain(
      "lib/eventsIntelligence",
    );
  });

  it("lists only wired members for retrieval augmentation", () => {
    const wired = listWiredChamberKnowledgeMemberIds();
    expect(wired).toContain("client-relationships");
    expect(wired).toContain("events");
    expect(wired).toContain("knowledge-management");
    expect(wired).not.toContain("finance");
    expect(wired).not.toContain("learning");
  });

  it("registers knowledge-management as runtime-canonical and fully wired", () => {
    const pack = getChamberKnowledgePack("knowledge-management");
    expect(pack).toBeDefined();
    expect(pack!.libraryStatus).toBe("runtime-canonical");
    expect(pack!.wiringStatus).toBe("fully");
    expect(pack!.docsRoot).toBe(
      "docs/visual-spark-studios/Knowledge-Management-Intelligence",
    );
    expect(pack!.architecturePackNote).toContain("527–538");
    expect(pack!.contract?.libraryVersion).toBe(
      KNOWLEDGE_MANAGEMENT_LIBRARY_VERSION,
    );
    expect(pack!.docs.length).toBe(KNOWLEDGE_MANAGEMENT_DOCS.length);
    expect(pack!.runtimeBridge).toBeNull();
  });

  it("does not wire Learning packs into Knowledge retrieval inventory", () => {
    const pack = getChamberKnowledgePack("knowledge-management");
    const paths = pack!.docs.map((d) => d.path).join("\n");
    expect(paths).not.toMatch(/551_|LEARNING_|Learning-Intelligence/i);
    expect(pack!.docs.some((d) => d.path.includes("527_"))).toBe(true);
    expect(pack!.docs.some((d) => d.path.includes("538_"))).toBe(true);
  });
});

describe("loadChamberKnowledge", () => {
  it("loads CR contracts and verifies selected docs exist on disk", () => {
    const slice = loadChamberKnowledgeVerified("client-relationships", {
      domainHint: "client conflict repair",
    });
    expect(slice.wiringStatus).toBe("fully");
    expect(slice.contract).toEqual(CLIENT_RELATIONSHIPS_RUNTIME_CONTRACT);
    expect(slice.selectedPaths.length).toBeGreaterThan(3);
    expect(slice.filesVerified).toBe(true);
    expect(slice.missingPaths).toEqual([]);
    expect(
      slice.selectedPaths.some((p) => p.includes("011_CLIENT_RELATIONSHIPS_SAFETY")),
    ).toBe(true);
  });

  it("selects safety-focused CR docs for safety domain hints", () => {
    const slice = loadChamberKnowledge("client-relationships", {
      domainHint: "harassment safety legal",
    });
    expect(slice.selectedPaths.some((p) => p.includes("011_"))).toBe(true);
    expect(slice.selectedPaths.some((p) => p.includes("001_"))).toBe(true);
  });

  it("returns events retrieval paths via eventsIntelligence bridge", () => {
    const slice = loadChamberKnowledge("events", {
      domainHint: "planning",
    });
    expect(slice.runtimeBridge).toBe("eventsIntelligence");
    expect(slice.selectedPaths.length).toBeGreaterThan(0);
    expect(
      slice.selectedPaths.every((p) =>
        p.startsWith("docs/visual-spark-studios/Events-Intelligence"),
      ),
    ).toBe(true);
  });

  it("does not invent contracts for specialty-only members", () => {
    const slice = loadChamberKnowledge("finance");
    expect(slice.wiringStatus).toBe("docs-only");
    expect(slice.contract).toBeNull();
    expect(slice.selectedPaths).toEqual([]);
    expect(chamberKnowledgeShouldAugmentChat("finance")).toBe(false);
  });
});

describe("chamber knowledge chat path", () => {
  it("injects CR knowledge contracts into chamberMemberHintForChat", () => {
    const member = getChamberMemberById("client-relationships");
    expect(member).toBeDefined();
    const hint = chamberMemberHintForChat(member!);
    expect(hint).toContain("CHAMBER KNOWLEDGE LIBRARY ACTIVE");
    expect(hint).toContain("client-relationships");
    expect(hint).toContain(CLIENT_RELATIONSHIPS_LIBRARY_VERSION);
    expect(hint).toContain("PRIMARY OWNERSHIP");
    expect(hint).toContain("DOES NOT OWN");
    expect(hint).toContain("Safety wins");
    expect(hint).toContain("Do not become a CRM");
    expect(hint).toContain("012_CLIENT_RELATIONSHIPS_RETRIEVAL");
    expect(hint).not.toContain("You are a knowledge base");
  });

  it("injects Events knowledge bridge into chamberMemberHintForChat", () => {
    const member = getChamberMemberById("events");
    const hint = chamberMemberHintForChat(member!);
    expect(hint).toContain("CHAMBER KNOWLEDGE LIBRARY ACTIVE");
    expect(hint).toContain("eventsIntelligence");
    expect(hint).toContain("EVENTS INTELLIGENCE OPERATING RULES");
  });

  it("keeps finance specialty prompt without knowledge library block", () => {
    const member = getChamberMemberById("finance");
    const hint = chamberMemberHintForChat(member!);
    expect(hint).toContain("CHAMBER MEMBER ACTIVE");
    expect(hint).not.toContain("CHAMBER KNOWLEDGE LIBRARY ACTIVE");
    expect(chamberKnowledgeHintForChat("finance")).toBeNull();
  });

  it("formats prompt without dumping full library body", () => {
    const slice = loadChamberKnowledge("client-relationships", {
      skipFilesystemCheck: true,
    });
    const block = formatChamberKnowledgePromptBlock(slice);
    expect(block.length).toBeLessThan(8000);
    expect(block).not.toContain("# Client Relationships Intelligence — Library Overview");
  });

  it("CompanionPageClient still routes Chamber hints through chamberMemberHintForChat", () => {
    const client = readFileSync(
      join(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain('from "@/lib/chamber/chamberMemberPrompt"');
    expect(client).toContain("chamberMemberHintForChat(activeChamberMember)");
    expect(client).toContain("chamberMemberChatHint");
  });
});

describe("knowledge-management retrieval wiring", () => {
  it("loads Knowledge contracts and verifies selected docs exist on disk", () => {
    const slice = loadChamberKnowledge("knowledge-management", {
      domainHint: "conflicting versions outdated",
    });
    expect(slice.wiringStatus).toBe("fully");
    expect(slice.contract).toEqual(KNOWLEDGE_MANAGEMENT_RUNTIME_CONTRACT);
    expect(slice.selectedPaths.length).toBeGreaterThan(2);
    expect(slice.selectedPaths.length).toBeLessThanOrEqual(10);
    expect(slice.filesVerified).toBe(true);
    expect(slice.missingPaths).toEqual([]);
    expect(
      slice.selectedPaths.some((p) =>
        p.includes("534_KNOWLEDGE_CONTRADICTION"),
      ),
    ).toBe(true);
  });

  it("selects capture/lifecycle docs for capture domain hints", () => {
    const slice = loadChamberKnowledge("knowledge-management", {
      domainHint: "capture and preserve this lesson learned",
    });
    expect(
      slice.selectedPaths.some((p) => p.includes("530_KNOWLEDGE_CAPTURE")),
    ).toBe(true);
    expect(
      slice.selectedPaths.some((p) =>
        p.includes("532_KNOWLEDGE_LIFECYCLE"),
      ),
    ).toBe(true);
  });

  it("excludes platform memory and expert-council files from retrieval slices", () => {
    const paths = knowledgeManagementSelectPaths(
      KNOWLEDGE_MANAGEMENT_DOCS,
      "organize knowledge library",
    );
    expect(paths.every((p) => !p.includes("KMG-022"))).toBe(true);
    expect(paths.every((p) => !p.includes("KMG-011"))).toBe(true);
    expect(paths.every((p) => !p.includes("536_KNOWLEDGE_AUTOMATIC"))).toBe(
      true,
    );
  });

  it("caps path count to prevent prompt flooding", () => {
    const paths = knowledgeManagementSelectPaths(
      KNOWLEDGE_MANAGEMENT_DOCS,
      null,
      10,
    );
    expect(paths.length).toBeLessThanOrEqual(10);
  });

  it("encodes owns / does-not-own / routing handoff contracts", () => {
    const c = KNOWLEDGE_MANAGEMENT_RUNTIME_CONTRACT;
    expect(c.primaryOwns.join(" ")).toMatch(/Capture/i);
    expect(c.primaryOwns.join(" ")).toMatch(/lineage/i);
    expect(c.doesNotOwn.join(" ")).toMatch(/Learning/i);
    expect(c.doesNotOwn.join(" ")).toMatch(/Momentum/i);
    expect(c.doesNotOwn.join(" ")).toMatch(/Create mechanics/i);
    expect(c.doesNotOwn.join(" ")).toMatch(/platform memory/i);
    expect(c.doesNotOwn.join(" ")).toMatch(/Factual invention/i);
    expect(c.productionCompletionRules.join(" ")).toMatch(/never auto-launch/i);
    expect(c.productionCompletionRules.join(" ")).toMatch(/Create handoff only/i);
    expect(c.safetyRules.join(" ")).toMatch(/named experts/i);
    expect(c.safetyRules.join(" ")).toMatch(/visual intelligence are NOT available/i);
  });

  it("routes Learning/Momentum/Projects hints to ownership+routing roles", () => {
    const roles = knowledgeManagementRolesForHint("I need a skill practice course");
    expect(roles).toContain("routing");
    expect(roles).toContain("ownership");
    expect(roles).not.toContain("create-catalog");
  });

  it("injects Knowledge contracts into chamberMemberHintForChat", () => {
    const member = getChamberMemberById("knowledge-management");
    expect(member).toBeDefined();
    const hint = chamberMemberHintForChat(member!);
    expect(hint).toContain("CHAMBER KNOWLEDGE LIBRARY ACTIVE");
    expect(hint).toContain("knowledge-management");
    expect(hint).toContain(KNOWLEDGE_MANAGEMENT_LIBRARY_VERSION);
    expect(hint).toContain("PRIMARY OWNERSHIP");
    expect(hint).toContain("DOES NOT OWN");
    expect(hint).toContain("KNOWLEDGE MATCH / HONESTY POSTURE");
    expect(hint).toContain("never auto-launch");
    expect(hint).toContain("528_KNOWLEDGE_CANONICAL_OWNERSHIP");
    expect(hint).not.toContain("You are a knowledge base");
    expect(hint).not.toContain("According to Nonaka");
  });

  it("formats Knowledge prompt without dumping full library body", () => {
    const slice = loadChamberKnowledge("knowledge-management", {
      skipFilesystemCheck: true,
    });
    const block = formatChamberKnowledgePromptBlock(slice);
    expect(block.length).toBeLessThan(12000);
    expect(block).not.toContain(
      "# 528 — Knowledge Canonical Ownership & Non-Duplication Contract",
    );
    expect(block).toContain("Weak match");
    expect(block).toContain("Automatic knowledge visuals are unavailable");
  });

  it("leaves Learning and finance without Knowledge library block", () => {
    const learning = getChamberMemberById("learning");
    const finance = getChamberMemberById("finance");
    expect(chamberMemberHintForChat(learning!)).not.toContain(
      "knowledge-management",
    );
    expect(chamberMemberHintForChat(finance!)).not.toContain(
      "CHAMBER KNOWLEDGE LIBRARY ACTIVE",
    );
    expect(chamberKnowledgeShouldAugmentChat("learning")).toBe(false);
  });

  it("keeps CR and Events wiring unchanged alongside Knowledge", () => {
    expect(loadChamberKnowledge("client-relationships").wiringStatus).toBe(
      "fully",
    );
    expect(loadChamberKnowledge("events").runtimeBridge).toBe(
      "eventsIntelligence",
    );
    expect(chamberKnowledgeHintForChat("knowledge-management")).toContain(
      "knowledge-management",
    );
  });
});
