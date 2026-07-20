import { describe, expect, it } from "vitest";
import { EMPTY_CREATE_WORKFLOW } from "@/lib/createWorkflow";
import { ensureEventPlanSchemaRegistered } from "@/lib/workTypeSchema/schemas/eventPlan";
import { initializeWorkspaceV2Workflow } from "@/lib/createWorkspaceV2";
import {
  buildCreateAssistancePacket,
  runCreateAssistance,
} from "./buildAssistance";

describe("Create contextual assistance", () => {
  it("builds a section-specific packet with Work + Section IDs", () => {
    ensureEventPlanSchemaRegistered();
    const workflow = {
      ...initializeWorkspaceV2Workflow("Event Plan"),
      sessionId: "ws-assist-1",
      sectionContent: { purpose: "Deepen trust this weekend" },
      activeSectionId: "purpose",
    };
    const packet = buildCreateAssistancePacket({
      workflow,
      sectionId: "purpose",
      actionId: "help_me_think",
      constraints: ["keep it short"],
    });
    expect(packet.workId).toBe("ws-assist-1");
    expect(packet.workTypeId).toBe("event_plan");
    expect(packet.sectionId).toBe("purpose");
    expect(packet.sectionContent).toContain("Deepen trust");
    expect(packet.workMetadata.constraints).toContain("keep it short");
  });

  it("Help Me Think / Ideas / Not Sure / Examples / Review are section-specific", () => {
    const workflow = {
      ...EMPTY_CREATE_WORKFLOW,
      sessionId: "ws-2",
      selectedTypeLabel: "SOP",
      templateSections: [{ id: "steps", label: "Steps" }],
      sectionContent: { steps: "1. Open the drawer" },
    };
    for (const actionId of [
      "help_me_think",
      "give_me_ideas",
      "im_not_sure",
      "show_examples",
      "review_this",
    ] as const) {
      const result = runCreateAssistance({
        workflow,
        sectionId: "steps",
        actionId,
      });
      expect(result.guidance.toLowerCase()).toContain("steps");
      expect(result.packet.sectionId).toBe("steps");
    }
  });
});
