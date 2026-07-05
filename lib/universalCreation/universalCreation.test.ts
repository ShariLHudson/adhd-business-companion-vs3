import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectUniversalDocumentType,
  shouldEnterUniversalCreation,
  startUniversalCreationTurn,
  advanceUniversalCreation,
  clearUniversalCreationSession,
  formatReviewMenu,
  parseReviewChoice,
  pluginById,
  advanceGuidedCreationFlow,
  UNIVERSAL_DOCUMENT_PLUGINS,
  getDocumentCreationProfile,
  formatUniversalCreationTurnReply,
  saveUniversalCreationSession,
  resolveUniversalCreationTurn,
} from "./index";
import { harvestDiscoveryFromConversation } from "./discoveryContextHarvest";
import { isCreateTerminalDecision } from "@/lib/conversation/createTerminalOwner";
import { evaluateSparkDecisionEngine } from "@/lib/sparkCompanion";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { shouldResolveEarlyLocalSupportTurn } from "@/lib/conversation/earlyLocalSupportTurn";
import { shouldUseEmotionalFirstSequence } from "@/lib/conversation/emotionalFirstResponseSequence";
import { isDifficultClientCallRequest } from "@/lib/conversation/shariCompanionEngine";
import {
  shouldContinueActiveCreateSession,
  shouldExitActiveCreateSession,
} from "@/lib/conversation/createSessionExit";

