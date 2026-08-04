import type { HowDoIHelpArticle } from "./howDoIHelpTypes";
import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import {
  howDoIBrowseSections,
  mainAreaBrowseArticleIds,
} from "./howDoIHelpBrowseStructure";

/**
 * Main Areas — grouped in How Do I browse (Basics, Daily Use, Growth, Resources).
 * Derived from browse structure for search indexing and legacy callers.
 */
export const HELP_CENTER_ARTICLE_IDS: readonly string[] = mainAreaBrowseArticleIds();

export type HelpCenterArticleId = string;

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
  return HELP_CENTER_ARTICLE_IDS.includes(id);
}

export function mainAreaBrowseSubgroups() {
  const main = howDoIBrowseSections().find((s) => s.id === "main-areas");
  return main?.subgroups ?? [];
}
