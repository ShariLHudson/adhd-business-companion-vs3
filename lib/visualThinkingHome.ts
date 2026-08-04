/**
 * P0.43 / P0.51 — Visual Thinking™ home: guidance-first catalog + per-type help.
 */

import type { AppSection } from "./companionUi";
import type { VisualThinkingViewId } from "./visualThinkingStudio";
import type { VisualFocusMode } from "./visualFocus/types";

export type VisualThinkingHomeCategoryId =
  | "business"
  | "content"
  | "planning"
  | "decisions"
  | "thinking";

export const VISUAL_THINKING_CATEGORY_ORDER: VisualThinkingHomeCategoryId[] = [
  "business",
  "content",
  "planning",
  "decisions",
  "thinking",
];

export const VISUAL_THINKING_CATEGORY_LABELS: Record<
  VisualThinkingHomeCategoryId,
  string
> = {
  business: "BUSINESS",
  content: "CONTENT",
  planning: "PLANNING",
  decisions: "DECISIONS",
  thinking: "THINKING",
};

/** Active home catalog IDs (P0.51 simplified set). */
export type VisualThinkingHomeTypeId =
  | "brand-canvas"
  | "offer-canvas"
  | "sales-funnel"
  | "customer-journey"
  | "content-calendar"
  | "pinterest-planner"
  | "content-ecosystem"
  | "project-map"
  | "timeline"
  | "decision-tree"
  | "comparison-map"
  | "priority-matrix"
  | "mind-map";

export type VisualThinkingHomeHelp = {
  whatItIs: string;
  whenToUse: string;
  example: string;
  howToBuild: string[];
};

export type VisualThinkingHomeType = {
  id: VisualThinkingHomeTypeId;
  category: VisualThinkingHomeCategoryId;
  mode: VisualFocusMode;
  /** When set, opens this workspace instead of creating a map. */
  section?: AppSection;
  /** When true, card shows Coming Soon and does not open a workspace. */
  comingSoon?: boolean;
  title: string;
  emoji: string;
  shortDescription: string;
  help: VisualThinkingHomeHelp;
};

function help(
  whatItIs: string,
  whenToUse: string,
  example: string,
  howToBuild: string[],
): VisualThinkingHomeHelp {
  return { whatItIs, whenToUse, example, howToBuild };
}

function box(
  id: VisualThinkingHomeTypeId,
  category: VisualThinkingHomeCategoryId,
  title: string,
  emoji: string,
  shortDescription: string,
  mode: VisualFocusMode,
  helpContent: VisualThinkingHomeHelp,
  opts?: { section?: AppSection; comingSoon?: boolean },
): VisualThinkingHomeType {
  return {
    id,
    category,
    title,
    emoji,
    shortDescription,
    mode,
    section: opts?.section,
    comingSoon: opts?.comingSoon,
    help: helpContent,
  };
}

export const VISUAL_THINKING_HOME_TYPES: Record<
  VisualThinkingHomeTypeId,
  VisualThinkingHomeType
