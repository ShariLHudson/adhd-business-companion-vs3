/**
 * Momentum Institute Phase 1 — placeholder catalog for drawer-wall interaction.
 * Structural data only — no lesson bodies.
 */

import type {
  InstituteDepartmentDefinition,
  InstituteDrawerDefinition,
  InstituteTopicDefinition,
  KnowledgeCardDefinition,
  LearningExperienceDefinition,
  MomentumInstituteCatalog,
} from "@/lib/sparkMomentumInstitute/types";
import {
  SPARK_COMPETENCY_FRAMEWORK_V1,
  perspectivesForTopicSlug,
} from "@/lib/sparkCompetencyFramework/competencyFrameworkV1";

const INSTITUTE_ID = "momentum-institute";
const VERSION = "1.0.0-phase1-drawers";

type CategorySeed = {
  slug: string;
  title: string;
  pillarId: "build_your_business" | "build_your_thinking" | "build_your_legacy";
  cards: string[];
};

const FEATURED_DRAWERS: {
  slug: string;
  title: string;
  categorySlug: string;
  pillarId: CategorySeed["pillarId"];
  cards: string[];
}[] = [
  {
    slug: "customer-psychology",
    title: "Customer Psychology",
    categorySlug: "marketing",
    pillarId: "build_your_business",
    cards: [
      "Why People Buy",
      "Building Trust",
      "Social Proof",
      "Emotional Decisions",
      "Risk Reduction",
    ],
  },
  {
    slug: "confidence",
    title: "Confidence",
    categorySlug: "confidence",
    pillarId: "build_your_thinking",
    cards: [
      "Imposter Syndrome",
      "Courage",
      "Confidence Through Action",
      "Fear of Selling",
      "Taking Imperfect Action",
    ],
  },
  {
    slug: "networking",
    title: "Networking",
    categorySlug: "networking",
    pillarId: "build_your_business",
    cards: [
      "Building Relationships",
      "Follow-up Systems",
      "Referral Thinking",
      "Community",
      "Giving First",
    ],
  },
];

