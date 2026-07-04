/**
 * Estate Expert Registry™ — internal advisors Spark selects automatically.
 * Members never choose experts; Spark integrates expertise invisibly.
 */

import type { EstateExpert } from "./intelligenceTypes";

export const ESTATE_EXPERTS: readonly EstateExpert[] = [
  {
    id: "copywriter",
    name: "Copywriter",
    categories: ["create"],
    specialties: ["email", "newsletter", "blog", "social", "website copy"],
    triggers: ["write", "email", "newsletter", "blog", "copy", "headline"],
  },
  {
    id: "research-analyst",
    name: "Research Analyst",
    categories: ["research", "learn"],
    specialties: ["research", "analysis", "comparisons", "trends", "summaries"],
    triggers: ["research", "compare", "analyze", "trends", "latest", "report"],
  },
  {
    id: "marketing-expert",
    name: "Marketing Expert",
    categories: ["business", "momentum", "create"],
    specialties: ["marketing", "campaigns", "content", "launches"],
    triggers: ["marketing", "campaign", "launch", "audience", "funnel"],
  },
  {
    id: "business-strategist",
    name: "Business Strategist",
    categories: ["business", "momentum"],
    specialties: ["strategy", "planning", "offers", "growth"],
    triggers: ["business", "strategy", "plan", "grow", "build my business"],
  },
  {
    id: "sales-expert",
    name: "Sales Expert",
    categories: ["business"],
    specialties: ["sales", "crm", "pipeline", "offers", "pricing"],
    triggers: ["sales", "crm", "pipeline", "close", "pricing"],
  },
  {
    id: "instructional-designer",
    name: "Instructional Designer",
    categories: ["create", "learn"],
    specialties: ["sop", "course", "training", "curriculum"],
    triggers: ["sop", "course", "training", "lesson", "curriculum"],
  },
  {
    id: "project-manager",
    name: "Project Manager",
    categories: ["momentum"],
    specialties: ["projects", "roadmap", "milestones", "action plans"],
    triggers: ["project", "roadmap", "milestone", "action plan", "timeline"],
  },
  {
    id: "adhd-coach",
    name: "ADHD Coach",
    categories: ["focus", "restore", "momentum"],
    specialties: ["focus", "overwhelm", "executive function", "body doubling"],
    triggers: ["focus", "adhd", "overwhelm", "distract", "body double"],
  },
  {
    id: "executive-coach",
    name: "Executive Coach",
    categories: ["business", "momentum", "learn"],
    specialties: ["decisions", "leadership", "priorities"],
    triggers: ["decide", "priority", "leadership", "executive"],
  },
  {
    id: "writing-coach",
    name: "Writing Coach",
    categories: ["create", "journal"],
    specialties: ["writing", "reflection", "proposal", "presentation"],
    triggers: ["write", "draft", "proposal", "presentation", "journal"],
  },
  {
    id: "technology-expert",
    name: "Technology Expert",
    categories: ["research", "learn", "business"],
    specialties: ["ai tools", "software", "tech trends"],
    triggers: ["ai", "software", "tool", "tech", "automation"],
  },
  {
    id: "productivity-specialist",
    name: "Productivity Specialist",
    categories: ["focus", "momentum"],
    specialties: ["pomodoro", "deep work", "weekly planning"],
    triggers: ["productive", "pomodoro", "deep work", "weekly plan"],
  },
  {
    id: "graphic-design-advisor",
    name: "Graphic Design Advisor",
    categories: ["create", "play"],
    specialties: ["images", "vision board", "visual", "design"],
    triggers: ["image", "design", "vision board", "visual", "graphic"],
  },
  {
    id: "financial-educator",
    name: "Financial Educator",
    categories: ["business", "learn"],
    specialties: ["pricing", "revenue", "financial planning"],
    triggers: ["pricing", "revenue", "profit", "financial"],
  },
  {
    id: "career-advisor",
    name: "Career Advisor",
    categories: ["learn", "grow", "journal"],
    specialties: ["career", "growth", "accomplishments"],
    triggers: ["career", "accomplishment", "growth", "promotion"],
  },
] as const;

const BY_ID = new Map<string, EstateExpert>(
  ESTATE_EXPERTS.map((e) => [e.id, e]),
);

export function estateExpertById(id: string): EstateExpert | undefined {
  return BY_ID.get(id);
}

export function estateExpertNames(ids: readonly string[]): string[] {
  return ids
    .map((id) => BY_ID.get(id)?.name)
    .filter((n): n is string => Boolean(n));
}
