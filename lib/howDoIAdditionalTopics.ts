import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import { isHelpCenterArticle } from "./howDoIHelpCenterArticles";
import { isNewUserStartHereArticle } from "./howDoIOnboardingStart";
import type { HowDoIHelpArticle, HowDoIHelpCategoryId } from "./howDoIHelpTypes";

export type AdditionalHelpTopicGroupId =
  | "conversation"
  | "adhd-support"
  | "focus-planning"
  | "create-deep-dives"
  | "business-growth"
  | "decisions";

export type AdditionalHelpTopicGroup = {
  id: AdditionalHelpTopicGroupId;
  label: string;
  emoji: string;
  description: string;
  sourceCategoryIds: readonly HowDoIHelpCategoryId[];
  /** Main-area cards already covered above — never duplicate here. */
  excludeArticleIds?: readonly string[];
};

/**
 * Deeper help topics — educational articles, not onboarding flows.
 * Shown in How Do I below the 12 Main Area cards.
 */
export const ADDITIONAL_HELP_TOPIC_GROUPS: AdditionalHelpTopicGroup[] = [
  {
    id: "conversation",
    label: "Conversation Companion",
    emoji: "💬",
    description: "Chat, voice, memory, and how conversation fits the ecosystem.",
    sourceCategoryIds: ["conversation"],
  },
  {
    id: "adhd-support",
    label: "ADHD Support",
    emoji: "🧠",
    description: "Strategies for overwhelm, initiation, time, and momentum.",
    sourceCategoryIds: ["adhd-support"],
  },
  {
    id: "focus-planning",
    label: "Focus & Planning",
    emoji: "🎯",
    description: "Sessions, appointments, visual focus, and planning patterns.",
    sourceCategoryIds: ["focus-momentum", "planning"],
    excludeArticleIds: ["plan-my-day"],
  },
  {
    id: "create-deep-dives",
    label: "Create Deep Dives",
    emoji: "✍️",
    description: "Workshops, SOPs, lead magnets, landing pages, and more.",
    sourceCategoryIds: ["create"],
    excludeArticleIds: ["create-overview"],
  },
  {
    id: "business-growth",
    label: "Business Growth",
    emoji: "📈",
    description: "Marketing, sales, visibility, and networking.",
    sourceCategoryIds: ["business-growth"],
  },
  {
    id: "decisions",
    label: "Decisions",
    emoji: "🧭",
    description: "Compare options, choose priorities, and get unstuck.",
    sourceCategoryIds: ["decisions"],
  },
];

const articlesById = new Map(HOW_DO_I_HELP_ARTICLES.map((a) => [a.id, a]));

function articlesForGroup(group: AdditionalHelpTopicGroup): HowDoIHelpArticle[] {
  const excluded = new Set(group.excludeArticleIds ?? []);

  return HOW_DO_I_HELP_ARTICLES.filter(
    (article) =>
      group.sourceCategoryIds.includes(article.categoryId) &&
      !excluded.has(article.id) &&
      !isHelpCenterArticle(article.id) &&
      !isNewUserStartHereArticle(article.id),
  );
}

export type AdditionalHelpTopicGroupWithArticles = AdditionalHelpTopicGroup & {
  articles: HowDoIHelpArticle[];
};

export function additionalHelpTopicGroups(): AdditionalHelpTopicGroupWithArticles[] {
  return ADDITIONAL_HELP_TOPIC_GROUPS.map((group) => ({
    ...group,
    articles: articlesForGroup(group),
  })).filter((group) => group.articles.length > 0);
}

export function additionalHelpArticles(): HowDoIHelpArticle[] {
  const seen = new Set<string>();
  const out: HowDoIHelpArticle[] = [];

  for (const group of additionalHelpTopicGroups()) {
    for (const article of group.articles) {
      if (seen.has(article.id)) continue;
      seen.add(article.id);
      out.push(article);
    }
  }

  return out;
}

export function isAdditionalHelpArticle(id: string): boolean {
  return additionalHelpArticles().some((a) => a.id === id);
}

export function additionalTopicGroupIdForArticle(
  articleId: string,
): AdditionalHelpTopicGroupId | null {
  for (const group of additionalHelpTopicGroups()) {
    if (group.articles.some((a) => a.id === articleId)) {
      return group.id;
    }
  }
  return null;
}
