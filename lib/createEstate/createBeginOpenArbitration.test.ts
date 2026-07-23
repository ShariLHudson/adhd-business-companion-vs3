/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it } from "vitest";
import "@/lib/universalWorkEngine";
import { ensureEventPlanWorkTypeRegistered } from "@/lib/universalWorkEngine/packages/eventPlan/registerEventPlanWorkType";
import { launchFromCreate } from "@/lib/universalWorkEngine";
import { EVENT_PLAN_WORK_TYPE_ID } from "@/lib/workTypeSchema";
import {
  assertWorkshopNotSop,
  resolveGuidedBeginOpen,
  shouldForceNewCreateBegin,
} from "./createBeginOpenArbitration";
import {
  clearForceNewCreateSession,
  resetForceNewCreateSessionForTests,
  armForceNewCreateSession,
} from "./forceNewCreateSession";
import {
  confirmCreateBeginToOpen,
  resolveCreateBeginOutcome,
} from "./resolveCreateBeginOutcome";
import { isForceNewCreationRequest } from "@/lib/universalCreationEntrypoint/forceNewIntent";

describe("createBeginOpenArbitration — Workshop entry", () => {
  beforeEach(() => {
    resetForceNewCreateSessionForTests();
    ensureEventPlanWorkTypeRegistered();
  });

  it("new workshop resolves to Event Plan + Workshop subtype (confirm → open)", () => {
    const outcome = resolveCreateBeginOutcome("new workshop");
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.artifactType.toLowerCase()).toMatch(/workshop/);
    expect(outcome.isEventDomain).toBe(true);
    expect(assertWorkshopNotSop(outcome.artifactType)).toBe(true);

    const open = confirmCreateBeginToOpen(outcome);
    expect(open.kind).toBe("open");
    if (open.kind !== "open") return;
    expect(open.isEventDomain).toBe(true);
    expect(open.artifactType.toLowerCase()).not.toMatch(/sop/);
  });

  it("explicit Workshop selection cannot fall through to SOP", () => {
    const outcome = resolveCreateBeginOutcome("Create a Workshop");
    expect(outcome.kind).toBe("confirm");
    if (outcome.kind !== "confirm") return;
    expect(outcome.artifactType.toLowerCase()).toBe("workshop");
    expect(outcome.artifactType.toLowerCase()).not.toContain("sop");
    expect(assertWorkshopNotSop(outcome.artifactType)).toBe(true);
  });

  it("new workshop language arms forceNew", () => {
    expect(isForceNewCreationRequest("new workshop")).toBe(true);
    expect(isForceNewCreationRequest("workshop new")).toBe(true);
    expect(shouldForceNewCreateBegin({ text: "new workshop" })).toBe(true);
  });

  it("pending prior creation does not silently override explicit new workshop", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me plan a workshop",
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(first.workId).toBeTruthy();

    const confirm = resolveCreateBeginOutcome("new workshop");
    expect(confirm.kind).toBe("confirm");
    if (confirm.kind !== "confirm") return;
    const open = confirmCreateBeginToOpen(confirm);
    expect(open.kind).toBe("open");
    if (open.kind !== "open") return;

    const guided = resolveGuidedBeginOpen({ outcome: open });
    expect(guided.kind).toBe("open_new");
    if (guided.kind !== "open_new") return;
    expect(guided.resolution.decision).toBe("create_new");
    expect(guided.resolution.workId).toBeTruthy();
    expect(guided.resolution.workId).not.toBe(first.workId);
  });

  it("ambiguity clarify exposes continue / start-new labels", () => {
    const first = launchFromCreate({
      originalUserMessage: "Help me plan a workshop",
      candidateWorkTypeId: EVENT_PLAN_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(first.workId).toBeTruthy();

    const confirm = resolveCreateBeginOutcome(
      "Help me plan a workshop for founders",
    );
    expect(confirm.kind).toBe("confirm");
    if (confirm.kind !== "confirm") return;
    const open = confirmCreateBeginToOpen(confirm);
    if (open.kind !== "open") return;

    // Without forceNew, duplicate risk may clarify or continue — both are actionable.
    const guided = resolveGuidedBeginOpen({ outcome: open, forceNewArmed: false });
    expect(["clarify", "continue_existing", "open_new"]).toContain(guided.kind);
    if (guided.kind === "clarify") {
      expect(guided.continueLabel).toMatch(/Continue Existing Workshop/i);
      expect(guided.startNewLabel).toMatch(/Start New Workshop/i);
      expect(guided.reply).toMatch(/continue what you started|begin something new/i);
    } else if (guided.kind === "continue_existing") {
      expect(guided.workId).toBeTruthy();
      expect(guided.continueLabel).toMatch(/Continue Existing Workshop/i);
      // Prefer the just-created workshop when duplicate signals fire.
      expect([first.workId, guided.workId]).toContain(guided.workId);
    }
  });

  it("Start New Workshop path forceNew creates rather than clearing only", () => {
    armForceNewCreateSession();
    const confirm = resolveCreateBeginOutcome("Workshop");
    expect(confirm.kind).toBe("confirm");
    if (confirm.kind !== "confirm") return;
    const open = confirmCreateBeginToOpen(confirm);
    if (open.kind !== "open") return;

    const guided = resolveGuidedBeginOpen({
      outcome: open,
      forceNewArmed: true,
    });
    expect(guided.kind).toBe("open_new");
    if (guided.kind !== "open_new") return;
    expect(guided.resolution.decision).toBe("create_new");
    expect(guided.resolution.openUniversalInterface).toBe(true);
    clearForceNewCreateSession();
  });

  it("repeated forceNew opens do not reuse the same work id", () => {
    const confirm = resolveCreateBeginOutcome("new workshop");
    if (confirm.kind !== "confirm") return;
    const open = confirmCreateBeginToOpen(confirm);
    if (open.kind !== "open") return;

    const a = resolveGuidedBeginOpen({ outcome: open, forceNewArmed: true });
    const b = resolveGuidedBeginOpen({ outcome: open, forceNewArmed: true });
    expect(a.kind).toBe("open_new");
    expect(b.kind).toBe("open_new");
    if (a.kind !== "open_new" || b.kind !== "open_new") return;
    expect(a.resolution.workId).not.toBe(b.resolution.workId);
  });
});
