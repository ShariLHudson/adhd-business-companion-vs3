import { describe, expect, it } from "vitest";
import {
  addFindingsToCollection,
  buildContextualResearchRequest,
  buildResearchOutcome,
  createResearchCollection,
  createResearchSession,
  extractIntendedOutcome,
  inferResearchMode,
  inferResearchUseOptions,
  makeStableFinding,
  organizedCollectionView,
  shouldAskAboutFormat,
  validateResearchOutcome,
  type ResearchCollectionRecord,
  type ResearchSession,
} from "./index";
import { pickTopicPack } from "./conversation";
import { getLiveResearchProviderStatus } from "@/lib/universalRequestOutcome";
import * as RL from "./index";

/**
 * RL-4: the canned conversation engine (startResearchConversation /
 * continueResearchConversation) is gone — the Research Library runs on the
 * shared engine now. These tests exercise the STILL-LIVE Use-This-Research,
 * outcome-building, session-mode, and collection layers, seeding collections
 * exactly the way the real collection is built (createResearchSession +
 * createResearchCollection + addFindingsToCollection) — no canned engine.
 */
function seedCollection(text: string): {
  session: ResearchSession;
  collection: ResearchCollectionRecord;
} {
  const session = createResearchSession({ text });
  const pack = pickTopicPack(text);
  const findings = (pack?.findings ?? []).map((f) =>
    makeStableFinding({ title: f.title, content: f.content, kind: f.kind }),
  );
  const seeded = findings.length
    ? findings
    : [
        makeStableFinding({ title: "Overview", content: "…", kind: "theme" }),
        makeStableFinding({ title: "Key fact", content: "…", kind: "fact" }),
        makeStableFinding({
          title: "Recommendation",
          content: "…",
          kind: "recommendation",
        }),
      ];
  const collection = addFindingsToCollection(
    createResearchCollection(session),
    seeded,
  );
  return { session, collection };
}

describe("Research Library — canned conversation engine retired (RL-4)", () => {
  it("no longer exports the canned conversation engine or dead helpers", () => {
    const bag = RL as unknown as Record<string, unknown>;
    expect(bag.startResearchConversation).toBeUndefined();
    expect(bag.continueResearchConversation).toBeUndefined();
    expect(bag.queueResearchThis).toBeUndefined();
    expect(bag.touchSession).toBeUndefined();
    expect(bag.mergeResearchCollections).toBeUndefined();
    expect(bag.loadResearchLibraryStore).toBeUndefined();
    expect(bag.getResearchSessionById).toBeUndefined();
    expect(bag.appendSessionTurn).toBeUndefined();
  });
});

describe("Research Library — live Use-This-Research + outcome layer", () => {
  it("Use This Research offers context-aware advisory choices", () => {
    const { session, collection } = seedCollection(
      "I want to understand advisory boards.",
    );
    const options = inferResearchUseOptions({ collection, session });
    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options.length).toBeLessThanOrEqual(5);
    const labels = options.map((o) => o.label).join(" | ");
    expect(labels).toMatch(/Advisory Board Plan/i);
    expect(labels).not.toMatch(/Five-Day Content Plan/i);
  });

  it("prioritized list is organized, not a raw dump", () => {
    const { collection } = seedCollection("Research podcasting.");
    const option = inferResearchUseOptions({ collection }).find(
      (o) => o.outcomeType === "list",
    ) || {
      id: "generic_list",
      label: "Make a Prioritized List",
      description: "",
      outcomeType: "list" as const,
      destination: "create" as const,
      reason: "",
      confidence: 0.8,
      primary: false,
      requiresClarification: false,
    };
    const artifact = buildResearchOutcome({
      collection,
      option,
      freeformRequest: "Turn this into a prioritized list of what I should do first.",
    });
    expect(artifact.kind).toBe("list");
    expect(artifact.sections.length).toBeGreaterThanOrEqual(2);
    expect(validateResearchOutcome(artifact).passed).toBe(true);
  });

  it("document and form outcomes are substantive", () => {
    const { collection } = seedCollection("I want to understand advisory boards.");
    const doc = buildResearchOutcome({
      collection,
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
      collection,
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

  it("visual handoff carries substantive collection payload", () => {
    const { collection } = seedCollection("I want to understand advisory boards.");
    const visual = buildResearchOutcome({
      collection,
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
    expect(payload.researchCollectionId).toBe(collection.id);
    expect(payload.findings.length).toBeGreaterThan(0);
  });

  it("strategy and project proposals require review", () => {
    const { collection } = seedCollection("I want to understand advisory boards.");
    const strategy = buildResearchOutcome({
      collection,
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
      collection,
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

  it("does not force a format menu after substantive research", () => {
    const { session, collection } = seedCollection(
      "I want to understand advisory boards.",
    );
    expect(collection.findings.length).toBeGreaterThanOrEqual(3);
    expect(
      shouldAskAboutFormat({
        collection,
        session: { ...session, currentStatus: "conversing" },
        userAskedWhatNext: false,
      }),
    ).toBe(false);
  });
});

describe("Research Library — session modes + contextual Research This", () => {
  it("infers research modes", () => {
    expect(
      inferResearchMode({ text: "compare hosting options", intendedOutcome: null }),
    ).toBe("comparison");
  });

  it("preserves an explicit intended outcome from the request", () => {
    const session = createResearchSession({
      text: "Research advisory boards and create a plan for building one for my business.",
    });
    expect(session.intendedOutcome).toBeTruthy();
    expect(extractIntendedOutcome(session.currentQuestion)).toBeTruthy();
  });

  it("builds a contextual Research This request without re-explaining", () => {
    const ctx = buildContextualResearchRequest({
      sourceExperience: "projects",
      selectedText: "customer onboarding checklist",
      surroundingContext: "Q2 launch project",
    });
    expect(ctx.researchTopic.toLowerCase()).toContain("onboarding");
    expect(ctx.sourceExperience).toBe("projects");
  });

  it("organized collection view exposes progressive sections", () => {
    const { collection } = seedCollection("Help me understand Medicare.");
    const view = organizedCollectionView(collection);
    expect(view.whatIAsked).toBeTruthy();
    expect(view.importantFindings.length).toBeGreaterThan(0);
  });

  it("live research is honestly unavailable while no provider is connected", () => {
    expect(getLiveResearchProviderStatus().liveResearchAvailable).toBe(false);
  });
});
