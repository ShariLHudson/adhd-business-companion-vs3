import { describe, expect, it } from "vitest";
import {
  loadBusinessBrainCatalog,
  getKnowledgeCouncil,
  getBrainDepartment,
  departmentSynthesisContext,
  listSchoolsForDepartment,
  listTeachingSourcesForDepartment,
  canPublishLesson,
  validateContentClaim,
  buildVerifiedKnowledgeSource,
  EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS,
  SOURCE_INTEGRITY_CHECKLIST,
} from "./index";
import { KNOWLEDGE_SOURCES, SCHOOLS_OF_THOUGHT, RESEARCH_DISCIPLINES } from "./knowledgeCouncil";
import type { KnowledgeContentClaim } from "./sourceIntegrity/types";

describe("Spark Business Brain™", () => {
  it("loads full catalog from curriculum + knowledge council", () => {
    const catalog = loadBusinessBrainCatalog();
    expect(catalog.knowledgeCouncil.title).toBe("Spark Knowledge Council™");
    expect(catalog.departments).toHaveLength(44);
    expect(catalog.curriculumTopics.length).toBeGreaterThan(150);
    expect(catalog.knowledgeCards).toHaveLength(catalog.curriculumTopics.length);
    expect(catalog.learningExperiences.length).toBeGreaterThan(
      catalog.knowledgeCards.length,
    );
  });

  it("keeps knowledge council internal — no expert person names in sources", () => {
    for (const source of KNOWLEDGE_SOURCES) {
      expect(source.visibility).toBe("internal");
      expect(source.sourceTitle).not.toMatch(/\b(Dr\.|Professor)\b/);
    }
    for (const school of SCHOOLS_OF_THOUGHT) {
      expect(school.visibility).toBe("internal");
    }
  });

  it("marks council placeholders as unverified_candidate — not teaching-eligible", () => {
    for (const source of KNOWLEDGE_SOURCES) {
      expect(source.verificationStatus).toBe("unverified_candidate");
      expect(source.sourceType).toBe("curatorial_placeholder");
      expect(source.limitationNotes.length).toBeGreaterThan(10);
      expect(source.authorOrOrganization).toBeNull();
    }
    expect(listTeachingSourcesForDepartment("dept-marketing")).toHaveLength(0);
  });

  it("every department has purpose, sources, schools, disciplines, competencies", () => {
    const catalog = loadBusinessBrainCatalog();
    for (const dept of catalog.departments) {
      expect(dept.purpose.length).toBeGreaterThan(10);
      expect(dept.knowledgeSourceIds.length).toBeGreaterThan(0);
      expect(dept.schoolOfThoughtIds.length).toBeGreaterThan(0);
      expect(dept.researchDisciplineIds.length).toBeGreaterThan(0);
      expect(dept.coreCompetencyIds.length).toBeGreaterThan(0);
    }
  });

  it("marketing department links pricing school and sources", () => {
    const marketing = getBrainDepartment("dept-marketing");
    expect(marketing?.name).toBe("Marketing");
    const schools = listSchoolsForDepartment("dept-marketing");
    expect(schools.some((s) => s.slug === "value-pricing")).toBe(true);

    const ctx = departmentSynthesisContext("dept-marketing");
    expect(ctx?.schoolSlugs).toContain("value-pricing");
    expect(ctx?.topicCount).toBeGreaterThan(0);
  });

  it("knowledge cards include content layers and exclude unverified sources from teaching ids", () => {
    const catalog = loadBusinessBrainCatalog();
    const pricing = catalog.knowledgeCards.find((c) =>
      c.slug.includes("pricing-psychology"),
    );
    expect(pricing?.schoolOfThoughtIds.length).toBeGreaterThan(0);
    expect(pricing?.sourceIds).toHaveLength(0);
    expect(pricing?.contentLayers).toEqual(EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS);
    expect(pricing?.metadata.difficulty).toBeDefined();
  });

  it("declares planned experience archetypes without lesson bodies", () => {
    const catalog = loadBusinessBrainCatalog();
    const minute = catalog.learningExperiences.find(
      (e) => e.kind === "business_mastery_minute",
    );
    expect(minute?.status).toBe("planned");
    expect(minute?.summary).toMatch(/No lesson body yet/i);

    const apprenticeship = catalog.learningExperiences.find(
      (e) => e.kind === "apprenticeship",
    );
    expect(apprenticeship).toBeDefined();
    if (apprenticeship?.kind === "apprenticeship") {
      expect(apprenticeship.weekCount).toBeGreaterThan(0);
    }
  });

  it("knowledge council includes disciplines, sources, and schools", () => {
    const council = getKnowledgeCouncil();
    expect(council.researchDisciplines).toHaveLength(RESEARCH_DISCIPLINES.length);
    expect(council.schoolsOfThought.length).toBe(SCHOOLS_OF_THOUGHT.length);
    expect(council.departmentIds).toHaveLength(44);
  });
});

describe("Source Integrity™", () => {
  const verifiedSource = buildVerifiedKnowledgeSource({
    id: "src-test-verified",
    slug: "test-verified",
    sourceTitle: "Example Verified Work",
    authorOrOrganization: "Example Press",
    sourceType: "book",
    publicationDate: "2020-01-01",
    reference: "https://example.org/book",
    referenceKind: "url",
    confidenceLevel: "high",
    limitationNotes: "Scope limited to small business context.",
    description: "Test fixture only.",
    disciplineIds: ["disc-economics"],
  });

  it("defines seven-item Source Integrity Checklist", () => {
    expect(SOURCE_INTEGRITY_CHECKLIST).toHaveLength(7);
    expect(SOURCE_INTEGRITY_CHECKLIST[0]?.question).toMatch(/factual claims sourced/i);
    expect(SOURCE_INTEGRITY_CHECKLIST[6]?.question).toMatch(/speculative/i);
  });

  it("rejects Spark synthesis presented as a quote", () => {
    const claim: KnowledgeContentClaim = {
      id: "claim-1",
      kind: "spark_synthesis",
      isQuote: true,
      quoteExact: true,
    };
    const issues = validateContentClaim(
      claim,
      new Map([[verifiedSource.id, verifiedSource]]),
    );
    expect(issues.some((i) => i.code === "synthesis_as_quote")).toBe(true);
  });

  it("blocks lesson publish when facts use unverified sources", () => {
    const unverified = KNOWLEDGE_SOURCES[0]!;
    const layers = {
      ...EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS,
      facts: [
        {
          id: "fact-1",
          kind: "fact" as const,
          sourceIds: [unverified.id],
        },
      ],
    };
    const checklistAnswers = Object.fromEntries(
      SOURCE_INTEGRITY_CHECKLIST.map((item) => [item.id, true]),
    ) as Record<(typeof SOURCE_INTEGRITY_CHECKLIST)[number]["id"], boolean>;

    const result = canPublishLesson({
      contentLayers: layers,
      sources: [unverified],
      checklistAnswers,
    });
    expect(result.allowed).toBe(false);
    expect(result.reasons.some((r) => r.includes("source_not_verified"))).toBe(
      true,
    );
  });

  it("requires author for verified sources — no invented metadata", () => {
    expect(() =>
      buildVerifiedKnowledgeSource({
        id: "bad",
        slug: "bad",
        sourceTitle: "Fake",
        authorOrOrganization: "",
        sourceType: "book",
        confidenceLevel: "low",
        limitationNotes: "n/a",
        description: "n/a",
        disciplineIds: [],
      }),
    ).toThrow(/authorOrOrganization/);
  });
});
