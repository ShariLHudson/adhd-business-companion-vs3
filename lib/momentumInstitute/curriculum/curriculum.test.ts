import { describe, expect, it, beforeEach } from "vitest";

import {
  computeCurriculumRegistryStats,
  registerCurriculumKnowledgeCard,
  resetCurriculumRegistry,
  getCurriculumRegistry,
} from "@/lib/momentumInstitute/curriculum/registry";
import { parseKnowledgeCardMarkdown } from "@/lib/momentumInstitute/curriculum/parseKnowledgeCard";
import { parseFrontmatter } from "@/lib/momentumInstitute/curriculum/parseFrontmatter";
import {
  curriculumCardToKnowledgeCardDefinition,
  mergeCurriculumIntoCatalog,
} from "@/lib/momentumInstitute/curriculum/compiler";
import {
  curriculumToLearningPanelContent,
  resolveKnowledgeCardViewerModel,
} from "@/lib/momentumInstitute/curriculum/resolver";
import { EMPTY_INSTITUTE_CATALOG } from "@/lib/momentumInstitute/catalog/provider";

const SAMPLE_CARD = `---
id: KC-001-why-people-buy
title: Why People Buy
college: College of Business Growth
department: marketing
drawer: buyer-psychology
competencies:
  - pricing-confidence
  - value-communication
difficulty: foundational
estimated_time: 8
related_cards:
  - KC-002-trust-before-transaction
status: published
author: Shari
version: "1.0.0"
last_updated: "2026-06-30"
---

## Essential question

Why do customers say yes?

## Why this matters

Buyers decide with emotion first.

## Core principle

People buy outcomes they believe in.

## Key ideas

1. Emotion chooses first
2. Price signals quality
3. Confidence changes the room

## Real business example

Maria raised her rate and three clients said yes.

## Reflection questions

- Where does this show up in your business?
- What would you try this week?

## Make It Mine™

- How could this apply to your business?

## Try It This Week™

Write your price and read it aloud once.

## Common mistakes

- Apologizing for your price

## Related competencies™

- pricing-confidence

## Related knowledge cards™

- KC-002-trust-before-transaction — natural next

## Related apprenticeships™

- Marketing Confidence Apprenticeship
`;

describe("Curriculum parser", () => {
  it("parses YAML frontmatter", () => {
    const { metadata, body } = parseFrontmatter(SAMPLE_CARD);
    expect(metadata.id).toBe("KC-001-why-people-buy");
    expect(metadata.title).toBe("Why People Buy");
    expect(body).toContain("## Essential question");
  });

  it("parses full knowledge card document", () => {
    const doc = parseKnowledgeCardMarkdown(
      SAMPLE_CARD,
      "knowledge-cards/marketing/KC-001-why-people-buy.md",
    );
    expect(doc.metadata.department).toBe("marketing");
    expect(doc.body.corePrinciple).toContain("outcomes");
    expect(doc.body.keyIdeas).toHaveLength(3);
    expect(doc.body.tryItThisWeek).toContain("price");
  });
});

describe("Curriculum registry & compiler", () => {
  beforeEach(() => resetCurriculumRegistry());

  it("registers cards and compiles into catalog", () => {
    const doc = parseKnowledgeCardMarkdown(
      SAMPLE_CARD,
      "knowledge-cards/marketing/KC-001-why-people-buy.md",
    );
    registerCurriculumKnowledgeCard(doc);

    const stats = computeCurriculumRegistryStats();
    expect(stats.published).toBe(1);

    const cardDef = curriculumCardToKnowledgeCardDefinition(doc);
    expect(cardDef.id).toBe("KC-001-why-people-buy");
    expect(cardDef.competencyIds).toContain("pricing-confidence");

    const merged = mergeCurriculumIntoCatalog(EMPTY_INSTITUTE_CATALOG, [doc]);
    expect(merged.knowledgeCards.some((c) => c.id === "KC-001-why-people-buy")).toBe(
      true,
    );
    expect(merged.experiences.some((e) => e.id === "bmm-KC-001-why-people-buy")).toBe(
      true,
    );
  });

  it("resolves viewer model for published cards", () => {
    const doc = parseKnowledgeCardMarkdown(
      SAMPLE_CARD,
      "knowledge-cards/marketing/KC-001-why-people-buy.md",
    );
    registerCurriculumKnowledgeCard(doc);

    const model = resolveKnowledgeCardViewerModel("KC-001-why-people-buy");
    expect(model?.metadata.title).toBe("Why People Buy");
    expect(model?.body.reflectionQuestions.length).toBeGreaterThan(0);

    const panel = curriculumToLearningPanelContent(doc);
    expect(panel.introduction).toContain("emotion");
  });

  it("skips draft cards in viewer model", () => {
    const draft = SAMPLE_CARD.replace("status: published", "status: draft");
    const doc = parseKnowledgeCardMarkdown(draft, "knowledge-cards/marketing/draft.md");
    registerCurriculumKnowledgeCard(doc);
    expect(resolveKnowledgeCardViewerModel("KC-001-why-people-buy")).toBeNull();
  });
});
