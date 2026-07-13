/**
 * Business Estate section help — Help Me Answer / Research This (no Talk).
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GuidedStageWorkspace } from "@/components/companion/guided-stages/GuidedStageWorkspace";
import * as guidedFieldHelp from "@/lib/profile/guidedFieldHelp";
import {
  GUIDED_FIELD_HELP_EVENT,
  type GuidedFieldHelpRequest,
} from "@/lib/profile/guidedFieldTypes";
import { businessEstateFieldSupportsResearch } from "@/lib/profile/businessEstateSectionResearchSupport";

describe("Business Estate section help opens chat", () => {
  let container: HTMLDivElement;
  let root: Root;
  let values: Record<string, string>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    values = {
      problemsSolved: "Scattered follow-up",
      outcomesCreated: "",
      coreValues: "Kindness",
      mainOffer: "",
    };
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function renderOffers(stageId = "offers-problems-outcomes") {
    act(() => {
      root.render(
        <GuidedStageWorkspace
          areaId="offers"
          values={values}
          onChange={(key, value) => {
            values[key] = value;
          }}
          onFocusField={() => {}}
          activeFieldKey={null}
          onSaveAndReturnLater={() => {}}
          onCancel={() => {}}
          roomChrome
          focusStageId={stageId}
        />,
      );
    });
  }

  it("does not show Talk This Through With Shari", () => {
    renderOffers();
    expect(
      container.querySelector('[data-testid="talk-this-through"]'),
    ).toBeNull();
    expect(container.textContent).not.toMatch(/Talk This Through With Shari/i);
  });

  it("Help Me Answer dispatches guided field help with question context", () => {
    const helpSpy = vi.spyOn(guidedFieldHelp, "requestGuidedFieldHelp");
    const events: GuidedFieldHelpRequest[] = [];
    const onHelp = (e: Event) => {
      events.push((e as CustomEvent<GuidedFieldHelpRequest>).detail);
    };
    window.addEventListener(GUIDED_FIELD_HELP_EVENT, onHelp);

    renderOffers();
    act(() => {
      container
        .querySelector('[data-testid="section-help-me-answer"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(helpSpy).toHaveBeenCalled();
    const req = helpSpy.mock.calls[0]![0] as GuidedFieldHelpRequest;
    expect(req.helpMode).toBe("help_me_develop");
    expect(req.fieldPath).toBe("offers.problemsSolved");
    expect(req.question).toMatch(/Problems and Outcomes/i);
    expect(req.currentValue).toBe("Scattered follow-up");
    expect(events[0]?.helpMode).toBe("help_me_develop");

    window.removeEventListener(GUIDED_FIELD_HELP_EVENT, onHelp);
    helpSpy.mockRestore();
  });

  it("Research This dispatches research mode with the same draft context", () => {
    const helpSpy = vi.spyOn(guidedFieldHelp, "requestGuidedFieldHelp");
    renderOffers();
    act(() => {
      container
        .querySelector('[data-testid="section-research-this"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const req = helpSpy.mock.calls[0]![0] as GuidedFieldHelpRequest;
    expect(req.helpMode).toBe("research_with_shari");
    expect(req.currentValue).toBe("Scattered follow-up");
    expect(req.fieldPath).toBe("offers.problemsSolved");
    helpSpy.mockRestore();
  });

  it("Research This is hidden for personal-reflection questions", () => {
    expect(businessEstateFieldSupportsResearch("identity.coreValues")).toBe(
      false,
    );
    expect(businessEstateFieldSupportsResearch("identity.mission")).toBe(false);
    expect(
      businessEstateFieldSupportsResearch("work-style.decisionStyle"),
    ).toBe(false);
    expect(
      businessEstateFieldSupportsResearch("offers.problemsSolved"),
    ).toBe(true);
  });

  it("hides Research This in the Identity values UI", () => {
    act(() => {
      root.render(
        <GuidedStageWorkspace
          areaId="identity"
          values={{
            vision: "A calmer path",
            coreValues: "Kindness",
            mission: "",
          }}
          onChange={() => {}}
          onFocusField={() => {}}
          activeFieldKey={null}
          onSaveAndReturnLater={() => {}}
          onCancel={() => {}}
          roomChrome
          focusStageId="identity-direction"
        />,
      );
    });
    act(() => {
      container
        .querySelector('[data-testid="stage-done-vision"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(
      container.querySelector(
        '[data-testid="stage-question-identity.coreValues"]',
      ),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="section-help-me-answer"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="section-research-this"]'),
    ).toBeNull();
  });

  it("preserves draft text when help opens", () => {
    const before = values.problemsSolved;
    renderOffers();
    act(() => {
      container
        .querySelector('[data-testid="section-help-me-answer"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(values.problemsSolved).toBe(before);
    expect(
      (container.querySelector("textarea") as HTMLTextAreaElement).value,
    ).toBe(before);
  });

  it("does not save answers automatically when help is requested", () => {
    const helpSpy = vi.spyOn(guidedFieldHelp, "requestGuidedFieldHelp");
    renderOffers();
    act(() => {
      container
        .querySelector('[data-testid="section-help-me-answer"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(helpSpy).toHaveBeenCalled();
    expect(values.problemsSolved).toBe("Scattered follow-up");
    helpSpy.mockRestore();
  });

  it("only one section-specific help block exists", () => {
    renderOffers();
    expect(
      container.querySelectorAll('[data-testid="business-estate-section-help"]')
        .length,
    ).toBe(1);
  });

  it("shows the short context hint", () => {
    renderOffers();
    expect(
      container.querySelector(
        '[data-testid="business-estate-section-help-hint"]',
      )?.textContent,
    ).toMatch(/current answer as context/i);
  });
});
