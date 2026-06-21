import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import {
  articlesForBrowseSubgroup,
  browseLocationForArticle,
  howDoIBrowseSections,
  type HowDoISubgroupId,
} from "./howDoIHelpBrowseStructure";
import type { HowDoIHelpArticle } from "./howDoIHelpTypes";

export type AdditionalHelpTopicGroupId = HowDoISubgroupId;

export type AdditionalHelpTopicGroup = {
  id: AdditionalHelpTopicGroupId;
  label: string;
  emoji: string;
  description: string;
};

/** @deprecated Browse structure is defined in howDoIHelpBrowseStructure */
export const ADDITIONAL_HELP_TOPIC_GROUPS: AdditionalHelpTopicGroup[] =
  howDoIBrowseSections()
    .find((s) => s.id === "additional-help")
    ?.subgroups?.map((g) => ({
      id: g.id,
      label: g.label,
      emoji: "🛠",
      description: g.label,
    })) ?? [];

export type AdditionalHelpTopicGroupWithArticles = AdditionalHelpTopicGroup & {
  articles: HowDoIHelpArticle[];
};

export function additionalHelpTopicGroups(): AdditionalHelpTopicGroupWithArticles[] {
  const section = howDoIBrowseSections().find((s) => s.id === "additional-help");
  if (!section?.subgroups) return [];

  return section.subgroups.map((subgroup) => ({
    id: subgroup.id,
    label: subgroup.label,
    emoji: "🛠",
    description: subgroup.label,
    articles: articlesForBrowseSubgroup(subgroup),
  }));
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
  const loc = browseLocationForArticle(id);
  return loc?.topSectionId === "additional-help";
}

export function additionalTopicGroupIdForArticle(
  articleId: string,
): AdditionalHelpTopicGroupId | null {
  const loc = browseLocationForArticle(articleId);
  if (loc?.topSectionId === "additional-help" && loc.subgroupId) {
    return loc.subgroupId;
  }
  return null;
}

/** All help article ids not in onboarding or main areas. */
export function legacyOverflowArticleIds(): string[] {
  return HOW_DO_I_HELP_ARTICLES.filter((a) => isAdditionalHelpArticle(a.id)).map(
    (a) => a.id,
  );
}
