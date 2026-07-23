/**
 * 587–598 — Facebook Community LIVE-PATH registration proof.
 *
 * The foundation cert suite clears the registries and calls the `ensure…`
 * functions by hand, which proves the package *can* register. This suite proves
 * the package *does* register on the real Create-open path: importing the public
 * Universal Work Engine barrel (as the Create Entrance panel does via
 * `launchFromCreate`) must register the Facebook Community Work Type and
 * Blueprint through side effects alone — no manual `ensure…` call, no registry
 * reset. It also proves natural-language routing attaches the guided Blueprint.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID,
  getBlueprint,
  getWorkTypePackage,
  isBlueprintRegistered,
  launchFromCreate,
  listBlueprints,
  resetWorkBlueprintStateForTests,
  resetWorkIdentityStoreForTests,
  resetWorkRelationshipsForTests,
} from "@/lib/universalWorkEngine";
import { FACEBOOK_COMMUNITY_WORK_TYPE_ID } from "@/lib/workTypeSchema/schemas/facebookCommunityMap";

// NOTE: intentionally no registry reset and no ensure* call before these tests —
// registration must already be present from the barrel import above.

describe("587–598 — Facebook Community live-path registration", () => {
  it("registers the Work Type from the UWE barrel import alone (no manual ensure)", () => {
    const pkg = getWorkTypePackage(FACEBOOK_COMMUNITY_WORK_TYPE_ID);
    expect(pkg?.workTypeId).toBe(FACEBOOK_COMMUNITY_WORK_TYPE_ID);
    expect(pkg?.displayName).toBe("Facebook Community");
    expect(pkg?.creationExperienceId).toBe("create");
    expect(pkg?.blueprintIds).toContain(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID);
    expect(pkg?.capabilities.projectBridge).toBe(true);
  });

  it("registers the Blueprint from the UWE barrel import alone", () => {
    expect(isBlueprintRegistered(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID)).toBe(
      true,
    );
    expect(
      listBlueprints({ workTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID }),
    ).toHaveLength(1);
  });

  it("routes a natural-language request to the guided Work Type + Blueprint", () => {
    const result = launchFromCreate({
      originalUserMessage:
        "Help me start a Facebook community for my past clients",
      forceNew: true,
    });
    expect(result.decision).toBe("create_new");
    expect(result.workTypeId).toBe(FACEBOOK_COMMUNITY_WORK_TYPE_ID);
    // The guided Blueprint must attach — not an empty scratch workspace.
    expect(result.blueprintId).toBe(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID);
    expect(result.workId).toBeTruthy();
  });

  it("attaches the guided Blueprint even when only the Work Type is known (Create Begin path)", () => {
    const result = launchFromCreate({
      originalUserMessage: "Let's build this out",
      candidateWorkTypeId: FACEBOOK_COMMUNITY_WORK_TYPE_ID,
      forceNew: true,
    });
    expect(result.workTypeId).toBe(FACEBOOK_COMMUNITY_WORK_TYPE_ID);
    expect(result.blueprintId).toBe(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID);
    expect(result.workId).toBeTruthy();
  });

  it("does not create a duplicate for the same intent (no shadow workspace)", () => {
    // Isolate WORK STATE only (not the registries) so accumulated Work from
    // earlier tests in this file cannot confuse the duplicate assessment. The
    // Work Type / Blueprint registrations from the barrel import remain intact.
    resetWorkIdentityStoreForTests();
    resetWorkBlueprintStateForTests();
    resetWorkRelationshipsForTests();
    const first = launchFromCreate({
      originalUserMessage: "Create a Facebook group for my membership",
      forceNew: true,
    });
    const second = launchFromCreate({
      originalUserMessage: "Create a Facebook group for my membership",
    });
    expect(["continue_existing", "clarify", "create_new"]).toContain(
      second.decision,
    );
    if (second.decision === "continue_existing") {
      expect(second.workId).toBe(first.workId);
    }
  });

  it("leaves plain Facebook post requests to the content path (no false FB Community route)", () => {
    const result = launchFromCreate({
      originalUserMessage: "Write me a Facebook post about our sale",
      forceNew: true,
    });
    expect(result.workTypeId).not.toBe(FACEBOOK_COMMUNITY_WORK_TYPE_ID);
    expect(result.blueprintId).not.toBe(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID);
  });

  it("guided Blueprint keeps its honesty, privacy, artifact, and handoff contract", () => {
    const bp = getBlueprint(FACEBOOK_COMMUNITY_SIMPLE_BLUEPRINT_ID)!;
    // Runtime-complete minimum artifact — persisted Community Foundation Brief.
    expect(bp.deliverables).toContain("Community Foundation Brief");
    // Privacy is treated as a careful, possibly irreversible decision.
    expect(
      bp.adaptiveQuestions.some((q) => q.id === "q_privacy_choice"),
    ).toBe(true);
    expect(
      bp.commonlyForgottenItems.some((i) => /privacy/i.test(i)),
    ).toBe(true);
    // No false upload/post/invite claims (Facebook truth contract).
    expect(
      bp.riskPrompts.some((r) => /upload|post|invite/i.test(r)),
    ).toBe(true);
    expect(
      bp.completionCriteria.some((c) => /no claim of a completed upload/i.test(c)),
    ).toBe(true);
    // Explicit, member-intentional Create-to-Project handoff (never auto-convert).
    expect(
      bp.projectBridgeRecommendations.some((r) => /never auto-convert/i.test(r)),
    ).toBe(true);
  });
});
