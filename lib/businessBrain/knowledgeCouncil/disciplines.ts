/**
 * Spark Knowledge Council — research disciplines registry.
 * INTERNAL — informs synthesis; never shown as expert names to members.
 */

import type { ResearchDiscipline } from "../types";

export const RESEARCH_DISCIPLINES: ResearchDiscipline[] = [
  { id: "disc-behavioral-psychology", slug: "behavioral-psychology", title: "Behavioral psychology", description: "How people decide, habituate, and respond.", visibility: "internal" },
  { id: "disc-behavioral-economics", slug: "behavioral-economics", title: "Behavioral economics", description: "Incentives, framing, and choice architecture.", visibility: "internal" },
  { id: "disc-economics", slug: "economics", title: "Economics", description: "Markets, value exchange, and pricing theory.", visibility: "internal" },
  { id: "disc-organizational-psychology", slug: "organizational-psychology", title: "Organizational psychology", description: "Teams, culture, and workplace behavior.", visibility: "internal" },
  { id: "disc-neuroscience", slug: "neuroscience", title: "Neuroscience", description: "Brain function, attention, and regulation.", visibility: "internal" },
  { id: "disc-executive-function-science", slug: "executive-function-science", title: "Executive function science", description: "Planning, initiation, working memory, flexibility.", visibility: "internal" },
  { id: "disc-learning-science", slug: "learning-science", title: "Learning science", description: "How capability is acquired and retained.", visibility: "internal" },
  { id: "disc-adult-development", slug: "adult-development", title: "Adult development", description: "Growth, identity, and capability over time.", visibility: "internal" },
  { id: "disc-communication-theory", slug: "communication-theory", title: "Communication theory", description: "Clarity, persuasion, and dialogue.", visibility: "internal" },
  { id: "disc-decision-science", slug: "decision-science", title: "Decision science", description: "Judgment, uncertainty, and choice quality.", visibility: "internal" },
  { id: "disc-systems-theory", slug: "systems-theory", title: "Systems theory", description: "Feedback, leverage, and complexity.", visibility: "internal" },
  { id: "disc-strategic-management", slug: "strategic-management", title: "Strategic management", description: "Positioning, advantage, and execution.", visibility: "internal" },
  { id: "disc-marketing-science", slug: "marketing-science", title: "Marketing science", description: "Demand, messaging, and customer behavior.", visibility: "internal" },
  { id: "disc-sales-methodology", slug: "sales-methodology", title: "Sales methodology", description: "Discovery, trust, and ethical conversion.", visibility: "internal" },
  { id: "disc-brand-strategy", slug: "brand-strategy", title: "Brand strategy", description: "Meaning, differentiation, and trust.", visibility: "internal" },
  { id: "disc-operations-research", slug: "operations-research", title: "Operations research", description: "Process design and throughput.", visibility: "internal" },
  { id: "disc-financial-management", slug: "financial-management", title: "Financial management", description: "Cash, profit, forecasting, and unit economics.", visibility: "internal" },
  { id: "disc-entrepreneurship-studies", slug: "entrepreneurship-studies", title: "Entrepreneurship studies", description: "Building under uncertainty.", visibility: "internal" },
  { id: "disc-innovation-studies", slug: "innovation-studies", title: "Innovation studies", description: "Experimentation, iteration, and adoption.", visibility: "internal" },
  { id: "disc-coaching-methodology", slug: "coaching-methodology", title: "Coaching methodology", description: "Questions, accountability, and growth.", visibility: "internal" },
  { id: "disc-leadership-studies", slug: "leadership-studies", title: "Leadership studies", description: "Influence, culture, and stewardship.", visibility: "internal" },
  { id: "disc-ethics", slug: "ethics", title: "Ethics", description: "Responsible business and AI use.", visibility: "internal" },
  { id: "disc-design-thinking", slug: "design-thinking", title: "Design thinking", description: "Human-centered problem solving.", visibility: "internal" },
  { id: "disc-information-science", slug: "information-science", title: "Information science", description: "Research, evidence, and sense-making.", visibility: "internal" },
  { id: "disc-habit-formation", slug: "habit-formation", title: "Habit formation", description: "Consistency through environment and cues.", visibility: "internal" },
];
