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
  title: "Visual Thinking",
  tagline: "Think visually, not linearly.",
  microCopy:
    "Build a map, discover patterns, and receive insights, recommendations, and next steps.",
  question: "How do you want to think today?",
  footer:
    "The insight is the product — not the file. Save when something is worth keeping.",
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
    title: "Decision Tree",
    subtitle: "What happens if I choose this?",
    emoji: "🌳",
    whatItIs: "Explore possible paths before you commit to a choice.",
    whenToUse:
      "When you need to see what could happen next — not which option is best.",
    youWillReceive: [
      "Visual decision paths",
      "Possible outcomes",
      "Risks along each branch",
      "Opportunities per path",
      "Recommendations",
      "Suggested next steps",
    ],
    bestFor: "Exploring possible outcomes",
    useWhen: [
      "hiring someone",
      "raising prices",
      "launching a service",
      "making a major business decision",
    ],
    whyItHelps:
      "A decision tree helps you visualize what could happen next before you commit.",
    exampleLines: [
      "Hire VA",
      "↓",
      "More Time",
      "↓",
      "More Content",
      "↓",
      "More Leads",
    ],
    actionLabel: "Create Path Map",
    boundaryNote:
      "Need a recommendation? Use Decision Compass — it helps answer which option is best. Decision Tree explores paths; Decision Compass helps you choose.",
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
      "Course Launch",
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
    "Decision Compass (separate from Visual Thinking) — when you need help choosing the best option, not just exploring paths. Decision Tree shows what could happen; Decision Compass helps you decide.",
    "Continue Thinking (studio dashboard) resumes up to 3 active maps — momentum, not storage. Saved in Other is for work you intentionally keep.",
  ];
}
