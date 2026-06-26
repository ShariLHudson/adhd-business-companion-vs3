import { describe, expect, it } from "vitest";
import {
  evaluateHonorTheirIntent,
  honorTheirIntentHintForChat,
  resolveGuestArrivalMode,
  violatesMomentumProtection,
  detectEmergentNeed,
  mapArrivalModeToVisitIntent,
  shouldSuppressReflectionForHonorIntent,
} from "./index";

describe("Honor Their Intent™", () => {
  it("classifies come to work vs come to be helped", () => {
    expect(resolveGuestArrivalMode({ userText: "Help me write an SOP." })).toBe(
      "come_to_work",
    );
    expect(
      resolveGuestArrivalMode({ userText: "I need to build a sales funnel." }),
    ).toBe("come_to_work");
    expect(
      resolveGuestArrivalMode({ userText: "Write me a Pinterest description." }),
    ).toBe("come_to_work");
    expect(resolveGuestArrivalMode({ userText: "I'm overwhelmed." })).toBe(
      "come_to_be_helped",
    );
    expect(
      resolveGuestArrivalMode({ userText: "I don't know where to start." }),
    ).toBe("come_to_be_helped");
  });

  it("honors work momentum — begin immediately, no emotional detour", () => {
    const verdict = evaluateHonorTheirIntent({
      userText: "Help me build my client onboarding process.",
    });
    expect(verdict.arrivalMode).toBe("come_to_work");
    expect(verdict.honorMomentum).toBe(true);
    expect(verdict.beginImmediately).toBe(true);
    expect(verdict.suppressEmotionalDetour).toBe(true);
    expect(verdict.suggestedOpening).toContain("Let's build");
  });

  it("honors help arrivals — stay in living room, listen first", () => {
    const verdict = evaluateHonorTheirIntent({
      userText: "I don't know what's wrong today.",
    });
    expect(verdict.arrivalMode).toBe("come_to_be_helped");
    expect(verdict.stayInLivingRoom).toBe(true);
    expect(verdict.honorMomentum).toBe(false);
    expect(shouldSuppressReflectionForHonorIntent(verdict)).toBe(false);
  });

  it("gentle awareness — emergent need during work session", () => {
    const mid = evaluateHonorTheirIntent({
      userText: "I don't even know why I'm doing this anymore.",
      sessionWasWork: true,
    });
    expect(mid.emergentNeedDetected).toBe(true);
    expect(mid.flowShift).toBe(true);
    expect(mid.gentleAwarenessOnly).toBe(false);
    expect(shouldSuppressReflectionForHonorIntent(mid)).toBe(false);

    const working = evaluateHonorTheirIntent({
      userText: "Add a welcome email step.",
      sessionWasWork: true,
    });
    expect(working.gentleAwarenessOnly).toBe(true);
    expect(working.honorMomentum).toBe(true);
  });

  it("detects emergent need phrases", () => {
    expect(
      detectEmergentNeed("I don't even know why I'm doing this anymore."),
    ).toBe(true);
    expect(detectEmergentNeed("Add step three to the checklist.")).toBe(false);
  });

  it("forbids momentum-interrupting copy", () => {
    expect(
      violatesMomentumProtection("Before we do that, how are you feeling today?"),
    ).toBe(true);
    expect(violatesMomentumProtection("Absolutely. Let's build it.")).toBe(false);
  });

  it("maps arrival mode to Companion Relationship visit intent", () => {
    expect(mapArrivalModeToVisitIntent("come_to_work")).toBe("work_now");
    expect(mapArrivalModeToVisitIntent("come_to_be_helped")).toBe("linger");
    expect(mapArrivalModeToVisitIntent("unclear")).toBe("neutral");
  });

  it("produces chat hint with constitutional guidance", () => {
    const hint = honorTheirIntentHintForChat(
      evaluateHonorTheirIntent({ userText: "Create a marketing funnel." }),
    );
    expect(hint).toContain("HONOR THEIR INTENT");
    expect(hint).toContain("came to WORK");
    expect(hint).toMatch(/Before we begin/i);
  });
});
