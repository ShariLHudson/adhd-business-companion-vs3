import {
  bestEcosystemSearchResult,
  searchEcosystem,
} from "./howDoIEcosystemSearch";
import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import {
  additionalHelpArticles,
  additionalHelpTopicGroups,
} from "./howDoIAdditionalTopics";
import {
  helpCenterArticles,
  HELP_CENTER_ARTICLE_IDS,
  isHelpCenterArticle,
} from "./howDoIHelpCenterArticles";
import {
  NEW_USER_START_HERE_IDS,
  newUserStartHereArticles,
} from "./howDoIOnboardingStart";
import {
  HOW_DO_I_COMPANION_PRINCIPLE,
  HOW_DO_I_CORE_WORKFLOW,
  type HowDoIHelpArticle,
} from "./howDoIHelpTypes";

export {
  HOW_DO_I_COMPANION_PRINCIPLE,
  HOW_DO_I_CORE_WORKFLOW,
  helpCenterArticles,
  isHelpCenterArticle,
  type HowDoIHelpArticle,
};

export { HELP_CENTER_ARTICLE_IDS } from "./howDoIHelpCenterArticles";
export {
  NEW_USER_START_HERE_IDS,
  newUserStartHereArticles,
  isNewUserStartHereArticle,
} from "./howDoIOnboardingStart";
export {
  additionalHelpArticles,
  additionalHelpTopicGroups,
  additionalTopicGroupIdForArticle,
  ADDITIONAL_HELP_TOPIC_GROUPS,
} from "./howDoIAdditionalTopics";
export {
  ONBOARDING_EXPERIENCE,
  ONBOARDING_EXPERIENCE_CONTENT,
} from "./onboardingExperienceContent";
export {
  searchEcosystem,
  groupEcosystemSearchResults,
  bestEcosystemSearchResult,
  type EcosystemSearchResult,
  type EcosystemSearchResultType,
  type EcosystemSearchAction,
} from "./howDoIEcosystemSearch";

const helpCenterById = new Map(
  helpCenterArticles().map((a) => [a.id, a]),
);

export function getHelpArticle(id: string): HowDoIHelpArticle | undefined {
  return helpCenterById.get(id) ?? HOW_DO_I_HELP_ARTICLES.find((a) => a.id === id);
}

/** @deprecated Use helpCenterArticles */
export function featuredHelpArticles(): HowDoIHelpArticle[] {
  return helpCenterArticles();
}

function buildHelpBrowseOrderIndex(): Map<string, number> {
  const order = new Map<string, number>();
  let index = 0;

  for (const id of NEW_USER_START_HERE_IDS) {
    order.set(id, index++);
  }
  for (const id of HELP_CENTER_ARTICLE_IDS) {
    order.set(id, index++);
  }
  for (const group of additionalHelpTopicGroups()) {
    for (const article of group.articles) {
      if (!order.has(article.id)) order.set(article.id, index++);
    }
  }

  return order;
}

let helpBrowseOrderCache: Map<string, number> | null = null;

function helpBrowseOrderIndex(): Map<string, number> {
  if (!helpBrowseOrderCache) {
    helpBrowseOrderCache = buildHelpBrowseOrderIndex();
  }
  return helpBrowseOrderCache;
}

function compareHelpBrowseOrder(a: HowDoIHelpArticle, b: HowDoIHelpArticle): number {
  const order = helpBrowseOrderIndex();
  const ai = order.get(a.id) ?? Number.MAX_SAFE_INTEGER;
  const bi = order.get(b.id) ?? Number.MAX_SAFE_INTEGER;
  return ai - bi;
}

/** Help articles only — backed by global ecosystem search. */
export function searchHelpArticles(query: string): HowDoIHelpArticle[] {
  return searchEcosystem(query, 30)
    .filter((r) => r.action.kind === "help-article")
    .map((r) =>
      r.action.kind === "help-article"
        ? getHelpArticle(r.action.articleId)
        : undefined,
    )
    .filter((a): a is HowDoIHelpArticle => Boolean(a))
    .sort(compareHelpBrowseOrder);
}

export function bestHelpArticleMatch(query: string): HowDoIHelpArticle | null {
  const best = bestEcosystemSearchResult(query);
  if (best?.action.kind === "help-article") {
    return getHelpArticle(best.action.articleId) ?? null;
  }
  return searchHelpArticles(query)[0] ?? null;
}

/** @deprecated */
export const HOW_DO_I_ECOSYSTEM_CARDS = helpCenterArticles();

export function searchEcosystemCards(query: string) {
  return searchEcosystem(query);
}

export function bestEcosystemCardMatch(query: string) {
  return bestEcosystemSearchResult(query);
}
