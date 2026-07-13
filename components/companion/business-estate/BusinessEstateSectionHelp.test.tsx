/**
 * Business Estate section help placement under active fields.
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GuidedStageWorkspace } from "@/components/companion/guided-stages/GuidedStageWorkspace";
import * as guidedFieldHelp from "@/lib/profile/guidedFieldHelp";

describe("Business Estate section help placement", () => {
  let container: HTMLDivElement;
  let root: Root;
  let values: Record<string, string>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    values = { problemsSolved: "Scattered follow-up", outcomesCreated: "" };
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
          onFocusStageIdChange={() => {}}
        />,
      );
    });
  }

  it("shows Problems and Outcomes help directly beneath its fields", () => {
    renderOffers("offers-problems-outcomes");
    const help = container.querySelector(
      '[data-testid="business-estate-section-help"]',
    );
    const field = container.querySelector(
      '[data-testid="stage-question-offers.problemsSolved"]',
    );
    expect(help).toBeTruthy();
    expect(field).toBeTruthy();
    expect(field?.contains(help)).toBe(true);
    expect(help?.getAttribute("data-stage-id")).toBe(
      "offers-problems-outcomes",
    );
    expect(
      container.querySelector('[data-testid="talk-this-through"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="section-help-me-answer"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="section-research-this"]'),
    ).toBeTruthy();
  });

  it("only one section-specific help exists at a time", () => {
    renderOffers("offers-problems-outcomes");
    expect(
      container.querySelectorAll('[data-testid="business-estate-section-help"]')
        .length,
    ).toBe(1);
  });

  it("preserves draft text when help actions are used", () => {
    const helpSpy = vi.spyOn(guidedFieldHelp, "requestGuidedFieldHelp");
    renderOffers("offers-problems-outcomes");
    const before = "Scattered follow-up";
    expect(
      (container.querySelector("textarea") as HTMLTextAreaElement)?.value,
    ).toBe(before);

    act(() => {
      container
        .querySelector('[data-testid="section-help-me-answer"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    act(() => {
      container
        .querySelector('[data-testid="section-research-this"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(values.problemsSolved).toBe(before);
    expect(
      (container.querySelector("textarea") as HTMLTextAreaElement).value,
    ).toBe(before);
    expect(helpSpy).toHaveBeenCalled();
    helpSpy.mockRestore();
  });

  it("passes active section and question context to Help Me Answer", () => {
    const helpSpy = vi.spyOn(guidedFieldHelp, "requestGuidedFieldHelp");
    renderOffers("offers-problems-outcomes");
    act(() => {
      container
        .querySelector('[data-testid="section-help-me-answer"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(helpSpy).toHaveBeenCalled();
    const req = helpSpy.mock.calls[0]![0];
    expect(req.fieldPath).toBe("offers.problemsSolved");
    expect(req.currentValue).toBe("Scattered follow-up");
    expect(req.question).toMatch(/Problems and Outcomes/i);
    expect(req.helpMode).toBe("help_me_develop");
    helpSpy.mockRestore();
  });

  it("does not change People I Help single-question flow", () => {
    act(() => {
      root.render(
        <GuidedStageWorkspace
          areaId="people-i-help"
          values={{}}
          onChange={() => {}}
          onFocusField={() => {}}
          activeFieldKey={null}
          onSaveAndReturnLater={() => {}}
          onCancel={() => {}}
        />,
      );
    });
    expect(
      container.querySelector('[data-testid="guided-stage-entry"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-testid="business-estate-section-help"]'),
    ).toBeNull();
  });
});
