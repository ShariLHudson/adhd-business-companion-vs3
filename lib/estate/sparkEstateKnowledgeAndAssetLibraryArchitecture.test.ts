import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTemplate } from "@/lib/companionStore";
import {
  formatSparkEstateKnowledgeAndAssetLibraryReport,
  retrieveSparkEstateKnowledge,
  selectSparkEstateKnowledgeForCard,
  SPARK_ESTATE_KNOWLEDGE_CATEGORIES,
  SPARK_ESTATE_KNOWLEDGE_PRINCIPLE,
  SPARK_ESTATE_KNOWLEDGE_QUESTION,
  SPARK_ESTATE_MEMBER_LIBRARY_SECTIONS,
  SPARK_ESTATE_ROOM_KNOWLEDGE,
  verifySparkEstateKnowledgeAndAssetLibrary,
} from "./sparkEstateKnowledgeAndAssetLibraryArchitecture";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => {
      mem.clear();
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
    sessionStorage: storage,
  });
}

describe("sparkEstateKnowledgeAndAssetLibraryArchitecture", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("defines six knowledge categories and retrieval architecture", () => {
    const verification = verifySparkEstateKnowledgeAndAssetLibrary();
    expect(SPARK_ESTATE_KNOWLEDGE_CATEGORIES).toHaveLength(6);
    expect(SPARK_ESTATE_KNOWLEDGE_PRINCIPLE).toContain("understand");
    expect(SPARK_ESTATE_KNOWLEDGE_QUESTION).toContain("move forward");
    expect(verification.categories).toBe(6);
    expect(verification.retrievalReady).toBe(true);
    expect(verification.roomConnectionsReady).toBe(true);
    expect(verification.creationJourneyAligned).toBe(true);
    expect(verification.memberLibraryReady).toBe(true);
    expect(SPARK_ESTATE_MEMBER_LIBRARY_SECTIONS).toHaveLength(4);
  });

  it("maps room knowledge connections for chamber, marketing, content, and research", () => {
    expect(SPARK_ESTATE_ROOM_KNOWLEDGE.chamber.uses).toContain("decision tools");
    expect(SPARK_ESTATE_ROOM_KNOWLEDGE.marketing.uses).toContain("funnel templates");
    expect(SPARK_ESTATE_ROOM_KNOWLEDGE.content.sections).toContain("content-generator");
    expect(SPARK_ESTATE_ROOM_KNOWLEDGE.research.uses).toContain("analysis frameworks");
  });

  it("retrieves templates and snippets by topic instead of random dumps", () => {
    createTemplate({
      title: "Launch email sequence",
      body: "A simple nurture email for new subscribers.",
      category: "emails",
      status: "saved",
    });

    const results = retrieveSparkEstateKnowledge({
      topic: "email",
      section: "content-generator",
      limit: 3,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.name.toLowerCase()).toContain("email");
    expect(results[0]?.rooms).toContain("marketing");
  });

  it("selects knowledge for cards with purpose and application guidance", () => {
    createTemplate({
      title: "Weekly planning framework",
      body: "Start with one priority and three supporting tasks.",
      category: "systems",
      status: "saved",
    });

    const asset = selectSparkEstateKnowledgeForCard({
      text: "I need help planning my week",
      section: "momentum-builder",
    });
    expect(asset?.category).toBe("frameworks");
    expect(asset?.howToUse).toBeTruthy();
  });

  it("formats a readable knowledge architecture report", () => {
    const report = formatSparkEstateKnowledgeAndAssetLibraryReport();
    expect(report).toContain(SPARK_ESTATE_KNOWLEDGE_QUESTION);
    expect(report).toContain("Room knowledge connections");
    expect(report).toContain("Integration checks");
  });
});
