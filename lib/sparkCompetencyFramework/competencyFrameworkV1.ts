/**
 * Spark Competency Framework v1.0 — canonical pillar, department, and drawer scaffold.
 * Data-driven structure only — no lesson content.
 */

import type {
  InstitutePillarDefinition,
  KnowledgePerspectiveDefinition,
  SparkCompetencyFrameworkV1,
} from "./types";
import { COMPETENCY_FRAMEWORK_VERSION } from "./types";

const PILLARS: InstitutePillarDefinition[] = [
  {
    id: "build_yourself",
    slug: "build-yourself",
    title: "Build Yourself",
    tagline: "Become the entrepreneur your business needs.",
    description:
      "Personal growth, executive function, confidence, mindset, and leadership of self.",
    departmentIds: [
      "dept-entrepreneur-mindset",
      "dept-confidence-courage",
      "dept-adhd-entrepreneurship",
      "dept-executive-function",
      "dept-productivity-momentum",
      "dept-emotional-intelligence",
      "dept-habits-consistency",
      "dept-resilience-recovery",
      "dept-focus-attention",
      "dept-energy-management",
      "dept-communication",
      "dept-personal-leadership",
    ],
    sortOrder: 1,
    iconKey: "pillar-self",
  },
  {
    id: "build_your_business",
    slug: "build-your-business",
    title: "Build Your Business",
    tagline: "Create a business that works.",
    description:
      "Strategy, operations, finance, systems, customers, marketing, and sales.",
    departmentIds: [
      "dept-business-foundations",
      "dept-strategy",
      "dept-marketing",
      "dept-branding",
      "dept-sales",
      "dept-customer-experience",
      "dept-finance",
      "dept-operations",
      "dept-systems",
      "dept-project-management",
      "dept-ai-for-business",
      "dept-business-growth",
      "dept-legal-risk-awareness",
    ],
    sortOrder: 2,
    iconKey: "pillar-business",
  },
  {
    id: "build_your_thinking",
    slug: "build-your-thinking",
    title: "Build Your Thinking",
    tagline: "Develop the way exceptional entrepreneurs think.",
    description:
      "Critical, strategic, systems, and creative thinking — one of Spark's most unique areas.",
    departmentIds: [
      "dept-critical-thinking",
      "dept-strategic-thinking",
      "dept-systems-thinking",
      "dept-creative-thinking",
      "dept-decision-making",
      "dept-opportunity-recognition",
      "dept-problem-solving",
      "dept-learning-how-to-learn",
      "dept-research",
      "dept-innovation",
    ],
    sortOrder: 3,
    iconKey: "pillar-thinking",
  },
  {
    id: "build_your_legacy",
    slug: "build-your-legacy",
    title: "Build Your Legacy",
    tagline: "Turn knowledge into lasting impact.",
    description:
      "Leadership, influence, teaching, growth, and contribution.",
    departmentIds: [
      "dept-leadership",
      "dept-coaching",
      "dept-mentoring",
      "dept-speaking",
      "dept-writing",
      "dept-course-creation",
      "dept-community-building",
      "dept-thought-leadership",
      "dept-legacy-building",
    ],
    sortOrder: 4,
    iconKey: "pillar-legacy",
  },
];

function dept(
  id: string,
  pillarId: InstitutePillarDefinition["id"],
  title: string,
  sortOrder: number,
) {
  return {
    id,
    pillarId,
    slug: id.replace(/^dept-/, ""),
    title,
    sortOrder,
  };
}

