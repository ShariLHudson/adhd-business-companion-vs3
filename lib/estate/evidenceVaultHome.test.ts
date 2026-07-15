/**
 * Evidence Vault home helpers — favorites, search, surprise, reminder, draft.
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createEvidenceEntry,
  getEvidenceEntries,
  isEvidenceFavorite,
  toggleEvidenceFavorite,
  type EvidenceEntryInput,
} from "@/lib/evidenceBankStore";
import {
  clearEvidenceVaultDraft,
  hasEvidenceVaultDraft,
  loadEvidenceVaultDraft,
  saveEvidenceVaultDraft,
} from "./evidenceVaultDraft";
import {
  EVIDENCE_VAULT_CHAT_OPEN_OFFER,
  EVIDENCE_VAULT_EMPTY_INTRO,
  EVIDENCE_VAULT_HOW_DO_I_LABEL,
  EVIDENCE_VAULT_SURPRISE_RECENT_KEY,
  getRecentEvidenceEntries,
  pickSurpriseEvidenceEntry,
  searchEvidenceEntries,
  shouldShowGentleReminder,
} from "./evidenceVaultHome";
import { EVIDENCE_VAULT_ENCOURAGEMENT_LINE } from "./winSaveOffer";
import { detectsEncouragementNeed } from "./winSaveOffer";

const STORAGE_KEY = "companion-evidence-bank-v1";

function seedEntry(
  overrides: Partial<EvidenceEntryInput> & { whatHappened: string },
) {
  return createEvidenceEntry({
    category: "Personal Growth",
    whatImproved: "",
    whatMovedForward: "",
    whatProblemSolved: "",
    whoBenefited: "",
    whyItMattered: "",
    whatThisProves: "",
    attachments: [],
    ...overrides,
  });
}

describe("evidenceVaultHome", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("keeps existing saved evidence readable without favorites", () => {
    const legacy = [
      {
        id: "ev-legacy-1",
        category: "Client Result",
        whatHappened: "Closed the proposal",
        whatImproved: "",
        whatMovedForward: "",
        whatProblemSolved: "",
        whoBenefited: "the client",
        whyItMattered: "trust",
        whatThisProves: "I can finish",
        attachments: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const entries = getEvidenceEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.whatHappened).toBe("Closed the proposal");
    expect(isEvidenceFavorite(entries[0]!)).toBe(false);
  });

  it("toggles favorites without breaking other fields", () => {
    const entry = seedEntry({ whatHappened: "A quiet win" });
    expect(isEvidenceFavorite(entry)).toBe(false);
    const toggled = toggleEvidenceFavorite(entry.id);
    expect(toggled?.favorite).toBe(true);
    expect(toggled?.whatHappened).toBe("A quiet win");
    const again = toggleEvidenceFavorite(entry.id);
    expect(again?.favorite).toBe(false);
  });

  it("returns recent evidence and supports search", () => {
    seedEntry({ whatHappened: "Client thanked me" });
    seedEntry({ whatHappened: "Finished the launch plan" });
    seedEntry({ whatHappened: "Morning walk restored me" });
    const recent = getRecentEvidenceEntries(2);
    expect(recent).toHaveLength(2);
    const found = searchEvidenceEntries("launch");
    expect(found).toHaveLength(1);
    expect(found[0]?.whatHappened).toMatch(/launch/i);
  });

  it("Surprise Me avoids repeating the same evidence when possible", () => {
    seedEntry({ whatHappened: "Memory one" });
    seedEntry({ whatHappened: "Memory two" });
    seedEntry({ whatHappened: "Memory three" });
    const first = pickSurpriseEvidenceEntry();
    const second = pickSurpriseEvidenceEntry();
    const third = pickSurpriseEvidenceEntry();
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(third).toBeTruthy();
    const ids = [first!.id, second!.id, third!.id];
    expect(new Set(ids).size).toBe(3);
    const recentRaw = sessionStorage.getItem(EVIDENCE_VAULT_SURPRISE_RECENT_KEY);
    expect(recentRaw).toBeTruthy();
  });

  it("shows a gentle reminder only after idle days", () => {
    const entry = seedEntry({ whatHappened: "Older moment" });
    const old = {
      ...entry,
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-01-01T00:00:00.000Z",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([old]));
    expect(shouldShowGentleReminder(getEvidenceEntries())).toBe(true);
    expect(shouldShowGentleReminder([])).toBe(false);
  });

  it("persists and clears unfinished drafts", () => {
    expect(hasEvidenceVaultDraft()).toBe(false);
    saveEvidenceVaultDraft({ situation: "Started writing…" });
    expect(hasEvidenceVaultDraft()).toBe(true);
    expect(loadEvidenceVaultDraft()?.values.situation).toMatch(/Started/);
    clearEvidenceVaultDraft();
    expect(hasEvidenceVaultDraft()).toBe(false);
  });

  it("does not treat empty capture values as a draft", () => {
    saveEvidenceVaultDraft({ situation: "   ", lessonsLearned: "" });
    expect(hasEvidenceVaultDraft()).toBe(false);
  });

  it("asks permission before opening the vault in chat copy", () => {
    expect(EVIDENCE_VAULT_ENCOURAGEMENT_LINE).toBe(
      "Would you like me to open your Evidence Vault?",
    );
    expect(EVIDENCE_VAULT_CHAT_OPEN_OFFER).toBe(
      EVIDENCE_VAULT_ENCOURAGEMENT_LINE,
    );
    expect(detectsEncouragementNeed("I need encouragement")).toBe(true);
    expect(detectsEncouragementNeed("I'm doubting myself")).toBe(true);
    expect(
      detectsEncouragementNeed("I don't think I've accomplished anything"),
    ).toBe(true);
  });

  it("keeps empty-state and How Do I? copy calm", () => {
    expect(EVIDENCE_VAULT_EMPTY_INTRO).toMatch(/proof of your journey/);
    expect(EVIDENCE_VAULT_HOW_DO_I_LABEL).toBe("How Do I?");
  });
});
