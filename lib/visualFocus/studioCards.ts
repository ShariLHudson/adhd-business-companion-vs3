/**
 * Visual Focus Studio — single source of truth for teaching cards.
 */

import type { VisualFocusMode } from "./types";

export type VisualFocusStudioAccent = {
  borderTop: string;
  headerBg: string;
  iconRing: string;
  actionBorder: string;
  actionFg: string;
  actionHover: string;
};

export type VisualFocusStudioCard = {
  mode: VisualFocusMode;
  title: string;
  subtitle?: string;
  emoji: string;
  /** What is this? — one clear sentence. */
  whatItIs: string;
  /** When should I use it? — one clear sentence. */
  whenToUse: string;
  /** What will I receive? */
  youWillReceive: string[];
  bestFor: string;
  useWhen: string[];
  whyItHelps: string;
  exampleLines: string[];
  actionLabel: string;
  boundaryNote?: string;
  accent: VisualFocusStudioAccent;
  keywords: string[];
};

export const VISUAL_FOCUS_STUDIO_HERO = {
  title: "Cartographer's Studio",
  tagline: "Every map tells a story. Every story reveals a path.",
  microCopy:
    "Choose a framed map. Spark asks the right questions, builds a first draft, and you reshape it.",
  question: "Which map will help you see this clearly?",
  footer:
    "The room is the navigation. Every framed map on the wall opens a guided map you can finish, edit, and print.",
} as const;

export const VISUAL_FOCUS_WORK_WITH_SHARI = {
  headline: "Not sure which one to use?",
  body: "Tell me what you're trying to figure out and I'll recommend the best visual thinking approach.",
  actionLabel: "Work With Shari",
} as const;

export const VISUAL_FOCUS_SHARI_PROMPT =
  "I'm in Visual Thinking and I'm not sure which visual thinking tool fits. Here's what I'm trying to figure out: ";

const ACCENTS: Record<VisualFocusMode, VisualFocusStudioAccent> = {
  "mind-map": {
    borderTop: "border-t-violet-500",
    headerBg: "bg-gradient-to-br from-violet-50/90 to-white",
    iconRing: "bg-violet-100 text-violet-800",
    actionBorder: "border-violet-300",
    actionFg: "text-violet-900",
    actionHover: "hover:bg-violet-50",
  },
  "decision-tree": {
    borderTop: "border-t-amber-600",
    headerBg: "bg-gradient-to-br from-amber-50/90 to-white",
    iconRing: "bg-amber-100 text-amber-900",
    actionBorder: "border-amber-300",
    actionFg: "text-amber-950",
    actionHover: "hover:bg-amber-50",
  },
  "strategy-map": {
    borderTop: "border-t-emerald-600",
    headerBg: "bg-gradient-to-br from-emerald-50/90 to-white",
    iconRing: "bg-emerald-100 text-emerald-800",
    actionBorder: "border-emerald-300",
    actionFg: "text-emerald-900",
    actionHover: "hover:bg-emerald-50",
  },
  "relationship-map": {
    borderTop: "border-t-sky-500",
    headerBg: "bg-gradient-to-br from-sky-50/90 to-white",
    iconRing: "bg-sky-100 text-sky-800",
    actionBorder: "border-sky-300",
    actionFg: "text-sky-900",
    actionHover: "hover:bg-sky-50",
  },
  "project-map": {
    borderTop: "border-t-orange-500",
    headerBg: "bg-gradient-to-br from-orange-50/90 to-white",
    iconRing: "bg-orange-100 text-orange-800",
    actionBorder: "border-orange-300",
    actionFg: "text-orange-900",
    actionHover: "hover:bg-orange-50",
  },
  "process-map": {
    borderTop: "border-t-slate-600",
    headerBg: "bg-gradient-to-br from-slate-50/90 to-white",
    iconRing: "bg-slate-100 text-slate-800",
    actionBorder: "border-slate-300",
    actionFg: "text-slate-900",
    actionHover: "hover:bg-slate-50",
  },
  "journey-map": {
    borderTop: "border-t-indigo-500",
    headerBg: "bg-gradient-to-br from-indigo-50/90 to-white",
    iconRing: "bg-indigo-100 text-indigo-800",
    actionBorder: "border-indigo-300",
    actionFg: "text-indigo-900",
    actionHover: "hover:bg-indigo-50",
  },
  "timeline-map": {
    borderTop: "border-t-cyan-600",
    headerBg: "bg-gradient-to-br from-cyan-50/90 to-white",
    iconRing: "bg-cyan-100 text-cyan-900",
    actionBorder: "border-cyan-300",
    actionFg: "text-cyan-950",
    actionHover: "hover:bg-cyan-50",
  },
  "opportunity-map": {
    borderTop: "border-t-yellow-600",
    headerBg: "bg-gradient-to-br from-yellow-50/90 to-white",
    iconRing: "bg-yellow-100 text-yellow-900",
    actionBorder: "border-yellow-300",
    actionFg: "text-yellow-950",
    actionHover: "hover:bg-yellow-50",
  },
  "system-map": {
    borderTop: "border-t-stone-600",
    headerBg: "bg-gradient-to-br from-stone-50/90 to-white",
    iconRing: "bg-stone-100 text-stone-800",
    actionBorder: "border-stone-300",
    actionFg: "text-stone-900",
    actionHover: "hover:bg-stone-50",
  },
  "priority-map": {
    borderTop: "border-t-rose-500",
    headerBg: "bg-gradient-to-br from-rose-50/90 to-white",
    iconRing: "bg-rose-100 text-rose-800",
    actionBorder: "border-rose-300",
    actionFg: "text-rose-900",
    actionHover: "hover:bg-rose-50",
  },
  "visual-kanban": {
    borderTop: "border-t-pink-500",
    headerBg: "bg-gradient-to-br from-pink-50/90 to-white",
    iconRing: "bg-pink-100 text-pink-800",
    actionBorder: "border-pink-300",
    actionFg: "text-pink-900",
    actionHover: "hover:bg-pink-50",
  },
  "business-canvas": {
    borderTop: "border-t-teal-700",
    headerBg: "bg-gradient-to-br from-teal-50/90 to-white",
    iconRing: "bg-teal-100 text-teal-900",
    actionBorder: "border-teal-300",
    actionFg: "text-teal-950",
    actionHover: "hover:bg-teal-50",
  },
};

