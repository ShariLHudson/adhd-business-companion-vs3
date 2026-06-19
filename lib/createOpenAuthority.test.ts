import { describe, expect, it } from "vitest";
import {
  artifactLockUserMessage,
  buildCreateConsentOffer,
  createOpenBypassesConsent,
  createReceiptMessage,
  draftSwitchUserMessage,
  evaluateCreateOpen,
  shouldSilentlyOpenCreate,
  toPendingCreatePayload,
  type CreateOpenContext,
  type CreateOpenRequest,
} from "./createOpenAuthority";
import { CREATE_OPEN_ENTRY_AUDIT } from "./createOpenAudit";

const baseCtx: CreateOpenContext = {
  createPanelOpen: false,
  lockedType: null,
  currentDraftType: null,
  currentDraftContent: "",
  storedSessionType: null,
  userText: "",
  lastAssistantText: "",
};

const baseReq: CreateOpenRequest = {
  source: "ensure_live_create",
  section: "content-generator",
  input: {
    itemType: "Facebook Post",
    title: "New Facebook Post",
    brief: "",
    stage: "editing draft",
    source: "generated",
  },
};

describe("createOpenAuthority", () => {
  it("Facebook post ideas does not silently open Create", () => {
    const text = "I need Facebook post ideas";
    expect(shouldSilentlyOpenCreate(text)).toBe(false);
    const decision = evaluateCreateOpen(
      { ...baseReq, userText: text },
      { ...baseCtx, userText: text },
    );
    expect(decision.action).toBe("offer");
    expect(buildCreateConsentOffer(text)).toMatch(/open Create/i);
  });

  it("newsletter help offers Create before opening", () => {
    const text = "I need help writing a newsletter";
    const decision = evaluateCreateOpen(
      {
        ...baseReq,
        source: "chat",
        input: { ...baseReq.input, itemType: "Newsletter" },
        userText: text,
      },
      { ...baseCtx, userText: text },
    );
    expect(decision.action).toBe("offer");
    if (decision.action === "offer") {
      expect(decision.message).toMatch(/draft|Create/i);
      expect(decision.pending.section).toBe("content-generator");
    }
  });

  it('explicit "open create" bypasses consent', () => {
    const text = "open create";
    expect(
      createOpenBypassesConsent(
        { ...baseReq, userText: text },
        { ...baseCtx, userText: text },
      ),
    ).toBe(true);
    const decision = evaluateCreateOpen(
      { ...baseReq, userText: text },
      { ...baseCtx, userText: text },
    );
    expect(decision.action).toBe("open");
  });

  it("draft creation produces a receipt message", () => {
    expect(createReceiptMessage("draft_created")).toBe(
      "I started a draft beside us.",
    );
    const decision = evaluateCreateOpen(
      {
        ...baseReq,
        source: "handoff",
        userText: "open create and draft it",
        consentGranted: true,
      },
      { ...baseCtx, userText: "open create and draft it" },
    );
    expect(decision.action).toBe("open");
    if (decision.action === "open") {
      expect(decision.receipt).toBe("draft_created");
    }
  });

  it("draft update produces a receipt message", () => {
    expect(createReceiptMessage("draft_updated")).toBe("I updated your draft.");
    const decision = evaluateCreateOpen(
      {
        ...baseReq,
        source: "artifact",
        userInitiated: true,
        input: {
          ...baseReq.input,
          draftContent: "Hello world",
        },
      },
      {
        ...baseCtx,
        createPanelOpen: true,
        currentDraftType: "Newsletter",
        currentDraftContent: "Old",
      },
    );
    expect(decision.action).toBe("sync_draft");
    if (decision.action === "sync_draft") {
      expect(decision.receipt).toBe("draft_updated");
    }
  });

  it("artifact lock produces user-visible feedback", () => {
    const msg = artifactLockUserMessage("Newsletter", "Email");
    expect(msg).toMatch(/newsletter/i);
    expect(msg).toMatch(/draft type|finish or switch/i);
    const decision = evaluateCreateOpen(
      {
        ...baseReq,
        source: "chat",
        input: { ...baseReq.input, itemType: "Email" },
      },
      {
        ...baseCtx,
        createPanelOpen: true,
        lockedType: "Newsletter",
        currentDraftType: "Newsletter",
        currentDraftContent: "Draft text",
      },
    );
    expect(decision.action).toBe("artifact_lock");
  });

  it("draft switch requires acknowledgement", () => {
    const msg = draftSwitchUserMessage("LinkedIn Post", "Newsletter");
    expect(msg).toMatch(/LinkedIn Post/i);
    const decision = evaluateCreateOpen(
      {
        ...baseReq,
        source: "chat",
        input: { ...baseReq.input, itemType: "Newsletter" },
        userText: "help me with a newsletter",
      },
      {
        ...baseCtx,
        createPanelOpen: false,
        currentDraftType: "LinkedIn Post",
        currentDraftContent: "Existing draft",
        userText: "help me with a newsletter",
      },
    );
    expect(decision.action).toBe("draft_switch");
    if (decision.action === "draft_switch") {
      expect(decision.pending).toEqual(
        toPendingCreatePayload({
          ...baseReq,
          source: "chat",
          input: { ...baseReq.input, itemType: "Newsletter" },
          userText: "help me with a newsletter",
        }),
      );
    }
  });

  it("silent Create opens are eliminated in authority layer", () => {
    const brainstorm = "I need Facebook post ideas";
    expect(shouldSilentlyOpenCreate(brainstorm)).toBe(false);
    expect(
      evaluateCreateOpen(
        { ...baseReq, userText: brainstorm },
        { ...baseCtx, userText: brainstorm },
      ).action,
    ).toBe("offer");
  });

  it("audit inventory lists all entry points through requestCreateOpen", () => {
    expect(CREATE_OPEN_ENTRY_AUDIT.length).toBeGreaterThanOrEqual(10);
    expect(
      CREATE_OPEN_ENTRY_AUDIT.every((row) =>
        row.currentPath.includes("requestCreateOpen"),
      ),
    ).toBe(true);
  });
});
