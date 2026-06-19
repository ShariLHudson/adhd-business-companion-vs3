import { describe, expect, it, beforeEach } from "vitest";
import {
  assembleConversationArtifact,
  buildHandoffReceipt,
  evaluateConversationHandoff,
  hasUsableConversationContext,
  isConversationAssemblyIntent,
  isExplicitBlankCreateOpen,
  tryAssembleFromConversation,
} from "./conversationArtifactAssembler";
import { blankScaffoldForType } from "./createInitialization";
import {
  clearStashedConversation,
  isReturnToConversationRequest,
  loadStashedConversation,
  stashConversationBeforeHandoff,
} from "./conversationHandoffRecovery";
import { saveCreateSession, loadCreateSession, clearCreateSession } from "./createSessionStore";

const SOP_CHAT = [
  { role: "user" as const, content: "I need an SOP for onboarding new clients" },
  { role: "assistant" as const, content: "Great — what should we call this SOP?" },
  { role: "user" as const, content: "Client Onboarding SOP" },
  { role: "assistant" as const, content: "What are the main steps?" },
  {
    role: "user" as const,
    content:
      "1. Send welcome email\n2. Schedule kickoff call\n3. Collect brand assets",
  },
  { role: "assistant" as const, content: "Any purpose or scope details?" },
  {
    role: "user" as const,
    content:
      "Purpose: standardize onboarding. Scope: all new retainer clients.",
  },
  {
    role: "assistant" as const,
    content: "Got it — I have title, steps, purpose, and scope.",
  },
];

const REPORT_CHAT = [
  { role: "user" as const, content: "I need to write a quarterly performance report" },
  { role: "assistant" as const, content: "What should the report cover?" },
  {
    role: "user" as const,
    content:
      "Summary: Q1 revenue up 12%. Background: we launched a new offer in February.",
  },
  {
    role: "user" as const,
    content:
      "Key findings: email list grew 18%, workshop attendance doubled. Recommendations: double down on workshops.",
  },
  { role: "assistant" as const, content: "Anything else for next steps?" },
  { role: "user" as const, content: "Next steps: plan Q2 workshop series and refresh lead magnet." },
];

const MARKETING_PLAN_CHAT = [
  { role: "user" as const, content: "Help me plan marketing for my coaching launch" },
  { role: "assistant" as const, content: "What's the goal?" },
  { role: "user" as const, content: "Goal: fill 10 spots in the group program" },
  { role: "assistant" as const, content: "Who is the audience?" },
  { role: "user" as const, content: "Audience: overwhelmed solo founders with ADHD" },
  { role: "assistant" as const, content: "Which channels?" },
  { role: "user" as const, content: "Channels: LinkedIn posts, email list, one live workshop" },
  { role: "user" as const, content: "Timeline: 6 weeks starting April 1" },
];

const RESEARCH_PAPER_CHAT = [
  { role: "user" as const, content: "I'm drafting a research paper on ADHD productivity tools" },
  { role: "assistant" as const, content: "What's your research question?" },
  {
    role: "user" as const,
    content:
      "Research question: Which body-doubling tools improve task completion for ADHD adults?",
  },
  {
    role: "user" as const,
    content:
      "Introduction: ADHD entrepreneurs struggle with task initiation despite high motivation.",
  },
  {
    role: "user" as const,
    content:
      "Key points: accountability partners, visual timers, and structured coworking sessions help.",
  },
];