> = {
  "brand-canvas": box(
    "brand-canvas",
    "business",
    "Brand Canvas™",
    "🎨",
    "Define and organize your business identity, messaging, and positioning.",
    "business-canvas",
    help(
      "Your existing Brand Canvas™ framework — audience, offer, revenue, and positioning in one visual workspace.",
      "When you need to see how your business fits together without rewriting what already works.",
      "Audience → Offer → Revenue → Channels → Key Activities",
      [
        "Open Brand Canvas™ — your saved framework loads as-is.",
        "Work through each section at your own pace.",
        "Use change exploration when you want to test a pivot.",
        "Save versions when a snapshot is worth keeping.",
      ],
    ),
  ),
  "offer-canvas": box(
    "offer-canvas",
    "business",
    "Offer Canvas™",
    "💎",
    "Map what you sell, who it's for, and why it matters.",
    "strategy-map",
    help(
      "A visual map of your offer — promise, proof, price, and path to yes.",
      "When you are shaping or refining what you sell.",
      "Core promise → Bonuses → Proof → Price → Next step",
      [
        "Name the offer in the title bar.",
        "Add branches for promise, proof, and delivery.",
        "Keep one idea per branch.",
        "Generate the visual when the offer feels coherent.",
      ],
    ),
  ),
  "sales-funnel": box(
    "sales-funnel",
    "business",
    "Sales Funnel™",
    "🛒",
    "See how strangers become customers step by step.",
    "decision-tree",
    help(
      "A funnel map shows how people move from awareness to purchase.",
      "When launch or marketing steps feel disconnected.",
      "Ad → Landing page → Email sequence → Call → Sale",
      [
        "Start with how people first discover you.",
        "Add each step in order toward purchase.",
        "Note where people typically drop off.",
        "Generate the visual to spot gaps.",
      ],
    ),
  ),
  "customer-journey": box(
    "customer-journey",
    "business",
    "Customer Journey™",
    "🗺️",
    "Map the experience from first touch to loyal fan.",
    "relationship-map",
    help(
      "A journey map connects touchpoints across the full client experience.",
      "When you want to improve onboarding, delivery, or retention.",
      "Discover → Buy → Onboard → Win → Refer",
      [
        "List major journey stages as nodes.",
        "Connect feelings and actions at each stage.",
        "Highlight friction points.",
        "Generate the visual to discuss improvements.",
      ],
    ),
  ),
  "content-calendar": box(
    "content-calendar",
    "content",
    "Content Calendar™",
    "📆",
    "Plan upcoming content visually.",
    "visual-kanban",
    help(
      "A visual calendar for scheduling content across weeks and channels.",
      "When you need to see what ships when without a spreadsheet.",
      "Columns: Week 1, Week 2 — cards: blog, video, email",
      [
        "Rename columns to match your weeks or channels.",
        "Add one content piece per card.",
        "Drag cards as plans shift.",
        "Generate when the month feels planned.",
      ],
    ),
  ),
  "pinterest-planner": box(
    "pinterest-planner",
    "content",
    "Pinterest Planner™",
    "📌",
    "Organize pins, boards, and visual content ideas.",
    "visual-kanban",
    help(
      "A board-style planner for Pinterest and visual content batches.",
      "When you batch pins or plan visual themes ahead.",
      "Boards: Launch, Testimonials, Tips — cards per pin idea",
      [
        "Create columns for boards or themes.",
        "Add pin ideas as cards.",
        "Move cards as you publish or repurpose.",
        "Generate when ready to produce.",
      ],
    ),
  ),
  "content-ecosystem": box(
    "content-ecosystem",
    "content",
    "Content Ecosystem™",
    "🌐",
    "Turn one piece of content into many across blog, email, Pinterest, LinkedIn, short-form video, and lead magnets.",
    "relationship-map",
    help(
      "Map how one hub piece (podcast, video, article) fans out into blog posts, emails, social clips, and lead magnets.",
      "When you want a repurposing system — one piece becoming many across platforms.",
      "Hub video → Short clips → Newsletter → Pinterest pins → LinkedIn posts → Lead magnet",
      [
        "Place your hub content in the center.",
        "Connect each repurposing path outward to a platform or format.",
        "Note which derivative pieces feed others.",
        "Generate when you can see the full content ecosystem.",
      ],
    ),
  ),
  "project-map": box(
    "project-map",
    "planning",
    "Project Map™",
    "📁",
    "Break a big project into visual stages.",
    "project-map",
    help(
      "A project map breaks a large initiative into stages you can see and start from.",
      "When a project feels overwhelming and you need structure without a task list.",
      "Course Launch → Content, Landing Page, Emails, Promotion",
      [
        "Name the project in the title bar.",
        "Add major stages as branches.",
        "Group related work under each stage.",
        "Generate the visual when stages feel clear enough to act on.",
      ],
    ),
  ),
  timeline: box(
    "timeline",
    "planning",
    "Timeline™",
    "📅",
    "Place milestones on a visual time path.",
    "project-map",
    help(
      "A timeline orders milestones along a path so you can see what comes when.",
      "When dates or phases matter and you need to see the sequence over time.",
      "Week 1 Plan → Week 2 Build → Week 3 Polish → Week 4 Launch",
      [
        "Start with your end goal or launch date in mind.",
        "Add milestones in time order — earliest first.",
        "Keep each milestone to one clear outcome.",
        "Generate the visual when the sequence matches reality.",
      ],
    ),
  ),
  "decision-tree": box(
    "decision-tree",
    "decisions",
    "Decision Tree™",
    "🌳",
    "Explore outcomes before making a decision.",
    "decision-tree",
    help(
      "A decision tree shows possible paths and outcomes before you commit to a choice.",
      "When you want to see what could happen next — not which option is best.",
      "Hire VA → More Time → More Content → More Leads",
      [
        "Start with the decision you are facing.",
        "Add a branch for each choice you could make.",
        "Under each choice, add what might happen next.",
        "Use Decision Compass™ when you need help choosing.",
      ],
    ),
  ),
  "comparison-map": box(
    "comparison-map",
    "decisions",
    "Comparison Map™",
    "⚖️",
    "Compare options side by side visually.",
    "visual-kanban",
    help(
      "A comparison map sorts options and criteria into columns so you can weigh them visually.",
      "When you are comparing a few options and lists feel too flat.",
      "Columns: Option A, Option B — cards for pros, cons, and notes",
      [
        "Rename columns to match your options.",
        "Add cards for pros, cons, costs, or criteria.",
        "Drag cards between columns as you learn more.",
        "Generate when options feel fairly represented.",
      ],
    ),
  ),
  "priority-matrix": box(
    "priority-matrix",
    "decisions",
    "Priority Matrix™",
    "📊",
    "Sort ideas by impact and effort — one item at a time.",
    "visual-kanban",
    help(
      "A guided priority matrix scores each idea on impact and effort, then places it in Quick Wins, Major Projects, Fill-In Tasks, or Avoid.",
      "When everything feels urgent and drag-and-drop matrices overwhelm you.",
      "Quick Wins | Major Projects | Fill-In Tasks | Avoid",
      [
        "Add one item at a time with impact and effort sliders.",
        "Let the system place each item in the right quadrant.",
        "Use Focus Lock™ to work only Quick Wins or Major Projects.",
        "Generate when your focus set feels honest.",
      ],
    ),
  ),
  "mind-map": box(
    "mind-map",
    "thinking",
    "Mind Map™",
    "🧠",
    "Organize ideas and brainstorm visually.",
    "mind-map",
    help(
      "A mind map branches ideas outward from one central topic so you can see the whole picture at once.",
      "When thoughts feel scattered and you want to explore without forcing a linear order.",
      "Launch Workshop → Audience, Pricing, Bonuses, Marketing, Follow Up",
      [
        "Name your central idea in the title bar.",
        "Add branches for each major theme.",
        "Keep labels short — one idea per branch.",
        "Generate the visual map when you have at least two meaningful items.",
      ],
    ),
  ),
};

