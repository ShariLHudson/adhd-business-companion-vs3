import { getCognitiveGrowthProfile } from "./cognitiveGrowthPrinciple";
import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import { getWorkspaceAreaWorkflow } from "./workspaceAreaWorkflows";

/** Workspace keys used by panels — maps to How Do I help articles. */
export type WorkspaceHelpAreaId =
  | "plan-my-day"
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
  | "time-block"
  | "decision-compass";

const HELP_ARTICLE_ID: Record<WorkspaceHelpAreaId, string> = {
  "plan-my-day": "plan-my-day",
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
  "time-block": "momentum-appointments",
  "decision-compass": "decision-compass",
};

const AREA_DISPLAY_NAME: Partial<Record<WorkspaceHelpAreaId, string>> = {
  "brain-dump": "Clear My Mind",
  "content-generator": "Create",
  playbook: "Strategies",
  "templates-library": "Templates",
  settings: "Settings",
  "time-block": "Momentum Appointments",
  "decision-compass": "Decision Compass",
};

const RELATED_AREAS: Partial<Record<WorkspaceHelpAreaId, string>> = {
  "plan-my-day":
    "Pulls from Projects and Clear My Mind. Finished work lands in My Work; wins and proof build in Wins This Week and Evidence Bank.",
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
    "Hub for Projects, Saved Work, Create drafts, decisions, and files — search when you know the name but not the workspace.",
  "evidence-bank":
    "Built from Wins This Week, completed work in My Work, and exports from Create. Review when planning or pitching.",
  "wins-this-week":
    "Companion to Evidence Bank — weekly encouragement without scorekeeping. Log wins from any workspace as you go.",
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

export function getWorkspaceHelpContent(
  areaId: string,
): WorkspaceHelpContent | null {
  const key = areaId as WorkspaceHelpAreaId;
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
