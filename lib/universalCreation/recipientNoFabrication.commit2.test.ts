/**
 * D3 Commit 2 — the recipient keyword-default block is removed from
 * applyEmailDiscoveryDefaults. A recipient is never fabricated from broad
 * keyword presence ("client"/"customer"/"team"); it is only ever set from what
 * the member actually stated (harvestEmailDiscovery) or an authoritative answer.
 *
 * Scope: recipient fabrication only. No answer-routing / pending-slot changes
 * (Commit 3). Commit 1 infra (mergeHarvestedAnswers options) untouched.
 */

import { describe, expect, it } from "vitest";
import {
  applyEmailDiscoveryDefaults,
  harvestDiscoveryFromConversation,
} from "./discoveryContextHarvest";
import { mergeHarvestedAnswers } from "./orchestrator";

describe("applyEmailDiscoveryDefaults — recipient never fabricated from a keyword", () => {
  it('does not invent a recipient from "client" alone', () => {
    const r = applyEmailDiscoveryDefaults(
      {},
      "To update the client on the project timeline.",
      [],
    );
    expect("email-recipient" in r).toBe(false);
  });

  it('does not invent a recipient from "customer" alone', () => {
    const r = applyEmailDiscoveryDefaults({}, "a quick note about the customer", []);
    expect("email-recipient" in r).toBe(false);
  });

  it('does not invent a recipient from "team" alone', () => {
    const r = applyEmailDiscoveryDefaults({}, "send this to the team", []);
    expect("email-recipient" in r).toBe(false);
  });

  it("leaves an already-present recipient untouched", () => {
    const r = applyEmailDiscoveryDefaults(
      { "email-recipient": "My accountant" },
      "email the client",
      [],
    );
    expect(r["email-recipient"]).toBe("My accountant");
  });
});

describe("applyEmailDiscoveryDefaults — non-recipient defaults preserved", () => {
  it("still fills purpose + ask from a substantive line", () => {
    const r = applyEmailDiscoveryDefaults(
      {},
      "I need them to follow through on the agreed items",
      [],
    );
    expect(r["email-purpose"]).toBeTruthy();
    expect(r["email-ask"]).toBe(r["email-purpose"]);
  });

  it("still fills context when the background is implied", () => {
    const r = applyEmailDiscoveryDefaults({}, "they already know the background", []);
    expect(r["email-context"]).toBeTruthy();
    expect("email-recipient" in r).toBe(false);
  });

  it("still fills relationship when tension is stated", () => {
    const r = applyEmailDiscoveryDefaults({}, "things are rough right now", []);
    expect(r["email-relationship"]).toBe("Rough at the moment");
    expect("email-recipient" in r).toBe(false);
  });
});

describe("legitimate recipient harvesting is NOT removed", () => {
  it("still extracts a recipient the member explicitly stated", () => {
    const r = harvestDiscoveryFromConversation("email", ["email to a client"]);
    // harvestEmailDiscovery (unchanged) reads what was actually said.
    expect(r["email-recipient"]).toBe("A client");
  });
});

describe("merge-level proof + non-email flows unaffected", () => {
  it("no longer fabricates a recipient for the D3 repro text", () => {
    const r = mergeHarvestedAnswers(
      "email",
      "To update the client on the project timeline.",
      {},
    );
    expect("email-recipient" in r).toBe(false);
  });

  it("does not touch a non-email flow", () => {
    const prior = { "sop-process-name": "Onboarding" };
    const r = mergeHarvestedAnswers("sop", "email the client and the team", prior);
    expect(r).toEqual(prior);
  });
});
