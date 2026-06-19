import { describe, expect, it } from "vitest";
import {
  freshWorkspaceChatMessages,
  messagesForApi,
  resolveWorkspaceOpener,
  workspaceOpenerForSection,
} from "./workspaceChatPurity";

describe("workspaceChatPurity", () => {
  it("uses short openers per workspace", () => {
    expect(workspaceOpenerForSection("projects")).toMatch(/working on today/i);
    expect(workspaceOpenerForSection("content-generator")).toMatch(/create/i);
    expect(workspaceOpenerForSection("client-avatars")).toMatch(/client avatar/i);
    expect(workspaceOpenerForSection("templates-library")).toMatch(/template/i);
    expect(workspaceOpenerForSection("snippets")).toMatch(/snippet/i);
  });

  it("fresh workspace thread contains only the opener", () => {
    const opener = workspaceOpenerForSection("projects")!;
    const thread = freshWorkspaceChatMessages(opener);
    expect(thread).toHaveLength(1);
    expect(thread[0]?.role).toBe("assistant");
    expect(thread[0]?.content).toBe(opener);
  });

  it("Open Projects after Create — API payload excludes prior turns when scoped", () => {
    const createTurns = [
      { role: "user" as const, content: "Help me write a post" },
      { role: "assistant" as const, content: "Let's draft it." },
    ];
    const projectOpener = resolveWorkspaceOpener("projects");
    const scoped = freshWorkspaceChatMessages(projectOpener);

    expect(scoped.some((m) => m.content.includes("post"))).toBe(false);

    const apiPayload = messagesForApi(scoped, { section: "projects" });
    expect(apiPayload).toHaveLength(1);
    expect(apiPayload[0]?.content).toMatch(/working on today/i);
    expect(apiPayload.some((m) => m.content.includes("post"))).toBe(false);
  });

  it("Open Create after Projects — scoped thread has only Create opener", () => {
    const projectOpener = resolveWorkspaceOpener("projects");
    const afterProjects = freshWorkspaceChatMessages(projectOpener);

    const createOpener = resolveWorkspaceOpener("content-generator");
    const afterCreate = freshWorkspaceChatMessages(createOpener);

    expect(afterCreate).toHaveLength(1);
    expect(afterCreate[0]?.content).toMatch(/create/i);
    expect(
      messagesForApi(afterCreate, { section: "content-generator" }).some((m) =>
        m.content.includes("working on today"),
      ),
    ).toBe(false);
  });

  it("Open Client Avatar after Create — old Create not in scoped buffer", () => {
    const createThread = [
      { role: "assistant" as const, content: "What would you like to create?" },
      { role: "user" as const, content: "A sales page" },
    ];
    const avatarOpener = resolveWorkspaceOpener("client-avatars");
    const avatarThread = freshWorkspaceChatMessages(avatarOpener);

    expect(createThread.some((m) => m.content.includes("sales page"))).toBe(
      true,
    );
    expect(avatarThread.some((m) => m.content.includes("sales page"))).toBe(
      false,
    );
  });

  it("unscoped chat still sends user and assistant turns", () => {
    const thread = [
      { role: "assistant" as const, content: "Hi" },
      { role: "user" as const, content: "Hello" },
      { role: "system" as const, content: "ignore" },
    ];
    expect(messagesForApi(thread, null)).toEqual([
      { role: "assistant", content: "Hi" },
      { role: "user", content: "Hello" },
    ]);
  });

  it("Strategy Apply style clear thread is a single opener", () => {
    const opener = "Let's apply this strategy step by step.";
    const thread = freshWorkspaceChatMessages(opener);
    expect(messagesForApi(thread, null)).toEqual([
      { role: "assistant", content: opener },
    ]);
  });

  it("resolveWorkspaceOpener prefers custom ack over default", () => {
    expect(resolveWorkspaceOpener("projects", "You're back in VIP Offer.")).toBe(
      "You're back in VIP Offer.",
    );
  });
});
