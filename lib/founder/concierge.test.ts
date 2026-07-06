import { describe, expect, it } from "vitest";

import {
  ExecutiveConciergeService,
  prepareOffice,
} from "./concierge/services";

describe("Executive Concierge", () => {
  it("prepareOffice returns a fully prepared executive office", () => {
    const office = prepareOffice();
    expect(office.greeting).toContain("Shari");
    expect(office.primaryMessage.text.length).toBeGreaterThan(10);
    expect(office.agenda.priorities.length).toBeLessThanOrEqual(3);
    expect(office.agenda.watchItems.length).toBeLessThanOrEqual(3);
    expect(office.agenda.opportunity).not.toBeNull();
    expect(office.agenda.recommendation).not.toBeNull();
    expect(office.drawer.length).toBeGreaterThanOrEqual(5);
  });

  it("ExecutiveConciergeService methods return sample orchestration data", () => {
    expect(ExecutiveConciergeService.getMorningGreeting()).toContain("Good morning");
    expect(ExecutiveConciergeService.getSuggestedWorkspace().href).toContain("/workspace/");
    expect(ExecutiveConciergeService.getSuggestedThinkingSpace().label.length).toBeGreaterThan(3);
    expect(ExecutiveConciergeService.getQuickWins().length).toBeGreaterThan(0);
    expect(ExecutiveConciergeService.getWatchItems().length).toBeLessThanOrEqual(3);
    expect(ExecutiveConciergeService.getReminders().length).toBeGreaterThan(0);
  });

  it("only one primary concierge message is surfaced", () => {
    const office = prepareOffice();
    expect(office.primaryMessage.id).toBeTruthy();
    expect(office.primaryMessage.text).not.toMatch(/what would you like to do/i);
  });
});