describe("Universal Creation Framework", () => {
  beforeEach(() => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => mem.set(k, v),
      removeItem: (k: string) => mem.delete(k),
      clear: () => mem.clear(),
    };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
    clearUniversalCreationSession();
  });

  it("detects document types from natural language", () => {
    expect(detectUniversalDocumentType("help me write an email")).toBe("email");
    expect(detectUniversalDocumentType("Help me create an SOP")).toBe("sop");
    expect(detectUniversalDocumentType("draft a newsletter")).toBe("newsletter");
    expect(detectUniversalDocumentType("write a blog post")).toBe("blog");
  });

  it("enters universal creation instead of immediate open for SOP", () => {
    expect(shouldEnterUniversalCreation("Help me create an SOP")).toBe(true);
    const turn = startUniversalCreationTurn("Help me create an SOP", 1);
    expect(turn?.kind).toBe("question");
    expect(turn && "question" in turn && turn.question).toMatch(
      /own business|client/i,
    );
  });

  it("enters universal creation for email", () => {
    expect(shouldEnterUniversalCreation("help me write an email")).toBe(true);
    const turn = startUniversalCreationTurn("help me write an email", 1);
    expect(turn?.kind).toBe("question");
  });

  it("completes SOP discovery and prepares before Create", () => {
    let session = startUniversalCreationTurn("Help me create an SOP", 1)!.session;
    const answers = [
      "For my own business",
      "Starting from scratch",
      "My VA team will use it",
      "Client onboarding",
      "Each time a new client starts",
      "They skip the welcome email step",
    ];
    let result = null;
    for (const answer of answers) {
      result = advanceUniversalCreation(session, answer);
      if (result?.kind === "ready") break;
      if (result?.kind === "question") session = result.session;
    }
    expect(result?.kind).toBe("ready");
    expect(result?.preparationLine).toMatch(/SOP|checklist/i);
    expect(result?.guidedCreationHint).toMatch(/Guided Creation/i);
  });

  it("handles uncertainty without stopping the flow", () => {
    const start = startUniversalCreationTurn("help me write an email", 1)!;
    const uncertain = advanceUniversalCreation(
      start.session,
      "I'm not sure who it's for",
    );
    expect(uncertain?.kind).toBe("uncertainty");
    expect(uncertain?.message).toMatch(/recommend|examples|teach/i);
  });

  it("registers enhancements per document plugin", () => {
    const sop = pluginById("sop");
    expect(sop?.enhancements.map((e) => e.id)).toContain("checklist");
    const newsletter = pluginById("newsletter");
    expect(newsletter?.enhancements.map((e) => e.id)).toContain("social-posts");
  });

  it("newsletter discovery asks through full question set before ready", () => {
    let session = startUniversalCreationTurn("help me create a newsletter", 1)!;
    expect(session.kind).toBe("question");

    const answers = [
      "to let people know about my new adhd app",
      "business people who have adhd",
      "that their brain is not broken — there is a better way to work",
      "my new adhd app that helps them run their business",
      "more like a friend checking in",
      "try the app and reply with what would help most",
      "skip",
      "they feel hopeful and take one small step",
    ];

    let result: ReturnType<typeof advanceUniversalCreation> = null;
    for (const answer of answers) {
      if (session.kind !== "question") break;
      result = advanceUniversalCreation(session.session, answer);
      if (result?.kind === "ready") break;
      if (result?.kind === "question") session = result;
    }

    expect(result?.kind).toBe("ready");
    expect(result?.message).toMatch(/start the draft now/i);
    expect(result?.message).not.toMatch(/discovery is complete/i);
  });

  it("newsletter guided flow drafts, revises, then offers completion", () => {
    let session = startUniversalCreationTurn("help me create a newsletter", 1)!;
    const answers = [
      "announce my adhd app",
      "adhd entrepreneurs",
      "they can grow without fighting their brain",
      "Spark — my adhd companion app",
      "warm friend tone",
      "visit the site",
      "skip",
      "one person replies saying it helped",
    ];
    let ready = null;
    for (const answer of answers) {
      const next = advanceUniversalCreation(session.session, answer);
      if (next?.kind === "ready") {
        ready = next;
        break;
      }
      if (next?.kind === "question") session = next;
    }
    expect(ready?.kind).toBe("ready");

    const draftTurn = advanceGuidedCreationFlow(
      ready!.session,
      "yes",
      ready!.message,
    );
    expect(draftTurn?.kind).toBe("draft");
    expect(draftTurn?.draftBody).toMatch(/Subject line options/i);

    const reviseTurn = advanceGuidedCreationFlow(
      draftTurn!.session,
      "make the opening shorter",
      `${draftTurn!.message}\n\n${draftTurn!.draftBody}`,
    );
    expect(reviseTurn?.kind).toBe("draft");

    const approveTurn = advanceGuidedCreationFlow(
      reviseTurn!.session,
      "looks good",
      reviseTurn!.message,
    );
    expect(approveTurn?.message).toMatch(/feel ready/i);

    const completeTurn = advanceGuidedCreationFlow(
      { ...reviseTurn!.session, phase: "approval" },
      "1",
      approveTurn!.message,
    );
    expect(completeTurn?.message).toMatch(/Google Docs/i);
  });

  it("provides review phase menu", () => {
    expect(formatReviewMenu()).toMatch(/draft ready/i);
    expect(parseReviewChoice("2")).toBe("section_by_section");
  });

  it("detects sales funnel and website types", () => {
    expect(detectUniversalDocumentType("help me build a sales funnel")).toBe(
      "sales_funnel",
    );
    expect(detectUniversalDocumentType("write homepage copy for my site")).toBe(
      "website",
    );
  });

  it("email and newsletter use different discovery questions", () => {
    const email = startUniversalCreationTurn("help me write an email", 1);
    const newsletter = startUniversalCreationTurn(
      "help me create a newsletter",
      1,
    );
    expect(email && "question" in email && email.question).toMatch(
      /receiving this email/i,
    );
    expect(
      newsletter && "question" in newsletter && newsletter.question,
    ).not.toMatch(/receiving this email/i);
    expect(
      getDocumentCreationProfile("email").discoveryQuestions.length,
    ).toBeGreaterThanOrEqual(4);
    expect(
      getDocumentCreationProfile("newsletter").discoveryQuestions.length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("every document plugin pulls type-specific discovery from profiles", () => {
    for (const plugin of UNIVERSAL_DOCUMENT_PLUGINS) {
      const profile = getDocumentCreationProfile(plugin.id);
      expect(plugin.discoveryQuestions.length).toBeGreaterThanOrEqual(4);
      expect(plugin.discoveryQuestions).toEqual(profile.discoveryQuestions);
      expect(profile.essence.length).toBeGreaterThan(10);
      expect(profile.draftSections.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("formatUniversalCreationTurnReply includes draft body in chat", () => {
    let session = startUniversalCreationTurn("help me create a newsletter", 1)!;
    const answers = [
      "announce my adhd app",
      "adhd entrepreneurs",
      "they can grow without fighting their brain",
      "Spark — my adhd companion app",
      "warm friend tone",
      "visit the site",
      "skip",
      "one person replies saying it helped",
    ];
    let ready = null;
    for (const answer of answers) {
      const next = advanceUniversalCreation(session.session, answer);
      if (next?.kind === "ready") {
        ready = next;
        break;
      }
      if (next?.kind === "question") session = next;
    }
    expect(ready?.kind).toBe("ready");
    saveUniversalCreationSession(ready!.session);

    const draftTurn = advanceGuidedCreationFlow(
      ready!.session,
      "yes",
      ready!.message,
    );
    expect(draftTurn?.kind).toBe("draft");
    const reply = formatUniversalCreationTurnReply(draftTurn!);
    expect(reply).toMatch(/Subject line options/i);
    expect(reply).toMatch(/Here's a first draft/i);
    expect(reply.length).toBeGreaterThan(200);
  });

  it("re-shows draft when member asks where it is", () => {
    const session = {
      documentType: "newsletter" as const,
      phase: "review" as const,
      confidence: { score: 100, what: true, why: true, who: true, success: true },
      answers: {
        "newsletter-why": "introduce my adhd app",
        "newsletter-who": "adhd business owners",
      },
      questionIndex: 8,
      originalUserText: "help me write a newsletter",
      startedAtTurn: 1,
      preparationReady: true,
      pendingEnhancements: [],
      draftContent: "**Subject line options**\n\n1. A note for you",
    };
    const reshow = advanceGuidedCreationFlow(
      session,
      "where is the draft",
      "Here's a first draft — take your time with it.",
    );
    expect(reshow?.kind).toBe("draft");
    expect(reshow?.draftBody).toMatch(/Subject line options/i);
  });

  it("frictionless universal creation includes draft body on yes", () => {
    let session = startUniversalCreationTurn("help me create a newsletter", 1)!;
    const answers = [
      "introduce my adhd app",
      "adhd business owners",
      "app adapts to them",
      "7 day free trial",
      "friendly",
      "sign up for trial",
      "skip",
      "curiosity and trial signups",
    ];
    let ready = null;
    for (const answer of answers) {
      const next = advanceUniversalCreation(session.session, answer);
      if (next?.kind === "ready") {
        ready = next;
        break;
      }
      if (next?.kind === "question") session = next;
    }
    saveUniversalCreationSession(ready!.session);

    const frictionless = resolveFrictionlessAction({
      userText: "yes",
      currentTurn: 2,
      lastAssistantText: ready!.message,
    });
    expect(frictionless.localReply).toMatch(/Subject line options/i);
    expect(frictionless.localReply).not.toBe(
      "Here's a first draft — take your time with it.",
    );
  });

  it("create terminal owns yes after draft permission", () => {
    const engine = evaluateSparkDecisionEngine({ userText: "yes" });
    const readyMsg =
      "Good — I have a clear picture of who this is for and what it needs to do.\n\nWant me to start the draft now?";
    expect(
      isCreateTerminalDecision(engine, {
        userText: "yes",
        lastAssistantText: readyMsg,
      }),
    ).toBe(true);
  });

  it("routes difficult client email to create — not call coaching", () => {
    const text = "I need to write an email to a difficult client";
    expect(isDifficultClientCallRequest(text)).toBe(false);
    expect(shouldUseEmotionalFirstSequence(text)).toBe(false);
    expect(
      shouldResolveEarlyLocalSupportTurn(text, {
        type: "EMOTIONAL_SUPPORT",
        confidence: "medium",
        owner: "frictionless:support",
        reason: "test",
        blockKernelNavigation: true,
        blockBridgeResponder: true,
        blockCollectionOffer: true,
        blockSecondaryResponders: false,
      }),
    ).toBe(false);
    expect(detectUniversalDocumentType(text)).toBe("email");
  });

  it("harvests prior conversation and skips only answered email questions", () => {
    const context = [
      "I need to write an email to a difficult client",
      "rough at the moment",
      "that she needs to follow through on agreed items or i can no longer keep her as a client",
      "she already knows what she agreed to",
    ];
    const harvested = harvestDiscoveryFromConversation("email", context);
    expect(harvested["email-recipient"]).toMatch(/client/i);
    expect(harvested["email-purpose"]).toMatch(/follow through/i);
    expect(harvested["email-context"]).toMatch(/already knows/i);

    const turn = startUniversalCreationTurn(
      "I need to write an email to a difficult client",
      1,
      context,
    );
    expect(turn?.kind).toBe("question");
    expect(turn && "question" in turn && turn.question).toMatch(
      /good response/i,
    );
    expect(turn && "question" in turn && turn.question).not.toMatch(
      /Who is receiving|relationship with them|one sentence|already know/i,
    );
  });

  it("asks first email profile question when nothing is harvested yet", () => {
    const turn = startUniversalCreationTurn("help me write an email", 1);
    expect(turn?.kind).toBe("question");
    expect(turn && "question" in turn && turn.question).toMatch(
      /receiving this email/i,
    );
  });

  it("uses Conversation Style from Settings for email tone — not a discovery question", () => {
    const profile = getDocumentCreationProfile("email");
    expect(profile.discoveryQuestions.some((q) => q.id === "email-tone")).toBe(
      false,
    );
    expect(profile.discoveryQuestions.length).toBeGreaterThanOrEqual(5);
    const turn = startUniversalCreationTurn("help me write an email", 1);
    expect(turn?.session.answers["email-tone"]).toMatch(/balanced|clear/i);
  });

  it("completes email discovery when success answer mentions conflict", () => {
    let session = startUniversalCreationTurn("help me write an email", 1)!.session;
    const steps = [
      "Sue my client",
      "could be better — she is not following through and I may not keep her as a client",
      "she knows all the things we agreed on",
      "i don't want to be mean as i don't like conflict but she is wasting my time",
    ];
    let result = null;
    for (const answer of steps) {
      result = advanceUniversalCreation(session, answer);
      if (result?.kind === "ready") break;
      if (result?.kind === "question") session = result.session;
    }
    expect(result?.kind).toBe("ready");
    expect(result?.message).toMatch(/start the draft|write it now/i);
    expect(result?.session.answers["email-success"]).toMatch(/conflict|mean/i);
  });

  it("does not route email discovery answers to emotional support", () => {
    const last = "What would a good response look like?";
    const answer =
      "i don't want to be mean as i don't like conflict but she is wasting my time";
    expect(shouldExitActiveCreateSession(answer, last)).toBe(false);
    expect(shouldContinueActiveCreateSession(answer, last)).toBe(true);
    expect(
      shouldResolveEarlyLocalSupportTurn(answer, {
        type: "EMOTIONAL_SUPPORT",
        confidence: "medium",
        owner: "frictionless:support",
        reason: "test",
        blockKernelNavigation: true,
        blockBridgeResponder: true,
        blockCollectionOffer: true,
        blockSecondaryResponders: false,
      }, last),
    ).toBe(false);
  });

  it("repairs email correction after mistaken call coaching", () => {
    const context = [
      "I need to write an email to a difficult client",
      "that she needs to follow through on agreed items or i can no longer keep her as a client",
    ];
    const turn = resolveUniversalCreationTurn(
      "I didn't say a call I said an email",
      3,
      "I can see why you'd want to avoid this call.",
      context,
    );
    expect(turn?.kind).toBe("question");
    expect(turn && "intro" in turn && turn.intro).toMatch(/email, not a call/i);
  });
});
