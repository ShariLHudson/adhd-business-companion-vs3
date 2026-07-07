import { describe, expect, it } from "vitest";
import { isEstateGuideQuestion } from "@/lib/sparkKnowledge/estateGuide";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence";
import {
  arbitrateConversationRouting,
  classifyConversationGoal,
  isRetrieveIntent,
  runConversationRoutingPipeline,
  selectWinningCapability,
  evaluateEstateIntelligenceCandidates,
  tryStabilizationFastPath,
} from "./index";
import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";

const stubRouting = {
  category: "chat",
  learnFastPath: false,
} as IntentRoutingDecision;

describe("Conversation Stabilization™", () => {
  describe("goal classifier", () => {
    it("A — new project → create", () => {
      expect(classifyConversationGoal("I need to start a new project")).toBe(
        "create",
      );
    });

    it("B — research pricing → research (not discovery)", () => {
      expect(
        classifyConversationGoal(
          "Research pricing for my music/audio library",
        ),
      ).toBe("research");
    });

    it("C — find snippet → retrieve", () => {
      expect(
        isRetrieveIntent(
          "Find me a snippet about my ADHD Business Ecosystem",
        ),
      ).toBe(true);
      expect(
        classifyConversationGoal(
          "Find me a snippet about my ADHD Business Ecosystem",
        ),
      ).toBe("retrieve");
    });

    it("D — template request → create", () => {
      expect(
        classifyConversationGoal("I need a template for a document"),
      ).toBe("create");
    });

    it("G — treehouse navigation → explicit_navigation", () => {
      expect(classifyConversationGoal("Take me to the treehouse")).toBe(
        "explicit_navigation",
      );
    });
  });

  describe("arbitration blocks estate recommendation for task goals", () => {
    it("blocks recommendation for research", () => {
      const arbitration = arbitrateConversationRouting({
        userText: "Research pricing for my music/audio library",
      });
      expect(arbitration.goal).toBe("research");
      expect(arbitration.blockedSubsystems).toContain("recommendation");
      expect(arbitration.blockedSubsystems).toContain("implied_need");
    });
  });

  describe("fast path transcripts", () => {
    it("A — opens new project with naming question", () => {
      const arbitration = arbitrateConversationRouting({
        userText: "I need to start a new project",
      });
      const result = tryStabilizationFastPath(
        {
          userText: "I need to start a new project",
          arbitration,
        },
        stubRouting,
      );
      expect(result?.winningSubsystem).toBe("create_project");
      expect(result?.localReply).toMatch(/what should we call it/i);
      expect(result?.immediateCreateProjectOpen).toBeTruthy();
    });

    it("A turn 2 — continues project after naming prompt", () => {
      const arbitration = arbitrateConversationRouting({
        userText: "ADHD Music Library",
        lastAssistantText:
          "Let's bring that project to life.\n\nWhat should we call it?",
      });
      const result = tryStabilizationFastPath(
        {
          userText: "ADHD Music Library",
          lastAssistantText:
            "Let's bring that project to life.\n\nWhat should we call it?",
          arbitration,
        },
        stubRouting,
      );
      expect(result?.winningSubsystem).toBe("project_continuation");
      expect(result?.localReply).toMatch(/main goal/i);
    });

    it("B — research opens research subsystem", () => {
      const arbitration = arbitrateConversationRouting({
        userText: "Research pricing for my music/audio library",
      });
      const result = tryStabilizationFastPath(
        {
          userText: "Research pricing for my music/audio library",
          arbitration,
        },
        stubRouting,
      );
      expect(result?.winningSubsystem).toBe("research");
      expect(result?.immediateResearchOpen).toBeTruthy();
    });

    it("C — retrieve does not route to estate guide", () => {
      expect(
        isEstateGuideQuestion(
          "Find me a snippet about my ADHD Business Ecosystem",
        ),
      ).toBe(false);
      const arbitration = arbitrateConversationRouting({
        userText: "Find me a snippet about my ADHD Business Ecosystem",
      });
      const result = tryStabilizationFastPath(
        {
          userText: "Find me a snippet about my ADHD Business Ecosystem",
          arbitration,
        },
        stubRouting,
      );
      expect(result?.winningSubsystem).toBe("retrieve");
    });

    it("E — brain dump capture for short task", () => {
      const arbitration = arbitrateConversationRouting({
        userText: "make doctor appointment",
        activeWorkflow: "brain-dump",
      });
      const result = tryStabilizationFastPath(
        {
          userText: "make doctor appointment",
          activeWorkflow: "brain-dump",
          arbitration,
        },
        stubRouting,
      );
      expect(result?.winningSubsystem).toBe("brain_dump_capture");
    });
  });

  describe("navigation excludes content retrieve", () => {
    it("does not treat snippet search as navigation", () => {
      const decision = resolveEstateNavigationIntent(
        "Find me a snippet about my ADHD Business Ecosystem",
      );
      expect(decision.kind).toBe("unresolved");
    });

    it("still navigates to treehouse", () => {
      const decision = resolveEstateNavigationIntent("Take me to the treehouse");
      expect(decision.kind).toBe("navigate_direct");
    });
  });

  describe("routing pipeline", () => {
    it("research wins over experience/discovery candidates", () => {
      const pipeline = runConversationRoutingPipeline(
        { userText: "Research pricing for my music/audio library" },
        stubRouting,
      );
      expect(pipeline.winningCapability).toBe("research");
      expect(pipeline.fastPath?.winningSubsystem).toBe("research");
      const experience = pipeline.candidates.find(
        (c) => c.capability === "experience",
      );
      expect(experience?.eligible).toBe(false);
    });

    it("retrieve wins over navigation for snippet search", () => {
      const pipeline = runConversationRoutingPipeline(
        {
          userText: "Find me a snippet about my ADHD Business Ecosystem",
        },
        stubRouting,
      );
      expect(pipeline.winningCapability).toBe("retrieval");
      expect(pipeline.fastPath?.winningSubsystem).toBe("retrieve");
    });

    it("explicit navigation wins navigation capability", () => {
      const pipeline = runConversationRoutingPipeline(
        { userText: "Take me to the treehouse" },
        stubRouting,
      );
      expect(pipeline.winningCapability).toBe("navigation");
      expect(pipeline.fastPath).toBeNull();
    });

    it("evaluates all estate intelligence branches", () => {
      const arbitration = arbitrateConversationRouting({
        userText: "What can I do here?",
      });
      const candidates = evaluateEstateIntelligenceCandidates({
        userText: "What can I do here?",
        arbitration,
      });
      const capabilities = candidates.map((c) => c.capability);
      expect(capabilities).toContain("navigation");
      expect(capabilities).toContain("room");
      expect(capabilities).toContain("feature");
      expect(capabilities).toContain("object");
      expect(capabilities).toContain("experience");
      expect(capabilities).toContain("discovery");
      expect(capabilities).toContain("help");
      expect(capabilities).toContain("research");
      expect(capabilities).toContain("create");
      expect(capabilities).toContain("capture");
      expect(capabilities).toContain("retrieval");
    });

    it("selectWinningCapability prefers task goals over discovery", () => {
      const arbitration = arbitrateConversationRouting({
        userText: "I need a template for a document",
      });
      const candidates = evaluateEstateIntelligenceCandidates({
        userText: "I need a template for a document",
        arbitration,
      });
      expect(selectWinningCapability(arbitration, candidates)).toBe("create");
    });
  });
});
