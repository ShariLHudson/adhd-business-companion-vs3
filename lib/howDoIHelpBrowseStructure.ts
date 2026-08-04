import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";
import type { HowDoIHelpArticle } from "./howDoIHelpTypes";

export type HowDoITopSectionId = "new-user" | "main-areas" | "additional-help";

export type HowDoIMainSubgroupId =
  | "basics"
  | "daily-use"
  | "growth"
  | "resources";

export type HowDoIAdditionalSubgroupId =
  | "account"
  | "notifications"
  | "productivity"
  | "settings"
  | "integrations"
  | "troubleshooting"
  | "advanced-companion";

export type HowDoISubgroupId = HowDoIMainSubgroupId | HowDoIAdditionalSubgroupId;

export type HowDoIBrowseSubgroup = {
  id: HowDoISubgroupId;
  label: string;
  articleIds: readonly string[];
  /** When true, preserve articleIds order (onboarding paths). */
  preserveOrder?: boolean;
};

export type HowDoIBrowseTopSection = {
  id: HowDoITopSectionId;
  label: string;
  emoji: string;
  description: string;
  articleIds?: readonly string[];
  subgroups?: HowDoIBrowseSubgroup[];
};

/** P0.34 — recommended onboarding order (not alphabetical). */
const NEW_USER_START_ARTICLE_IDS = [
  "meet-your-companion",
  "first-5-minutes",
  "your-first-day",
  "your-first-week",
] as const;

const MAIN_AREA_SUBGROUPS: readonly HowDoIBrowseSubgroup[] = [
  {
    id: "basics",
    label: "Basics",
    preserveOrder: true,
    articleIds: [
      "how-the-ecosystem-works",
      "understanding-the-main-areas",
      "frequently-asked-questions",
    ],
  },
  {
    id: "daily-use",
    label: "Daily Use",
    preserveOrder: true,
    articleIds: [
      "chat-companion",
      "today-view",
      "plan-my-day",
      "focus-sessions",
      "clear-my-mind",
      "daily-workflows",
    ],
  },
  {
    id: "growth",
    label: "Growth",
    preserveOrder: true,
    articleIds: [
      "outcome-goals",
      "wins-this-week",
      "evidence-bank",
      "portfolio",
      "my-journey",
      "growth-reports",
    ],
  },
  {
    id: "resources",
    label: "Resources",
    preserveOrder: true,
    articleIds: [
      "templates",
      "strategies",
      "create-overview",
      "visual-focus",
      "learning-resources",
      "saved-work",
    ],
  },
];

const ADVANCED_COMPANION_CORE_IDS = [
  "how-conversation-works",
  "adaptive-learning",
  "memory",
  "workspace-vs-chat",
  "chat-workspace",
  "voice-conversations",
  "privacy",
] as const;

const ADDITIONAL_HELP_SUBGROUPS: readonly HowDoIBrowseSubgroup[] = [
  {
    id: "account",
    label: "Account",
    articleIds: ["account-settings", "subscription"],
  },
  {
    id: "notifications",
    label: "Notifications",
    articleIds: ["notifications"],
  },
  {
    id: "productivity",
    label: "Productivity",
    articleIds: [
      "productivity-help",
      "cognitive-growth",
      "time-blocking",
      "executive-function",
      "planning-problems",
    ],
  },
  {
    id: "settings",
    label: "Settings",
    articleIds: [
      "settings-personalization",
      "personalization",
      "adaptive-colors",
      "accessibility",
      "views-layouts",
      "language-settings",
      "voice-preferences",
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    articleIds: ["integrations"],
  },
  {
    id: "troubleshooting",
    label: "Troubleshooting",
    articleIds: ["troubleshooting"],
  },
  {
    id: "advanced-companion",
    label: "Advanced Companion Behavior",
    articleIds: [...ADVANCED_COMPANION_CORE_IDS],
  },
];

const articlesById = new Map(HOW_DO_I_HELP_ARTICLES.map((a) => [a.id, a]));

function compareByTitle(a: HowDoIHelpArticle, b: HowDoIHelpArticle): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
}

function resolveArticles(
  ids: readonly string[],
  preserveOrder = false,
): HowDoIHelpArticle[] {
  const articles = ids
    .map((id) => articlesById.get(id))
    .filter((a): a is HowDoIHelpArticle => Boolean(a));
  return preserveOrder ? articles : articles.sort(compareByTitle);
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

function buildAdvancedOverflowIds(): string[] {
  const explicit = allExplicitBrowseArticleIds();
  return HOW_DO_I_HELP_ARTICLES.filter((a) => !explicit.has(a.id))
    .sort(compareByTitle)
    .map((a) => a.id);
}

export function howDoIBrowseSections(): HowDoIBrowseTopSection[] {
  const overflow = buildAdvancedOverflowIds();
  const advancedGroup = ADDITIONAL_HELP_SUBGROUPS.find(
    (g) => g.id === "advanced-companion",
  )!;
  const advancedArticleIds = [
    ...advancedGroup.articleIds,
    ...overflow,
  ];

  const additionalSubgroups = ADDITIONAL_HELP_SUBGROUPS.map((group) => {
    const ids =
      group.id === "advanced-companion" ? advancedArticleIds : group.articleIds;
    return {
      ...group,
      articleIds: resolveArticles(ids, group.preserveOrder).map((a) => a.id),
    };
  });

  return [
    {
      id: "new-user",
      label: "New? Start Here",
      emoji: "🚀",
      description: "Where to start — orientation in a few calm steps.",
      articleIds: resolveArticles(NEW_USER_START_ARTICLE_IDS, true).map(
        (a) => a.id,
      ),
    },
    {
      id: "main-areas",
      label: "Main Areas",
      emoji: "🌎",
      description: "How the ecosystem works — basics, daily use, growth, and resources.",
      subgroups: MAIN_AREA_SUBGROUPS.map((group) => ({
        ...group,
        articleIds: resolveArticles(group.articleIds, group.preserveOrder).map(
          (a) => a.id,
        ),
      })),
    },
    {
      id: "additional-help",
      label: "Additional Help Topics",
      emoji: "🛠",
      description: "Account, settings, integrations, troubleshooting, and deeper companion topics.",
      subgroups: additionalSubgroups,
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

/** Human-readable path for search results, e.g. "Main Areas → Growth". */
export function formatBrowseLocationLabel(
  location: HowDoIBrowseLocation,
): string {
  const section = howDoIBrowseSections().find((s) => s.id === location.topSectionId);
  if (!section) return "Help";

  if (!location.subgroupId) {
    return section.label;
  }

  const subgroup = section.subgroups?.find((g) => g.id === location.subgroupId);
  return subgroup ? `${section.label} → ${subgroup.label}` : section.label;
}

export function browseLocationLabelForArticle(articleId: string): string | null {
  const loc = browseLocationForArticle(articleId);
  return loc ? formatBrowseLocationLabel(loc) : null;
}

export function articlesForBrowseSubgroup(
  subgroup: HowDoIBrowseSubgroup,
): HowDoIHelpArticle[] {
  return resolveArticles(subgroup.articleIds, subgroup.preserveOrder);
}

export function articlesForNewUserStart(): HowDoIHelpArticle[] {
  return resolveArticles(NEW_USER_START_ARTICLE_IDS, true);
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

export function mainAreaBrowseArticleIds(): string[] {
  const main = howDoIBrowseSections().find((s) => s.id === "main-areas");
  return (main?.subgroups ?? []).flatMap((g) => g.articleIds);
}
