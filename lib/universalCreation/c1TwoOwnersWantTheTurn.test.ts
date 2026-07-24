/**
 * C1 — Two Owners Want the Turn (permanent regression)
 *
 * Explicit “write the email” + overwhelm context must draft, not open
 * Evidence Vault or restart Create discovery.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { decideShariResponse } from "@/lib/shariAnswerFirst/decideShariResponse";
import { decideConversationTurnAuthority } from "@/lib/shariAnswerFirst/turnAuthority";
import { validateConversationExcellence } from "@/lib/shariAnswerFirst/conversationExcellence";
import { runShariCognitivePipeline } from "@/lib/shariAnswerFirst/cognitivePipeline";
import {
  advanceUniversalCreation,
  clearUniversalCreationSession,
  formatUniversalCreationTurnReply,
  hasExecutableDraftContext,
  resolveUniversalCreationTurn,
  saveUniversalCreationSession,
  startUniversalCreationTurn,
} from "./orchestrator";
import { harvestDiscoveryFromConversation } from "./discoveryContextHarvest";

const C1_OPEN =
  "I'm so overwhelmed, I don't even know what to tell my team — can you just write the email for me.";
const C1_PURPOSE =
  "that right now i am overwhelmed and need them to give me until tomorrow to answer their questions";
const C1_REASSERT = "write the email to my team";

beforeEach(() => {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => mem.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", {
    localStorage: storage,
    sessionStorage: storage,
  });
  clearUniversalCreationSession();
});

describe("C1 — Two Owners Want the Turn", () => {
  it("turn authority: explicit write-email owns over overwhelm frictionless", () => {
    const decision = decideShariResponse(C1_OPEN);
    expect(decision.explicitCreationRequested).toBe(true);
    const auth = decideConversationTurnAuthority({
      userText: C1_OPEN,
      decision,
      isFollowUp: false,
      thread: null,
      primaryRole: "teacher",
      pendingCreateConsent: false,
      hasCurrentFounderAction: false,
      activeCreateSession: false,
    });
    expect(auth.owner).toBe("create_execution");
    expect(auth.allowOverwhelmFrictionless).toBe(false);
    expect(auth.allowEmotionalDestinationOffer).toBe(false);
  });

  it("harvests team + overwhelm purpose from the opening request", () => {
    const harvested = harvestDiscoveryFromConversation("email", [C1_OPEN]);
    expect(harvested["email-recipient"]).toMatch(/team/i);
    expect(harvested["email-purpose"] || harvested["email-ask"]).toBeTruthy();
  });

  it("produces a first email draft immediately from the opening request", () => {
    const turn = startUniversalCreationTurn(C1_OPEN, 1);
    expect(turn).not.toBeNull();
    expect(turn!.kind).toBe("draft");
    if (turn!.kind !== "draft") return;
    const reply = formatUniversalCreationTurnReply(turn!);
    expect(reply).toMatch(/team|tomorrow|overwhelm|Subject/i);
    expect(reply).not.toMatch(/Who is receiving this email/i);
    expect(reply).not.toMatch(/Evidence Vault/i);
    expect(hasExecutableDraftContext(turn!.session)).toBe(true);
  });

  it("retains recipient through follow-ups and does not restart discovery", () => {
    const first = startUniversalCreationTurn(C1_OPEN, 1);
    expect(first?.kind).toBe("draft");
    if (!first || first.kind !== "draft") return;
    saveUniversalCreationSession(first.session);

    // Interrupting emotional destination assistant text must not break Create ownership.
    const vaultInterrupt =
      "This feels heavy right now. Would it help to open your Evidence Vault anyway?";
    const reassert = resolveUniversalCreationTurn(
      C1_REASSERT,
      4,
      vaultInterrupt,
    );
    expect(reassert).not.toBeNull();
    expect(reassert!.kind).toBe("draft");
    expect(reassert!.session.answers["email-recipient"]).toMatch(/team/i);
    expect(formatUniversalCreationTurnReply(reassert!)).not.toMatch(
      /Who is receiving this email/i,
    );
  });

  it("advances with purpose detail without re-asking recipient", () => {
    // Simulate thin first session if draft path were deferred.
    const seeded = startUniversalCreationTurn(
      "can you write an email for me about my schedule",
      1,
    );
    if (seeded?.kind === "question") {
      saveUniversalCreationSession(seeded.session);
      const afterTeam = advanceUniversalCreation(seeded.session, "the team");
      expect(afterTeam).not.toBeNull();
      if (afterTeam?.kind === "question") {
        expect(afterTeam.question).not.toMatch(/who is receiving/i);
        const afterPurpose = advanceUniversalCreation(
          afterTeam.session,
          C1_PURPOSE,
        );
        expect(afterPurpose?.kind).toBe("draft");
      } else {
        expect(afterTeam?.kind).toBe("draft");
      }
    }
  });

  it("excellence fails Evidence Vault steals of explicit create", () => {
    const turn = runShariCognitivePipeline(C1_OPEN);
    const stolen = validateConversationExcellence({
      request: C1_OPEN,
      answer:
        "This feels heavy right now. Would it help to open your Evidence Vault anyway?",
      decision: turn.decision,
      context: turn.context,
      questionPolicy: turn.questionPolicy,
      primaryRole: turn.primaryProfessionalRole,
      composition: turn.composition,
      wisdom: turn.wisdom,
    });
    expect(stolen.excellenceFailures).toContain(
      "explicit_create_stolen_by_emotional_destination",
    );
  });

  it("active Create session keeps ownership through purpose clarification", () => {
    const decision = decideShariResponse(C1_PURPOSE);
    const auth = decideConversationTurnAuthority({
      userText: C1_PURPOSE,
      decision,
      isFollowUp: true,
      thread: null,
      primaryRole: "coach",
      pendingCreateConsent: false,
      hasCurrentFounderAction: false,
      activeCreateSession: true,
    });
    expect(auth.owner).toBe("create_execution");
    expect(auth.allowEmotionalDestinationOffer).toBe(false);
    expect(auth.allowOverwhelmFrictionless).toBe(false);
  });
});
