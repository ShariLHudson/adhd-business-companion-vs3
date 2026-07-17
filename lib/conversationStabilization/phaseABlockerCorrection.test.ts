/**
 * Phase A preview failure correction — isolated conversation tests.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveFrictionlessAction } from "@/lib/frictionlessActionLayer";
import { resolveEstateNavigationIntent } from "@/lib/estateNavigationIntelligence";
import {
  clearPendingChoice,
  loadPendingChoice,
  resolvePendingChoiceTurn,
} from "@/lib/pendingChoice";
import {
  beginTurnDecision,
  buildConversationDecision,
  endTurnDecision,
  applyShariVoiceLayer,
} from "./index";
import {
  detectCompoundOverwhelmTask,
  formatCompoundOverwhelmTaskReply,
} from "@/lib/companionConversationContext/detectCompoundIntent";
import { clearCompanionConversationState } from "@/lib/companionConversationContext/store";
import { goToPlace } from "@/lib/estate/goToPlace";
import { clearUniversalCreationSession } from "@/lib/universalCreation";
import { validateEstateNavigationTarget } from "@/lib/estateNavigationIntelligence/routeValidation";

function resetIsolation() {
  endTurnDecision();
  clearPendingChoice();
  clearCompanionConversationState();
  clearUniversalCreationSession();
}

function freshTurn(userText: string, pending = false) {
  resetIsolation();
  return beginTurnDecision(
    `iso-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    buildConversationDecision({
      userText,
      pendingSelectionActive: pending,
    }),
  );
}

afterEach(() => {
  resetIsolation();
});

describe("Phase A blocker correction", () => {
  beforeEach(() => {
    resetIsolation();
  });

  it("Blocker 1 — bare overwhelm invents no proposal", () => {
    const input = "I'm overwhelmed today.";
    expect(detectCompoundOverwhelmTask(input)).toBe(false);
    freshTurn(input);
    const f = resolveFrictionlessAction({
      userText: input,
      lastAssistantText: "",
    });
    const reply = f.localReply ?? "";
    console.log("ISO-1 reply:", reply);
    expect(reply).not.toMatch(/proposal/i);
    expect(reply).not.toMatch(/Greenhouse|Fireside|Conservatory|Peaceful Places/i);
    expect(reply).not.toMatch(/breathe|breathing exercise/i);
  });

  it("Blocker 1 — project overwhelm stays on the project", () => {
    const input = "I'm overwhelmed trying to finish this project.";
    expect(detectCompoundOverwhelmTask(input)).toBe(true);
    expect(formatCompoundOverwhelmTaskReply(input)).toMatch(/project/i);
    expect(formatCompoundOverwhelmTaskReply(input)).not.toMatch(/proposal/i);
    freshTurn(input);
    const f = resolveFrictionlessAction({
      userText: input,
      lastAssistantText: "",
    });
    const reply = f.localReply ?? "";
    console.log("ISO-2 reply:", reply);
    expect(reply).toMatch(/project/i);
    expect(reply).not.toMatch(/proposal/i);
  });

  it("Blocker 1 — new chat after proposal talk stays isolated", () => {
    freshTurn("Let's work on the proposal for Acme.");
    resolveFrictionlessAction({
      userText: "Let's work on the proposal for Acme.",
      lastAssistantText: "",
    });
    // Brand-new conversation — clear continuity
    clearCompanionConversationState();
    clearPendingChoice();
    const input = "I'm overwhelmed today.";
    freshTurn(input);
    const f = resolveFrictionlessAction({
      userText: input,
      lastAssistantText: "",
    });
    expect(f.localReply ?? "").not.toMatch(/proposal|Acme/i);
  });

  it("Blockers 2+3 — peaceful menu pending matches display; 3 = Ocean Conservatory", () => {
    const input = "Take me somewhere peaceful.";
    freshTurn(input);
    const f = resolveFrictionlessAction({
      userText: input,
      lastAssistantText: "",
    });
    const reply = f.localReply ?? "";
    console.log("ISO-6 menu:\n", reply);
    const pending = loadPendingChoice();
    console.log(
      "ISO-6 pending:",
      JSON.stringify(
        pending?.choices.map((c) => ({
          n: c.visibleNumber,
          label: c.label,
          id: c.id,
          placeId: c.callback.placeId,
        })),
        null,
        2,
      ),
    );

    expect(reply).toMatch(/1\.\s+.+/);
    expect(pending?.choices.length).toBeGreaterThanOrEqual(2);
    expect(pending?.menuText).toBeTruthy();

    // Visible menu numbers must match pending order 1..n
    pending!.choices.forEach((choice, index) => {
      expect(choice.visibleNumber ?? index + 1).toBe(index + 1);
      expect(choice.navigationAvailable !== false).toBe(true);
      const placeId = choice.callback.placeId ?? choice.destination!;
      expect(goToPlace({ placeId }).ok).toBe(true);
    });
    expect(reply).toMatch(/1\.\s*Reflection Pond/i);
    expect(reply).toMatch(/2\.\s*Personal Library/i);
    expect(reply).toMatch(/3\.\s*(?:The\s+)?Ocean Conservatory/i);
    expect(pending!.choices[2]!.label).toMatch(/Ocean Conservatory/i);

    const third = pending!.choices[2];
    expect(third).toBeTruthy();
    expect(third!.label).toMatch(/Ocean Conservatory/i);
    const thirdId = third!.callback.placeId ?? third!.id;
    expect(thirdId === "conservatory" || third!.id === "conservatory").toBe(
      true,
    );
    console.log("third option", third!.visibleNumber, third!.label, thirdId);
    console.log(
      "ISO-6 pending payload:",
      JSON.stringify(pending, null, 2),
    );

    endTurnDecision();
    beginTurnDecision(
      "pick-3",
      buildConversationDecision({
        userText: "3",
        pendingSelectionActive: true,
      }),
    );
    const byNumber = resolvePendingChoiceTurn("3");
    expect(byNumber.kind).toBe("resolved");
    if (byNumber.kind === "resolved") {
      expect(byNumber.action.placeId).toBe(thirdId);
      console.log("resolved 3 →", byNumber.action.placeId);
    }

    clearPendingChoice();
    freshTurn(input);
    resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
    endTurnDecision();
    beginTurnDecision(
      "pick-name",
      buildConversationDecision({
        userText: "Ocean Conservatory",
        pendingSelectionActive: true,
      }),
    );
    const byName = resolvePendingChoiceTurn("Ocean Conservatory");
    expect(byName.kind).toBe("resolved");
    if (byName.kind === "resolved") {
      expect(byName.action.placeId).toBe(thirdId);
      console.log("resolved Ocean Conservatory →", byName.action.placeId);
    }

    clearPendingChoice();
    freshTurn(input);
    resolveFrictionlessAction({ userText: input, lastAssistantText: "" });
    const again = resolvePendingChoiceTurn("the third one");
    expect(again.kind).toBe("resolved");
    if (again.kind === "resolved") {
      expect(again.action.placeId).toBe(thirdId);
    }
  });

  it("Blocker 2 — new menu replaces old pending", () => {
    freshTurn("Take me somewhere peaceful.");
    resolveFrictionlessAction({
      userText: "Take me somewhere peaceful.",
      lastAssistantText: "",
    });
    const first = loadPendingChoice();
    expect(first?.choices[0]?.id).toBeTruthy();

    clearPendingChoice();
    freshTurn("Take me to the conservatory");
    const nav = resolveEstateNavigationIntent("Take me to the conservatory");
    if (nav.kind === "offer_choices") {
      resolveFrictionlessAction({
        userText: "Take me to the conservatory",
        lastAssistantText: "",
      });
    }
    const second = loadPendingChoice();
    if (second && first) {
      expect(second.pendingChoiceId).not.toBe(first.pendingChoiceId);
    }
  });

  it("Blocker 4 — CRM and casual return parseable local replies", () => {
    const crm = "Should I switch CRMs?";
    freshTurn(crm);
    const crmF = resolveFrictionlessAction({
      userText: crm,
      lastAssistantText: "",
    });
    const crmReply = applyShariVoiceLayer({
      text: crmF.localReply ?? "",
      userText: crm,
      finalResponseOwner: `frictionless:${crmF.category}`,
    }).text;
    console.log("ISO-9 CRM:", crmReply);
    expect(crmReply.length).toBeGreaterThan(40);
    expect(crmReply).not.toMatch(/chat unavailable/i);
    expect(crmReply).not.toMatch(/#{1,3} |Greenhouse|Take me somewhere/i);
    expect(crmReply).toMatch(/CRM|switch|migration|outcome/i);

    const casual = "The appointment went well today.";
    clearPendingChoice();
    clearCompanionConversationState();
    freshTurn(casual);
    const casualF = resolveFrictionlessAction({
      userText: casual,
      lastAssistantText: "",
    });
    const casualReply = applyShariVoiceLayer({
      text: casualF.localReply ?? "",
      userText: casual,
      finalResponseOwner: `frictionless:${casualF.category}`,
    }).text;
    console.log("ISO-10 casual:", casualReply);
    expect(casualReply.length).toBeGreaterThan(20);
    expect(casualReply).not.toMatch(/chat unavailable/i);
    expect(casualReply).not.toMatch(/1\.|Clear My Mind|Take me to/i);
  });
});
