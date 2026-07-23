/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { clearFirePortfolioStorageForTests } from "@/lib/founder/briefs/firePortfolioStorage";
import { formatFounderLocalDateDisplay } from "@/lib/founder/briefs/founderLocalDate";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => createElement("a", { href }, children),
}));

vi.mock("@/lib/founder/dailyWorkflow", () => ({
  composeFounderDailyWorkflow: () => ({
    greeting: "Good morning, Shari.",
    office: {
      workspaceSuggestion: {
        id: "ws",
        title: "Mission Workspace",
        reason: "Focus",
        href: "/companion/founder",
      },
      thinkingSpace: {
        id: "ts",
        title: "Quiet desk",
        reason: "Think",
        label: "Quiet desk",
        href: "/companion/founder",
      },
      agenda: { items: [], priorities: [], watchItems: [], opportunities: [], recommendations: [] },
      reminders: { items: [] },
      drawer: [],
    },
  }),
}));

vi.mock("./missions/MissionWorkspaceShell", () => ({
  MissionWorkspaceShell: () => createElement("div", { "data-testid": "mission-shell" }),
}));
vi.mock("./flame/FlameMentorPresence", () => ({
  FlameMentorPresence: () => createElement("div", { "data-testid": "flame" }),
}));
vi.mock("./concierge/ConciergeWorkspaceSuggestion", () => ({
  ConciergeWorkspaceSuggestion: () =>
    createElement("div", { "data-testid": "concierge-ws" }),
}));
vi.mock("./concierge/ConciergeThinkingSpace", () => ({
  ConciergeThinkingSpace: () =>
    createElement("div", { "data-testid": "concierge-think" }),
}));
vi.mock("./concierge/ConciergeAgenda", () => ({
  ConciergeAgenda: () => createElement("div", { "data-testid": "agenda" }),
}));
vi.mock("./concierge/ConciergeReminders", () => ({
  ConciergeReminders: () => createElement("div", { "data-testid": "reminders" }),
}));
vi.mock("./FounderWorkspaceCards", () => ({
  FounderWorkspaceCards: () =>
    createElement("div", { "data-testid": "workspace-cards" }),
}));

describe("FounderHome — daily FIRE report slice", () => {
  beforeEach(() => {
    clearFirePortfolioStorageForTests();
  });

  it("shows today’s dated FIRE brief as the dominant home surface", async () => {
    const { FounderHome } = await import("./FounderHome");
    const html = renderToStaticMarkup(createElement(FounderHome));
    const todayDisplay = formatFounderLocalDateDisplay(new Date());

    expect(html).toContain("Executive Office");
    expect(html).toContain("Today’s Executive Intelligence Brief");
    expect(html).toContain("Spark Estate Executive Intelligence Brief");
    expect(html).toContain(todayDisplay);
    expect(html).toContain('data-testid="fire-executive-brief"');
    expect(html).toContain('data-testid="founder-home-secondary"');
    expect(html).toContain('data-testid="mission-shell"');
    expect(html).toContain('data-testid="workspace-cards"');
    expect(html).toMatch(
      /Prepared from the intelligence currently available in your Founder Workspace/i,
    );
  });
});
