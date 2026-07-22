/**
 * How Spark Estate Works Together — content completeness + open bridge.
 * @vitest-environment jsdom
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  HOW_EVERYTHING_WORKS_TOGETHER_HELP_LABEL,
  HOW_SPARK_ESTATE_WORKS_TOGETHER,
  HOW_SPARK_ESTATE_WORKS_TOGETHER_FEATURE,
  SHOW_ME_HOW_THIS_FITS_TOGETHER_LABEL,
  getRoomOrientation,
  hasHowThisFitsTogetherLink,
  listEstateOrientationPlaceIds,
  requestOpenHowSparkEstateWorksTogether,
  HOW_SPARK_ESTATE_WORKS_TOGETHER_OPEN_EVENT,
} from "./index";

const REQUIRED_PLACE_IDS = [
  "create",
  "projects",
  "cartography",
  "strategies",
  "chamber",
  "board",
  "business-pulse",
  "evidence",
  "wins",
  "hall",
] as const;

const REQUIRED_DESTINATION_KEYS = [
  "content-generator",
  "projects",
  "cartographers-studio",
  "playbook",
  "chamber-of-momentum",
  "boardroom",
  "business-pulse",
  "evidence-vault",
  "celebration-garden",
  "hall-of-accomplishments",
] as const;

describe("How Spark Estate Works Together content", () => {
  it("names the feature and help / fits-together labels in plain language", () => {
    expect(HOW_SPARK_ESTATE_WORKS_TOGETHER.featureName).toBe(
      HOW_SPARK_ESTATE_WORKS_TOGETHER_FEATURE,
    );
    expect(HOW_SPARK_ESTATE_WORKS_TOGETHER.helpMenuLabel).toBe(
      HOW_EVERYTHING_WORKS_TOGETHER_HELP_LABEL,
    );
    expect(HOW_SPARK_ESTATE_WORKS_TOGETHER.fitsTogetherLinkLabel).toBe(
      SHOW_ME_HOW_THIS_FITS_TOGETHER_LABEL,
    );
  });

  it("includes intro, close, and all ten places with What / Why / Connect", () => {
    expect(HOW_SPARK_ESTATE_WORKS_TOGETHER.intro.length).toBeGreaterThanOrEqual(2);
    expect(HOW_SPARK_ESTATE_WORKS_TOGETHER.close.length).toBeGreaterThanOrEqual(2);
    expect(listEstateOrientationPlaceIds()).toEqual([...REQUIRED_PLACE_IDS]);

    for (const place of HOW_SPARK_ESTATE_WORKS_TOGETHER.places) {
      expect(place.name.trim().length).toBeGreaterThan(0);
      expect(place.summary.trim().length).toBeGreaterThan(0);
      expect(place.whatIsThis.trim().length).toBeGreaterThan(20);
      expect(place.whyWouldIUseIt.trim().length).toBeGreaterThan(20);
      expect(place.howItConnects.trim().length).toBeGreaterThan(20);
      expect(place.howItConnects.toLowerCase()).not.toMatch(
        /\b(module|dashboard|launching)\b/,
      );
    }
  });

  it("defines a permission-based Estate Tour with four calm stops", () => {
    const tour = HOW_SPARK_ESTATE_WORKS_TOGETHER.tour;
    expect(tour.steps).toHaveLength(4);
    expect(tour.walkWithMeLabel).toMatch(/walk with me/i);
    expect(tour.stayLabel).toMatch(/stay/i);
    expect(tour.notNowLabel).toMatch(/not now/i);
    expect(tour.invitation.toLowerCase()).not.toMatch(/\blaunch/);
    for (const step of tour.steps) {
      expect(step.shariLine.trim().length).toBeGreaterThan(20);
    }
  });

  it("maps major destinations to orientation places", () => {
    for (const key of REQUIRED_DESTINATION_KEYS) {
      expect(hasHowThisFitsTogetherLink(key)).toBe(true);
      expect(getRoomOrientation(key)).not.toBeNull();
    }
  });
});

describe("How Spark Estate Works Together open bridge", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("dispatches an open event with optional focus place", () => {
    const events: CustomEvent[] = [];
    const handler = (event: Event) => {
      events.push(event as CustomEvent);
    };
    window.addEventListener(HOW_SPARK_ESTATE_WORKS_TOGETHER_OPEN_EVENT, handler);
    requestOpenHowSparkEstateWorksTogether({
      focusPlaceId: "projects",
      startTour: true,
    });
    window.removeEventListener(
      HOW_SPARK_ESTATE_WORKS_TOGETHER_OPEN_EVENT,
      handler,
    );

    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toEqual({
      focusPlaceId: "projects",
      startTour: true,
    });
  });
});
