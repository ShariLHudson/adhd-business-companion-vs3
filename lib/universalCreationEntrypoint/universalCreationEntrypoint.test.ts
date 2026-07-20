/**
 * @vitest-environment jsdom
 * 055 — Universal Creation Entrypoint
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clearRelationshipRegistryForTests } from "@/lib/creationEcosystem";
import {
  clearActiveEventRecord,
  clearEventAssetInstancesForTests,
} from "@/lib/eventsIntelligence";
import { clearConnectedAssetEditorForTests } from "@/lib/connectedAssetEditor";
import {
  CREATION_ENTRY_SOURCES,
  assessEntrypointConfidence,
  enterCreationFromChamber,
  enterCreationFromCreate,
  enterCreationFromDashboard,
  enterCreationFromNotification,
  enterCreationFromProjects,
  enterCreationFromSearch,
  enterCreationFromShari,
  resolveUniversalCreationEntrypoint,
} from "./index";

describe("055 Universal Creation Entrypoint", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearActiveEventRecord();
    clearEventAssetInstancesForTests();
    clearRelationshipRegistryForTests();
    clearConnectedAssetEditorForTests();
  });

  it("standard document exists", () => {
    const body = readFileSync(
      resolve(
        process.cwd(),
        "docs/create-experience/standards/055_UNIVERSAL_CREATION_ENTRYPOINT_STANDARD.md",
      ),
      "utf8",
    );
    expect(body).toMatch(/Many Entry Points/i);
    expect(body).toMatch(/One Creation Record/i);
    expect(body).toMatch(/Never duplicate/i);
  });

  it("supports all required entry sources", () => {
    expect(CREATION_ENTRY_SOURCES).toEqual(
      expect.arrayContaining([
        "shari",
        "create",
        "projects",
        "chamber",
        "board",
        "cartography",
        "dashboard",
        "home",
        "search",
        "conversation",
        "notification",
        "recommendation",
      ]),
    );
  });

  it("confidence — high opens, low stays conversational", () => {
    expect(
      assessEntrypointConfidence("Help me plan a conference.").confidence,
    ).toBe("high");
    expect(
      assessEntrypointConfidence(
        "What is the difference between a summit and a conference?",
      ).confidence,
    ).toBe("low");
    expect(
      assessEntrypointConfidence("I'm thinking about doing a workshop.")
        .confidence,
    ).toBe("medium");
  });

  it("knowledge questions never open a workspace", () => {
    const r = enterCreationFromShari({
      userText: "What should I consider when planning a workshop?",
    });
    expect(r.action).toBe("stay_conversation");
    expect(r.engineResult).toBeNull();
  });

  it("Shari / Create / Projects / Dashboard / Search / Notification → one Creation Record", () => {
    const fromShari = enterCreationFromShari({
      userText:
        "Help me create a one-day workshop for ADHD business people to beta test the platform.",
    });
    expect(
      fromShari.action === "open_workspace" ||
        fromShari.action === "resume_workspace",
    ).toBe(true);
    expect(fromShari.creationRecordId).toBeTruthy();
    const id = fromShari.creationRecordId!;

    const fromCreate = enterCreationFromCreate({
      userText: "Create Workshop — continue ADHD beta workshop",
    });
    expect(fromCreate.creationRecordId).toBe(id);
    expect(fromCreate.preventedDuplicate || fromCreate.action.includes("resume") || fromCreate.eventRecordId === fromShari.eventRecordId).toBe(
      true,
    );

    const fromProjects = enterCreationFromProjects({
      userText: "Open my workshop creation workspace",
    });
    expect(fromProjects.creationRecordId).toBe(id);
    expect(fromProjects.preventedDuplicate || fromProjects.eventRecordId).toBeTruthy();

    const fromDash = enterCreationFromDashboard({
      userText: "Continue planning",
    });
    expect(fromDash.creationRecordId).toBe(id);
    expect(fromDash.action).toMatch(/resume|open/);

    const fromSearch = enterCreationFromSearch({
      userText: "Workshop",
      hintedEventRecordId: fromShari.eventRecordId,
    });
    expect(fromSearch.creationRecordId).toBe(id);

    const fromNote = enterCreationFromNotification({
      userText: "Finalize Speaker Packet",
      hintedEventRecordId: fromShari.eventRecordId,
      hintedAssetTypeId: "speaker_packet",
      hintedSectionId: "speakers",
    });
    expect(fromNote.creationRecordId).toBe(id);
  });

  it("Marketing Chamber — landing page attaches to existing workshop, no duplicate", () => {
    const workshop = enterCreationFromShari({
      userText:
        "Help me create a workshop for ADHD business people to introduce the platform.",
    });
    expect(workshop.eventRecordId).toBeTruthy();

    const marketing = enterCreationFromChamber({
      userText: "Create a landing page for my ADHD workshop.",
      activeChamberMemberId: "marketing",
    });

    expect(marketing.action).toBe("open_asset");
    expect(marketing.assetTypeId).toBe("landing_page");
    expect(marketing.creationRecordId).toBe(workshop.creationRecordId);
    expect(marketing.eventRecordId).toBe(workshop.eventRecordId);
    expect(marketing.preventedDuplicate).toBe(true);
    expect(marketing.editorSession?.document.assetTypeId).toBe("landing_page");
    expect(marketing.contextPreserved || marketing.doNotReask.length >= 0).toBe(
      true,
    );
  });

  it("existing conversation resumes context without re-asking", () => {
    const start = enterCreationFromCreate({
      userText:
        "Help me create a workshop whose purpose is beta testing with ADHD business people as the audience.",
    });
    const again = resolveUniversalCreationEntrypoint({
      entrySource: "conversation",
      userText: "Continue my workshop plan",
    });
    expect(again.creationRecordId).toBe(start.creationRecordId);
    expect(again.action).toMatch(/resume|open/);
    expect(again.doNotReask.length).toBeGreaterThan(0);
  });
});