describe("conversationArtifactAssembler", () => {
  it("1 — multi-turn SOP chat assembles populated SOP draft", () => {
    const artifact = assembleConversationArtifact({
      userCommand: "Put the SOP together for me",
      messages: [...SOP_CHAT, { role: "user", content: "Put the SOP together for me" }],
    });
    expect(artifact).not.toBeNull();
    expect(artifact!.artifactType).toBe("SOP");
    expect(artifact!.title).toContain("Client Onboarding");
    expect(artifact!.draftContent).toContain("Send welcome email");
    expect(artifact!.draftContent).toContain("standardize onboarding");
    expect(artifact!.draftContent).not.toEqual(blankScaffoldForType("SOP"));
    expect(artifact!.confidence).not.toBe("low");
  });

  it("2 — multi-turn report chat assembles report draft", () => {
    const artifact = assembleConversationArtifact({
      userCommand: "Turn this into a report",
      messages: [
        ...REPORT_CHAT,
        { role: "user", content: "Turn this into a report" },
      ],
    });
    expect(artifact?.artifactType).toBe("Report");
    expect(artifact?.draftContent).toMatch(/Q1 revenue|workshop attendance/i);
    expect(artifact?.draftContent).not.toEqual(blankScaffoldForType("Document"));
  });

  it("3 — marketing plan chat assembles marketing plan draft", () => {
    const artifact = assembleConversationArtifact({
      userCommand: "Create a marketing plan from this",
      messages: [
        ...MARKETING_PLAN_CHAT,
        { role: "user", content: "Create a marketing plan from this" },
      ],
    });
    expect(artifact?.artifactType).toBe("Marketing Plan");
    expect(artifact?.draftContent).toMatch(/fill 10 spots|LinkedIn/i);
  });

  it("4 — research paper chat assembles research paper draft", () => {
    const artifact = assembleConversationArtifact({
      userCommand: "Make this into a research paper",
      messages: [
        ...RESEARCH_PAPER_CHAT,
        { role: "user", content: "Make this into a research paper" },
      ],
    });
    expect(artifact?.artifactType).toBe("Research Paper");
    expect(artifact?.draftContent).toMatch(/body-doubling|coworking/i);
  });

  it("5 — general put this together with clear context populates draft", () => {
    const messages = [
      { role: "user" as const, content: "Let's outline a client welcome guide" },
      { role: "assistant" as const, content: "What should we call it?" },
      { role: "user" as const, content: "Client Welcome Guide" },
      { role: "assistant" as const, content: "What sections should it include?" },
      {
        role: "user" as const,
        content:
          "Overview: how we work together. Key points: response times, project rhythm, and how to get help. Next steps: book kickoff and complete onboarding form.",
      },
      { role: "user" as const, content: "Put this together for me" },
    ];
    const artifact = assembleConversationArtifact({
      userCommand: "Put this together for me",
      messages,
    });
    expect(artifact).not.toBeNull();
    expect(artifact!.draftContent.length).toBeGreaterThan(80);
    expect(artifact!.draftContent).toMatch(/response times|kickoff/i);
  });

  it("6 — vague put this together with no context asks clarifying question", () => {
    const evaluation = evaluateConversationHandoff({
      userCommand: "Put this together for me",
      messages: [{ role: "user", content: "Put this together for me" }],
    });
    expect(evaluation.action).toBe("none");
    expect(
      isConversationAssemblyIntent("Put this together for me", [
        { role: "user", content: "Put this together for me" },
      ]),
    ).toBe(false);
  });

  it("7 — conversation content exists → assembled draft is not blank scaffold", () => {
    const resolved = tryAssembleFromConversation({
      userCommand: "Build the SOP",
      messages: [
        ...SOP_CHAT,
        { role: "user", content: "Build the SOP" },
      ],
      hintType: "SOP",
    });
    expect(resolved).not.toBeNull();
    expect(resolved!.draftContent).not.toEqual(blankScaffoldForType("SOP"));
  });

  it("8 — source conversation stashed before handoff", () => {
    clearStashedConversation();
    const messages = [
      ...SOP_CHAT,
      { role: "user" as const, content: "Put the SOP together for me" },
    ];
    stashConversationBeforeHandoff(messages, { artifactType: "SOP" });
    const stash = loadStashedConversation();
    expect(stash?.messages.length).toBeGreaterThan(4);
    expect(stash?.artifactType).toBe("SOP");
    clearStashedConversation();
  });

  it("9 — return to original conversation request is detected", () => {
    expect(isReturnToConversationRequest("Return to Original Conversation")).toBe(
      true,
    );
    expect(isReturnToConversationRequest("back to our planning conversation")).toBe(
      true,
    );
  });

  it("10 — refresh after handoff preserves populated draft in create session", () => {
    clearCreateSession();
    const artifact = assembleConversationArtifact({
      userCommand: "Put the SOP together for me",
      messages: [
        ...SOP_CHAT,
        { role: "user", content: "Put the SOP together for me" },
      ],
    });
    expect(artifact).not.toBeNull();
    saveCreateSession({
      genSeed: {
        type: artifact!.artifactType,
        topic: artifact!.title,
        brief: artifact!.summary,
        draft: artifact!.draftContent,
      },
      creationContext: {
        section: "content-generator",
        itemType: artifact!.artifactType,
        title: artifact!.title,
        draftContent: artifact!.draftContent,
        brief: artifact!.summary,
        stage: "editing draft",
        source: "generated",
      },
      workspaceDetail: null,
    });
    const loaded = loadCreateSession();
    expect(loaded?.genSeed.draft).toContain("Send welcome email");
    clearCreateSession();
  });

  it("11 — non-assembly chat does not trigger handoff", () => {
    const evaluation = evaluateConversationHandoff({
      userCommand: "What do you think about my pricing?",
      messages: [
        { role: "user", content: "What do you think about my pricing?" },
        {
          role: "assistant",
          content: "Tell me more about your offer and who it's for.",
        },
      ],
    });
    expect(evaluation.action).toBe("none");
    expect(isExplicitBlankCreateOpen("open create")).toBe(true);
  });

  it("builds type-specific receipts", () => {
    const sop = assembleConversationArtifact({
      userCommand: "Put the SOP together",
      messages: [...SOP_CHAT, { role: "user", content: "Put the SOP together" }],
    });
    expect(buildHandoffReceipt(sop!)).toContain("SOP");
  });

  it("requires usable conversation context for assembly intent", () => {
    expect(hasUsableConversationContext(SOP_CHAT)).toBe(true);
    expect(hasUsableConversationContext([])).toBe(false);
  });
});

describe("conversationHandoffRecovery", () => {
  beforeEach(() => {
    clearStashedConversation();
  });

  it("restores stashed thread content", () => {
    const messages = SOP_CHAT;
    stashConversationBeforeHandoff(messages, { artifactType: "SOP" });
    const stash = loadStashedConversation();
    expect(stash?.messages[2]?.content).toContain("Client Onboarding");
  });
});
