import { describe, expect, it } from "vitest";
import {
  canCreateRelationshipEdge,
  isSuggestionOnlyMatchReason,
  mayAutoLinkFromMatchReasons,
  relationshipLinkDecision,
} from "./relationshipIntegrity";

describe("relationshipIntegrity (141)", () => {
  it("allows only trusted edge sources", () => {
    expect(canCreateRelationshipEdge("creation_flow_lineage")).toBe(true);
    expect(canCreateRelationshipEdge("explicit_user_link")).toBe(true);
    expect(canCreateRelationshipEdge("shared_work_project_context")).toBe(true);
    expect(canCreateRelationshipEdge("user_confirmed")).toBe(true);
    expect(canCreateRelationshipEdge(undefined)).toBe(false);
    expect(canCreateRelationshipEdge("title_similarity" as never)).toBe(false);
  });

  it("treats similar titles as suggestion-only — never auto-link alone", () => {
    expect(isSuggestionOnlyMatchReason("similar_title_or_intent")).toBe(true);
    expect(mayAutoLinkFromMatchReasons(["similar_title_or_intent"])).toBe(
      false,
    );
    expect(
      relationshipLinkDecision(["similar_title_or_intent"]),
    ).toBe("needs_user_confirmation");
  });

  it("allows auto-link when a trusted reason is present", () => {
    expect(
      mayAutoLinkFromMatchReasons([
        "related_project",
        "similar_title_or_intent",
      ]),
    ).toBe(true);
    expect(
      relationshipLinkDecision(["hinted_work_id"]),
    ).toBe("auto_link_ok");
  });

  it("refuses link when no usable reasons", () => {
    expect(relationshipLinkDecision([])).toBe("do_not_link");
    expect(relationshipLinkDecision(["unknown_signal"])).toBe("do_not_link");
  });
});
