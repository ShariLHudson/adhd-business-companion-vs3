import { getCognitiveGrowthProfile } from "./cognitiveGrowthPrinciple";
import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import { getWorkspaceAreaWorkflow } from "./workspaceAreaWorkflows";

/** Workspace keys used by panels — maps to How Do I help articles. */
export type WorkspaceHelpAreaId =
  | "plan-my-day"
  | "visual-focus"
  | "projects"
  | "content-generator"
  | "brain-dump"
  | "playbook"
  | "templates-library"
  | "snippets"
  | "my-work"
  | "evidence-bank"
  | "wins-this-week"
  | "client-avatars"
  | "settings"
  | "growth"
  | "time-block"
  | "decision-compass"
  | "confidence-vault"
  | "my-journey";

const HELP_ARTICLE_ID: Partial<Record<WorkspaceHelpAreaId, string>> = {
  "plan-my-day": "plan-my-day",
  "visual-focus": "visual-focus",
  projects: "projects",
  "content-generator": "create-overview",
  "brain-dump": "clear-my-mind",
  playbook: "strategies",
  "templates-library": "templates",
  snippets: "snippets",
  "my-work": "my-work",
  "evidence-bank": "evidence-bank",
  "wins-this-week": "wins-this-week",
  "client-avatars": "client-avatars",
  settings: "settings-personalization",
  growth: "growth-center",
  "time-block": "momentum-appointments",
  "decision-compass": "decision-compass",
  "confidence-vault": "my-highlights",
  "my-journey": "my-journey",
};

const AREA_DISPLAY_NAME: Partial<Record<WorkspaceHelpAreaId, string>> = {
  "brain-dump": "Clear My Mind",
  "content-generator": "Create",
  playbook: "Strategies",
  "templates-library": "Templates",
  settings: "Settings",
  "time-block": "Momentum Appointments",
  "decision-compass": "Decision Compass",
  growth: "Growth Center",
};

const RELATED_AREAS: Partial<Record<WorkspaceHelpAreaId, string>> = {
  "plan-my-day":
    "Pulls from Projects and Clear My Mind. Finished work lands in My Work; wins and proof build in Wins This Week and Evidence Bank.",
  "visual-focus":
    "Separate from Plan My Day — use for mind maps, decision trees, and spatial thinking. Plan My Day stays for today's task views.",
  projects:
    "Links to Plan My Day, Create, Clear My Mind, and My Work. Chat can sit beside a project while you think.",
  "content-generator":
    "Uses Client Avatars and Templates for context. Drafts export to My Work; Snippets help with short-form copy.",
  "brain-dump":
    "First step in the Core Workflow — route captures to Projects, Plan My Day, Strategies, or Create when ready.",
  playbook:
    "Opens Focus, Clear My Mind, and Plan My Day when a strategy points there. Business strategies can flow into Create.",
  "templates-library":
    "Pairs with Create — Build With Shari adapts templates in conversation before anything drafts.",
  snippets:
    "Feeds Create and marketing workflows. Pair with Client Avatars for voice and tone.",
  "my-work":
    "Hub with Search Everything, Continue Working (favorites, recently active, resume items), and Browse My Work (Created Content, Projects, Snippets, Strategies, Templates, Archive).",
  "evidence-bank":
    "Separate from Wins This Week — wins capture what happened; evidence captures why it mattered. Part of 🌱 Growth alongside My Highlights and My Journey.",
  "wins-this-week":
    "Companion to Evidence Bank and My Highlights — weekly encouragement without scorekeeping. Review via Growth Inbox on the Growth hub.",
  growth:
    "Hub for Wins This Week, Evidence Bank, My Highlights, and My Journey — open each from navigation cards. Growth Inbox and Growth Reports live here too.",
  "client-avatars":
    "Informs Create, Templates, Snippets, and Strategies so messaging stays personal.",
  settings:
    "Personalization improves Chat and Create. Business Profile and appearance settings support the whole ecosystem.",
};

const articlesById = new Map(HOW_DO_I_HELP_ARTICLES.map((a) => [a.id, a]));

export type WorkspaceHelpContent = {
  areaId: WorkspaceHelpAreaId;
  areaName: string;
  whatItIs: string;
  whenToUse: string;
  workflow: string[];
  tips: string[];
  relatedAreas?: string;
  /** Cognitive Growth Principle — Question 1 */
  helpsToday?: string;
  /** Cognitive Growth Principle — Question 2 */
  strengthens?: string;
};

