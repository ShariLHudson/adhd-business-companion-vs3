import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import type { HowDoIHelpArticle } from "./howDoIHelpTypes";

/** Shown in How Do I → 🚀 New? Start Here — alphabetical by title. */
export const NEW_USER_START_HERE_IDS = [
  "first-5-minutes",
  "frequently-asked-questions",
  "how-the-ecosystem-works",
  "meet-your-companion",
  "understanding-the-main-areas",
  "your-first-day",
  "your-first-week",
] as const;

export type NewUserStartHereId = (typeof NEW_USER_START_HERE_IDS)[number];

const byId = new Map(HOW_DO_I_HELP_ARTICLES.map((a) => [a.id, a]));

function compareByTitle(a: HowDoIHelpArticle, b: HowDoIHelpArticle): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

export function newUserStartHereArticles(): HowDoIHelpArticle[] {
  return NEW_USER_START_HERE_IDS.map((id) => {
    const article = byId.get(id);
    if (!article) {
      throw new Error(`Missing new-user start article: ${id}`);
    }
    return article;
  }).sort(compareByTitle);
}

export function isNewUserStartHereArticle(id: string): boolean {
  return (NEW_USER_START_HERE_IDS as readonly string[]).includes(id);
}
