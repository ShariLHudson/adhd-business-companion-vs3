/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  resolveChamberMemberFromText,
  isChamberMemberRequest,
} from "./chamberMemberAliases";
import { mayNavigateToChamberMember } from "@/lib/conversationStabilization/chamberNavigateGate";
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

  it("resolves Execution Manager to Momentum Intelligence", () => {
    const r = resolveChamberMemberFromText("Talk to the Execution Manager");
    expect(r.kind).toBe("match");
    if (r.kind === "match") expect(r.match.memberId).toBe("momentum");
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

describe("chamberMemberAliases — HR / hiring routes to People & Culture", () => {
  // People & Culture is the authoritative HR / hiring / recruiting / candidate /
  // onboarding / team-fit member. These requests must resolve there instead of
  // falling through to generic Estate navigation.
  const directMatchToPeopleCulture = [
    // Required test phrases (alias-shaped)
    "HR Chamber member",
    "human resources",
    "candidate selection",
    "applicant hiring decision",
    "interviewing help",
    "onboarding",
    // Required natural-language requests
    "I need to speak to the HR Chamber member",
    "Take me to the human resources member",
    "Help me choose between two candidates",
    "Which applicant should I hire?",
    "I need help interviewing a candidate",
    "I need advice about onboarding someone",
  ];

  for (const text of directMatchToPeopleCulture) {
    it(`resolves "${text}" → people-culture`, () => {
      const r = resolveChamberMemberFromText(text);
      expect(r.kind).toBe("match");
      if (r.kind === "match") expect(r.match.memberId).toBe("people-culture");
    });
  }

  it("keeps the existing team-culture alias on People & Culture", () => {
    const r = resolveChamberMemberFromText("team culture");
    expect(r.kind).toBe("match");
    if (r.kind === "match") expect(r.match.memberId).toBe("people-culture");
  });

  it("resolves an explicit HR request as a navigable member request", () => {
    expect(isChamberMemberRequest("Take me to the human resources member")).toBe(
      true,
    );
    const gate = mayNavigateToChamberMember({
      userText: "Take me to the human resources member",
    });
    expect(gate.allow).toBe(true);
    if (gate.allow) expect(gate.memberId).toBe("people-culture");
  });

  it("keeps hiring-for-marketing ambiguous between People & Culture and Marketing", () => {
    const r = resolveChamberMemberFromText("I'm hiring someone for marketing");
    expect(r.kind).toBe("ambiguous");
    if (r.kind === "ambiguous") {
      const ids = r.options.map((o) => o.memberId);
      expect(ids).toContain("people-culture");
      expect(ids).toContain("marketing");
    }
    // Ambiguous never silently auto-navigates — it clarifies in chat.
    const gate = mayNavigateToChamberMember({
      userText: "I'm hiring someone for marketing",
    });
    expect(gate.allow).toBe(false);
  });

  // Negative guards: ordinary statements that merely contain an HR domain word
  // must NOT be over-claimed as explicit Chamber-navigation requests. Safety is
  // provided by the CB-022 gate (explicit member request or bare member name),
  // not by suppressing the alias.
  const ordinaryStatementsMustNotNavigate = [
    "I hired a great VA last year",
    "One candidate emailed me yesterday",
    "My employee is on vacation",
    "I have an interview tomorrow",
    "Talent matters in this business",
  ];

  for (const text of ordinaryStatementsMustNotNavigate) {
    it(`does not treat "${text}" as a Chamber-navigation request`, () => {
      expect(isChamberMemberRequest(text)).toBe(false);
      expect(
        mayNavigateToChamberMember({ userText: text }).allow,
      ).toBe(false);
      expect(detectChamberMemberCommand(text)).toBeNull();
    });
  }
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
