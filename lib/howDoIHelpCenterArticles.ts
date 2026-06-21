import type { HowDoIHelpArticle } from "./howDoIHelpTypes";
import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";

/**
 * Main Areas — one card per major ecosystem destination.
 * Workflow order (matches Core Workflow), never alphabetical.
 */
export const HELP_CENTER_ARTICLE_IDS = [
  "plan-my-day",
  "projects",
  "create-overview",
  "clear-my-mind",
  "strategies",
  "templates",
  "snippets",
  "my-work",
  "evidence-bank",
  "wins-this-week",
  "client-avatars",
  "settings-personalization",
] as const;

export type HelpCenterArticleId = (typeof HELP_CENTER_ARTICLE_IDS)[number];

const byId = new Map(HOW_DO_I_HELP_ARTICLES.map((a) => [a.id, a]));

export function helpCenterArticles(): HowDoIHelpArticle[] {
  return HELP_CENTER_ARTICLE_IDS.map((id) => {
    const article = byId.get(id);
    if (!article) {
      throw new Error(`Missing help center article: ${id}`);
    }
    return article;
  });
}

export function isHelpCenterArticle(id: string): boolean {
  return (HELP_CENTER_ARTICLE_IDS as readonly string[]).includes(id);
}
