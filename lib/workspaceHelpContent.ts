import { getCognitiveGrowthProfile } from "./cognitiveGrowthPrinciple";
import { CLEAR_MY_MIND_HELP } from "./clearMyMindHelpContent";
import { NEW_DAYS_CHAT_INSTRUCTION } from "./chatWorkspaceHelpContent";
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
    "Pulls from Projects and Clear My Mind. Finished work lands in My Work; wins and proof build in Wins This Week and Evidence Vault.",
  "visual-focus":
    "Studio hub with teaching cards — separate from Plan My Day (tasks) and Decision Compass (choosing which option is best). Decision Tree here explores what happens if you choose a path.",
  projects:
    "Links to Plan My Day, Create, Clear My Mind, and My Work. Chat can sit beside a project while you think.",
  "content-generator":
    "Uses Client Avatars and Templates for context. Drafts export to My Work; Snippets help with short-form copy.",
  "brain-dump":
    "Pairs with Plan My Day and Projects when you use Thought Actions to move a captured thought.",
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
    "Companion to Evidence Vault and My Highlights — weekly encouragement without scorekeeping. Review via Growth Inbox on the Growth hub.",
  growth:
    "Hub for Wins This Week, Evidence Vault, My Highlights, and My Journey — open each from navigation cards. Growth Inbox and Growth Reports live here too.",
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

const LOCAL_PLAN_MY_DAY_HELP: Omit<
  WorkspaceHelpContent,
  "areaId" | "helpsToday" | "strengthens"
> = {
  areaName: "Plan My Day",
  whatItIs:
    "A daily decision workspace — not a task manager, project manager, or long-term planner. It answers one question: what is realistic for me today?",
  whenToUse:
    "When competing priorities need a reality check against your energy, time, appointments, motivation, and mental bandwidth today.",
  workflow: [
    "Add a task above the board — ideas from Clear My Mind, Projects, yesterday's work, or new commitments.",
    "Decide where it belongs: Considering Today, Today's Focus, or In Progress.",
    "Work the board — move items as you begin and finish; tap ✓ to complete (items archive and leave the board).",
    "Defer or remove what does not belong today.",
    "Check Today's Reality in the compact summary; update via Today's Reality in the top bar when your capacity shifts.",
    "When starting a new day, use Chat Workspace → New Day's Chat to reset this workspace.",
  ],
  tips: [
    "The goal is not to do everything — it is to identify what matters most today.",
    "This workspace is intentionally temporary so it does not become another overwhelming task list.",
    "Kanban has three columns only — no Done column. Completion archives to progress history and Founder Intelligence.",
    NEW_DAYS_CHAT_INSTRUCTION.menuPath.replace(/\*\*/g, "") +
      " when you want a clean daily start.",
  ],
  relatedAreas:
    "Pulls from Clear My Mind and Projects. Completed work lands in progress history, My Work, and Founder Intelligence learning.",
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
      "Define Outcome Goals — where you are headed (not a task list).",
      "Open Plan My Day when you are ready to choose what fits today.",
      "Open My Wins, Evidence Vault, My Highlights, or My Journey from the hub cards.",
      "Check Growth Inbox for moments the app noticed — save where they belong or dismiss.",
      "Tap Growth Reports for a printable reflection — not a live dashboard.",
    ],
    tips: [
      "Reviewing progress strengthens pattern recognition and self-awareness over time.",
      "Nothing is logged without your review in Growth Inbox.",
    ],
    relatedAreas:
      "Wins, Evidence Vault, My Highlights, and My Journey — each area has its own workspace.",
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
      "Separate from Evidence Vault: highlights celebrate you; evidence captures impact.",
    ],
    relatedAreas:
      "Part of 🌱 Growth alongside Wins, Evidence Vault, and My Journey.",
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
      "Distinct from Evidence Vault (impact) and My Highlights (accomplishments and recognition).",
  },
};

export function getWorkspaceHelpContent(
  areaId: string,
): WorkspaceHelpContent | null {
  const key = areaId as WorkspaceHelpAreaId;

  if (key === "brain-dump") {
    const growth = getCognitiveGrowthProfile(key);
    return {
      areaId: key,
      ...CLEAR_MY_MIND_HELP,
      helpsToday: growth?.helpsToday,
      strengthens: growth?.strengthens,
    };
  }

  if (key === "plan-my-day") {
    const growth = getCognitiveGrowthProfile(key);
    return {
      areaId: key,
      ...LOCAL_PLAN_MY_DAY_HELP,
      helpsToday: growth?.helpsToday,
      strengthens: growth?.strengthens,
    };
  }

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