const CATEGORY_DRAWERS: CategorySeed[] = [
  { slug: "marketing", title: "Marketing", pillarId: "build_your_business", cards: ["Positioning Basics"] },
  { slug: "sales", title: "Sales", pillarId: "build_your_business", cards: ["Ethical Selling"] },
  { slug: "leadership", title: "Leadership", pillarId: "build_your_legacy", cards: ["Leading With Clarity"] },
  { slug: "speaking", title: "Speaking", pillarId: "build_your_legacy", cards: ["Speaking With Warmth"] },
  { slug: "ai", title: "AI", pillarId: "build_your_business", cards: ["AI as Thinking Partner"] },
  { slug: "executive-function", title: "Executive Function", pillarId: "build_your_thinking", cards: ["Working Memory Supports"] },
  { slug: "decision-making", title: "Decision Making", pillarId: "build_your_thinking", cards: ["Choosing Under Uncertainty"] },
  { slug: "systems", title: "Systems", pillarId: "build_your_business", cards: ["Repeatable Systems"] },
  { slug: "pricing", title: "Pricing", pillarId: "build_your_business", cards: ["Pricing Foundations"] },
  { slug: "offers", title: "Offers", pillarId: "build_your_business", cards: ["Offer Clarity"] },
  { slug: "finance", title: "Finance", pillarId: "build_your_business", cards: ["Cash Flow Awareness"] },
  { slug: "communication", title: "Communication", pillarId: "build_your_legacy", cards: ["Clear Communication"] },
  { slug: "customer-experience", title: "Customer Experience", pillarId: "build_your_business", cards: ["Experience Design"] },
  { slug: "hiring", title: "Hiring", pillarId: "build_your_business", cards: ["Hiring Thoughtfully"] },
  { slug: "automation", title: "Automation", pillarId: "build_your_business", cards: ["Automate the Repeatable"] },
  { slug: "habits", title: "Habits", pillarId: "build_your_thinking", cards: ["Sustainable Habits"] },
  { slug: "learning", title: "Learning", pillarId: "build_your_thinking", cards: ["Learning How to Learn"] },
  { slug: "thinking-skills", title: "Thinking Skills", pillarId: "build_your_thinking", cards: ["Sharper Thinking"] },
  { slug: "creative-thinking", title: "Creative Thinking", pillarId: "build_your_thinking", cards: ["Creative Leaps"] },
  { slug: "strategic-thinking", title: "Strategic Thinking", pillarId: "build_your_thinking", cards: ["Strategic Foresight"] },
  { slug: "pattern-recognition", title: "Pattern Recognition", pillarId: "build_your_thinking", cards: ["Seeing Patterns"] },
  { slug: "problem-solving", title: "Problem Solving", pillarId: "build_your_thinking", cards: ["Solve the Real Problem"] },
  { slug: "innovation", title: "Innovation", pillarId: "build_your_business", cards: ["Innovation Without Chaos"] },
  { slug: "adhd-entrepreneurship", title: "ADHD Entrepreneurship", pillarId: "build_your_thinking", cards: ["Entrepreneurial EF"] },
  { slug: "business-growth", title: "Business Growth", pillarId: "build_your_business", cards: ["Growth With Intention"] },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const KNOWLEDGE_CARD_SUMMARIES: Record<string, string> = {
  "Why People Buy": "Understand the emotional and practical reasons customers say yes.",
  "Building Trust": "Earn confidence before you ever ask for the sale.",
  "Imposter Syndrome": "Name the pattern so it stops running your decisions.",
  "Building Relationships": "Grow a network that feels human, not transactional.",
  "Positioning Basics": "Clarify who you serve and why you are the right fit.",
  "Ethical Selling": "Sell in a way that protects trust and pride.",
  "Pricing Foundations": "Understand why customers buy based on perceived value.",
  "Strategic Foresight": "See around corners without living in anxiety.",
};

function knowledgeCardOneLiner(cardTitle: string, drawerTitle: string): string {
  return (
    KNOWLEDGE_CARD_SUMMARIES[cardTitle] ??
    `A focused look at ${cardTitle} inside ${drawerTitle}.`
  );
}

function buildPhase1Catalog(): MomentumInstituteCatalog {
  const departments: InstituteDepartmentDefinition[] = [];
  const drawers: InstituteDrawerDefinition[] = [];
  const topics: InstituteTopicDefinition[] = [];
  const knowledgeCards: KnowledgeCardDefinition[] = [];
  const experiences: LearningExperienceDefinition[] = [];

  const featuredSlugs = new Set(FEATURED_DRAWERS.map((d) => d.slug));

  let deptOrder = 0;
  let drawerOrder = 0;

  const ensureDepartment = (seed: CategorySeed): InstituteDepartmentDefinition => {
    const id = `dept-${seed.slug}`;
    let dept = departments.find((d) => d.id === id);
    if (!dept) {
      dept = {
        id,
        instituteId: INSTITUTE_ID,
        pillarId: seed.pillarId,
        slug: seed.slug,
        title: seed.title,
        description: `${seed.title} — entrepreneur development.`,
        drawerIds: [],
        sortOrder: deptOrder++,
        competencyIds: [],
      };
      departments.push(dept);
    }
    return dept;
  };

  const addDrawer = (input: {
    slug: string;
    title: string;
    categorySlug: string;
    pillarId: CategorySeed["pillarId"];
    cards: string[];
  }) => {
    const dept = ensureDepartment({
      slug: input.categorySlug,
      title:
        CATEGORY_DRAWERS.find((c) => c.slug === input.categorySlug)?.title ??
        input.categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      pillarId: input.pillarId,
      cards: [],
    });

    const drawerId = `drawer-${input.slug}`;
    const topicId = `topic-${input.slug}`;
    const cardIds: string[] = [];

    input.cards.forEach((cardTitle, index) => {
      const cardSlug = slugify(cardTitle);
      const cardId = `kc-${input.slug}-${cardSlug}`;
      cardIds.push(cardId);
      const expId = `exp-bmm-${input.slug}-${cardSlug}`;
      knowledgeCards.push({
        kind: "knowledge-card",
        id: cardId,
        topicId,
        drawerId,
        departmentId: dept.id,
        slug: cardSlug,
        title: cardTitle,
        summary: knowledgeCardOneLiner(cardTitle, input.title),
        description: knowledgeCardOneLiner(cardTitle, input.title),
        metadata: {
          difficulty: "foundational",
          estimatedMinutes: 8,
          businessStages: ["idea", "launch", "growth"],
          adhdRelevance: "medium",
          aiRelevance: "low",
        },
        competencyIds: [],
        perspectiveIds: perspectivesForTopicSlug(input.slug),
        experienceDefinitionIds: [expId],
        tags: [input.slug, dept.slug],
        version: VERSION,
        createdAt: "2026-01-01T00:00:00.000Z",
      });
      experiences.push({
        id: expId,
        kind: "business_mastery_minute",
        knowledgeCardId: cardId,
        topicId,
        drawerId,
        departmentId: dept.id,
        title: `${cardTitle} — Business Mastery Minute`,
        summary: "Placeholder experience shell.",
        estimatedMinutes: 5,
        competencyIds: [],
        lifecycleStages: ["discover", "learn", "reflect"],
        version: VERSION,
        createdAt: "2026-01-01T00:00:00.000Z",
      });
    });

    drawers.push({
      id: drawerId,
      departmentId: dept.id,
      pillarId: input.pillarId,
      slug: input.slug,
      title: input.title,
      description: `Index cards on ${input.title}.`,
      topicIds: [topicId],
      sortOrder: drawerOrder++,
    });
    dept.drawerIds.push(drawerId);

    topics.push({
      id: topicId,
      drawerId,
      departmentId: dept.id,
      slug: input.slug,
      title: input.title,
      summary: `Knowledge Cards on ${input.title}.`,
      knowledgeCardIds: cardIds,
      supportedExperienceTypes: [
        "business_mastery_minute",
        "deep_lesson",
        "business_lab",
        "simulation",
        "challenge",
        "apply_to_my_business",
      ],
      competencyIds: [],
      perspectiveIds: perspectivesForTopicSlug(input.slug),
      sortOrder: 1,
    });
  };

  for (const featured of FEATURED_DRAWERS) {
    addDrawer(featured);
  }

  for (const category of CATEGORY_DRAWERS) {
    if (featuredSlugs.has(category.slug)) continue;
    addDrawer({
      slug: category.slug,
      title: category.title,
      categorySlug: category.slug,
      pillarId: category.pillarId,
      cards: category.cards,
    });
  }

  return {
    institute: {
      id: INSTITUTE_ID,
      slug: "momentum-institute",
      title: "Momentum Institute",
      subtitle: "Entrepreneur Development Center",
      tagline: "Who do you want to become?",
      pillarIds: SPARK_COMPETENCY_FRAMEWORK_V1.pillars.map((p) => p.id),
      departmentIds: departments.map((d) => d.id),
      version: VERSION,
    },
    competencyFramework: SPARK_COMPETENCY_FRAMEWORK_V1,
    pillars: SPARK_COMPETENCY_FRAMEWORK_V1.pillars,
    perspectives: SPARK_COMPETENCY_FRAMEWORK_V1.perspectives,
    departments,
    drawers,
    topics,
    knowledgeCards,
    experiences,
    competencies: [],
    relationships: [],
    learningPaths: [],
    makeItMineTemplates: [],
    returnClosings: [],
    evidenceOpportunityTemplates: [],
  };
}

export const PHASE1_INSTITUTE_CATALOG = buildPhase1Catalog();

export const PHASE1_DRAWER_IDS = PHASE1_INSTITUTE_CATALOG.drawers.map((d) => d.id);
