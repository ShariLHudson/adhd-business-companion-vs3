import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import type { HowDoIHelpArticle } from "./howDoIHelpTypes";

export type HowDoITopSectionId = "new-user" | "main-areas" | "additional-help";

export type HowDoIMainSubgroupId = "daily-use" | "growth" | "resources";

export type HowDoIAdditionalSubgroupId =
  | "account-settings"
  | "companion-features"
  | "productivity-growth"
  | "more-help";

export type HowDoISubgroupId = HowDoIMainSubgroupId | HowDoIAdditionalSubgroupId;

export type HowDoIBrowseSubgroup = {
  id: HowDoISubgroupId;
  label: string;
  articleIds: readonly string[];
};

export type HowDoIBrowseTopSection = {
  id: HowDoITopSectionId;
  label: string;
  emoji: string;
  description: string;
  /** Flat list for New? Start Here */
  articleIds?: readonly string[];
  subgroups?: HowDoIBrowseSubgroup[];
};

/** Alphabetical by article title — resolved at runtime. */
const NEW_USER_START_ARTICLE_IDS = [
  "first-5-minutes",
  "frequently-asked-questions",
  "how-the-ecosystem-works",
  "meet-your-companion",
  "understanding-the-main-areas",
  "your-first-day",
  "your-first-week",
] as const;

const MAIN_AREA_SUBGROUPS: readonly HowDoIBrowseSubgroup[] = [
  {
    id: "daily-use",
    label: "Daily Use",
    articleIds: [
      "clear-my-mind",
      "create-overview",
      "focus-sessions",
      "plan-my-day",
      "projects",
    ],
  },
  {
    id: "growth",
    label: "Growth",
    articleIds: [
      "evidence-bank",
      "my-highlights",
      "my-journey",
      "wins-this-week",
    ],
  },
  {
    id: "resources",
    label: "Resources",
    articleIds: [
      "client-avatars",
      "my-work",
      "snippets",
      "strategies",
      "templates",
    ],
  },
];

const ADDITIONAL_HELP_SUBGROUPS: readonly HowDoIBrowseSubgroup[] = [
  {
    id: "account-settings",
    label: "Account & Settings",
    articleIds: [
      "account-settings",
      "notifications",
      "personalization",
      "settings-personalization",
      "subscription",
    ],
  },
  {
    id: "companion-features",
    label: "Companion Features",
    articleIds: ["chat-companion", "memory", "privacy", "voice-conversations"],
  },
  {
    id: "productivity-growth",
    label: "Productivity & Growth",
    articleIds: [
      "cognitive-growth",
      "growth-reports",
      "ecosystem-search",
      "growth-uploads",
    ],
  },
];

const articlesById = new Map(HOW_DO_I_HELP_ARTICLES.map((a) => [a.id, a]));

function compareByTitle(a: HowDoIHelpArticle, b: HowDoIHelpArticle): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

function resolveArticles(ids: readonly string[]): HowDoIHelpArticle[] {
  return ids
    .map((id) => articlesById.get(id))
    .filter((a): a is HowDoIHelpArticle => Boolean(a))
    .sort(compareByTitle);
}

function allExplicitBrowseArticleIds(): Set<string> {
  const ids = new Set<string>(NEW_USER_START_ARTICLE_IDS);
  for (const group of MAIN_AREA_SUBGROUPS) {
    for (const id of group.articleIds) ids.add(id);
  }
  for (const group of ADDITIONAL_HELP_SUBGROUPS) {
    for (const id of group.articleIds) ids.add(id);
  }
  return ids;
}

function buildMoreHelpSubgroup(): HowDoIBrowseSubgroup {
  const explicit = allExplicitBrowseArticleIds();
  const overflow = HOW_DO_I_HELP_ARTICLES.filter((a) => !explicit.has(a.id)).sort(
    compareByTitle,
  );
  return {
    id: "more-help",
    label: "More Help Topics",
    articleIds: overflow.map((a) => a.id),
  };
}

export function howDoIBrowseSections(): HowDoIBrowseTopSection[] {
  const moreHelp = buildMoreHelpSubgroup();
  const additionalSubgroups = [
    ...ADDITIONAL_HELP_SUBGROUPS,
    ...(moreHelp.articleIds.length > 0 ? [moreHelp] : []),
  ];

  return [
    {
      id: "new-user",
      label: "New? Start Here",
      emoji: "🚀",
      description:
        "Orientation and onboarding — calm first steps, not a feature manual.",
      articleIds: [...NEW_USER_START_ARTICLE_IDS],
    },
    {
      id: "main-areas",
      label: "Main Areas",
      emoji: "📚",
      description: "The core ecosystem — grouped by how you use them.",
      subgroups: MAIN_AREA_SUBGROUPS.map((group) => ({
        ...group,
        articleIds: resolveArticles(group.articleIds).map((a) => a.id),
      })),
    },
    {
      id: "additional-help",
      label: "Additional Help Topics",
      emoji: "🛠",
      description: "Account, companion behavior, productivity, and deeper topics.",
      subgroups: additionalSubgroups.map((group) => ({
        ...group,
        articleIds: resolveArticles(group.articleIds).map((a) => a.id),
      })),
    },
  ];
}

export type HowDoIBrowseLocation = {
  topSectionId: HowDoITopSectionId;
  subgroupId?: HowDoISubgroupId;
  articleId: string;
};

export function browseLocationForArticle(
  articleId: string,
): HowDoIBrowseLocation | null {
  for (const section of howDoIBrowseSections()) {
    if (section.articleIds?.includes(articleId)) {
      return { topSectionId: section.id, articleId };
    }
    for (const subgroup of section.subgroups ?? []) {
      if (subgroup.articleIds.includes(articleId)) {
        return {
          topSectionId: section.id,
          subgroupId: subgroup.id,
          articleId,
        };
      }
    }
  }
  return null;
}

export function articlesForBrowseSubgroup(
  subgroup: HowDoIBrowseSubgroup,
): HowDoIHelpArticle[] {
  return resolveArticles(subgroup.articleIds);
}

export function articlesForNewUserStart(): HowDoIHelpArticle[] {
  return resolveArticles(NEW_USER_START_ARTICLE_IDS);
}

/** @deprecated Use browseLocationForArticle */
export function additionalTopicGroupIdForArticle(
  articleId: string,
): HowDoISubgroupId | null {
  const loc = browseLocationForArticle(articleId);
  if (loc?.topSectionId === "additional-help" && loc.subgroupId) {
    return loc.subgroupId;
  }
  return null;
}

export function isNewUserStartHereArticle(id: string): boolean {
  return (NEW_USER_START_ARTICLE_IDS as readonly string[]).includes(id);
}

export function isHelpCenterBrowseArticle(id: string): boolean {
  const loc = browseLocationForArticle(id);
  return loc?.topSectionId === "main-areas";
}

export function getBrowseArticle(id: string): HowDoIHelpArticle | undefined {
  return articlesById.get(id);
}
