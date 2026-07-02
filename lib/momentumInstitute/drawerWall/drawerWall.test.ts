import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  matchDrawerIdForMemberText,
  reduceDrawerWallState,
  resolveDrawerWallItems,
} from "./drawerWallController";
import { PHASE1_INSTITUTE_CATALOG } from "./phase1Catalog";
import {
  resetInstituteCatalogProvider,
  setInstituteCatalogProvider,
} from "../catalog/provider";

describe("Momentum Institute drawer wall", () => {
  beforeEach(() => {
    setInstituteCatalogProvider({ load: () => PHASE1_INSTITUTE_CATALOG });
  });

  afterEach(() => {
    resetInstituteCatalogProvider();
  });

  it("resolves wall items from catalog and layout", () => {
    const items = resolveDrawerWallItems();
    expect(items.length).toBeGreaterThan(20);
    const confidence = items.find((item) => item.drawer.slug === "confidence");
    expect(confidence?.knowledgeCards).toHaveLength(5);
    expect(confidence?.knowledgeCards[0]?.title).toBe("Imposter Syndrome");
  });

  it("opens and closes drawers without losing card selection state", () => {
    let state = reduceDrawerWallState(
      { openDrawerId: null, openKnowledgeCardId: null, hoveredDrawerId: null },
      { type: "open_drawer", drawerId: "drawer-networking" },
    );
    expect(state.openDrawerId).toBe("drawer-networking");
    state = reduceDrawerWallState(state, {
      type: "open_knowledge_card",
      knowledgeCardId: "kc-networking-building-relationships",
    });
    expect(state.openKnowledgeCardId).toContain("kc-networking");
    state = reduceDrawerWallState(state, { type: "close_knowledge_card" });
    expect(state.openKnowledgeCardId).toBeNull();
    expect(state.openDrawerId).toBe("drawer-networking");
  });

  it("matches member language to drawers for future Estate Intelligence", () => {
    expect(matchDrawerIdForMemberText("I need help with confidence")).toBe(
      "drawer-confidence",
    );
    expect(matchDrawerIdForMemberText("customer psychology")).toBe(
      "drawer-customer-psychology",
    );
  });
});
