/**
 * D3 Commit 1 — opt-in supplement-only / protect-slot behavior for
 * mergeHarvestedAnswers. Proves the new options while confirming the default
 * (no options) behavior is unchanged for existing callers.
 *
 * Scope: this merge helper only. No routing/binding changes (Commit 3), no
 * recipient-default removal (Commit 2).
 */

import { describe, expect, it } from "vitest";
import { mergeHarvestedAnswers } from "./orchestrator";

// "email to a client" makes harvestEmailDiscovery emit a single, predictable
// key: email-recipient = "A client" (see discoveryContextHarvest.harvestEmailDiscovery).
const HARVEST_TEXT = "email to a client";
const HARVESTED_RECIPIENT = "A client";

describe("mergeHarvestedAnswers — default mode unchanged", () => {
  it("harvests into an empty prior map (legacy behavior)", () => {
    const result = mergeHarvestedAnswers("email", HARVEST_TEXT, {});
    expect(result["email-recipient"]).toBe(HARVESTED_RECIPIENT);
  });

  it("harvested values overwrite prior values (legacy behavior)", () => {
    const result = mergeHarvestedAnswers("email", HARVEST_TEXT, {
      "email-recipient": "My accountant",
    });
    // Default merge is { ...prior, ...harvested } — harvest wins.
    expect(result["email-recipient"]).toBe(HARVESTED_RECIPIENT);
  });

  it("is a no-op passthrough when nothing harvests (non-email type)", () => {
    const prior = { "sop-process-name": "Onboarding" };
    const result = mergeHarvestedAnswers("sop", "some unrelated text", prior);
    expect(result).toEqual(prior);
  });
});

describe("mergeHarvestedAnswers — supplementOnly", () => {
  it("fills an empty, non-protected slot", () => {
    const result = mergeHarvestedAnswers(
      "email",
      HARVEST_TEXT,
      {},
      [],
      { supplementOnly: true },
    );
    expect(result["email-recipient"]).toBe(HARVESTED_RECIPIENT);
  });

  it("never overwrites a populated slot (prior wins)", () => {
    const result = mergeHarvestedAnswers(
      "email",
      HARVEST_TEXT,
      { "email-recipient": "My accountant" },
      [],
      { supplementOnly: true },
    );
    expect(result["email-recipient"]).toBe("My accountant");
  });
});

describe("mergeHarvestedAnswers — protectSlotId", () => {
  it("never writes the protected slot when prior is absent (strips harvest + default)", () => {
    const result = mergeHarvestedAnswers(
      "email",
      HARVEST_TEXT,
      {},
      [],
      { supplementOnly: true, protectSlotId: "email-recipient" },
    );
    // Harvest wanted "A client"; the recipient default would want "Client".
    // Both must be suppressed — the protected slot stays absent.
    expect("email-recipient" in result).toBe(false);
  });

  it("preserves the prior value of the protected slot (no overwrite)", () => {
    const result = mergeHarvestedAnswers(
      "email",
      HARVEST_TEXT,
      { "email-recipient": "My accountant" },
      [],
      { supplementOnly: true, protectSlotId: "email-recipient" },
    );
    expect(result["email-recipient"]).toBe("My accountant");
  });

  it("protects the slot even in default (non-supplement) mode", () => {
    const result = mergeHarvestedAnswers(
      "email",
      HARVEST_TEXT,
      { "email-recipient": "My accountant" },
      [],
      { protectSlotId: "email-recipient" },
    );
    expect(result["email-recipient"]).toBe("My accountant");
  });

  it("does not restrict other slots that legitimately harvest", () => {
    // A protected recipient must not block enrichment of a different empty slot.
    const result = mergeHarvestedAnswers(
      "email",
      "email to the team, and I need them to follow through on agreed items",
      {},
      [],
      { supplementOnly: true, protectSlotId: "email-recipient" },
    );
    expect("email-recipient" in result).toBe(false);
    // The purpose/ask harvest is unrelated to the protected slot and still lands.
    expect(result["email-purpose"]).toBeTruthy();
  });
});
