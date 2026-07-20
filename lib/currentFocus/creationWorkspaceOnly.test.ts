/**
 * 066 Finalization — companion side panel permanently absent from Creation Destinations.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  beginCreationDestinationSession,
  clearCreationDestinationSessionForTests,
  endCreationDestinationSession,
  forbidCompanionSidePanelDuringCreation,
  mayShowCompanionChatDuringCreation,
} from "./creationSession";

describe("066 Finalization — workspace-only Creation", () => {
  beforeEach(() => {
    clearCreationDestinationSessionForTests();
  });

  it("CreateEstateWorkingPanel never mounts companion chat chrome", () => {
    const panel = readFileSync(
      resolve(
        process.cwd(),
        "components/companion/CreateEstateWorkingPanel.tsx",
      ),
      "utf8",
    );
    expect(panel).not.toContain("EstateRoomChatChrome");
    expect(panel).not.toContain("SimpleChat");
    expect(panel).not.toContain("HomeChatInputFooter");
    expect(panel).not.toContain("chatVisible");
    expect(panel).not.toContain("thread");
    expect(panel).toContain('data-creation-companion-panel="absent"');
    expect(panel).toContain("CurrentFocusInteraction");
  });

  it("CPC Create Destination does not pass thread/footer into WorkingPanel", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toContain("forbidCompanionSidePanelDuringCreation");
    const start = client.indexOf("<CreateEstateWorkingPanel");
    expect(start).toBeGreaterThan(0);
    const slice = client.slice(start, start + 6000);
    expect(slice).not.toContain("thread={");
    expect(slice).not.toContain("footer={");
    expect(slice).not.toContain("chatVisible");
  });

  it("side panel open is forbidden while Creation session active", () => {
    beginCreationDestinationSession("evt-1");
    expect(forbidCompanionSidePanelDuringCreation()).toBe(true);
    expect(mayShowCompanionChatDuringCreation()).toBe(false);
    endCreationDestinationSession();
    expect(forbidCompanionSidePanelDuringCreation()).toBe(false);
    expect(mayShowCompanionChatDuringCreation()).toBe(true);
  });

  it("ensureSplitBesideChatLayout / openChatBesideWorkspace are gated", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    expect(client).toMatch(
      /openChatBesideWorkspace[\s\S]{0,200}forbidCompanionSidePanelDuringCreation/,
    );
    expect(client).toMatch(
      /ensureSplitBesideChatLayout[\s\S]{0,200}forbidCompanionSidePanelDuringCreation/,
    );
    expect(client).toMatch(
      /setEstateRoomChatVisible[\s\S]{0,300}forbidCompanionSidePanelDuringCreation/,
    );
  });

  it("Show Conversation chip and Experience Controls cannot reopen Creation chat", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const chipAt = client.indexOf('data-testid="show-conversation-chip"');
    expect(chipAt).toBeGreaterThan(0);
    const beforeChip = client.slice(Math.max(0, chipAt - 800), chipAt);
    expect(beforeChip).toContain("forbidCompanionSidePanelDuringCreation()");
    expect(beforeChip).toContain('activeSection !== "create"');
    const toggleAt = client.indexOf("allowConversationToggle=");
    expect(toggleAt).toBeGreaterThan(0);
    const toggleSlice = client.slice(toggleAt, toggleAt + 450);
    expect(toggleSlice).toContain("forbidCompanionSidePanelDuringCreation()");
    expect(toggleSlice).toContain('activeSection !== "create"');
  });

  it("createEstateWorkingActive never calls setEstateRoomChatVisible(true)", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const idx = client.indexOf("if (createEstateWorkingActive)");
    expect(idx).toBeGreaterThan(0);
    const slice = client.slice(idx, idx + 500);
    expect(slice).toContain("setEstateRoomChatVisible(false)");
    expect(slice).not.toContain("setEstateRoomChatVisible(true)");
  });

  it("Create Estate Entrance launchers never reopen side panel", () => {
    const client = readFileSync(
      resolve(process.cwd(), "app/companion/CompanionPageClient.tsx"),
      "utf8",
    );
    const start = client.indexOf("<CreateEstateEntrancePanel");
    expect(start).toBeGreaterThan(0);
    const end = client.indexOf("<CreateEstateWorkingPanel", start);
    const slice = client.slice(
      start,
      end > start ? end : start + 12000,
    );
    // Working panel may appear earlier in file — fall back to entrance→how-do-i
    const entranceSlice =
      slice.includes("onSelectCreationType")
        ? slice
        : client.slice(
            start,
            client.indexOf('{activeSection === "how-do-i"', start),
          );
    expect(entranceSlice).toContain("onSelectCreationType");
    expect(entranceSlice).toContain("startFreshCreateFromEstate");
    expect(entranceSlice).not.toContain("setEstateRoomChatVisible(true)");
  });
});
