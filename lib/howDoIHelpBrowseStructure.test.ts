import { describe, expect, it } from "vitest";
import {
  articlesForNewUserStart,
  browseLocationForArticle,
  browseLocationLabelForArticle,
  formatBrowseLocationLabel,
  howDoIBrowseSections,
} from "./howDoIHelpBrowseStructure";
import { HELP_CENTER_ARTICLE_IDS } from "./howDoIHelpCenterArticles";

describe("howDoIHelpBrowseStructure P0.34", () => {
  it("orders New? Start Here onboarding articles", () => {
    const titles = articlesForNewUserStart().map((a) => a.id);
    expect(titles).toEqual([
      "meet-your-companion",
      "first-5-minutes",
      "your-first-day",
      "your-first-week",
    ]);
  });

  it("places Basics first under Main Areas", () => {
    const main = howDoIBrowseSections().find((s) => s.id === "main-areas");
    expect(main?.subgroups?.[0]?.id).toBe("basics");
    expect(main?.subgroups?.[0]?.articleIds).toEqual([
      "how-the-ecosystem-works",
      "understanding-the-main-areas",
      "frequently-asked-questions",
    ]);
  });

  it("groups Growth topics for progress tracking", () => {
    const growth = howDoIBrowseSections()
      .find((s) => s.id === "main-areas")
      ?.subgroups?.find((g) => g.id === "growth");
    expect(growth?.articleIds).toEqual([
      "outcome-goals",
      "wins-this-week",
      "evidence-bank",
      "portfolio",
      "my-journey",
      "growth-reports",
    ]);
  });

  it("formats search location labels", () => {
    const loc = browseLocationForArticle("outcome-goals");
    expect(loc).not.toBeNull();
    expect(formatBrowseLocationLabel(loc!)).toBe("Main Areas → Growth");
    expect(browseLocationLabelForArticle("outcome-goals")).toBe(
      "Main Areas → Growth",
    );
  });

  it("derives help center article ids from main areas browse", () => {
    expect(HELP_CENTER_ARTICLE_IDS).toContain("outcome-goals");
    expect(HELP_CENTER_ARTICLE_IDS).toContain("chat-companion");
    expect(HELP_CENTER_ARTICLE_IDS).not.toContain("meet-your-companion");
  });

  it("lists additional help topic subgroups", () => {
    const additional = howDoIBrowseSections().find(
      (s) => s.id === "additional-help",
    );
    const labels = additional?.subgroups?.map((g) => g.label) ?? [];
    expect(labels).toContain("Account");
    expect(labels).toContain("Troubleshooting");
    expect(labels).toContain("Advanced Companion Behavior");
  });
});
