import { describe, expect, it } from "vitest";
import {
  classificationTypeFromWorkingIntent,
  deriveCreationIdentity,
  isDocumentClassificationType,
  mayApplyEventWorkspace,
} from "./deriveCreationIdentity";
import { bootstrapWorkspaceV2Session } from "@/lib/createWorkspaceV2";
import { applyEventWorkspaceToCreateWorkflow } from "@/lib/eventCreationWorkspace";
import type { EventRecord } from "@/lib/eventsIntelligence/types";

describe("deriveCreationIdentity — three-field rule", () => {
  it("keeps originalRequest, derives workingIntent and clean title", () => {
    const id = deriveCreationIdentity({
      originalRequest:
        "I want to start a brand new, completely separate project for a client onboarding checklist.",
      creationType: "Document",
    });
    expect(id.originalRequest).toMatch(/brand new, completely separate/i);
    expect(id.workingIntent).toBe("Create Checklist");
    expect(id.humanWorkspaceTitle.toLowerCase()).toBe(
      "client onboarding checklist",
    );
    expect(id.humanWorkspaceTitle).not.toMatch(/start a brand new|completely separate|workshop/i);
    expect(id.humanWorkspaceTitle).not.toBe(id.originalRequest);
  });

  it("never mashes Workshop Onboarding onto a checklist title", () => {
    const id = deriveCreationIdentity({
      originalRequest:
        "I want to start a brand new project for a client onboarding checklist",
      creationType: "Workshop",
    });
    expect(id.workingIntent).toBe("Create Checklist");
    expect(id.humanWorkspaceTitle.toLowerCase()).toBe(
      "client onboarding checklist",
    );
    expect(id.humanWorkspaceTitle).not.toMatch(/workshop|onboarding onboarding/i);
  });

  it("preserves confirmed title without remashing", () => {
    const id = deriveCreationIdentity({
      originalRequest: "",
      creationType: "Workshop",
      confirmedTitle: "Client Onboarding Checklist",
    });
    expect(id.humanWorkspaceTitle).toBe("Client Onboarding Checklist");
    expect(id.workingIntent).toBe("Create Checklist");
  });

  it("never uses force-new meta as the title", () => {
    const id = deriveCreationIdentity({
      originalRequest:
        "Start something new — create a separate Leadership Retreat 2026 Plan",
      creationType: "Retreat",
    });
    expect(id.humanWorkspaceTitle).not.toMatch(/start something new/i);
    expect(id.humanWorkspaceTitle.toLowerCase()).toMatch(/leadership|retreat/);
    expect(id.workingIntent).toMatch(/Create /i);
  });

  it("honors confirmed member title without changing originalRequest", () => {
    const id = deriveCreationIdentity({
      originalRequest: "help me create something for clients",
      confirmedTitle: "Client Onboarding Checklist",
      creationType: "Document",
    });
    expect(id.humanWorkspaceTitle).toBe("Client Onboarding Checklist");
    expect(id.originalRequest).toBe("help me create something for clients");
  });

  it("workingIntent is sole authority for classification + template bootstrap", () => {
    // Even when a Workshop hint is supplied, kind detection + workingIntent win.
    const id = deriveCreationIdentity({
      originalRequest:
        "I want to start a brand new project for a client onboarding checklist",
      creationType: "Workshop",
    });
    expect(id.workingIntent).toBe("Create Checklist");
    const classified = classificationTypeFromWorkingIntent(id.workingIntent);
    expect(classified).toBe("Checklist");
    // Template selection must bootstrap from workingIntent, not Workshop.
    const boot = bootstrapWorkspaceV2Session(classified);
    expect(boot.session.typeLabel).toBe("Checklist");
    expect(boot.session.workflow.selectedTypeLabel).toBe("Checklist");
  });

  it("Intent Detection ignores catalog/Workshop peer when request names checklist", () => {
    const withHint = deriveCreationIdentity({
      originalRequest: "create a client onboarding checklist",
      creationType: "Workshop",
    });
    const withoutHint = deriveCreationIdentity({
      originalRequest: "create a client onboarding checklist",
    });
    expect(withHint.workingIntent).toBe("Create Checklist");
    expect(withoutHint.workingIntent).toBe("Create Checklist");
    expect(withHint.humanWorkspaceTitle.toLowerCase()).toBe(
      "client onboarding checklist",
    );
  });

  it("Event classification — Retreat permits Event bind", () => {
    const id = deriveCreationIdentity({
      originalRequest: "Help me plan a leadership retreat",
    });
    expect(id.workingIntent).toBe("Create Retreat");
    const classified = classificationTypeFromWorkingIntent(id.workingIntent);
    expect(classified).toBe("Retreat");
    expect(isDocumentClassificationType(classified)).toBe(false);
    expect(mayApplyEventWorkspace(classified)).toBe(true);
  });

  it("Document Classification sole authority — Checklist chain never becomes Event", () => {
    const id = deriveCreationIdentity({
      originalRequest:
        "I want to start a brand new project for a client onboarding checklist",
    });
    expect(id.workingIntent).toBe("Create Checklist");
    const classified = classificationTypeFromWorkingIntent(id.workingIntent);
    expect(classified).toBe("Checklist");
    expect(isDocumentClassificationType(classified)).toBe(true);
    expect(mayApplyEventWorkspace(classified)).toBe(false);

    const boot = bootstrapWorkspaceV2Session(classified);
    expect(boot.session.typeLabel).toBe("Checklist");
    expect(boot.session.workflow.selectedTypeLabel).toBe("Checklist");

    const fakeEvent = {
      id: "evt-test",
      title: "Workshop Plan",
      eventTypeLabel: "Workshop",
      purpose: "Workshop",
      outcomes: "",
      audience: "",
      dates: "",
      venue: "",
      budget: "",
      format: "unspecified",
      sections: [],
    } as unknown as EventRecord;

    const stamped = {
      ...boot.session.workflow,
      selectedTypeLabel: classified,
      workingIntent: id.workingIntent,
      selectedTemplateName: id.humanWorkspaceTitle,
    };
    const afterBind = applyEventWorkspaceToCreateWorkflow(stamped, fakeEvent);
    expect(afterBind.selectedTypeLabel).toBe("Checklist");
    expect(afterBind.selectedTemplateName.toLowerCase()).toBe(
      "client onboarding checklist",
    );
    expect(afterBind.selectedTemplateName).not.toMatch(/workshop/i);
    expect(afterBind.creationWorkspaceKind).not.toBe("event");
    expect(afterBind.selectedTemplateId).not.toBe("event-creation-workspace");
  });
});
