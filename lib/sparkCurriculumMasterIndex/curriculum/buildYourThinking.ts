/**
 * Pillar III — Build Your Thinking curriculum map
 */

import { buildCurriculumEntry, EXPERIENCE_BUNDLES } from "../buildEntry";
import type { CurriculumMasterIndexEntry } from "../types";

const P = "build_your_thinking" as const;

function t(
  deptId: string,
  deptTitle: string,
  drawerSlug: string,
  drawerTitle: string,
  slug: string,
  title: string,
  shortDescription: string,
  capabilityFocus: string,
  competencies: string[],
  opts: {
    stages?: ("idea" | "launch" | "growth" | "scale" | "mature" | "all")[];
    adhd?: "none" | "low" | "medium" | "high";
    ai?: "none" | "low" | "medium" | "high";
    difficulty?: "foundational" | "intermediate" | "advanced" | "expert";
    minutes?: number;
    bundle?: keyof typeof EXPERIENCE_BUNDLES;
    sort: number;
  },
): CurriculumMasterIndexEntry {
  return buildCurriculumEntry({
    pillarId: P,
    departmentId: deptId,
    departmentTitle: deptTitle,
    drawerSlug,
    drawerTitle,
    slug,
    title,
    shortDescription,
    capabilityFocus,
    primaryCompetencies: competencies,
    businessStages: opts.stages ?? ["all"],
    adhdRelevance: opts.adhd ?? "medium",
    aiRelevance: opts.ai ?? "medium",
    difficulty: opts.difficulty ?? "foundational",
    estimatedMinutes: opts.minutes ?? 15,
    futureLearningExperiences: EXPERIENCE_BUNDLES[opts.bundle ?? "core"],
    sortOrder: opts.sort,
  });
}