const DEPARTMENTS = [
  // Pillar I — Build Yourself
  dept("dept-entrepreneur-mindset", "build_yourself", "Entrepreneur Mindset", 1),
  dept("dept-confidence-courage", "build_yourself", "Confidence & Courage", 2),
  dept("dept-adhd-entrepreneurship", "build_yourself", "ADHD Entrepreneurship", 3),
  dept("dept-executive-function", "build_yourself", "Executive Function", 4),
  dept("dept-productivity-momentum", "build_yourself", "Productivity & Momentum", 5),
  dept("dept-emotional-intelligence", "build_yourself", "Emotional Intelligence", 6),
  dept("dept-habits-consistency", "build_yourself", "Habits & Consistency", 7),
  dept("dept-resilience-recovery", "build_yourself", "Resilience & Recovery", 8),
  dept("dept-focus-attention", "build_yourself", "Focus & Attention", 9),
  dept("dept-energy-management", "build_yourself", "Energy Management", 10),
  dept("dept-communication", "build_yourself", "Communication", 11),
  dept("dept-personal-leadership", "build_yourself", "Personal Leadership", 12),
  // Pillar II — Build Your Business
  dept("dept-business-foundations", "build_your_business", "Business Foundations", 1),
  dept("dept-strategy", "build_your_business", "Strategy", 2),
  dept("dept-marketing", "build_your_business", "Marketing", 3),
  dept("dept-branding", "build_your_business", "Branding", 4),
  dept("dept-sales", "build_your_business", "Sales", 5),
  dept("dept-customer-experience", "build_your_business", "Customer Experience", 6),
  dept("dept-finance", "build_your_business", "Finance", 7),
  dept("dept-operations", "build_your_business", "Operations", 8),
  dept("dept-systems", "build_your_business", "Systems", 9),
  dept("dept-project-management", "build_your_business", "Project Management", 10),
  dept("dept-ai-for-business", "build_your_business", "AI for Business", 11),
  dept("dept-business-growth", "build_your_business", "Business Growth", 12),
  dept(
    "dept-legal-risk-awareness",
    "build_your_business",
    "Legal & Risk Awareness",
    13,
  ),
  // Pillar III — Build Your Thinking
  dept("dept-critical-thinking", "build_your_thinking", "Critical Thinking", 1),
  dept("dept-strategic-thinking", "build_your_thinking", "Strategic Thinking", 2),
  dept("dept-systems-thinking", "build_your_thinking", "Systems Thinking", 3),
  dept("dept-creative-thinking", "build_your_thinking", "Creative Thinking", 4),
  dept("dept-decision-making", "build_your_thinking", "Decision Making", 5),
  dept(
    "dept-opportunity-recognition",
    "build_your_thinking",
    "Opportunity Recognition",
    6,
  ),
  dept("dept-problem-solving", "build_your_thinking", "Problem Solving", 7),
  dept(
    "dept-learning-how-to-learn",
    "build_your_thinking",
    "Learning How to Learn",
    8,
  ),
  dept("dept-research", "build_your_thinking", "Research", 9),
  dept("dept-innovation", "build_your_thinking", "Innovation", 10),
  // Pillar IV — Build Your Legacy
  dept("dept-leadership", "build_your_legacy", "Leadership", 1),
  dept("dept-coaching", "build_your_legacy", "Coaching", 2),
  dept("dept-mentoring", "build_your_legacy", "Mentoring", 3),
  dept("dept-speaking", "build_your_legacy", "Speaking", 4),
  dept("dept-writing", "build_your_legacy", "Writing", 5),
  dept("dept-course-creation", "build_your_legacy", "Course Creation", 6),
  dept("dept-community-building", "build_your_legacy", "Community Building", 7),
  dept("dept-thought-leadership", "build_your_legacy", "Thought Leadership", 8),
  dept("dept-legacy-building", "build_your_legacy", "Legacy Building", 9),
];

function drawer(
  departmentId: string,
  pillarId: InstitutePillarDefinition["id"],
  slug: string,
  title: string,
  sortOrder: number,
) {
  return {
    id: `drawer-${departmentId.replace(/^dept-/, "")}-${slug}`,
    departmentId,
    pillarId,
    slug,
    title,
    sortOrder,
  };
}

