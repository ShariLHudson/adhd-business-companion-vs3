/**
 * Business Estate stage accordion — one section open; fields+help inside the card.
 * @vitest-environment jsdom
 */
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessEstateProgressOverview } from "@/components/companion/business-estate/BusinessEstateProgressOverview";
import { BusinessEstateRoomLayout } from "@/components/companion/business-estate/BusinessEstateRoomLayout";
import { GetExpertHelpAction } from "@/components/companion/advisory/GetExpertHelpAction";
import { GuidedStageWorkspace } from "@/components/companion/guided-stages/GuidedStageWorkspace";

describe("Business Estate stage accordion", () => {
  let container: HTMLDivElement;
  let root: Root;
  let values: Record<string, string>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    values = {
      mainOffer: "Clarity workshops",
      products: "",
      services: "",
      problemsSolved: "",
      outcomesCreated: "",
      futureOffers: "",
    };
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function OffersAccordion({
    initialStageId = "offers-main",
  }: {
    initialStageId?: string;
  }) {
    const [focusStageId, setFocusStageId] = useState(initialStageId);
    const workspace = (
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
        focusStageId={focusStageId}
        onFocusStageIdChange={setFocusStageId}
      />
    );

    return (
      <BusinessEstateRoomLayout
        header={<div>Offer Suite</div>}
        accordion={
          <BusinessEstateProgressOverview
            areaId="offers"
            values={values}
            activeStageId={focusStageId}
            onSelectStage={setFocusStageId}
            expandedContent={workspace}
            expandedFooter={<button type="button">Save Progress</button>}
          />
        }
        perspective={<GetExpertHelpAction onOpen={() => {}} />}
      />
    );
  }

  function render(stageId?: string) {
    act(() => {
      root.render(<OffersAccordion initialStageId={stageId} />);
    });
  }

  it("only one Business Estate section is open at a time", () => {
    render("offers-main");
    expect(
      container.querySelectorAll(
        '.business-estate-progress__item[data-open="true"]',
      ).length,
    ).toBe(1);
    act(() => {
      container
        .querySelector(
          '[data-testid="business-estate-progress-stage-offers-problems-outcomes"]',
        )
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(
      container.querySelectorAll(
        '.business-estate-progress__item[data-open="true"]',
      ).length,
    ).toBe(1);
    expect(
      container
        .querySelector(
          '[data-testid="business-estate-progress-item-offers-problems-outcomes"]',
        )
        ?.getAttribute("data-open"),
    ).toBe("true");
    expect(
      container
        .querySelector(
          '[data-testid="business-estate-progress-item-offers-main"]',
        )
        ?.getAttribute("data-open"),
    ).toBe("false");
  });

  it("Main Offer fields render inside the Main Offer card", () => {
    render("offers-main");
    const panel = container.querySelector(
      '[data-testid="business-estate-stage-panel-offers-main"]',
    );
    const field = container.querySelector(
      '[data-testid="stage-question-offers.mainOffer"]',
    );
    expect(panel).toBeTruthy();
    expect(field).toBeTruthy();
    expect(panel?.contains(field)).toBe(true);
  });

  it("Main Offer help/chat renders directly beneath its active field", () => {
    render("offers-main");
    const help = container.querySelector(
      '[data-testid="business-estate-section-help"]',
    );
    const field = container.querySelector(
      '[data-testid="stage-question-offers.mainOffer"]',
    );
    expect(help).toBeTruthy();
    expect(field?.contains(help)).toBe(true);
  });

  it("clicking Problems and Outcomes closes Main Offer", () => {
    render("offers-main");
    act(() => {
      container
        .querySelector(
          '[data-testid="business-estate-progress-stage-offers-problems-outcomes"]',
        )
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(
      container.querySelector(
        '[data-testid="business-estate-stage-panel-offers-main"]',
      ),
    ).toBeNull();
    expect(
      container
        .querySelector(
          '[data-testid="business-estate-progress-item-offers-main"]',
        )
        ?.getAttribute("data-open"),
    ).toBe("false");
  });

  it("Problems and Outcomes opens in its own card", () => {
    render("offers-main");
    act(() => {
      container
        .querySelector(
          '[data-testid="business-estate-progress-stage-offers-problems-outcomes"]',
        )
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const panel = container.querySelector(
      '[data-testid="business-estate-stage-panel-offers-problems-outcomes"]',
    );
    expect(panel).toBeTruthy();
    expect(
      panel?.querySelector(
        '[data-testid="stage-question-offers.problemsSolved"]',
      ),
    ).toBeTruthy();
  });

  it("no separate duplicate Working Area appears below the accordion", () => {
    render("offers-main");
    expect(
      container.querySelector('[aria-label="Working Area"]'),
    ).toBeNull();
    expect(
      container
        .querySelector('[data-testid="business-estate-room-layout"]')
        ?.getAttribute("data-layout"),
    ).toBe("accordion");
    expect(
      container.querySelectorAll('[data-testid="guided-stage-workspace"]')
        .length,
    ).toBe(1);
  });

  it("moving between sections preserves entered answers", () => {
    render("offers-main");
    values.mainOffer = "Workshops for founders";

    act(() => {
      container
        .querySelector(
          '[data-testid="business-estate-progress-stage-offers-problems-outcomes"]',
        )
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(
      container.querySelector(
        '[data-testid="business-estate-stage-panel-offers-main"]',
      ),
    ).toBeNull();

    act(() => {
      container
        .querySelector(
          '[data-testid="business-estate-progress-stage-offers-main"]',
        )
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(values.mainOffer).toBe("Workshops for founders");
    const again = container.querySelector(
      "textarea, input",
    ) as HTMLTextAreaElement | HTMLInputElement | null;
    expect(again?.value).toBe("Workshops for founders");
  });

  it("Continue advances one question at a time inside the open section", () => {
    render("offers-problems-outcomes");
    expect(
      container.querySelector(
        '[data-testid="stage-question-offers.problemsSolved"]',
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        '[data-testid="stage-question-offers.outcomesCreated"]',
      ),
    ).toBeNull();

    act(() => {
      container
        .querySelector('[data-testid="stage-done-problemsSolved"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(
      container.querySelector(
        '[data-testid="stage-question-offers.outcomesCreated"]',
      ),
    ).toBeTruthy();
    expect(
      container.querySelector(
        '[data-testid="stage-question-offers.problemsSolved"]',
      ),
    ).toBeNull();
  });

  it("only one section-specific help block exists", () => {
    render("offers-main");
    expect(
      container.querySelectorAll('[data-testid="business-estate-section-help"]')
        .length,
    ).toBe(1);
    act(() => {
      container
        .querySelector(
          '[data-testid="business-estate-progress-stage-offers-problems-outcomes"]',
        )
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(
      container.querySelectorAll('[data-testid="business-estate-section-help"]')
        .length,
    ).toBe(1);
  });

  it("Need Another Perspective remains once at the bottom", () => {
    render("offers-main");
    const perspectives = container.querySelectorAll(
      '[data-testid="get-expert-help-action"]',
    );
    expect(perspectives.length).toBe(1);
    const html = container.innerHTML;
    const panelIdx = html.indexOf(
      'data-testid="business-estate-stage-panel-offers-main"',
    );
    const perspectiveIdx = html.indexOf(
      'data-testid="get-expert-help-action"',
    );
    expect(panelIdx).toBeGreaterThanOrEqual(0);
    expect(perspectiveIdx).toBeGreaterThan(panelIdx);
  });

  it("keyboard users can open and close section cards", () => {
    render("offers-main");
    const problems = container.querySelector(
      '[data-testid="business-estate-progress-stage-offers-problems-outcomes"]',
    ) as HTMLButtonElement | null;
    expect(problems).toBeTruthy();
    act(() => {
      problems?.focus();
      problems?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      problems?.click();
    });
    expect(
      problems?.getAttribute("aria-expanded"),
    ).toBe("true");
    expect(
      container.querySelector(
        '[data-testid="business-estate-stage-panel-offers-problems-outcomes"]',
      ),
    ).toBeTruthy();
  });

  it("non-Business-Estate guided flows remain unchanged", () => {
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
      container.querySelector('[data-testid="business-estate-progress-overview"]'),
    ).toBeNull();
  });
});
