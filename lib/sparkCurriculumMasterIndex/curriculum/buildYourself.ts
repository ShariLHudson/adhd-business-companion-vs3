/**
 * Pillar I — Build Yourself curriculum map
 */

import { buildCurriculumEntry, EXPERIENCE_BUNDLES } from "../buildEntry";
import type { CurriculumMasterIndexEntry } from "../types";

const P = "build_yourself" as const;

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
    related?: string[];
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
    aiRelevance: opts.ai ?? "low",
    difficulty: opts.difficulty ?? "foundational",
    estimatedMinutes: opts.minutes ?? 10,
    relatedTopicSlugs: opts.related,
    futureLearningExperiences: EXPERIENCE_BUNDLES[opts.bundle ?? "core"],
    sortOrder: opts.sort,
  });
}

export const BUILD_YOURSELF_CURRICULUM: CurriculumMasterIndexEntry[] = [
  // Entrepreneur Mindset
  t("dept-entrepreneur-mindset", "Entrepreneur Mindset", "growth-mindset", "Growth Mindset", "founder-identity", "Founder Identity", "Who you are becoming as an entrepreneur.", "Develop a stable founder identity that survives setbacks.", ["entrepreneur-mindset", "confidence"], { sort: 1 }),
  t("dept-entrepreneur-mindset", "Entrepreneur Mindset", "growth-mindset", "Growth Mindset", "learning-from-failure", "Learning From Failure", "Failure as data, not verdict.", "Reframe failure into actionable learning.", ["entrepreneur-mindset", "resilience"], { sort: 2 }),
  t("dept-entrepreneur-mindset", "Entrepreneur Mindset", "risk-tolerance", "Risk Tolerance", "calculated-risk", "Calculated Risk", "Taking smart risks without recklessness.", "Judge risk with clarity instead of fear.", ["entrepreneur-mindset", "decision-making"], { difficulty: "intermediate", sort: 1 }),
  t("dept-entrepreneur-mindset", "Entrepreneur Mindset", "self-trust", "Self Trust", "trusting-your-judgment", "Trusting Your Judgment", "Confidence in your own decisions.", "Rely on your judgment after sufficient thought.", ["self-trust", "confidence"], { sort: 1 }),
  // Confidence & Courage
  t("dept-confidence-courage", "Confidence & Courage", "confidence", "Confidence", "building-confidence", "Building Confidence", "Confidence as a practiced capability.", "Act with confidence before feeling ready.", ["confidence", "courage"], { bundle: "practice", sort: 1 }),
  t("dept-confidence-courage", "Confidence & Courage", "fear", "Fear", "naming-fear", "Naming Fear", "See fear clearly without letting it drive.", "Reduce fear's grip through clarity.", ["confidence", "courage"], { sort: 1 }),
  t("dept-confidence-courage", "Confidence & Courage", "perfectionism", "Perfectionism", "good-enough", "Good Enough", "Ship work that is good enough to learn.", "Release perfectionism that blocks progress.", ["confidence", "productivity"], { adhd: "high", sort: 1 }),
  t("dept-confidence-courage", "Confidence & Courage", "imposter-syndrome", "Imposter Syndrome", "imposter-patterns", "Imposter Patterns", "Recognize imposter thoughts without believing them.", "Separate imposter feelings from facts.", ["confidence", "self-trust"], { sort: 1 }),
  t("dept-confidence-courage", "Confidence & Courage", "courage", "Courage", "courageous-action", "Courageous Action", "Small brave steps compound.", "Take courageous action despite uncertainty.", ["courage", "confidence"], { bundle: "practice", sort: 1 }),
  // ADHD Entrepreneurship
  t("dept-adhd-entrepreneurship", "ADHD Entrepreneurship", "adhd-foundations", "ADHD Foundations", "adhd-as-founder", "ADHD As A Founder", "Strengths and friction patterns for ADHD entrepreneurs.", "Design a business that fits your brain.", ["adhd-entrepreneurship", "executive-function"], { adhd: "high", bundle: "adhd", sort: 1 }),
  t("dept-adhd-entrepreneurship", "ADHD Entrepreneurship", "time-blindness", "Time Blindness", "time-awareness", "Time Awareness", "See time passing before deadlines hit.", "Develop time awareness without shame.", ["adhd-entrepreneurship", "time-management"], { adhd: "high", bundle: "adhd", sort: 1 }),
  t("dept-adhd-entrepreneurship", "ADHD Entrepreneurship", "task-initiation", "Task Initiation", "starting-tasks", "Starting Tasks", "Begin without waiting for perfect motivation.", "Initiate tasks reliably with EF supports.", ["task-initiation", "executive-function"], { adhd: "high", bundle: "adhd", sort: 1 }),
  t("dept-adhd-entrepreneurship", "ADHD Entrepreneurship", "hyperfocus", "Hyperfocus", "hyperfocus-management", "Hyperfocus Management", "Channel intense focus productively.", "Direct hyperfocus toward highest-value work.", ["adhd-entrepreneurship", "focus"], { adhd: "high", sort: 1 }),
  t("dept-adhd-entrepreneurship", "ADHD Entrepreneurship", "rejection-sensitivity", "Rejection Sensitivity", "rsd-in-business", "RSD In Business", "Rejection sensitivity in sales and feedback.", "Handle rejection without spiraling.", ["adhd-entrepreneurship", "emotional-intelligence"], { adhd: "high", sort: 1 }),
  t("dept-adhd-entrepreneurship", "ADHD Entrepreneurship", "environment-design", "Environment Design", "adhd-friendly-workspace", "ADHD-Friendly Workspace", "Environment that supports focus.", "Shape environment to reduce friction.", ["adhd-entrepreneurship", "executive-function"], { adhd: "high", bundle: "adhd", sort: 1 }),
  t("dept-adhd-entrepreneurship", "ADHD Entrepreneurship", "interest-motivation", "Interest Motivation", "interest-based-work", "Interest-Based Work", "Align work with genuine interest.", "Sustain motivation through interest alignment.", ["adhd-entrepreneurship", "momentum"], { adhd: "high", sort: 1 }),
  // Executive Function
  t("dept-executive-function", "Executive Function", "planning", "Planning", "weekly-planning", "Weekly Planning", "Plans that actually get used.", "Create plans you can follow.", ["planning", "executive-function"], { adhd: "high", bundle: "adhd", sort: 1 }),
  t("dept-executive-function", "Executive Function", "prioritization", "Prioritization", "what-matters-now", "What Matters Now", "Choose the few things that matter most.", "Prioritize under overload.", ["prioritization", "executive-function"], { adhd: "high", sort: 1 }),
  t("dept-executive-function", "Executive Function", "decision-fatigue", "Decision Fatigue", "decision-batching", "Decision Batching", "Reduce daily decision load.", "Preserve decision energy for what matters.", ["decision-making", "executive-function"], { adhd: "high", sort: 1 }),
  t("dept-executive-function", "Executive Function", "organization", "Organization", "external-brain", "External Brain", "Systems that hold what memory cannot.", "Build external systems for organization.", ["executive-function", "systems"], { adhd: "high", sort: 1 }),
  t("dept-executive-function", "Executive Function", "sequencing", "Sequencing", "task-sequencing", "Task Sequencing", "Order work for momentum.", "Sequence tasks to reduce startup cost.", ["executive-function", "planning"], { adhd: "high", sort: 1 }),
  t("dept-executive-function", "Executive Function", "cognitive-flexibility", "Cognitive Flexibility", "pivoting-tasks", "Pivoting Tasks", "Shift gears without losing the day.", "Switch contexts with less cost.", ["executive-function", "resilience"], { adhd: "high", difficulty: "intermediate", sort: 1 }),
  // Productivity & Momentum
  t("dept-productivity-momentum", "Productivity & Momentum", "momentum", "Momentum", "building-momentum", "Building Momentum", "Small wins that compound.", "Generate momentum without burnout.", ["momentum", "productivity"], { bundle: "practice", sort: 1 }),
  t("dept-productivity-momentum", "Productivity & Momentum", "deep-work", "Deep Work", "protected-focus-blocks", "Protected Focus Blocks", "Deep work in a distracted world.", "Protect time for meaningful work.", ["focus", "productivity"], { adhd: "high", sort: 1 }),
  t("dept-productivity-momentum", "Productivity & Momentum", "procrastination", "Procrastination", "starting-anyway", "Starting Anyway", "Start without waiting to feel ready.", "Overcome procrastination with micro-starts.", ["task-initiation", "momentum"], { adhd: "high", sort: 1 }),
  t("dept-productivity-momentum", "Productivity & Momentum", "motivation", "Motivation", "sustainable-motivation", "Sustainable Motivation", "Motivation that survives hard weeks.", "Maintain motivation without hype cycles.", ["momentum", "habits"], { sort: 1 }),
  t("dept-productivity-momentum", "Productivity & Momentum", "batching", "Batching", "task-batching", "Task Batching", "Batch similar work to reduce switching.", "Batch work to lower context switching.", ["productivity", "executive-function"], { adhd: "high", sort: 1 }),
  // Emotional Intelligence
  t("dept-emotional-intelligence", "Emotional Intelligence", "self-awareness", "Self Awareness", "emotional-awareness", "Emotional Awareness", "Notice emotions before they decide for you.", "Read your emotional signals early.", ["self-awareness", "emotional-intelligence"], { sort: 1 }),
  t("dept-emotional-intelligence", "Emotional Intelligence", "regulation", "Regulation", "calm-under-pressure", "Calm Under Pressure", "Stay regulated when stakes are high.", "Regulate emotion during business stress.", ["emotional-intelligence", "resilience"], { bundle: "practice", sort: 1 }),
  t("dept-emotional-intelligence", "Emotional Intelligence", "empathy", "Empathy", "customer-empathy", "Customer Empathy", "Understand customers as humans.", "Lead and sell with genuine empathy.", ["empathy", "customer-experience"], { sort: 1 }),
  t("dept-emotional-intelligence", "Emotional Intelligence", "conflict", "Conflict", "healthy-conflict", "Healthy Conflict", "Disagree without destroying relationships.", "Navigate conflict constructively.", ["communication", "emotional-intelligence"], { difficulty: "intermediate", sort: 1 }),
  // Habits & Consistency
  t("dept-habits-consistency", "Habits & Consistency", "habits", "Habits", "habit-design", "Habit Design", "Design habits that stick.", "Build habits without all-or-nothing thinking.", ["habits", "consistency"], { adhd: "high", bundle: "adhd", sort: 1 }),
  t("dept-habits-consistency", "Habits & Consistency", "routines", "Routines", "morning-routine", "Morning Routine", "Routines that anchor the day.", "Create anchoring routines that flex.", ["habits", "energy-management"], { adhd: "high", sort: 1 }),
  t("dept-habits-consistency", "Habits & Consistency", "accountability", "Accountability", "gentle-accountability", "Gentle Accountability", "Accountability without shame.", "Stay accountable with dignity.", ["consistency", "habits"], { sort: 1 }),
  t("dept-habits-consistency", "Habits & Consistency", "keystone-habits", "Keystone Habits", "keystone-habits", "Keystone Habits", "One habit that shifts many others.", "Identify habits with outsized leverage.", ["habits", "momentum"], { sort: 1 }),
  // Resilience & Recovery
  t("dept-resilience-recovery", "Resilience & Recovery", "resilience", "Resilience", "bounce-back", "Bounce Back", "Recover after hard seasons.", "Recover capacity after setbacks.", ["resilience", "recovery"], { bundle: "practice", sort: 1 }),
  t("dept-resilience-recovery", "Resilience & Recovery", "burnout", "Burnout", "burnout-recovery", "Burnout Recovery", "Restore clarity after burnout.", "Restore clarity and pace after burnout.", ["recovery", "resilience"], { adhd: "high", sort: 1 }),
  t("dept-resilience-recovery", "Resilience & Recovery", "failed-launch", "Failed Launch", "after-failed-launch", "After A Failed Launch", "Move forward after a launch that did not land.", "Learn and continue after failed launches.", ["resilience", "entrepreneur-mindset"], { stages: ["launch", "growth"], sort: 1 }),
  t("dept-resilience-recovery", "Resilience & Recovery", "long-absence", "Long Absence", "returning-after-absence", "Returning After Absence", "Come back without shame or catch-up panic.", "Return to work with dignity and clarity.", ["recovery", "self-trust"], { sort: 1 }),
  // Focus & Attention
  t("dept-focus-attention", "Focus & Attention", "focus", "Focus", "sustained-attention", "Sustained Attention", "Hold attention on meaningful work.", "Sustain attention on what matters.", ["focus", "executive-function"], { adhd: "high", bundle: "adhd", sort: 1 }),
  t("dept-focus-attention", "Focus & Attention", "distraction", "Distraction", "managing-distractions", "Managing Distractions", "Reduce distraction without fighting your brain.", "Manage distractions practically.", ["focus", "adhd-entrepreneurship"], { adhd: "high", sort: 1 }),
  t("dept-focus-attention", "Focus & Attention", "digital-boundaries", "Digital Boundaries", "phone-boundaries", "Phone Boundaries", "Boundaries with devices during work.", "Set device boundaries that hold.", ["focus", "boundaries"], { adhd: "high", sort: 1 }),
  // Energy Management
  t("dept-energy-management", "Energy Management", "energy", "Energy", "energy-mapping", "Energy Mapping", "Match tasks to energy levels.", "Align work with natural energy rhythms.", ["energy-management", "productivity"], { adhd: "high", sort: 1 }),
  t("dept-energy-management", "Energy Management", "sustainable-pace", "Sustainable Pace", "avoiding-hustle-culture", "Avoiding Hustle Culture", "Grow without destroying yourself.", "Build a pace you can sustain for years.", ["energy-management", "resilience"], { sort: 1 }),
  t("dept-energy-management", "Energy Management", "rest", "Rest", "rest-as-strategy", "Rest As Strategy", "Rest as part of performance.", "Use rest strategically, not guiltily.", ["energy-management", "recovery"], { sort: 1 }),
  // Communication
  t("dept-communication", "Communication", "listening", "Listening", "active-listening", "Active Listening", "Listen to understand, not to reply.", "Listen so others feel understood.", ["listening", "communication"], { bundle: "core", sort: 1 }),
  t("dept-communication", "Communication", "boundaries", "Boundaries", "business-boundaries", "Business Boundaries", "Boundaries with clients and team.", "Set boundaries that protect your work.", ["boundaries", "communication"], { bundle: "practice", sort: 1 }),
  t("dept-communication", "Communication", "negotiation", "Negotiation", "win-win-negotiation", "Win-Win Negotiation", "Negotiate without burning bridges.", "Negotiate outcomes both sides can accept.", ["negotiation", "communication"], { difficulty: "intermediate", bundle: "mastery", sort: 1 }),
  t("dept-communication", "Communication", "networking", "Networking", "authentic-networking", "Authentic Networking", "Build relationships without performing.", "Network authentically over time.", ["networking", "communication"], { bundle: "practice", sort: 1 }),
  t("dept-communication", "Communication", "difficult-conversations", "Difficult Conversations", "hard-conversations", "Hard Conversations", "Say what needs to be said with care.", "Lead difficult conversations with care.", ["communication", "emotional-intelligence"], { difficulty: "intermediate", sort: 1 }),
  t("dept-communication", "Communication", "clarity", "Clarity", "clear-communication", "Clear Communication", "Say less and mean more.", "Communicate with crisp clarity.", ["communication", "writing"], { sort: 1 }),
  // Personal Leadership
  t("dept-personal-leadership", "Personal Leadership", "influence", "Influence", "ethical-influence", "Ethical Influence", "Influence without manipulation.", "Influence others through trust.", ["influence", "personal-leadership"], { bundle: "mastery", sort: 1 }),
  t("dept-personal-leadership", "Personal Leadership", "values", "Values", "values-led-decisions", "Values-Led Decisions", "Decide from stated values.", "Make decisions aligned with values.", ["personal-leadership", "decision-making"], { sort: 1 }),
  t("dept-personal-leadership", "Personal Leadership", "purpose", "Purpose", "personal-purpose", "Personal Purpose", "Purpose that guides daily choices.", "Connect daily work to deeper purpose.", ["purpose", "personal-leadership"], { bundle: "legacy", sort: 1 }),
  t("dept-personal-leadership", "Personal Leadership", "integrity", "Integrity", "integrity-in-business", "Integrity In Business", "Keep promises to yourself and others.", "Operate with integrity under pressure.", ["personal-leadership", "self-trust"], { sort: 1 }),
];
