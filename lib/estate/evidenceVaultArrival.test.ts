import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EVIDENCE_VAULT_ARRIVAL_WELCOME,
  EVIDENCE_VAULT_INTENTIONAL_ENTRY_WELCOME,
  EVIDENCE_VAULT_ENTRANCE_DOOR_MS,
  EVIDENCE_VAULT_ENTRANCE_ENTER_MS,
  EVIDENCE_VAULT_ENTRANCE_UNLOCK_MS,
  formatEvidenceVaultFindProofReply,
  formatEvidenceVaultInsightsReply,
  formatEvidenceVaultReminderReply,
  hasEvidenceVaultEntranceCompleted,
  markEvidenceVaultEntranceCompleted,
  setEvidenceVaultPendingWelcome,
  consumeEvidenceVaultPendingWelcome,
} from "./evidenceVaultArrival";
import { resolveEstateRoomInvitations } from "./estateRoomInvitation";
import { isDedicatedEstateRoomPanelSection } from "./directEstateVisit";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  const session = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => storage.clear(),
  };
  vi.stubGlobal("sessionStorage", session);
  vi.stubGlobal("window", {
    sessionStorage: session,
    dispatchEvent: vi.fn(),
  });
});

describe("evidenceVaultArrival", () => {
  it("includes the EST-001 welcome lines", () => {
    expect(EVIDENCE_VAULT_ARRIVAL_WELCOME).toContain("Welcome to the Evidence Vault");
    expect(EVIDENCE_VAULT_ARRIVAL_WELCOME).toContain("meaningful experiences");
    expect(EVIDENCE_VAULT_ARRIVAL_WELCOME).toContain("What has my life been teaching me");
  });

  it("uses intentional entry welcome without generic menu", () => {
    expect(EVIDENCE_VAULT_INTENTIONAL_ENTRY_WELCOME).toContain(
      "Welcome back to your Evidence Vault",
    );
    expect(EVIDENCE_VAULT_INTENTIONAL_ENTRY_WELCOME).toContain(
      "What discovery would you like to preserve today?",
    );
  });

  it("offers place-first invitation actions", () => {
    const items = resolveEstateRoomInvitations("evidence-vault");
    const labels = items.map((item) => item.label);
    expect(labels).toContain("Open Today's Discovery File");
    expect(labels).toContain("Browse Archive");
    expect(labels).toContain("Search Discoveries");
    expect(labels).toContain("View Insights");
    expect(labels).toContain("Print Discoveries");
  });

  it("formats reminder, search, and insights replies without opening a form", () => {
    expect(formatEvidenceVaultReminderReply()).toMatch(/vault/i);
    expect(formatEvidenceVaultFindProofReply()).toMatch(/vault|discover/i);
    expect(formatEvidenceVaultInsightsReply()).toMatch(/vault|discover/i);
  });

  it("defers welcome until entrance ritual completes", () => {
    setEvidenceVaultPendingWelcome(EVIDENCE_VAULT_ARRIVAL_WELCOME);
    expect(consumeEvidenceVaultPendingWelcome()).toBe(
      EVIDENCE_VAULT_ARRIVAL_WELCOME,
    );
    expect(consumeEvidenceVaultPendingWelcome()).toBeNull();
  });

  it("uses dedicated panel routing for evidence-bank", () => {
    expect(isDedicatedEstateRoomPanelSection("evidence-bank")).toBe(true);
  });

  it("entrance timing stays within a slow ceremonial pace", () => {
    expect(EVIDENCE_VAULT_ENTRANCE_UNLOCK_MS).toBeGreaterThanOrEqual(500);
    expect(EVIDENCE_VAULT_ENTRANCE_DOOR_MS).toBeGreaterThanOrEqual(1800);
    expect(EVIDENCE_VAULT_ENTRANCE_ENTER_MS).toBeGreaterThanOrEqual(600);
  });

  it("persists entrance completion for returning visits", () => {
    const local = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => local.get(key) ?? null,
      setItem: (key: string, value: string) => {
        local.set(key, value);
      },
      removeItem: (key: string) => {
        local.delete(key);
      },
      clear: () => local.clear(),
    });
    expect(hasEvidenceVaultEntranceCompleted()).toBe(false);
    markEvidenceVaultEntranceCompleted();
    expect(hasEvidenceVaultEntranceCompleted()).toBe(true);
  });
});
