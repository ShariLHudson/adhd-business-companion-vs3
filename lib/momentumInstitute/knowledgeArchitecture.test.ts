import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_INSTITUTE_CATALOG } from "./catalog/testCatalog";
import {
  resetInstituteCatalogProvider,
  setInstituteCatalogProvider,
} from "./catalog/provider";
import {
  buildCatalogIndex,
  canAccessKnowledgeCard,
  getAncestorCompetencies,
  getChildCompetencies,
  getPrerequisiteKnowledgeCards,
  getRecommendedNextKnowledgeCards,
  resolveKnowledgeCardPlacement,
  sparkSuggestedLearningPath,
  sparkSuggestedNextCards,
} from "./knowledgeArchitecture";

describe("Spark Knowledge Architecture™", () => {
  beforeEach(() => {
    setInstituteCatalogProvider({ load: () => TEST_INSTITUTE_CATALOG });
  });

  afterEach(() => {
    resetInstituteCatalogProvider();
    vi.restoreAllMocks();
  });

  it("indexes catalog for O(1) lookups at scale", () => {
    const index = buildCatalogIndex(TEST_INSTITUTE_CATALOG);
    expect(index.byKnowledgeCardId.size).toBe(3);
    expect(index.cardsByDrawerId.get("drawer-dept-marketing-pricing")).toHaveLength(
      3,
    );
    expect(index.relationshipsFromCard.size).toBeGreaterThan(0);
  });

  it("resolves full hierarchy placement for a Knowledge Card", () => {
    const placement = resolveKnowledgeCardPlacement("kc-pricing-psychology");
    expect(placement?.pillarId).toBe("build_your_business");
    expect(placement?.department.slug).toBe("marketing");
    expect(placement?.drawer.slug).toBe("pricing");
    expect(placement?.knowledgeCard.title).toBe("Pricing Psychology");
  });

  it("resolves prerequisite relationships before advanced topics", () => {
    const blocked = canAccessKnowledgeCard("kc-pricing-psychology", {
      completedKnowledgeCardIds: [],
    });
    expect(blocked.accessible).toBe(false);
    expect(blocked.blockedByPrerequisiteIds).toContain("kc-pricing-foundations");

    const prereqs = getPrerequisiteKnowledgeCards("kc-pricing-psychology");
    expect(prereqs.map((p) => p.targetCard.id)).toContain(
      "kc-pricing-foundations",
    );
  });

  it("suggests next cards along the learning path", () => {
    const next = sparkSuggestedNextCards("kc-pricing-foundations", {
      completedKnowledgeCardIds: ["kc-pricing-foundations"],
    });
    expect(next[0]?.id).toBe("kc-pricing-psychology");

    const recommended = getRecommendedNextKnowledgeCards("kc-pricing-foundations");
    expect(recommended.some((r) => r.targetCard.id === "kc-pricing-psychology")).toBe(
      true,
    );
  });

  it("resolves Spark Suggested Learning Path™ from catalog data", () => {
    const path = sparkSuggestedLearningPath("kc-pricing-foundations", {
      completedKnowledgeCardIds: [],
    });
    expect(path).not.toBeNull();
    expect(path!.map((s) => s.knowledgeCard.id)).toEqual([
      "kc-pricing-foundations",
      "kc-pricing-psychology",
      "kc-value-pricing",
    ]);
    expect(path![1]?.accessible).toBe(false);
  });

  it("builds hierarchical competency graph", () => {
    const children = getChildCompetencies("comp-leadership");
    expect(children.map((c) => c.slug).sort()).toEqual([
      "decision-making",
      "delegation",
    ]);

    const ancestors = getAncestorCompetencies("comp-focus");
    expect(ancestors.some((a) => a.slug === "executive-function")).toBe(true);
  });

  it("carries Knowledge Card metadata without lesson bodies", () => {
    const card = TEST_INSTITUTE_CATALOG.knowledgeCards.find(
      (k) => k.id === "kc-pricing-psychology",
    );
    expect(card?.metadata?.difficulty).toBe("intermediate");
    expect(card?.metadata?.adhdRelevance).toBe("medium");
    expect(card?.competencyIds.length).toBeGreaterThan(1);
  });
});