export const VISUAL_THINKING_HOME_ORDER: VisualThinkingHomeTypeId[] =
  VISUAL_THINKING_CATEGORY_ORDER.flatMap((category) =>
    (Object.values(VISUAL_THINKING_HOME_TYPES) as VisualThinkingHomeType[])
      .filter((t) => t.category === category)
      .map((t) => t.id),
  );

/** Chat view IDs → home catalog (P0.51 trust alignment). */
const VIEW_ID_TO_HOME_TYPE: Partial<
  Record<VisualThinkingViewId, VisualThinkingHomeTypeId>
> = {
  "mind-map": "mind-map",
  "concept-map": "mind-map",
  "brain-dump-map": "mind-map",
  "category-tree": "mind-map",
  "decision-tree": "decision-tree",
  "pros-cons-map": "decision-tree",
  "comparison-map": "comparison-map",
  "priority-matrix": "priority-matrix",
  "project-map": "project-map",
  timeline: "timeline",
  roadmap: "timeline",
  "hierarchy-tree": "timeline",
  "content-structure-map": "project-map",
  "process-flow": "sales-funnel",
  "workflow-map": "sales-funnel",
  "sop-map": "sales-funnel",
  "funnel-map": "sales-funnel",
  "customer-journey-map": "customer-journey",
  "business-ecosystem-map": "content-ecosystem",
  "idea-cluster-map": "content-calendar",
  "overwhelm-map": "priority-matrix",
  "focus-map": "mind-map",
};

export function homeTypeIdForViewId(
  viewId: VisualThinkingViewId,
): VisualThinkingHomeTypeId | undefined {
  return VIEW_ID_TO_HOME_TYPE[viewId];
}

export function getVisualThinkingHomeType(
  id: VisualThinkingHomeTypeId,
): VisualThinkingHomeType {
  return VISUAL_THINKING_HOME_TYPES[id];
}

export function listVisualThinkingHomeTypes(): VisualThinkingHomeType[] {
  return VISUAL_THINKING_HOME_ORDER.map((id) => VISUAL_THINKING_HOME_TYPES[id]);
}

export function listVisualThinkingHomeByCategory(): {
  category: VisualThinkingHomeCategoryId;
  label: string;
  types: VisualThinkingHomeType[];
}[] {
  return VISUAL_THINKING_CATEGORY_ORDER.map((category) => ({
    category,
    label: VISUAL_THINKING_CATEGORY_LABELS[category],
    types: listVisualThinkingHomeTypes()
      .filter((t) => t.category === category)
      .sort((a, b) => a.title.localeCompare(b.title)),
  }));
}

const MODE_FALLBACK_HOME: Partial<
  Record<VisualFocusMode, VisualThinkingHomeTypeId>
> = {
  "mind-map": "mind-map",
  "decision-tree": "decision-tree",
  "strategy-map": "offer-canvas",
  "relationship-map": "customer-journey",
  "project-map": "project-map",
  "visual-kanban": "content-calendar",
  "business-canvas": "brand-canvas",
};

/** Resolve workspace help when reopening a map (prefers homeTypeId). */
export function resolveHomeTypeForMap(input: {
  homeTypeId?: string;
  mode: VisualFocusMode;
  title?: string;
}): VisualThinkingHomeType {
  const id = input.homeTypeId as VisualThinkingHomeTypeId | undefined;
  if (id && VISUAL_THINKING_HOME_TYPES[id]) {
    return VISUAL_THINKING_HOME_TYPES[id];
  }
  const fromMode = MODE_FALLBACK_HOME[input.mode];
  if (fromMode) return VISUAL_THINKING_HOME_TYPES[fromMode];
  return VISUAL_THINKING_HOME_TYPES["mind-map"];
}

export function displayTitleForMap(input: {
  homeTypeId?: string;
  mode: VisualFocusMode;
  title?: string;
}): string {
  const home = resolveHomeTypeForMap(input);
  return home.title;
}
