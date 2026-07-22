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
  chamberKnowledgeHintForChat,
  formatChamberKnowledgePromptBlock,
} from "./chamberKnowledgePromptBlock";
import {
  chamberKnowledgeShouldAugmentChat,
  loadChamberKnowledge,
} from "./loadChamberKnowledge";

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
    expect(wired).not.toContain("finance");
  });
});

describe("loadChamberKnowledge", () => {
  it("loads CR contracts and verifies selected docs exist on disk", () => {
    const slice = loadChamberKnowledge("client-relationships", {
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
