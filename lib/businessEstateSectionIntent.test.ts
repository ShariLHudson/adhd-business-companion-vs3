/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingBusinessEstateSection,
  consumePendingBusinessEstateSection,
  requestBusinessEstateReset,
  requestOpenBusinessEstateSection,
  subscribeBusinessEstateReset,
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

describe("business estate navigation reset (open at beginning)", () => {
  beforeEach(() => window.sessionStorage.clear());
  afterEach(() => window.sessionStorage.clear());

  it("clearing/reset drops a lingering room intent so entry opens at the overview", () => {
    // A prior resume left a pending room…
    requestOpenBusinessEstateSection("brand");
    clearPendingBusinessEstateSection();
    // …so a fresh entry consumes nothing → the panel stays at its default overview.
    expect(consumePendingBusinessEstateSection()).toBeNull();
  });

  it("requestBusinessEstateReset clears any pending room intent", () => {
    requestOpenBusinessEstateSection("offers");
    requestBusinessEstateReset();
    expect(consumePendingBusinessEstateSection()).toBeNull();
  });

  it("an explicit resume requested AFTER the reset still lands in its room (chat continue order)", () => {
    // Mirrors openProfileDestinationCore (reset) → requestOpenBusinessEstateSection (resume).
    requestBusinessEstateReset();
    requestOpenBusinessEstateSection("brand");
    expect(consumePendingBusinessEstateSection()).toBe("brand");
  });

  it("notifies reset subscribers so an already-open panel returns to the overview", () => {
    let resets = 0;
    const unsubscribe = subscribeBusinessEstateReset(() => {
      resets += 1;
    });
    requestBusinessEstateReset();
    unsubscribe();
    requestBusinessEstateReset();
    expect(resets).toBe(1);
  });
});
