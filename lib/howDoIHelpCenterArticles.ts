import type { HowDoIHelpArticle } from "./howDoIHelpTypes";
import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import { howDoIBrowseSections } from "./howDoIHelpBrowseStructure";

/**
 * Main Areas — grouped in How Do I browse (Daily Use, Growth, Resources).
 * Flat list kept for search indexing and legacy callers.
 */
export const HELP_CENTER_ARTICLE_IDS = [
  "clear-my-mind",
  "create-overview",
  "focus-sessions",
  "plan-my-day",
  "projects",
  "evidence-bank",
  "my-highlights",
  "my-journey",
  "wins-this-week",
  "client-avatars",
  "my-work",
  "snippets",
  "strategies",
  "templates",
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

export function mainAreaBrowseSubgroups() {
  const main = howDoIBrowseSections().find((s) => s.id === "main-areas");
  return main?.subgroups ?? [];
}
