import { describe, expect, it } from "vitest";
import {
  buildContextualResearchRequest,
  buildResearchOutcome,
  continueResearchConversation,
  extractIntendedOutcome,
  inferResearchMode,
  inferResearchUseOptions,
  organizedCollectionView,
  shouldAskAboutFormat,
  startResearchConversation,
  validateResearchOutcome,
} from "./index";
import { getLiveResearchProviderStatus } from "@/lib/universalRequestOutcome";

describe("Research Library — conversational research", () => {
  it("A: open research chat begins without forced format", () => {
    const result = startResearchConversation({
      text: "I want to understand advisory boards.",
    });
    expect(result.session.researchMode).toBe("open_exploration");
    expect(result.session.intendedOutcome).toBeNull();
    expect(result.autoOutcome).toBeNull();
    expect(result.offerUseThisResearch).toBe(false);
    expect(result.assistantMessage.toLowerCase()).toContain("advisory board");
    expect(result.assistantMessage).not.toMatch(
      /choose report|map, project, or strategy/i,
    );
    expect(result.collection.findings.length).toBeGreaterThanOrEqual(3);
    expect(result.collection.currentResearchStatus).toBe(
      getLiveResearchProviderStatus().liveResearchAvailable
        ? "current_research_in_progress"
        : "stable_knowledge_used",
    );
  });

  it("B: research with explicit result continues automatically", () => {
    const result = startResearchConversation({
      text: "Research advisory boards and create a plan for building one for my business.",
    });
    expect(result.session.researchMode).toBe("research_with_outcome");
    expect(result.session.intendedOutcome).toBeTruthy();
    expect(result.autoOutcome).toBeTruthy();
    expect(result.autoOutcome?.researchCollectionId).toBe(
      result.collection.id,
    );
    expect(result.assistantMessage).not.toMatch(/what would you like to do with this research/i);
  });

  it("C: Use This Research offers context-aware advisory choices", () => {
    const started = startResearchConversation({
      text: "I want to understand advisory boards.",
    });
    const options = inferResearchUseOptions({
      collection: started.collection,
      session: started.session,
    });
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options.length).toBeLessThanOrEqual(5);
    const labels = options.map((o) => o.label).join(" | ");
    expect(labels).toMatch(/Advisory Board Plan/i);
    expect(labels).toMatch(/Strategic Planning|Visually|Invitation|Role/i);
    expect(labels).not.toMatch(/Five-Day Content Plan/i);
  });

  it("D: prioritized list is organized, not a raw dump", () => {
    const started = startResearchConversation({
      text: "Research podcasting.",
    });
    const option = inferResearchUseOptions({
      collection: started.collection,
    }).find((o) => o.outcomeType === "list") || {
      id: "generic_list",
      label: "Make a Prioritized List",
      description: "",
      outcomeType: "list",
      destination: "create" as const,
      reason: "",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    };
    const artifact = buildResearchOutcome({
      collection: started.collection,
      option,
      freeformRequest: "Turn this into a prioritized list of what I should do first.",
    });
    expect(artifact.kind).toBe("list");
    expect(artifact.sections.length).toBeGreaterThanOrEqual(2);
    expect(validateResearchOutcome(artifact).passed).toBe(true);
  });

  it("E/F: document and form outcomes are substantive", () => {
    const started = startResearchConversation({
      text: "I want to understand advisory boards.",
    });
    const doc = buildResearchOutcome({
      collection: started.collection,
      option: {
        id: "doc",
        label: "Create a document I can give my team",
        description: "",
        outcomeType: "document",
        destination: "create",
        reason: "",
        confidence: 0.8,
        primary: true,
        requiresClarification: false,
      },
      freeformRequest: "Create a document I can give my team.",
    });
    expect(doc.sections.length).toBeGreaterThanOrEqual(2);

    const form = buildResearchOutcome({
      collection: started.collection,
      option: {
        id: "form",
        label: "Create a form",
        description: "",
        outcomeType: "form",
        destination: "create",
        reason: "",
        confidence: 0.8,
        primary: false,
        requiresClarification: false,
      },
      freeformRequest: "Create a form we can use to evaluate potential advisors.",
    });
    expect(form.kind).toBe("form");
    expect(form.sections.some((s) => /field|rating|select/i.test(s.body))).toBe(
      true,
    );
    expect(validateResearchOutcome(form).passed).toBe(true);
  });

  it("G: visual handoff carries substantive collection payload", () => {
    const started = startResearchConversation({
      text: "I want to understand advisory boards.",
    });
    const visual = buildResearchOutcome({
      collection: started.collection,
      option: {
        id: "advisory_visual",
        label: "Show the Advisory Structure Visually",
        description: "",
        outcomeType: "visual_map",
        destination: "visual_thinking",
        reason: "",
        confidence: 0.8,
        primary: false,
        requiresClarification: false,
      },
    });
    expect(visual.destinationHint).toBe("visual_thinking");
    const payload = JSON.parse(visual.content) as {
      findings: unknown[];
      researchCollectionId: string;
    };
    expect(payload.researchCollectionId).toBe(started.collection.id);
    expect(payload.findings.length).toBeGreaterThan(0);
  });

  it("H/I: strategy and project proposals require review", () => {
    const started = startResearchConversation({
      text: "I want to understand advisory boards.",
    });
    const strategy = buildResearchOutcome({
      collection: started.collection,
      option: {
        id: "strategy",
        label: "Create a strategy",
        description: "",
        outcomeType: "strategy",
        destination: "strategic_planning",
        reason: "",
        confidence: 0.8,
        primary: false,
        requiresClarification: false,
      },
    });
    expect(strategy.kind).toBe("strategy_proposal");
    expect(strategy.content).toMatch(/not approved|proposed/i);

    const project = buildResearchOutcome({
      collection: started.collection,
      option: {
        id: "project",
        label: "Turn this into a project",
        description: "",
        outcomeType: "project",
        destination: "projects",
        reason: "",
        confidence: 0.8,
        primary: false,
        requiresClarification: false,
      },
    });
    expect(project.kind).toBe("project_proposal");
    expect(project.content).toMatch(/Proposal Review|approve/i);
  });

  it("J: research-only follow-ups never force a format", () => {
    let turn = startResearchConversation({
      text: "I want to understand advisory boards.",
    });
    for (let i = 0; i < 5; i += 1) {
      turn = continueResearchConversation({
        session: turn.session,
        collection: turn.collection,
        text: `Tell me more about point ${i + 1}.`,
      });
      expect(turn.assistantMessage).not.toMatch(
        /would you like a report, map, or document/i,
      );
    }
    expect(turn.collection.findings.length).toBeGreaterThanOrEqual(3);
    // Offering Use This Research after substance is allowed; forcing format menus is not.
    expect(
      shouldAskAboutFormat({
        collection: turn.collection,
        session: { ...turn.session, currentStatus: "conversing" },
        userAskedWhatNext: false,
      }),
    ).toBe(false);
  });

  it("K: five-day social plan preserves qualifier via explicit outcome", () => {
    const result = startResearchConversation({
      text: "Research current webinar-promotion ideas and create a five-day social media content plan.",
    });
    expect(extractIntendedOutcome(result.session.currentQuestion)).toBeTruthy();
    expect(result.autoOutcome).toBeTruthy();
    expect(
      `${result.autoOutcome?.title} ${result.autoOutcome?.content}`.toLowerCase(),
    ).toMatch(/day|plan|content|webinar|social/);
  });

  it("L: step-by-step podcast guide path", () => {
    const result = startResearchConversation({
      text: "Research podcasting and show me step by step how to launch a podcast.",
    });
    expect(result.session.intendedOutcome).toBeTruthy();
    expect(result.autoOutcome).toBeTruthy();
    expect(result.collection.id).toBe(
      result.autoOutcome?.researchCollectionId,
    );
  });

  it("infers modes and contextual Research This", () => {
    expect(
      inferResearchMode({
        text: "compare hosting options",
        intendedOutcome: null,
      }),
    ).toBe("comparison");
    const ctx = buildContextualResearchRequest({
      sourceExperience: "projects",
      selectedText: "customer onboarding checklist",
      surroundingContext: "Q2 launch project",
    });
    expect(ctx.researchTopic.toLowerCase()).toContain("onboarding");
    expect(ctx.sourceExperience).toBe("projects");
  });

  it("organized collection view exposes progressive sections", () => {
    const started = startResearchConversation({
      text: "Help me understand Medicare.",
    });
    const view = organizedCollectionView(started.collection);
    expect(view.whatIAsked).toBeTruthy();
    expect(view.sources.length).toBeGreaterThan(0);
    expect(view.importantFindings.length).toBeGreaterThan(0);
  });

  it("marks live research unavailable honestly when provider is off", () => {
    const live = getLiveResearchProviderStatus();
    expect(live.liveResearchAvailable).toBe(false);
    const result = startResearchConversation({
      text: "Research current webinar promotion practices.",
    });
    expect(result.session.currentResearchStatus).toBe("stable_knowledge_used");
    expect(result.currentResearchNotice).toMatch(/stable|current research/i);
  });
});
