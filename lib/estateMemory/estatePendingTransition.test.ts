import { describe, expect, it, beforeEach } from "vitest";
import {
  buildEstateArrivalContinuation,
  clearEstatePendingTransition,
  inferEstateFollowUpQuestion,
  isEstateTransitionOfferMessage,
  registerEstatePendingTransition,
  saveEstatePendingTransition,
} from "./estatePendingTransition";

describe("Estate Pending Transition™", () => {
  beforeEach(() => {
    clearEstatePendingTransition();
  });

  it("recognizes estate invitation language in assistant offers", () => {
    expect(
      isEstateTransitionOfferMessage(
        "The Creative Studio™ is the perfect place for that. Would you like me to take us there?",
      ),
    ).toBe(true);
    expect(
      isEstateTransitionOfferMessage(
        "Would you like me to take you to the Journal Gazebo?",
      ),
    ).toBe(true);
    expect(
      isEstateTransitionOfferMessage("We could visit the Reading Nook."),
    ).toBe(true);
    expect(
      isEstateTransitionOfferMessage("Would you like to go to the Greenhouse?"),
    ).toBe(true);
    expect(isEstateTransitionOfferMessage("Would you like to open Create?")).toBe(
      false,
    );
  });

  it("does not treat task permission questions as estate transition offers", () => {
    expect(
      isEstateTransitionOfferMessage(
        "Would you like me to gather some recent findings?",
      ),
    ).toBe(false);
    expect(
      isEstateTransitionOfferMessage("Would you like me to research that?"),
    ).toBe(false);
    expect(
      isEstateTransitionOfferMessage("Would you like me to help draft it?"),
    ).toBe(false);
  });

  it("builds newsletter continuation without asking member to repeat intent", () => {
    const pending = registerEstatePendingTransition({
      destinationSection: "content-generator",
      originalUserIntent: "I want to write a newsletter",
      offeredAtTurn: 1,
    });
    const arrival = buildEstateArrivalContinuation(pending);
    expect(arrival).toContain("Create");
    expect(arrival).toContain("newsletter");
    expect(arrival).toContain("Who are you writing it for?");
  });

  it("infers learning follow-up for library transitions", () => {
    expect(
      inferEstateFollowUpQuestion("library", "I wanted to learn marketing"),
    ).toContain("marketing");
  });

  it("persists pending transition in session storage", () => {
    registerEstatePendingTransition({
      destinationSection: "decision-compass",
      originalUserIntent: "I can't decide whether to hire",
      offeredAtTurn: 2,
    });
    saveEstatePendingTransition({
      destinationEntryId: "decision-compass",
      destinationSection: "decision-compass",
      originalUserIntent: "test",
      offeredAtTurn: 1,
      savedAt: new Date().toISOString(),
    });
    clearEstatePendingTransition();
  });
});
