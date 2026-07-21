/**
 * @vitest-environment jsdom
 * 054 — Connected Asset Editor Framework
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clearRelationshipRegistryForTests } from "@/lib/creationEcosystem";
import {
  clearActiveEventRecord,
  clearEventAssetInstancesForTests,
  processEventsIntelligenceTurn,
} from "@/lib/eventsIntelligence";
import {
  CONNECTED_ASSET_EDITOR_CAPABILITIES,
  agendaEditorProvesFramework,
  clearConnectedAssetEditorForTests,
  listDocumentVersions,
  openAgendaEditor,
  openConnectedAssetEditor,
  resumeAgendaEditor,
  saveAgendaBlocks,
  saveConnectedAsset,
} from "./index";

describe("054 Connected Asset Editor Framework", () => {
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
        "docs/create-experience/standards/054_CONNECTED_ASSET_EDITOR_FRAMEWORK.md",
      ),
      "utf8",
    );
    expect(body).toMatch(/One pattern\. Many asset types/i);
    expect(body).toMatch(/versioned/i);
    expect(body).toMatch(/Agenda/i);
  });

  it("framework declares all eight inherited capabilities", () => {
    expect(CONNECTED_ASSET_EDITOR_CAPABILITIES).toEqual(
      expect.arrayContaining([
        "connected_to_creation_record",
        "versioned",
        "relationship_aware",
        "project_aware",
        "conversation_aware",
        "editable",
        "resumable",
        "recommendation_enabled",
      ]),
    );
    expect(CONNECTED_ASSET_EDITOR_CAPABILITIES).toHaveLength(8);
  });

  it("Agenda reference — open, edit, version, resume, connected", () => {
    const start = processEventsIntelligenceTurn({
      userText:
        "Help me create a one-day workshop whose purpose is to introduce the ADHD business platform and conduct beta testing, with ADHD business people as the audience.",
      forceStart: true,
    });
    expect(start.record).toBeTruthy();

    const session = openAgendaEditor({
      record: start.record!,
      templateId: "tpl-agenda-one-day-workshop",
    });
    expect(session).toBeTruthy();
    expect(agendaEditorProvesFramework(session!)).toBe(true);
    expect(session!.document.blocks.length).toBeGreaterThan(3);
    expect(session!.connections.doNotReask.length).toBeGreaterThan(0);
    expect(session!.orientation).not.toMatch(/registry|orchestrat/i);

    const editedBlocks = session!.document.blocks.map((b, i) =>
      i === 0 ? { ...b, body: "Welcome ADHD entrepreneurs gently." } : b,
    );
    const saved = saveAgendaBlocks({
      documentId: session!.document.documentId,
      blocks: editedBlocks,
      versionNote: "welcome copy",
    });
    expect(saved).toBeTruthy();
    expect(saved!.document.version).toBe(2);
    expect(saved!.document.blocks[0]?.body).toMatch(/ADHD entrepreneurs/);
    expect(listDocumentVersions(saved!.document.documentId).length).toBeGreaterThanOrEqual(
      1,
    );

    const resumed = resumeAgendaEditor({
      documentId: saved!.document.documentId,
    });
    expect(resumed?.document.plainText).toMatch(/ADHD entrepreneurs/);
    expect(resumed?.returnState.assetTypeId).toBe("agenda");
    expect(resumed?.connections.eventRecordId).toBe(start.record!.id);
  });

  it("same pattern opens a second asset type without Agenda-specific code paths", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me create a workshop event.",
      forceStart: true,
    });
    const budget = openConnectedAssetEditor({
      assetTypeId: "event_budget",
      eventRecordId: start.record!.id,
      sectionId: "budget",
      templateId: "tpl-budget-simple",
      title: "Event Budget",
    });
    expect(budget).toBeTruthy();
    expect(budget!.document.assetTypeId).toBe("event_budget");
    expect(budget!.document.creationRecordId).toBeTruthy();
    expect(budget!.capabilities).toEqual(CONNECTED_ASSET_EDITOR_CAPABILITIES);

    const saved = saveConnectedAsset({
      documentId: budget!.document.documentId,
      blocks: budget!.document.blocks.map((b, i) =>
        i === 0 ? { ...b, body: "$2,000 venue" } : b,
      ),
    });
    expect(saved!.document.version).toBe(2);
    expect(saved!.document.blocks[0]?.body).toMatch(/2,000/);
  });

  it("resume does not create a duplicate document for the same instance", () => {
    const start = processEventsIntelligenceTurn({
      userText: "Help me create a conference.",
      forceStart: true,
    });
    const first = openAgendaEditor({ record: start.record! });
    const second = openAgendaEditor({ record: start.record! });
    expect(second!.document.documentId).toBe(first!.document.documentId);
    expect(second!.document.instanceId).toBe(first!.document.instanceId);
  });
});
