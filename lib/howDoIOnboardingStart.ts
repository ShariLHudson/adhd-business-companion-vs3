import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import type { HowDoIHelpArticle } from "./howDoIHelpTypes";

/** P0.34 — How Do I → 🚀 New? Start Here (fixed order). */
export const NEW_USER_START_HERE_IDS = [
  "meet-your-companion",
  "first-5-minutes",
  "your-first-day",
  "your-first-week",
] as const;

export type NewUserStartHereId = (typeof NEW_USER_START_HERE_IDS)[number];

const byId = new Map(HOW_DO_I_HELP_ARTICLES.map((a) => [a.id, a]));

export function newUserStartHereArticles(): HowDoIHelpArticle[] {
  return NEW_USER_START_HERE_IDS.map((id) => {
    const article = byId.get(id);
    if (!article) {
      throw new Error(`Missing new-user start article: ${id}`);
    }
    return article;
  });
}

export function isNewUserStartHereArticle(id: string): boolean {
  return (NEW_USER_START_HERE_IDS as readonly string[]).includes(id);
}
