/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  consumePendingBusinessEstateSection,
  requestOpenBusinessEstateSection,
  subscribeBusinessEstateSectionOpen,
} from "./businessEstateSectionIntent";

describe("business estate section intent (Phase C deep-link)", () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => window.sessionStorage.clear());

  it("consumes a pending section once, then returns null", () => {
    requestOpenBusinessEstateSection("brand");
    expect(consumePendingBusinessEstateSection()).toBe("brand");
    expect(consumePendingBusinessEstateSection()).toBeNull();
  });

  it("ignores an unknown pending section value", () => {
    window.sessionStorage.setItem(
      "business-estate-section-pending-v1",
      "not-a-room",
    );
    expect(consumePendingBusinessEstateSection()).toBeNull();
  });

  it("notifies subscribers with the requested section", () => {
    const seen: string[] = [];
    const unsubscribe = subscribeBusinessEstateSectionOpen((id) =>
      seen.push(id),
    );
    requestOpenBusinessEstateSection("work-style");
    unsubscribe();
    requestOpenBusinessEstateSection("tools");
    expect(seen).toEqual(["work-style"]);
  });

  it("does not fire subscribers for an invalid dispatched section", () => {
    const seen: string[] = [];
    const unsubscribe = subscribeBusinessEstateSectionOpen((id) =>
      seen.push(id),
    );
    window.dispatchEvent(
      new CustomEvent("business-estate-section-open", {
        detail: { sectionId: "bogus" },
      }),
    );
    unsubscribe();
    expect(seen).toEqual([]);
  });
});