const LOCAL_GROWTH_HELP: Record<
  "growth" | "confidence-vault" | "my-journey",
  Omit<WorkspaceHelpContent, "areaId" | "helpsToday" | "strengthens">
> = {
  growth: {
    areaName: "Growth Center",
    whatItIs:
      "Your hub for progress, impact, highlights, and story — open each area from navigation cards. Growth Inbox and Growth Reports live here.",
    whenToUse:
      "When you want the big picture of how you are growing — not just today's tasks.",
    workflow: [
      "Open Wins, Evidence Bank, My Highlights, or My Journey from the hub cards.",
      "Process Growth Inbox on Wins This Week — save moments where they belong or dismiss.",
      "Generate a Growth Report when you want a combined printable view.",
    ],
    tips: [
      "Reviewing progress strengthens pattern recognition and self-awareness over time.",
      "Nothing is logged without your review in Growth Inbox.",
    ],
    relatedAreas:
      "Wins, Evidence Bank, My Highlights, and My Journey — each area has its own workspace.",
  },
  "confidence-vault": {
    areaName: "My Highlights",
    whatItIs:
      "A place to collect meaningful accomplishments, expertise, recognition, praise, credentials, testimonials, certifications, awards, and important moments that remind you of your growth, value, and capabilities.",
    whenToUse:
      "When you want to remember your strengths, preserve recognition, or celebrate what you have achieved.",
    workflow: [
      "Quick Save praise, testimonials, or recognition as they arrive.",
      "Add credentials and accomplishments when you earn them.",
      "Star the most meaningful items.",
      "Open when you need to remember what you have accomplished.",
    ],
    tips: [
      "Recognizing accomplishments is not ego — it is remembering reality when self-doubt appears.",
      "Separate from Evidence Bank: highlights celebrate you; evidence captures impact.",
    ],
    relatedAreas:
      "Part of 🌱 Growth alongside Wins, Evidence Bank, and My Journey.",
  },
  "my-journey": {
    areaName: "My Journey",
    whatItIs:
      "Your personal and professional story — experiences, lessons, milestones, and wisdom. Not a resume.",
    whenToUse:
      "When you want to preserve what shaped you, what you learned, and who you are becoming.",
    workflow: [
      "Add entries as milestones and lessons happen.",
      "Assign a life chapter (Early Life, Career, ADHD Discovery, etc.).",
      "Attach photos, letters, certificates, or links.",
      "Browse Timeline or Chapters when you need perspective.",
    ],
    tips: [
      "Core questions: Who am I? What has shaped me? What have I learned?",
      "Preserve meaning — not a profile form.",
    ],
    relatedAreas:
      "Distinct from Evidence Bank (impact) and My Highlights (accomplishments and recognition).",
  },
};

export function getWorkspaceHelpContent(
  areaId: string,
): WorkspaceHelpContent | null {
  const key = areaId as WorkspaceHelpAreaId;
  const local = LOCAL_GROWTH_HELP[key as keyof typeof LOCAL_GROWTH_HELP];
  if (local) {
    const growth = getCognitiveGrowthProfile(key);
    return {
      areaId: key,
      ...local,
      helpsToday: growth?.helpsToday,
      strengthens: growth?.strengthens,
    };
  }

  const articleId = HELP_ARTICLE_ID[key];
  if (!articleId) return null;

  const article = articlesById.get(articleId);
  if (!article) return null;

  const legacyWorkflow = getWorkspaceAreaWorkflow(areaId);
  const workflow = legacyWorkflow?.steps.length
    ? legacyWorkflow.steps
    : article.workflow;

  const tips = [...article.tips];
  if (legacyWorkflow?.tip && !tips.includes(legacyWorkflow.tip)) {
    tips.push(legacyWorkflow.tip);
  }

  const growth = getCognitiveGrowthProfile(key);

  return {
    areaId: key,
    areaName: AREA_DISPLAY_NAME[key] ?? article.title,
    whatItIs: article.whatItIs,
    whenToUse: article.whenToUse,
    workflow,
    tips,
    relatedAreas: RELATED_AREAS[key],
    helpsToday: growth?.helpsToday,
    strengthens: growth?.strengthens,
  };
}
