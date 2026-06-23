import { describe, expect, it } from "vitest";
import {
  CHAT_WORKSPACE_NAV_MODEL,
  NEW_CHAT_INSTRUCTION,
  NEW_DAYS_CHAT_INSTRUCTION,
} from "./chatWorkspaceHelpContent";
import { getWorkspaceHelpContent } from "./workspaceHelpContent";
import { HOW_DO_I_HELP_ARTICLES } from "./howDoIHelpArticles";

describe("chatWorkspaceHelpContent", () => {
  it("defines New Chat and New Day's Chat instructional copy", () => {
    expect(NEW_CHAT_INSTRUCTION.label).toBe("New Chat");
    expect(NEW_DAYS_CHAT_INSTRUCTION.label).toBe("New Day's Chat");
    expect(CHAT_WORKSPACE_NAV_MODEL).toContain("Chat Workspace");
    expect(CHAT_WORKSPACE_NAV_MODEL).toContain("Clear My Mind™");
  });

  it("is reflected in How Do I chat-workspace article", () => {
    const article = HOW_DO_I_HELP_ARTICLES.find((a) => a.id === "chat-workspace");
    expect(article).toBeDefined();
    expect(article!.workflow.join(" ")).toMatch(/New Chat/);
    expect(article!.workflow.join(" ")).toMatch(/New Day's Chat/);
  });

  it("is reflected in Plan My Day workspace help", () => {
    const help = getWorkspaceHelpContent("plan-my-day");
    expect(help?.workflow.some((s) => s.includes("Chat Workspace"))).toBe(true);
    expect(help?.tips.some((s) => s.includes("New Day's Chat"))).toBe(true);
  });
});
