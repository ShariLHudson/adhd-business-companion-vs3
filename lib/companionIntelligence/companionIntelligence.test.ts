import { describe, expect, it } from "vitest";
import {
  arbitrateConversationRouting,
  runConversationRoutingPipeline,
} from "@/lib/conversationStabilization";
import {
  detectCompanionActiveSession,
  isCompanionSessionLocked,
  isExplicitDirectionChange,
  shouldAllowEstateSuggestions,
  shouldUseEstateIntelligence,
} from "./index";
import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";

const stubRouting = {
  category: "chat",
  learnFastPath: false,
} as IntentRoutingDecision;

describe("Companion Intelligence™", () => {
  it("locks brain-dump session — capture not create", () => {
    const arbitration = arbitrateConversationRouting({
      userText: "call the dentist tomorrow",
      activeWorkflow: "brain-dump",
      workspace: "brain-dump",
    });
    expect(arbitration.activeSession).toBe("brain_dump");
    expect(arbitration.sessionLocked).toBe(true);
    expect(arbitration.goal).toBe("capture");
    expect(shouldAllowEstateSuggestions(arbitration)).toBe(false);
    expect(shouldUseEstateIntelligence(arbitration, "call the dentist tomorrow")).toBe(
      false,
    );
  });

  it("releases session on explicit navigation", () => {
    const activeSession = detectCompanionActiveSession({
      userText: "take me to the treehouse",
      activeWorkflow: "brain-dump",
      workspace: "brain-dump",
    });
    expect(activeSession).toBe("brain_dump");
    expect(
      isExplicitDirectionChange("take me to the treehouse", activeSession),
    ).toBe(true);
    expect(
      isCompanionSessionLocked(activeSession, true),
    ).toBe(false);
  });

  it("research intent blocks estate suggestions", () => {
    const arbitration = arbitrateConversationRouting({
      userText: "Research pricing for competitors",
    });
    expect(arbitration.goal).toBe("research");
    expect(shouldAllowEstateSuggestions(arbitration)).toBe(false);
    const pipeline = runConversationRoutingPipeline(
      { userText: "Research pricing for competitors" },
      stubRouting,
    );
    expect(pipeline.winningCapability).toBe("research");
  });

  it("retrieve never needs estate intelligence first", () => {
    const arbitration = arbitrateConversationRouting({
      userText: "Find me a snippet about my ADHD Business Ecosystem",
    });
    expect(arbitration.goal).toBe("retrieve");
    expect(
      shouldUseEstateIntelligence(
        arbitration,
        "Find me a snippet about my ADHD Business Ecosystem",
      ),
    ).toBe(false);
  });
});