/** Example drawers from v1.0 framework — expandable via catalog provider */
const EXAMPLE_DRAWERS = [
  // Build Yourself
  drawer("dept-confidence-courage", "build_yourself", "confidence", "Confidence", 1),
  drawer("dept-confidence-courage", "build_yourself", "fear", "Fear", 2),
  drawer("dept-confidence-courage", "build_yourself", "perfectionism", "Perfectionism", 3),
  drawer("dept-confidence-courage", "build_yourself", "imposter-syndrome", "Imposter Syndrome", 4),
  drawer("dept-executive-function", "build_yourself", "decision-fatigue", "Decision Fatigue", 1),
  drawer("dept-executive-function", "build_yourself", "task-initiation", "Task Initiation", 2),
  drawer("dept-executive-function", "build_yourself", "time-blindness", "Time Blindness", 3),
  drawer("dept-executive-function", "build_yourself", "executive-function", "Executive Function", 4),
  drawer("dept-productivity-momentum", "build_yourself", "motivation", "Motivation", 1),
  drawer("dept-habits-consistency", "build_yourself", "habits", "Habits", 1),
  drawer("dept-resilience-recovery", "build_yourself", "resilience", "Resilience", 1),
  drawer("dept-communication", "build_yourself", "boundaries", "Boundaries", 1),
  drawer("dept-speaking", "build_yourself", "public-speaking", "Public Speaking", 1),
  drawer("dept-communication", "build_yourself", "listening", "Listening", 2),
  drawer("dept-communication", "build_yourself", "negotiation", "Negotiation", 3),
  drawer("dept-communication", "build_yourself", "networking", "Networking", 4),
  drawer("dept-personal-leadership", "build_yourself", "influence", "Influence", 1),
  // Build Your Business
  drawer("dept-business-foundations", "build_your_business", "business-models", "Business Models", 1),
  drawer("dept-business-foundations", "build_your_business", "business-planning", "Business Planning", 2),
  drawer("dept-business-foundations", "build_your_business", "mission", "Mission", 3),
  drawer("dept-business-foundations", "build_your_business", "vision", "Vision", 4),
  drawer("dept-strategy", "build_your_business", "offers", "Offers", 1),
  drawer("dept-marketing", "build_your_business", "pricing", "Pricing", 1),
  drawer("dept-branding", "build_your_business", "branding", "Branding", 1),
  drawer("dept-marketing", "build_your_business", "messaging", "Messaging", 2),
  drawer("dept-marketing", "build_your_business", "positioning", "Positioning", 3),
  drawer("dept-marketing", "build_your_business", "headlines", "Headlines", 4),
  drawer("dept-marketing", "build_your_business", "storytelling", "Storytelling", 5),
  drawer("dept-sales", "build_your_business", "sales-psychology", "Sales Psychology", 1),
  drawer("dept-sales", "build_your_business", "discovery-calls", "Discovery Calls", 2),
  drawer("dept-sales", "build_your_business", "closing", "Closing", 3),
  drawer("dept-customer-experience", "build_your_business", "customer-journey", "Customer Journey", 1),
  drawer("dept-operations", "build_your_business", "hiring", "Hiring", 1),
  drawer("dept-operations", "build_your_business", "delegation", "Delegation", 2),
  drawer("dept-systems", "build_your_business", "sops", "SOPs", 1),
  drawer("dept-finance", "build_your_business", "cash-flow", "Cash Flow", 1),
  drawer("dept-finance", "build_your_business", "profit", "Profit", 2),
  drawer("dept-finance", "build_your_business", "forecasting", "Forecasting", 3),
  drawer("dept-systems", "build_your_business", "automation", "Automation", 2),
  drawer("dept-systems", "build_your_business", "crm", "CRM", 3),
  // Build Your Thinking
  drawer("dept-critical-thinking", "build_your_thinking", "critical-thinking", "Critical Thinking", 1),
  drawer("dept-critical-thinking", "build_your_thinking", "first-principles", "First Principles", 2),
  drawer("dept-strategic-thinking", "build_your_thinking", "second-order-thinking", "Second-Order Thinking", 1),
  drawer("dept-critical-thinking", "build_your_thinking", "pattern-recognition", "Pattern Recognition", 3),
  drawer("dept-creative-thinking", "build_your_thinking", "visual-thinking", "Visual Thinking", 1),
  drawer("dept-creative-thinking", "build_your_thinking", "creative-thinking", "Creative Thinking", 2),
  drawer("dept-decision-making", "build_your_thinking", "decision-trees", "Decision Trees", 1),
  drawer("dept-problem-solving", "build_your_thinking", "root-cause-analysis", "Root Cause Analysis", 1),
  drawer("dept-strategic-thinking", "build_your_thinking", "mental-models", "Mental Models", 2),
  drawer("dept-research", "build_your_thinking", "research-skills", "Research Skills", 1),
  drawer("dept-opportunity-recognition", "build_your_thinking", "opportunity-recognition", "Opportunity Recognition", 1),
  drawer("dept-strategic-thinking", "build_your_thinking", "business-analysis", "Business Analysis", 3),
  drawer("dept-strategic-thinking", "build_your_thinking", "scenario-planning", "Scenario Planning", 4),
  drawer("dept-innovation", "build_your_thinking", "innovation", "Innovation", 1),
  // Build Your Legacy
  drawer("dept-leadership", "build_your_legacy", "leadership", "Leadership", 1),
  drawer("dept-operations", "build_your_legacy", "delegation", "Delegation", 1),
  drawer("dept-coaching", "build_your_legacy", "coaching", "Coaching", 1),
  drawer("dept-mentoring", "build_your_legacy", "mentoring", "Mentoring", 1),
  drawer("dept-writing", "build_your_legacy", "writing", "Writing", 1),
  drawer("dept-writing", "build_your_legacy", "books", "Books", 2),
  drawer("dept-course-creation", "build_your_legacy", "courses", "Courses", 1),
  drawer("dept-course-creation", "build_your_legacy", "teaching", "Teaching", 2),
  drawer("dept-speaking", "build_your_legacy", "public-speaking", "Public Speaking", 1),
  drawer("dept-thought-leadership", "build_your_legacy", "authority", "Authority", 1),
  drawer("dept-community-building", "build_your_legacy", "community", "Community", 1),
  drawer("dept-business-growth", "build_your_legacy", "partnerships", "Partnerships", 1),
  drawer("dept-legacy-building", "build_your_legacy", "vision", "Vision", 1),
  drawer("dept-legacy-building", "build_your_legacy", "culture", "Culture", 2),
  drawer("dept-legacy-building", "build_your_legacy", "giving-back", "Giving Back", 3),
];

