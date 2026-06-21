/**
 * Cognitive Growth Principle — product north star for the ADHD Business Ecosystem™.
 * Support first. Growth second. Users should feel helped before they feel taught.
 */

export const THINKING_SKILLS = [
  "Reflection",
  "Pattern Recognition",
  "Decision Making",
  "Prioritization",
  "Problem Solving",
  "Confidence Building",
  "Self Awareness",
  "Strategic Thinking",
  "Learning From Experience",
] as const;

export type ThinkingSkill = (typeof THINKING_SKILLS)[number];

export type CognitiveGrowthProfile = {
  /** Question 1: How does this help the user today? */
  helpsToday: string;
  /** Question 2: What thinking skill does this strengthen? */
  strengthens: string;
  skills: ThinkingSkill[];
};

/** Per-workspace immediate value + cognitive growth (12 main areas + common tools). */
export const COGNITIVE_GROWTH_BY_AREA: Record<string, CognitiveGrowthProfile> = {
  "plan-my-day": {
    helpsToday: "Creates clarity and direction for today.",
    strengthens:
      "Strengthens prioritization and decision-making — choosing what matters when everything feels urgent.",
    skills: ["Prioritization", "Decision Making"],
  },
  projects: {
    helpsToday: "Turns scattered work into one place with a clear next step.",
    strengthens:
      "Strengthens problem solving and strategic thinking — breaking big goals into doable moves.",
    skills: ["Problem Solving", "Strategic Thinking"],
  },
  "content-generator": {
    helpsToday: "Gets words on the page when you know what you need but can't start.",
    strengthens:
      "Builds confidence and learning from experience — each draft teaches what works for your voice.",
    skills: ["Confidence Building", "Learning From Experience"],
  },
  "brain-dump": {
    helpsToday: "Reduces overwhelm by getting thoughts out of your head.",
    strengthens:
      "Strengthens pattern recognition and self-awareness — you see what's really crowding your mind.",
    skills: ["Pattern Recognition", "Self Awareness"],
  },
  playbook: {
    helpsToday: "Gives you a proven path when you're stuck on what to do next.",
    strengthens:
      "Strengthens problem solving and strategic thinking — matching the right approach to the situation.",
    skills: ["Problem Solving", "Strategic Thinking"],
  },
  "templates-library": {
    helpsToday: "Starts you from a framework instead of a blank page.",
    strengthens:
      "Builds learning from experience — reusable structures you refine over time.",
    skills: ["Learning From Experience", "Confidence Building"],
  },
  snippets: {
    helpsToday: "Saves phrases you use again so you don't rewrite from scratch.",
    strengthens:
      "Builds confidence — your best lines become easy to reach when you need them.",
    skills: ["Confidence Building", "Learning From Experience"],
  },
  "my-work": {
    helpsToday: "Finds drafts, projects, and files when you know the name but not the workspace.",
    strengthens:
      "Strengthens organization and self-awareness — you see what you've actually built.",
    skills: ["Self Awareness", "Problem Solving"],
  },
  "evidence-bank": {
    helpsToday: "Captures meaningful progress so it doesn't disappear.",
    strengthens:
      "Helps you recognize impact, patterns, strengths, and results over time.",
    skills: ["Pattern Recognition", "Reflection"],
  },
  "wins-this-week": {
    helpsToday: "Celebrates progress without scorekeeping pressure.",
    strengthens:
      "Builds reflection and confidence — noticing what went well trains your brain to see momentum.",
    skills: ["Reflection", "Confidence Building"],
  },
  "client-avatars": {
    helpsToday: "Clarifies who you serve so messaging feels personal, not generic.",
    strengthens:
      "Strengthens decision making and strategic thinking — sharper choices about offers and content.",
    skills: ["Decision Making", "Strategic Thinking"],
  },
  settings: {
    helpsToday: "Tunes the ecosystem to how you work and communicate.",
    strengthens:
      "Builds self-awareness — you learn what settings help you think and act at your best.",
    skills: ["Self Awareness"],
  },
  "time-block": {
    helpsToday: "Protects a window for one important thing today.",
    strengthens:
      "Strengthens prioritization and decision-making — committing to one block at a time.",
    skills: ["Prioritization", "Decision Making"],
  },
  "decision-compass": {
    helpsToday: "Helps when you're torn between options and need clarity.",
    strengthens:
      "Strengthens decision making and reflection — weighing tradeoffs without endless analysis.",
    skills: ["Decision Making", "Reflection"],
  },
};

export function getCognitiveGrowthProfile(
  areaId: string,
): CognitiveGrowthProfile | null {
  return COGNITIVE_GROWTH_BY_AREA[areaId] ?? null;
}

/** Injected into Shari's system prompt — keep actionable, not preachy. */
export const COGNITIVE_GROWTH_PROMPT_BLOCK = `# COGNITIVE GROWTH PRINCIPLE (apply silently — never lecture)
The ecosystem helps users solve immediate problems AND gradually strengthen how they think, decide, organize, prioritize, learn, and reflect. The goal is not only getting things done — it is becoming more capable, confident, and self-aware over time.

CORE RULE — Support first. Growth second.
The user should always feel helped before they feel taught. Solve the immediate problem before introducing reflection, pattern recognition, or learning.

RELIEF BEFORE REFLECTION — When overwhelmed, frustrated, stuck, anxious, confused, or emotionally activated:
1. Reduce pressure. 2. Create clarity. 3. Provide support. 4. Help them move forward.
Only then introduce reflection or learning. Never trap users in endless analysis — action before deep analysis when they need momentum.

BUILD THINKING CAPACITY, NOT DEPENDENCY
Strengthen their ability to decide, prioritize, solve problems, recognize patterns, reflect, learn from experience, and build confidence. Never create dependence on the AI — they should become more capable because of the system.

EVERY FEATURE ANSWERS TWO QUESTIONS (answer Q1 first in conversation; Q2 only when appropriate):
1. How does this help them today?
2. What thinking skill does this strengthen? (reflection, pattern recognition, decision making, prioritization, problem solving, confidence, self-awareness, strategic thinking, learning from experience)

SUCCESS: They should feel "This helped me" before they realize "This helped me grow."`;