export const BUILD_YOUR_THINKING_CURRICULUM: CurriculumMasterIndexEntry[] = [
  // Critical Thinking
  t("dept-critical-thinking", "Critical Thinking", "critical-thinking", "Critical Thinking", "clear-thinking", "Clear Thinking", "Think clearly under noise.", "Cut through noise to clear thought.", ["critical-thinking"], { bundle: "mastery", sort: 1 }),
  t("dept-critical-thinking", "Critical Thinking", "first-principles", "First Principles", "first-principles-reasoning", "First Principles Reasoning", "Break problems to fundamentals.", "Reason from first principles.", ["critical-thinking", "problem-solving"], { difficulty: "intermediate", bundle: "mastery", sort: 1 }),
  t("dept-critical-thinking", "Critical Thinking", "bias-awareness", "Bias Awareness", "cognitive-biases", "Cognitive Biases", "See biases before they decide.", "Recognize biases in your thinking.", ["critical-thinking", "decision-making"], { sort: 1 }),
  t("dept-critical-thinking", "Critical Thinking", "pattern-recognition", "Pattern Recognition", "business-patterns", "Business Patterns", "Patterns across situations.", "Recognize patterns without overfitting.", ["pattern-recognition", "strategic-thinking"], { difficulty: "intermediate", sort: 1 }),
  // Strategic Thinking
  t("dept-strategic-thinking", "Strategic Thinking", "second-order-thinking", "Second-Order Thinking", "second-order-effects", "Second-Order Effects", "Consider what happens next.", "Think through second-order effects.", ["strategic-thinking", "decision-making"], { bundle: "mastery", sort: 1 }),
  t("dept-strategic-thinking", "Strategic Thinking", "mental-models", "Mental Models", "founder-mental-models", "Founder Mental Models", "Models that improve decisions.", "Apply mental models judiciously.", ["mental-models", "strategic-thinking"], { difficulty: "intermediate", bundle: "mastery", sort: 1 }),
  t("dept-strategic-thinking", "Strategic Thinking", "business-analysis", "Business Analysis", "analyze-your-business", "Analyze Your Business", "See your business as a system.", "Analyze business performance holistically.", ["business-strategy", "systems-thinking"], { difficulty: "intermediate", sort: 1 }),
  t("dept-strategic-thinking", "Strategic Thinking", "scenario-planning", "Scenario Planning", "scenario-planning", "Scenario Planning", "Plan for multiple futures.", "Plan scenarios without paralysis.", ["strategic-thinking", "planning"], { difficulty: "advanced", bundle: "mastery", sort: 1 }),
  // Systems Thinking
  t("dept-systems-thinking", "Systems Thinking", "feedback-loops", "Feedback Loops", "business-feedback-loops", "Business Feedback Loops", "Loops that drive or drain growth.", "Identify reinforcing and balancing loops.", ["systems-thinking", "business-strategy"], { difficulty: "intermediate", sort: 1 }),
  t("dept-systems-thinking", "Systems Thinking", "leverage-points", "Leverage Points", "high-leverage-changes", "High Leverage Changes", "Small changes, big effects.", "Find leverage in complex systems.", ["systems-thinking", "strategic-thinking"], { difficulty: "advanced", sort: 1 }),
  // Creative Thinking
  t("dept-creative-thinking", "Creative Thinking", "creative-thinking", "Creative Thinking", "ideation", "Ideation", "Generate options before choosing.", "Generate strong options before deciding.", ["creative-thinking", "innovation"], { bundle: "practice", sort: 1 }),
  t("dept-creative-thinking", "Creative Thinking", "visual-thinking", "Visual Thinking", "visual-mapping", "Visual Mapping", "Think on paper and walls.", "Use visual thinking to clarify.", ["visual-thinking", "creative-thinking"], { adhd: "high", bundle: "practice", sort: 1 }),
  t("dept-creative-thinking", "Creative Thinking", "constraints", "Constraints", "creative-constraints", "Creative Constraints", "Constraints that unlock creativity.", "Use constraints to spark ideas.", ["creative-thinking", "problem-solving"], { sort: 1 }),
  // Decision Making
  t("dept-decision-making", "Decision Making", "decision-trees", "Decision Trees", "structured-decisions", "Structured Decisions", "Structure complex choices.", "Structure decisions without overthinking.", ["decision-making", "executive-function"], { adhd: "high", bundle: "practice", sort: 1 }),
  t("dept-decision-making", "Decision Making", "reversible-decisions", "Reversible Decisions", "one-way-two-way-doors", "One-Way Two-Way Doors", "Speed on reversible decisions.", "Match decision speed to reversibility.", ["decision-making", "momentum"], { sort: 1 }),
  t("dept-decision-making", "Decision Making", "decision-criteria", "Decision Criteria", "weighted-criteria", "Weighted Criteria", "Criteria before options.", "Define criteria before comparing options.", ["decision-making", "critical-thinking"], { sort: 1 }),
  // Opportunity Recognition
  t("dept-opportunity-recognition", "Opportunity Recognition", "opportunity-recognition", "Opportunity Recognition", "spotting-opportunities", "Spotting Opportunities", "See opportunities others miss.", "Spot viable opportunities early.", ["opportunity-recognition", "entrepreneur-mindset"], { bundle: "mastery", sort: 1 }),
  t("dept-opportunity-recognition", "Opportunity Recognition", "trend-spotting", "Trend Spotting", "market-trends", "Market Trends", "Trends vs fads.", "Distinguish durable trends from fads.", ["opportunity-recognition", "research"], { difficulty: "intermediate", sort: 1 }),
  // Problem Solving
  t("dept-problem-solving", "Problem Solving", "root-cause-analysis", "Root Cause Analysis", "root-cause", "Root Cause", "Solve causes, not symptoms.", "Find root causes systematically.", ["problem-solving", "critical-thinking"], { bundle: "practice", sort: 1 }),
  t("dept-problem-solving", "Problem Solving", "five-whys", "Five Whys", "five-whys-method", "Five Whys Method", "Dig deeper with five whys.", "Use five whys without stopping early.", ["problem-solving", "systems-thinking"], { sort: 1 }),
  t("dept-problem-solving", "Problem Solving", "problem-framing", "Problem Framing", "frame-the-problem", "Frame The Problem", "Frame problems before solving.", "Frame problems worth solving.", ["problem-solving", "strategic-thinking"], { sort: 1 }),
  // Learning How to Learn
  t("dept-learning-how-to-learn", "Learning How to Learn", "learning-science", "Learning Science", "how-learning-works", "How Learning Works", "Learn how you learn best.", "Apply learning science to business skill.", ["learning-science"], { bundle: "core", sort: 1 }),
  t("dept-learning-how-to-learn", "Learning How to Learn", "metacognition", "Metacognition", "thinking-about-thinking", "Thinking About Thinking", "Notice how you think while thinking.", "Improve thinking by observing it.", ["learning-science", "critical-thinking"], { sort: 1 }),
  t("dept-learning-how-to-learn", "Learning How to Learn", "skill-acquisition", "Skill Acquisition", "deliberate-practice", "Deliberate Practice", "Practice that builds capability.", "Practice skills deliberately.", ["learning-science", "momentum"], { bundle: "practice", sort: 1 }),
  // Research
  t("dept-research", "Research", "research-skills", "Research Skills", "business-research", "Business Research", "Research that informs decisions.", "Research efficiently for decisions.", ["research", "critical-thinking"], { sort: 1 }),
  t("dept-research", "Research", "customer-interviews", "Customer Interviews", "interview-customers", "Interview Customers", "Learn directly from customers.", "Interview customers without leading them.", ["research", "customer-experience"], { bundle: "practice", sort: 1 }),
  t("dept-research", "Research", "competitive-research", "Competitive Research", "competitive-analysis", "Competitive Analysis", "Understand competitors calmly.", "Analyze competitors without obsession.", ["research", "business-strategy"], { sort: 1 }),
  // Innovation
  t("dept-innovation", "Innovation", "innovation", "Innovation", "innovation-mindset", "Innovation Mindset", "Experiment and iterate.", "Innovate through disciplined experiments.", ["innovation", "creative-thinking"], { bundle: "mastery", sort: 1 }),
  t("dept-innovation", "Innovation", "mvp-thinking", "MVP Thinking", "minimum-viable-offer", "Minimum Viable Offer", "Test before you build big.", "Test offers with minimum viable scope.", ["innovation", "offers"], { stages: ["idea", "launch"], sort: 1 }),
  t("dept-innovation", "Innovation", "iteration", "Iteration", "build-measure-learn", "Build Measure Learn", "Loops of learning in the market.", "Iterate based on real feedback.", ["innovation", "learning-science"], { sort: 1 }),
];
