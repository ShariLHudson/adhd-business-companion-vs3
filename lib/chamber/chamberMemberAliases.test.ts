/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  resolveChamberMemberFromText,
  isChamberMemberRequest,
} from "./chamberMemberAliases";
import { detectChamberMemberCommand } from "@/lib/estateIntelligence/estateCommandRouter";
import { resolveEstateAction } from "@/lib/estate/decisionKernel/resolveEstateAction";
import { resetEstateRoomAwarenessForTests } from "@/lib/estate/roomAwareness";
import { beforeEach, vi } from "vitest";

function stubSession() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => mem.clear(),
  };
  vi.stubGlobal("sessionStorage", storage);
  vi.stubGlobal("window", { sessionStorage: storage, dispatchEvent: vi.fn() });
}

describe("chamberMemberAliases", () => {
  it("resolves marketing aliases", () => {
    for (const text of [
      "Take me to Marketing",
      "Show Marketing",
      "I want to talk to Marketing",
      "social media",
      "branding help",
    ]) {
      const r = resolveChamberMemberFromText(text);
      expect(r.kind).toBe("match");
      if (r.kind === "match") expect(r.match.memberId).toBe("marketing");
    }
  });

  it("resolves finance and sales aliases", () => {
    expect(resolveChamberMemberFromText("Open Finance").kind).toBe("match");
    expect(resolveChamberMemberFromText("I need help with invoicing").kind).toBe(
      "match",
    );
    const sales = resolveChamberMemberFromText("I need help with sales");
    expect(sales.kind).toBe("match");
    if (sales.kind === "match") expect(sales.match.memberId).toBe("sales");
  });

  it("resolves research and content and project management", () => {
    expect(resolveChamberMemberFromText("Research").kind).toBe("match");
    expect(resolveChamberMemberFromText("Content").kind).toBe("match");
    const pm = resolveChamberMemberFromText("Project Management");
    expect(pm.kind).toBe("match");
    if (pm.kind === "match") expect(pm.match.memberId).toBe("project-management");
  });

  it("clarifies need more clients", () => {
    const r = resolveChamberMemberFromText("I need more clients");
    expect(r.kind).toBe("ambiguous");
  });

  it("does not treat Chamber of Momentum alone as a member", () => {
    expect(resolveChamberMemberFromText("Take me to the Chamber of Momentum").kind).toBe(
      "none",
    );
  });

  it("detectChamberMemberCommand attaches chamberMemberId", () => {
    const cmd = detectChamberMemberCommand("Take me to Marketing");
    expect(cmd?.section).toBe("chamber-of-momentum");
    expect(cmd?.workspaceOffer.chamberMemberId).toBe("marketing");
    expect(cmd?.executeImmediately).toBe(true);
  });

  it("isChamberMemberRequest recognizes talk-to phrasing", () => {
    expect(isChamberMemberRequest("Let's ask Finance")).toBe(true);
    expect(isChamberMemberRequest("Take me to the Conservatory")).toBe(false);
  });
});

describe("resolveEstateAction chamber members", () => {
  beforeEach(() => {
    stubSession();
    resetEstateRoomAwarenessForTests();
  });

  it("navigates to Marketing member", () => {
    const result = resolveEstateAction({
      userText: "Take me to Marketing",
    });
    expect(result.action).toBe("NAVIGATE");
    if (result.action === "NAVIGATE" && result.target.kind === "place") {
      expect(result.target.command.workspaceOffer.chamberMemberId).toBe(
        "marketing",
      );
    }
  });

  it("navigates Chamber of Momentum without a member", () => {
    const result = resolveEstateAction({
      userText: "Take me to the Chamber of Momentum",
    });
    expect(result.action).toBe("NAVIGATE");
    if (result.action === "NAVIGATE" && result.target.kind === "place") {
      expect(result.target.command.section).toBe("chamber-of-momentum");
      expect(result.target.command.workspaceOffer.chamberMemberId).toBeUndefined();
    }
  });
});