export const VISUAL_FOCUS_STUDIO_CARDS: VisualFocusStudioCard[] = [
  {
    mode: "mind-map",
    title: "Mind Map",
    emoji: "🧠",
    whatItIs: "Branch ideas outward so you can see the whole picture at once.",
    whenToUse:
      "When thoughts feel scattered and you need to explore without a rigid order.",
    youWillReceive: [
      "Visual mind map",
      "Key themes and branches",
      "Hidden connections",
      "Patterns across ideas",
      "Recommendations",
      "Suggested next steps",
    ],
    bestFor: "Exploring ideas",
    useWhen: [
      "planning a workshop",
      "creating a course",
      "brainstorming content",
      "building a new offer",
      "organizing thoughts",
    ],
    whyItHelps:
      "Mind maps help you see the big picture and uncover ideas you may not have considered.",
    exampleLines: [
      "Launch Workshop",
      "├ Audience",
      "├ Pricing",
      "├ Bonuses",
      "├ Marketing",
      "└ Follow Up",
    ],
    actionLabel: "Create Mind Map",
    accent: ACCENTS["mind-map"],
    keywords: ["workshop", "course", "brainstorm", "content", "offer", "ideas"],
  },
  {
    mode: "decision-tree",
    title: "Decision Map",
    subtitle: "Compare options before you choose.",
    emoji: "🌳",
    whatItIs: "Compare options, benefits, and concerns before you commit.",
    whenToUse:
      "When more than one path feels possible and you need the tradeoffs visible.",
    youWillReceive: [
      "Visual decision comparison",
      "Options side by side",
      "Benefits and concerns",
      "Preferred direction",
      "Recommendations",
      "Suggested next steps",
    ],
    bestFor: "Comparing options before choosing",
    useWhen: [
      "hiring someone",
      "raising prices",
      "launching a service",
      "making a major business decision",
    ],
    whyItHelps:
      "A Decision Map helps you weigh options calmly instead of looping in your head.",
    exampleLines: [
      "Hire VA?",
      "├ Hire now",
      "├ Wait",
      "└ Project-by-project",
    ],
    actionLabel: "Create Decision Map",
    boundaryNote:
      "Need a recommendation? Use Decision Compass — it helps answer which option is best. Decision Map compares options; Decision Compass helps you choose.",
    accent: ACCENTS["decision-tree"],
    keywords: ["hire", "price", "launch", "decide", "whether", "paths", "outcomes"],
  },
  {
    mode: "strategy-map",
    title: "Strategy Map",
    emoji: "🎯",
    whatItIs: "Connect goals, actions, and priorities into one visual path.",
    whenToUse:
      "When you know where you want to go and need to build how to get there.",
    youWillReceive: [
      "Visual strategy map",
      "Goal-to-action links",
      "Priority patterns",
      "Gaps and leverage points",
      "Recommendations",
      "Suggested next steps",
    ],
    bestFor: "Building a path toward a goal",
    useWhen: [
      "growing revenue",
      "launching an offer",
      "building an audience",
      "creating a marketing strategy",
    ],
    whyItHelps:
      "A strategy map connects goals, actions, priorities, and opportunities.",
    exampleLines: [
      "Grow Revenue",
      "↓",
      "Improve Visibility",
      "↓",
      "Create Content",
      "↓",
      "Generate Leads",
    ],
    actionLabel: "Build Strategy Map",
    boundaryNote:
      "Use Decision Compass when you need to choose between options. Use Strategy Map when you need to build a path toward a goal.",
    accent: ACCENTS["strategy-map"],
    keywords: ["goal", "revenue", "grow", "strategy", "plan", "marketing"],
  },
  {
    mode: "relationship-map",
    title: "Relationship Map",
    emoji: "🤝",
    whatItIs:
      "See how people, systems, ideas, or business areas influence one another.",
    whenToUse:
      "When relationships are hidden and you need to understand what connects to what.",
    youWillReceive: [
      "Visual relationship map",
      "Key connections",
      "Risks",
      "Opportunities",
      "Recommendations",
      "Suggested next steps",
    ],
    bestFor: "Understanding how things connect",
    useWhen: [
      "understanding your business",
      "exploring client relationships",
      "visualizing systems",
      "mapping dependencies",
    ],
    whyItHelps:
      "Many business problems happen because relationships are hidden. This helps make them visible.",
    exampleLines: [
      "Audience",
      "↔ Offer",
      "↔ Marketing",
      "↔ Revenue",
    ],
    actionLabel: "Create Relationship Map",
    accent: ACCENTS["relationship-map"],
    keywords: ["connect", "relationship", "system", "dependency", "audience", "offer"],
  },
  {
    mode: "project-map",
    title: "Project Map",
    emoji: "📁",
    whatItIs: "Break a large initiative into visual stages you can actually start.",
    whenToUse:
      "When a project feels overwhelming and you need structure without a task list.",
    youWillReceive: [
      "Visual project map",
      "Stages and dependencies",
      "Bottlenecks",
      "Natural starting points",
      "Recommendations",
      "Suggested next steps",
    ],
    bestFor: "Breaking large projects into smaller pieces",
    useWhen: [
      "launching a course",
      "building a website",
      "creating a sales funnel",
      "planning a major initiative",
    ],
    whyItHelps:
      "Project maps turn overwhelming projects into manageable visual stages.",
    exampleLines: [
      "Website Redesign",
      "├ Content",
      "├ Landing Page",
      "├ Emails",
      "└ Promotion",
    ],
    actionLabel: "Create Project Map",
    boundaryNote:
      "Project Map helps you think through project structure. Projects is where ongoing project work lives.",
    accent: ACCENTS["project-map"],
    keywords: ["project", "website", "funnel", "launch", "course"],
  },
  {
    mode: "process-map",
    title: "Process Map",
    emoji: "🔁",
    whatItIs: "See steps, handoffs, and flow from start to finish.",
    whenToUse: "When a repeatable sequence needs to be visible and improvable.",
    youWillReceive: [
      "Visual process map",
      "Ordered steps",
      "Decision points",
      "Clear ending",
      "Suggested improvements",
    ],
    bestFor: "Making a workflow visible",
    useWhen: ["onboarding", "delivery", "content pipelines", "repeatable work"],
    whyItHelps: "It turns a fuzzy “how we do this” into a path you can improve.",
    exampleLines: ["Inquiry", "→ Discovery", "→ Proposal", "→ Delivery"],
    actionLabel: "Create Process Map",
    accent: ACCENTS["process-map"],
    keywords: ["process", "workflow", "steps", "onboarding", "pipeline"],
  },
  {
    mode: "journey-map",
    title: "Journey Map",
    emoji: "🧭",
    whatItIs: "Chart the path from where you are to where you want to go.",
    whenToUse: "When the human experience of a path matters — not only tasks.",
    youWillReceive: [
      "Visual journey map",
      "Stages along the way",
      "Turning points",
      "Current position",
      "Suggested next steps",
    ],
    bestFor: "Seeing an experience path",
    useWhen: ["client experience", "reader journeys", "go-to-market paths"],
    whyItHelps: "It keeps the human experience in view as you move forward.",
    exampleLines: ["Curious", "→ Consider", "→ Decide", "→ Begin"],
    actionLabel: "Create Journey Map",
    accent: ACCENTS["journey-map"],
    keywords: ["journey", "experience", "stages", "path", "client"],
  },
  {
    mode: "timeline-map",
    title: "Timeline Map",
    emoji: "📅",
    whatItIs: "Place events in order and see what comes next.",
    whenToUse: "When sequence and approximate timing matter most.",
    youWillReceive: [
      "Visual timeline",
      "Beginning and end",
      "Milestones",
      "Timing notes",
      "Suggested next steps",
    ],
    bestFor: "Ordering milestones",
    useWhen: ["launches", "campaigns", "personal milestones"],
    whyItHelps: "It turns a swirl of dates into a calm sequence.",
    exampleLines: ["Outline", "→ Build", "→ Open cart", "→ Close"],
    actionLabel: "Create Timeline Map",
    accent: ACCENTS["timeline-map"],
    keywords: ["timeline", "milestones", "schedule", "sequence", "dates"],
  },
  {
    mode: "opportunity-map",
    title: "Opportunity Map",
    emoji: "✨",
    whatItIs: "Explore possibilities, benefits, risks, and first steps.",
    whenToUse: "When several possibilities are open and you need upside and risk together.",
    youWillReceive: [
      "Visual opportunity map",
      "Possibilities",
      "Benefits and risks",
      "First steps",
      "Suggested focus",
    ],
    bestFor: "Scanning possibilities",
    useWhen: ["new offers", "partnerships", "growth ideas"],
    whyItHelps: "It keeps hope and caution in the same picture.",
    exampleLines: ["New offer", "· Benefit", "· Risk", "· First step"],
    actionLabel: "Create Opportunity Map",
    accent: ACCENTS["opportunity-map"],
    keywords: ["opportunity", "possibilities", "risk", "benefit", "ideas"],
  },
  {
    mode: "system-map",
    title: "System Map",
    emoji: "🕸️",
    whatItIs: "See how people, processes, and information work together.",
    whenToUse:
      "When you need dependencies, bottlenecks, or how the parts connect.",
    youWillReceive: [
      "Visual system map",
      "Major components",
      "Flows and dependencies",
      "Friction points",
      "Suggested improvements",
    ],
    bestFor: "Understanding how a system really works",
    useWhen: ["onboarding systems", "delivery operations", "tech stacks"],
    whyItHelps: "It makes invisible handoffs visible so the whole can improve.",
    exampleLines: ["Inquiry", "→ Discovery", "→ Proposal", "→ Kickoff"],
    actionLabel: "Create System Map",
    accent: ACCENTS["system-map"],
    keywords: ["system", "components", "flow", "dependency", "bottleneck"],
  },
  {
    mode: "priority-map",
    title: "Priority Map",
    emoji: "📌",
    whatItIs: "Sort what matters by impact, urgency, and effort.",
    whenToUse: "When everything feels important and you need a calmer focus.",
    youWillReceive: [
      "Visual priority map",
      "Impact and urgency view",
      "Selected focus",
      "Clearer next move",
    ],
    bestFor: "Choosing focus",
    useWhen: ["overwhelm", "planning a month", "too many options"],
    whyItHelps: "It externalizes the tug-of-war so one focus can settle.",
    exampleLines: ["High impact", "Urgent", "Later", "Selected focus"],
    actionLabel: "Create Priority Map",
    accent: ACCENTS["priority-map"],
    keywords: ["priority", "urgent", "impact", "focus", "effort"],
  },
  {
    mode: "visual-kanban",
    title: "Visual Kanban",
    emoji: "🧩",
    whatItIs: "Move ideas across columns to sort, group, and explore visually.",
    whenToUse:
      "When your brain thinks better by moving things around than reading lists.",
    youWillReceive: [
      "Visual kanban board",
      "Grouped idea clusters",
      "Movement patterns",
      "Ready-to-act items",
      "Recommendations",
      "Suggested next steps",
    ],
    bestFor: "Organizing ideas with movement",
    useWhen: [
      "sorting ideas",
      "grouping thoughts",
      "tracking exploration",
      "organizing possible actions",
    ],
    whyItHelps:
      "Some brains think better when they can move ideas around visually instead of reading lists.",
    exampleLines: [
      "Ideas",
      "↓",
      "Grouping",
      "↓",
      "Exploring",
      "↓",
      "Ready to act",
    ],
    actionLabel: "Open Visual Kanban",
    boundaryNote:
      "Visual Kanban is for ideas. Plan My Day is for today's tasks.",
    accent: ACCENTS["visual-kanban"],
    keywords: ["organize", "columns", "move", "sort", "group", "kanban"],
  },
  {
    mode: "business-canvas",
    title: "Business Canvas",
    emoji: "🏢",
    whatItIs: "Map how your business works — nine guided sections, no jargon required.",
    whenToUse:
      "When you need to understand or explain how audience, offer, and revenue fit together.",
    youWillReceive: [
      "Visual 9-box business canvas",
      "Section-by-section insights",
      "Gaps and strengths",
      "Risks and opportunities",
      "Recommendations",
      "Suggested next steps",
    ],
    bestFor: "Mapping how your business works",
    useWhen: [
      "mapping how your business works today",
      "understanding how your business fits together",
      "preparing for a launch or pivot",
      "connecting audience, offer, and revenue",
    ],
    whyItHelps:
      "You do not need to know business frameworks. Each section teaches what it means, why it matters, and what belongs there.",
    exampleLines: [
      "Customer Segments",
      "Value Proposition",
      "Channels",
      "Revenue Streams",
      "…9 guided sections",
    ],
    actionLabel: "Create Business Canvas",
    boundaryNote:
      "Business Canvas teaches while you build. Generate Business Canvas when ready for the visual 9-box and insights.",
    accent: ACCENTS["business-canvas"],
    keywords: ["business", "model", "canvas", "revenue", "offer", "audience", "pivot"],
  },
];

export function getStudioCardByMode(
  mode: VisualFocusMode,
): VisualFocusStudioCard | undefined {
  return VISUAL_FOCUS_STUDIO_CARDS.find((c) => c.mode === mode);
}

export function studioCardTitleForMode(mode: VisualFocusMode): string {
  return getStudioCardByMode(mode)?.title ?? mode;
}

/** Help article tips — one line per tool: what, when, outcomes. */
export function visualThinkingToolHelpTips(): string[] {
  const toolTips = VISUAL_FOCUS_STUDIO_CARDS.map((card) => {
    const outcomes = card.youWillReceive.join("; ");
    return `${card.title} — ${card.whatItIs} When: ${card.whenToUse} You'll receive: ${outcomes}.`;
  });
  return [
    ...toolTips,
    "Decision Compass (separate from Visual Thinking) — when you need help choosing the best option, not just exploring paths. Decision Map compares options; Decision Compass helps you decide.",
    "Continue Thinking (studio dashboard) resumes up to 3 active maps — momentum, not storage. Saved in Other is for work you intentionally keep.",
  ];
}