const PERSPECTIVES: KnowledgePerspectiveDefinition[] = [
  { id: "persp-behavioral-psychology", slug: "behavioral-psychology", title: "Behavioral psychology", description: "How people decide and behave." },
  { id: "persp-economics", slug: "economics", title: "Economics", description: "Value, markets, and incentives." },
  { id: "persp-sales", slug: "sales", title: "Sales", description: "Ethical persuasion and conversion." },
  { id: "persp-brand-strategy", slug: "brand-strategy", title: "Brand strategy", description: "Meaning, positioning, and trust." },
  { id: "persp-customer-experience", slug: "customer-experience", title: "Customer experience", description: "Journey, service, and retention." },
  { id: "persp-entrepreneurship", slug: "entrepreneurship", title: "Entrepreneurship", description: "Building under uncertainty." },
  { id: "persp-organizational-psychology", slug: "organizational-psychology", title: "Organizational psychology", description: "Teams, culture, and systems." },
  { id: "persp-communication", slug: "communication", title: "Communication", description: "Clarity, listening, and influence." },
  { id: "persp-team-development", slug: "team-development", title: "Team development", description: "Growing people and capability." },
  { id: "persp-decision-science", slug: "decision-science", title: "Decision science", description: "Better choices under pressure." },
  { id: "persp-coaching", slug: "coaching", title: "Coaching", description: "Questions that unlock action." },
  { id: "persp-executive-function", slug: "executive-function", title: "Executive function", description: "Initiation, planning, and follow-through." },
  { id: "persp-neuroscience", slug: "neuroscience", title: "Neuroscience", description: "Brain-friendly work design." },
  { id: "persp-learning-science", slug: "learning-science", title: "Learning science", description: "How capability compounds." },
  { id: "persp-behavioral-design", slug: "behavioral-design", title: "Behavioral design", description: "Environment shapes behavior." },
  { id: "persp-habit-formation", slug: "habit-formation", title: "Habit formation", description: "Consistency without shame." },
];

/** Topic → perspective mapping examples (catalog entries reference these ids) */
export const TOPIC_PERSPECTIVE_EXAMPLES: Record<string, string[]> = {
  pricing: [
    "persp-behavioral-psychology",
    "persp-economics",
    "persp-sales",
    "persp-brand-strategy",
    "persp-customer-experience",
    "persp-entrepreneurship",
  ],
  leadership: [
    "persp-organizational-psychology",
    "persp-communication",
    "persp-team-development",
    "persp-decision-science",
    "persp-coaching",
  ],
  "adhd-entrepreneurship": [
    "persp-executive-function",
    "persp-neuroscience",
    "persp-learning-science",
    "persp-behavioral-design",
    "persp-habit-formation",
    "persp-entrepreneurship",
  ],
};

export const SPARK_COMPETENCY_FRAMEWORK_V1: SparkCompetencyFrameworkV1 = {
  version: COMPETENCY_FRAMEWORK_VERSION,
  pillars: PILLARS,
  departments: DEPARTMENTS,
  exampleDrawers: EXAMPLE_DRAWERS,
  perspectives: PERSPECTIVES,
};

export function getPillarById(id: string) {
  return PILLARS.find((p) => p.id === id) ?? null;
}

export function listDepartmentsForPillar(pillarId: string) {
  return DEPARTMENTS.filter((d) => d.pillarId === pillarId).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function listExampleDrawersForDepartment(departmentId: string) {
  return EXAMPLE_DRAWERS.filter((d) => d.departmentId === departmentId).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export function getPerspectiveById(id: string) {
  return PERSPECTIVES.find((p) => p.id === id) ?? null;
}

export function perspectivesForTopicSlug(slug: string): string[] {
  return TOPIC_PERSPECTIVE_EXAMPLES[slug] ?? [];
}
