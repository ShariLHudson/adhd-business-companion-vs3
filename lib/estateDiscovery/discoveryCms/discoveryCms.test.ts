import { describe, expect, it } from "vitest";
import {
  canTransitionDiscoveryStatus,
  createDiscoveryDraftTemplate,
  getAllDiscoveryRecords,
  getMemberReadyDiscoveryRecords,
  groupDiscoveriesByStatus,
  isDiscoveryEligibleForMembers,
  lintDiscoveryVoice,
  validateDiscoveryContent,
  validateDiscoveryForLive,
} from "@/lib/estateDiscovery/discoveryCms";

describe("discoveryCms workflow", () => {
  it("allows Draft → Review → Approved → Live", () => {
    expect(canTransitionDiscoveryStatus("Draft", "Review")).toBe(true);
    expect(canTransitionDiscoveryStatus("Review", "Approved")).toBe(true);
    expect(canTransitionDiscoveryStatus("Approved", "Live")).toBe(true);
    expect(canTransitionDiscoveryStatus("Draft", "Live")).toBe(false);
  });

  it("groups records by editorial status", () => {
    const groups = groupDiscoveriesByStatus(getAllDiscoveryRecords());
    expect(groups.Live.length).toBe(13);
    expect(groups.Draft.length).toBe(4);
  });
});

describe("discoveryCms voice lint", () => {
  it("flags AI clichés and pushy language", () => {
    const draft = createDiscoveryDraftTemplate({
      id: "DISC-TEST",
      title: "Great question!",
      category: "estate-discovery",
      discoveryText: "Let's dive in — you should act now!!!",
      targetRegistry: "estate-rooms",
      targetId: "greenhouse",
    });

    const result = lintDiscoveryVoice(draft);
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it("passes warm human copy", () => {
    const live = getAllDiscoveryRecords().find((r) => r.id === "DISC-001");
    expect(live).toBeDefined();
    expect(lintDiscoveryVoice(live!).passed).toBe(true);
  });
});

describe("discoveryCms validation", () => {
  it("validates structural content for drafts", () => {
    const draft = createDiscoveryDraftTemplate({
      id: "DISC-DRAFT-TEST",
      title: "Greenhouse",
      category: "estate-discovery",
      discoveryText: "A quiet place for ideas still taking root.",
      targetRegistry: "estate-rooms",
      targetId: "greenhouse",
      relatedRoom: "greenhouse",
      destinationRoute: "/companion?section=growth-greenhouse",
      destinationType: "room",
    });

    const result = validateDiscoveryContent(draft);
    expect(result.valid).toBe(true);
  });

  it("blocks Live activation when target is not Live in Knowledge Base", () => {
    const draft = createDiscoveryDraftTemplate({
      id: "DISC-BLOCKED",
      title: "Create",
      category: "new-possibility",
      discoveryText: "A studio table waits until you are ready.",
      targetRegistry: "estate-features",
      targetId: "create",
      destinationRoute: "/companion?section=content-generator",
      destinationType: "feature",
    });
    draft.status = "Live";

    const result = validateDiscoveryForLive(draft);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "target-not-live")).toBe(true);
  });

  it("only exposes member-ready Live discoveries that pass validation", () => {
    const ready = getMemberReadyDiscoveryRecords();
    const live = getAllDiscoveryRecords().filter((record) => record.status === "Live");
    const missing = live
      .filter((record) => !ready.some((item) => item.id === record.id))
      .map((record) => ({
        id: record.id,
        issues: validateDiscoveryForLive(record).issues,
      }));
    expect(missing).toEqual([]);
    expect(ready.length).toBe(live.length);
    for (const record of ready) {
      expect(record.status).toBe("Live");
      expect(isDiscoveryEligibleForMembers(record)).toBe(true);
      expect(validateDiscoveryForLive(record).valid).toBe(true);
    }
  });
});
